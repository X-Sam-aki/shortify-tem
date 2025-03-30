import Bull from 'bull';
import { logger } from '@/utils/logger';
import { CacheService } from './cacheService';

interface QueueOptions {
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

interface JobStats {
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface JobProgress {
  jobId: string;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: any;
}

export class QueueService {
  private static instance: QueueService;
  private videoQueue: Bull.Queue;
  private cacheService: CacheService;
  private readonly DEFAULT_ATTEMPTS = 3;
  private readonly DEFAULT_BACKOFF = {
    type: 'exponential' as const,
    delay: 1000
  };

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.videoQueue = new Bull('video-generation', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        attempts: this.DEFAULT_ATTEMPTS,
        backoff: this.DEFAULT_BACKOFF,
        removeOnComplete: 100
      }
    });

    this.setupEventHandlers();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private setupEventHandlers(): void {
    this.videoQueue.on('error', (error) => {
      logger.error('Queue error:', error);
    });

    this.videoQueue.on('waiting', (jobId) => {
      logger.info(`Job ${jobId} is waiting`);
      this.updateJobProgress(jobId, 0, 'waiting');
    });

    this.videoQueue.on('active', (job) => {
      logger.info(`Job ${job.id} has started processing`);
      this.updateJobProgress(job.id, 0, 'processing');
    });

    this.videoQueue.on('progress', (job, progress) => {
      logger.info(`Job ${job.id} progress: ${progress}%`);
      this.updateJobProgress(job.id, progress, 'processing');
    });

    this.videoQueue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} has completed`);
      this.updateJobProgress(job.id, 100, 'completed', undefined, result);
    });

    this.videoQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} has failed:`, error);
      this.updateJobProgress(job.id, 0, 'failed', error.message);
    });
  }

  // Add job to queue
  public async addJob(data: any, options: QueueOptions = {}): Promise<Bull.Job> {
    try {
      const job = await this.videoQueue.add(data, {
        attempts: options.attempts || this.DEFAULT_ATTEMPTS,
        backoff: options.backoff || this.DEFAULT_BACKOFF,
        removeOnComplete: options.removeOnComplete ?? true,
        removeOnFail: options.removeOnFail ?? false
      });

      // Initialize job progress
      await this.updateJobProgress(job.id, 0, 'waiting');

      return job;
    } catch (error) {
      logger.error('Failed to add job:', error);
      throw error;
    }
  }

  // Update job progress
  private async updateJobProgress(
    jobId: string,
    progress: number,
    status: JobProgress['status'],
    error?: string,
    result?: any
  ): Promise<void> {
    const progressData: JobProgress = {
      jobId,
      progress,
      status,
      error,
      result
    };

    await this.cacheService.set(`job:${jobId}:progress`, progressData, {
      ttl: 24 * 60 * 60 // 24 hours
    });
  }

  // Get job progress
  public async getJobProgress(jobId: string): Promise<JobProgress | null> {
    return this.cacheService.get<JobProgress>(`job:${jobId}:progress`);
  }

  // Get job by ID
  public async getJob(jobId: string): Promise<Bull.Job | null> {
    try {
      return await this.videoQueue.getJob(jobId);
    } catch (error) {
      logger.error('Failed to get job:', error);
      return null;
    }
  }

  // Get queue statistics
  public async getStats(): Promise<JobStats> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.videoQueue.getWaitingCount(),
        this.videoQueue.getActiveCount(),
        this.videoQueue.getCompletedCount(),
        this.videoQueue.getFailedCount(),
        this.videoQueue.getDelayedCount()
      ]);

      return {
        total: waiting + active + completed + failed + delayed,
        waiting,
        active,
        completed,
        failed,
        delayed
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return {
        total: 0,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      };
    }
  }

  // Pause queue
  public async pause(): Promise<void> {
    try {
      await this.videoQueue.pause();
      logger.info('Queue paused');
    } catch (error) {
      logger.error('Failed to pause queue:', error);
      throw error;
    }
  }

  // Resume queue
  public async resume(): Promise<void> {
    try {
      await this.videoQueue.resume();
      logger.info('Queue resumed');
    } catch (error) {
      logger.error('Failed to resume queue:', error);
      throw error;
    }
  }

  // Clean old jobs
  public async cleanOldJobs(grace: number = 3600000): Promise<void> {
    try {
      await this.videoQueue.clean(grace, 'completed');
      await this.videoQueue.clean(grace, 'failed');
      logger.info('Old jobs cleaned');
    } catch (error) {
      logger.error('Failed to clean old jobs:', error);
      throw error;
    }
  }

  // Retry failed jobs
  public async retryFailedJobs(): Promise<void> {
    try {
      const failedJobs = await this.videoQueue.getFailed();
      for (const job of failedJobs) {
        await job.retry();
      }
      logger.info(`${failedJobs.length} failed jobs retried`);
    } catch (error) {
      logger.error('Failed to retry failed jobs:', error);
      throw error;
    }
  }

  // Close queue
  public async close(): Promise<void> {
    try {
      await this.videoQueue.close();
      logger.info('Queue closed');
    } catch (error) {
      logger.error('Failed to close queue:', error);
      throw error;
    }
  }
} 