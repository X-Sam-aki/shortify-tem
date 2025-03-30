import { exec } from 'child_process';
import { promisify } from 'util';
import { DatabaseService } from './databaseService';
import { StorageService } from './storageService';
import { S3 } from 'aws-sdk';
import { createGzip } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const execAsync = promisify(exec);

interface BackupConfig {
  retentionDays: number;
  compression: boolean;
  storage: 'local' | 's3';
  s3Bucket?: string;
  s3Prefix?: string;
}

export class BackupService {
  private static instance: BackupService;
  private databaseService: DatabaseService;
  private storageService: StorageService;
  private s3: S3;
  private readonly DEFAULT_RETENTION_DAYS = 30;
  private readonly BACKUP_DIR = 'backups';

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.storageService = StorageService.getInstance();

    // Initialize S3 client if credentials are available
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3 = new S3({
        region: process.env.AWS_REGION || 'us-east-1'
      });
    }
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Database backup
  public async createBackup(config: Partial<BackupConfig> = {}): Promise<string> {
    const {
      retentionDays = this.DEFAULT_RETENTION_DAYS,
      compression = true,
      storage = 'local',
      s3Bucket = process.env.AWS_BACKUP_BUCKET,
      s3Prefix = 'database-backups'
    } = config;

    try {
      // Create backup directory if it doesn't exist
      await mkdir(this.BACKUP_DIR, { recursive: true });

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const filepath = join(this.BACKUP_DIR, filename);

      // Create backup using pg_dump
      const { stdout, stderr } = await execAsync(
        `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F c -f ${filepath}`
      );

      if (stderr) {
        throw new Error(`Backup failed: ${stderr}`);
      }

      // Compress backup if enabled
      if (compression) {
        const compressedFilepath = `${filepath}.gz`;
        await this.compressFile(filepath, compressedFilepath);
        // Remove original file after compression
        await execAsync(`rm ${filepath}`);
      }

      // Upload to S3 if configured
      if (storage === 's3' && this.s3 && s3Bucket) {
        const s3Key = `${s3Prefix}/${filename}${compression ? '.gz' : ''}`;
        await this.uploadToS3(filepath, s3Bucket, s3Key);
      }

      return filepath;
    } catch (error) {
      console.error('Backup error:', error);
      throw new Error('Failed to create backup');
    }
  }

  // File compression
  private async compressFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(inputPath);
      const writeStream = createWriteStream(outputPath);
      const gzip = createGzip();

      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  // S3 upload
  private async uploadToS3(filepath: string, bucket: string, key: string): Promise<void> {
    const fileStream = createReadStream(filepath);
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: fileStream
    };

    await this.s3.upload(uploadParams).promise();
  }

  // Backup restoration
  public async restoreBackup(backupPath: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync(
        `pg_restore -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c ${backupPath}`
      );

      if (stderr) {
        throw new Error(`Restore failed: ${stderr}`);
      }
    } catch (error) {
      console.error('Restore error:', error);
      throw new Error('Failed to restore backup');
    }
  }

  // Backup cleanup
  public async cleanupOldBackups(config: Partial<BackupConfig> = {}): Promise<void> {
    const { retentionDays = this.DEFAULT_RETENTION_DAYS, storage = 'local' } = config;

    try {
      if (storage === 'local') {
        // Clean up local backups
        const { stdout } = await execAsync(
          `find ${this.BACKUP_DIR} -type f -mtime +${retentionDays} -delete`
        );
      } else if (storage === 's3' && this.s3) {
        // Clean up S3 backups
        const bucket = process.env.AWS_BACKUP_BUCKET;
        const prefix = config.s3Prefix || 'database-backups';

        const { Contents } = await this.s3
          .listObjects({
            Bucket: bucket!,
            Prefix: prefix
          })
          .promise();

        if (Contents) {
          const oldBackups = Contents.filter(
            obj => obj.LastModified && obj.LastModified < new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
          );

          for (const backup of oldBackups) {
            await this.s3
              .deleteObject({
                Bucket: bucket!,
                Key: backup.Key!
              })
              .promise();
          }
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      throw new Error('Failed to cleanup old backups');
    }
  }

  // Backup verification
  public async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      // Try to restore to a temporary database
      const tempDbName = `temp_${Date.now()}`;
      
      // Create temporary database
      await execAsync(
        `createdb -h ${process.env.DB_HOST} -U ${process.env.DB_USER} ${tempDbName}`
      );

      // Attempt restore
      await execAsync(
        `pg_restore -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${tempDbName} -c ${backupPath}`
      );

      // Drop temporary database
      await execAsync(
        `dropdb -h ${process.env.DB_HOST} -U ${process.env.DB_USER} ${tempDbName}`
      );

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  // Backup scheduling
  public async scheduleBackup(config: Partial<BackupConfig> = {}): Promise<void> {
    // This is a placeholder for implementing scheduled backups
    // In production, you would use a job scheduler like cron or AWS EventBridge
    console.log('Backup scheduled with config:', config);
  }

  // Error handling
  private handleError(error: any): never {
    console.error('Backup error:', error);
    throw new Error(error.message || 'Backup operation failed');
  }
} 