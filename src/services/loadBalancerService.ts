import { QueueService } from './queueService';
import { PerformanceService } from './performanceService';
import { logger } from '@/utils/logger';

interface WorkerStats {
  id: string;
  status: 'idle' | 'busy' | 'error';
  currentJobs: number;
  maxJobs: number;
  lastHeartbeat: number;
  performance: {
    cpu: number;
    memory: number;
    queueLength: number;
  };
}

interface LoadBalancerOptions {
  maxWorkers: number;
  maxJobsPerWorker: number;
  healthCheckInterval: number;
  workerTimeout: number;
}

export class LoadBalancerService {
  private static instance: LoadBalancerService;
  private queueService: QueueService;
  private performanceService: PerformanceService;
  private workers: Map<string, WorkerStats>;
  private options: LoadBalancerOptions;
  private healthCheckInterval: NodeJS.Timeout;

  private constructor() {
    this.queueService = QueueService.getInstance();
    this.performanceService = PerformanceService.getInstance();
    this.workers = new Map();
    this.options = {
      maxWorkers: parseInt(process.env.MAX_WORKERS || '5'),
      maxJobsPerWorker: parseInt(process.env.MAX_JOBS_PER_WORKER || '3'),
      healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
      workerTimeout: parseInt(process.env.WORKER_TIMEOUT || '60000')
    };
    this.startHealthCheck();
  }

  public static getInstance(): LoadBalancerService {
    if (!LoadBalancerService.instance) {
      LoadBalancerService.instance = new LoadBalancerService();
    }
    return LoadBalancerService.instance;
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkWorkersHealth();
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, this.options.healthCheckInterval);
  }

  private async checkWorkersHealth(): Promise<void> {
    const now = Date.now();
    const metrics = await this.performanceService.getCurrentMetrics();

    // Update worker stats based on performance metrics
    for (const [workerId, stats] of this.workers.entries()) {
      if (now - stats.lastHeartbeat > this.options.workerTimeout) {
        // Worker is unresponsive
        stats.status = 'error';
        logger.warn(`Worker ${workerId} is unresponsive`);
      }

      // Update performance metrics
      stats.performance = {
        cpu: metrics.system.cpu.usage,
        memory: (metrics.system.memory.used / metrics.system.memory.total) * 100,
        queueLength: metrics.queue.waiting
      };
    }

    // Remove dead workers
    for (const [workerId, stats] of this.workers.entries()) {
      if (stats.status === 'error') {
        this.workers.delete(workerId);
      }
    }
  }

  public async registerWorker(workerId: string): Promise<void> {
    if (this.workers.size >= this.options.maxWorkers) {
      throw new Error('Maximum number of workers reached');
    }

    this.workers.set(workerId, {
      id: workerId,
      status: 'idle',
      currentJobs: 0,
      maxJobs: this.options.maxJobsPerWorker,
      lastHeartbeat: Date.now(),
      performance: {
        cpu: 0,
        memory: 0,
        queueLength: 0
      }
    });

    logger.info(`Worker ${workerId} registered`);
  }

  public async unregisterWorker(workerId: string): Promise<void> {
    this.workers.delete(workerId);
    logger.info(`Worker ${workerId} unregistered`);
  }

  public async updateWorkerStatus(workerId: string, status: 'idle' | 'busy' | 'error'): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    worker.status = status;
    worker.lastHeartbeat = Date.now();
  }

  public async updateWorkerJobs(workerId: string, currentJobs: number): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    worker.currentJobs = currentJobs;
    worker.lastHeartbeat = Date.now();
  }

  public async getOptimalWorker(): Promise<string | null> {
    const availableWorkers = Array.from(this.workers.entries())
      .filter(([_, stats]) => 
        stats.status === 'idle' && 
        stats.currentJobs < stats.maxJobs
      )
      .sort(([_, a], [__, b]) => {
        // Sort by current jobs (ascending) and then by performance (descending)
        if (a.currentJobs !== b.currentJobs) {
          return a.currentJobs - b.currentJobs;
        }
        return (b.performance.cpu + b.performance.memory) - (a.performance.cpu + a.performance.memory);
      });

    return availableWorkers[0]?.[0] || null;
  }

  public async distributeJob(jobData: any): Promise<string> {
    const workerId = await this.getOptimalWorker();
    if (!workerId) {
      throw new Error('No available workers');
    }

    // Add job to queue with worker assignment
    const job = await this.queueService.addJob({
      ...jobData,
      workerId,
      priority: this.calculateJobPriority(jobData)
    });

    // Update worker status
    await this.updateWorkerStatus(workerId, 'busy');
    await this.updateWorkerJobs(workerId, (this.workers.get(workerId)?.currentJobs || 0) + 1);

    return job.id;
  }

  private calculateJobPriority(jobData: any): number {
    // Implement priority calculation based on various factors
    let priority = 0;

    // Higher priority for premium users
    if (jobData.userType === 'premium') {
      priority += 100;
    }

    // Higher priority for shorter videos
    if (jobData.duration < 30) {
      priority += 50;
    }

    // Higher priority for urgent jobs
    if (jobData.urgent) {
      priority += 200;
    }

    return priority;
  }

  public async getWorkerStats(): Promise<WorkerStats[]> {
    return Array.from(this.workers.values());
  }

  public async getLoadStats(): Promise<{
    totalWorkers: number;
    activeWorkers: number;
    totalJobs: number;
    averageLoad: number;
  }> {
    const stats = await this.getWorkerStats();
    const activeWorkers = stats.filter(w => w.status === 'busy').length;
    const totalJobs = stats.reduce((sum, w) => sum + w.currentJobs, 0);
    const averageLoad = stats.reduce((sum, w) => sum + (w.currentJobs / w.maxJobs), 0) / stats.length;

    return {
      totalWorkers: stats.length,
      activeWorkers,
      totalJobs,
      averageLoad
    };
  }

  public async close(): Promise<void> {
    clearInterval(this.healthCheckInterval);
    this.workers.clear();
  }
} 