
import { DatabaseService } from './databaseService';
import { StorageService } from './storageService';
import { BackupService } from './backupService';
import { logger } from '@/utils/logger';
import * as nodemailer from 'nodemailer';

interface AlertConfig {
  email?: string;
  slackWebhook?: string;
  storageThreshold?: number; // in bytes
  backupFailureThreshold?: number; // number of consecutive failures
}

interface Alert {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private databaseService: DatabaseService;
  private storageService: StorageService;
  private backupService: BackupService;
  private emailTransporter: nodemailer.Transporter | null = null;
  private readonly DEFAULT_STORAGE_THRESHOLD = 100 * 1024 * 1024 * 1024; // 100GB
  private readonly DEFAULT_BACKUP_FAILURE_THRESHOLD = 3;
  private alerts: Alert[] = [];
  private readonly MAX_ALERTS = 1000;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.storageService = StorageService.getInstance();
    this.backupService = BackupService.getInstance();

    // Initialize email transporter
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize monitoring
  public async initialize(config: Partial<AlertConfig> = {}): Promise<void> {
    try {
      // Start monitoring storage usage
      this.monitorStorageUsage(config.storageThreshold);

      // Start monitoring backup status
      this.monitorBackupStatus(config.backupFailureThreshold);

      logger.info('Monitoring service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize monitoring service:', error);
      throw new Error('Failed to initialize monitoring service');
    }
  }

  // Monitor storage usage
  private async monitorStorageUsage(threshold: number = this.DEFAULT_STORAGE_THRESHOLD): Promise<void> {
    try {
      const stats = await this.storageService.getStorageStats();
      
      if (stats.totalSize > threshold) {
        await this.createAlert('warning', 'Storage usage exceeds threshold', {
          currentSize: stats.totalSize,
          threshold,
          videoCount: stats.videoCount,
          imageCount: stats.imageCount
        });
      }
    } catch (error) {
      logger.error('Storage monitoring failed:', error);
      await this.createAlert('error', 'Failed to monitor storage usage');
    }
  }

  // Monitor backup status
  private async monitorBackupStatus(threshold: number = this.DEFAULT_BACKUP_FAILURE_THRESHOLD): Promise<void> {
    try {
      const recentAlerts = this.alerts.filter(
        alert => alert.type === 'error' && 
        alert.message.includes('backup') &&
        alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      if (recentAlerts.length >= threshold) {
        await this.createAlert('error', 'Multiple backup failures detected', {
          failureCount: recentAlerts.length,
          threshold
        });
      }
    } catch (error) {
      logger.error('Backup monitoring failed:', error);
      await this.createAlert('error', 'Failed to monitor backup status');
    }
  }

  // Create and send alert
  public async createAlert(
    type: Alert['type'],
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const alert: Alert = {
      type,
      message,
      timestamp: new Date(),
      metadata
    };

    // Add to alerts array
    this.alerts.push(alert);
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift();
    }

    // Log alert
    logger[type](message, metadata);

    // Send notifications
    await this.sendNotifications(alert);
  }

  // Send notifications
  private async sendNotifications(alert: Alert): Promise<void> {
    try {
      // Send email notification
      if (this.emailTransporter && process.env.ALERT_EMAIL) {
        await this.sendEmail(alert);
      }

      // Send Slack notification
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(alert);
      }
    } catch (error) {
      logger.error('Failed to send notifications:', error);
    }
  }

  // Send email notification
  private async sendEmail(alert: Alert): Promise<void> {
    if (!this.emailTransporter) return;
    
    const subject = `[${alert.type.toUpperCase()}] ${alert.message}`;
    const body = `
      Alert Type: ${alert.type}
      Message: ${alert.message}
      Time: ${alert.timestamp.toISOString()}
      ${alert.metadata ? `\nMetadata:\n${JSON.stringify(alert.metadata, null, 2)}` : ''}
    `;

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'alerts@example.com',
      to: process.env.ALERT_EMAIL || 'admin@example.com',
      subject,
      text: body
    });
  }

  // Send Slack notification
  private async sendSlackNotification(alert: Alert): Promise<void> {
    const payload = {
      text: `*${alert.type.toUpperCase()} Alert*\n${alert.message}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.type.toUpperCase()} Alert*\n${alert.message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Time: ${alert.timestamp.toISOString()}`
            }
          ]
        }
      ]
    };

    if (alert.metadata) {
      payload.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + JSON.stringify(alert.metadata, null, 2) + '```'
        }
      });
    }

    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }
  }

  // Get recent alerts
  public getRecentAlerts(limit: number = 10): Alert[] {
    return this.alerts.slice(-limit);
  }

  // Get alert statistics
  public getAlertStats(): Record<string, number> {
    return this.alerts.reduce(
      (stats, alert) => {
        stats[alert.type] = (stats[alert.type] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>
    );
  }

  // Error handling
  private handleError(error: any): never {
    logger.error('Monitoring error:', error);
    throw new Error(error.message || 'Monitoring operation failed');
  }
}
