import { DatabaseService } from './databaseService';
import { StorageService } from './storageService';
import { BackupService } from './backupService';
import { CronJob } from 'cron';
import { logger } from '@/utils/logger';

interface SchedulerConfig {
  backupSchedule?: string;
  storageOptimizationSchedule?: string;
  dataCleanupSchedule?: string;
  retentionDays?: number;
}

export class SchedulerService {
  private static instance: SchedulerService;
  private databaseService: DatabaseService;
  private storageService: StorageService;
  private backupService: BackupService;
  private jobs: Map<string, CronJob>;
  private readonly DEFAULT_RETENTION_DAYS = 30;
  private readonly DEFAULT_BACKUP_SCHEDULE = '0 0 * * *'; // Daily at midnight
  private readonly DEFAULT_STORAGE_SCHEDULE = '0 1 * * *'; // Daily at 1 AM
  private readonly DEFAULT_CLEANUP_SCHEDULE = '0 2 * * *'; // Daily at 2 AM

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.storageService = StorageService.getInstance();
    this.backupService = BackupService.getInstance();
    this.jobs = new Map();
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  // Initialize all scheduled jobs
  public async initialize(config: Partial<SchedulerConfig> = {}): Promise<void> {
    const {
      backupSchedule = this.DEFAULT_BACKUP_SCHEDULE,
      storageOptimizationSchedule = this.DEFAULT_STORAGE_SCHEDULE,
      dataCleanupSchedule = this.DEFAULT_CLEANUP_SCHEDULE,
      retentionDays = this.DEFAULT_RETENTION_DAYS
    } = config;

    try {
      // Schedule database backup
      this.scheduleBackup(backupSchedule, retentionDays);

      // Schedule storage optimization
      this.scheduleStorageOptimization(storageOptimizationSchedule);

      // Schedule data cleanup
      this.scheduleDataCleanup(dataCleanupSchedule, retentionDays);

      logger.info('Scheduler service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scheduler service:', error);
      throw new Error('Failed to initialize scheduler service');
    }
  }

  // Schedule database backup
  private scheduleBackup(schedule: string, retentionDays: number): void {
    const job = new CronJob(
      schedule,
      async () => {
        try {
          logger.info('Starting scheduled database backup');
          const backupPath = await this.backupService.createBackup({
            retentionDays,
            compression: true,
            storage: 's3'
          });
          logger.info(`Database backup completed successfully: ${backupPath}`);

          // Verify backup
          const isValid = await this.backupService.verifyBackup(backupPath);
          if (!isValid) {
            logger.error('Backup verification failed');
            // Implement notification/alert system here
          }

          // Cleanup old backups
          await this.backupService.cleanupOldBackups({
            retentionDays,
            storage: 's3'
          });
        } catch (error) {
          logger.error('Scheduled backup failed:', error);
          // Implement notification/alert system here
        }
      },
      null, // onComplete
      true, // start
      'UTC' // timeZone
    );

    this.jobs.set('backup', job);
  }

  // Schedule storage optimization
  private scheduleStorageOptimization(schedule: string): void {
    const job = new CronJob(
      schedule,
      async () => {
        try {
          logger.info('Starting scheduled storage optimization');
          
          // Optimize storage
          await this.storageService.optimizeStorage();
          
          // Cleanup unused assets
          await this.storageService.cleanupUnusedAssets();
          
          // Get storage stats
          const stats = await this.storageService.getStorageStats();
          logger.info('Storage optimization completed', stats);
          
          // Implement storage usage alerts if needed
          if (stats.totalSize > 100 * 1024 * 1024 * 1024) { // 100GB
            logger.warn('Storage usage exceeds 100GB');
            // Implement notification/alert system here
          }
        } catch (error) {
          logger.error('Storage optimization failed:', error);
          // Implement notification/alert system here
        }
      },
      null,
      true,
      'UTC'
    );

    this.jobs.set('storage', job);
  }

  // Schedule data cleanup
  private scheduleDataCleanup(schedule: string, retentionDays: number): void {
    const job = new CronJob(
      schedule,
      async () => {
        try {
          logger.info('Starting scheduled data cleanup');
          
          // Cleanup old data
          await this.databaseService.cleanupOldData();
          
          // Enforce data retention policies
          await this.databaseService.enforceDataRetention();
          
          logger.info('Data cleanup completed successfully');
        } catch (error) {
          logger.error('Data cleanup failed:', error);
          // Implement notification/alert system here
        }
      },
      null,
      true,
      'UTC'
    );

    this.jobs.set('cleanup', job);
  }

  // Stop all scheduled jobs
  public stopAll(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped scheduled job: ${name}`);
    }
    this.jobs.clear();
  }

  // Get job status
  public getJobStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name, job] of this.jobs) {
      status[name] = job.running;
    }
    return status;
  }

  // Error handling
  private handleError(error: any): never {
    logger.error('Scheduler error:', error);
    throw new Error(error.message || 'Scheduler operation failed');
  }
} 