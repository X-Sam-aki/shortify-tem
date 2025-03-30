import { CacheService } from './cacheService';
import { QueueService } from './queueService';
import { logger } from '@/utils/logger';
import os from 'os';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    swap: {
      total: number;
      used: number;
      free: number;
    };
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    interfaces: Record<string, {
      bytesReceived: number;
      bytesSent: number;
    }>;
  };
}

interface PerformanceMetrics {
  timestamp: number;
  system: SystemMetrics;
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  cache: {
    hits: number;
    misses: number;
    errors: number;
    size: number;
  };
  api: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
}

export class PerformanceService {
  private static instance: PerformanceService;
  private cacheService: CacheService;
  private queueService: QueueService;
  private metrics: PerformanceMetrics;
  private readonly METRICS_TTL = 24 * 60 * 60; // 24 hours
  private readonly METRICS_KEY = 'performance:metrics';
  private readonly METRICS_HISTORY_KEY = 'performance:history';
  private readonly MAX_HISTORY = 1000;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.queueService = QueueService.getInstance();
    this.metrics = this.initializeMetrics();
    this.startMonitoring();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      system: this.getSystemMetrics(),
      queue: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        errors: 0,
        size: 0
      },
      api: {
        requests: 0,
        errors: 0,
        avgResponseTime: 0
      }
    };
  }

  private getSystemMetrics(): SystemMetrics {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: {
        usage: cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length,
        cores: cpus.length,
        load: os.loadavg()
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        swap: {
          total: os.totalmem(),
          used: os.totalmem() - os.freemem(),
          free: os.freemem()
        }
      },
      disk: {
        total: 0, // Implement disk metrics
        used: 0,
        free: 0
      },
      network: {
        interfaces: os.networkInterfaces()
      }
    };
  }

  private async startMonitoring(): Promise<void> {
    // Collect metrics every minute
    setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        logger.error('Failed to collect metrics:', error);
      }
    }, 60000);
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Update system metrics
      this.metrics.system = this.getSystemMetrics();

      // Update queue metrics
      const queueStats = await this.queueService.getStats();
      this.metrics.queue = {
        waiting: queueStats.waiting,
        active: queueStats.active,
        completed: queueStats.completed,
        failed: queueStats.failed
      };

      // Update cache metrics
      const cacheStats = this.cacheService.getStats();
      this.metrics.cache = {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        errors: cacheStats.errors,
        size: cacheStats.size
      };

      // Update timestamp
      this.metrics.timestamp = Date.now();

      // Save current metrics
      await this.cacheService.set(this.METRICS_KEY, this.metrics, {
        ttl: this.METRICS_TTL
      });

      // Add to history
      await this.addToHistory(this.metrics);
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  private async addToHistory(metrics: PerformanceMetrics): Promise<void> {
    try {
      const history = await this.cacheService.get<PerformanceMetrics[]>(this.METRICS_HISTORY_KEY) || [];
      history.push(metrics);

      // Keep only the last MAX_HISTORY entries
      if (history.length > this.MAX_HISTORY) {
        history.shift();
      }

      await this.cacheService.set(this.METRICS_HISTORY_KEY, history, {
        ttl: this.METRICS_TTL
      });
    } catch (error) {
      logger.error('Failed to add metrics to history:', error);
      throw error;
    }
  }

  // Get current metrics
  public async getCurrentMetrics(): Promise<PerformanceMetrics> {
    try {
      const metrics = await this.cacheService.get<PerformanceMetrics>(this.METRICS_KEY);
      return metrics || this.metrics;
    } catch (error) {
      logger.error('Failed to get current metrics:', error);
      return this.metrics;
    }
  }

  // Get metrics history
  public async getMetricsHistory(limit: number = 100): Promise<PerformanceMetrics[]> {
    try {
      const history = await this.cacheService.get<PerformanceMetrics[]>(this.METRICS_HISTORY_KEY) || [];
      return history.slice(-limit);
    } catch (error) {
      logger.error('Failed to get metrics history:', error);
      return [];
    }
  }

  // Record API request
  public async recordApiRequest(responseTime: number, error: boolean = false): Promise<void> {
    try {
      this.metrics.api.requests++;
      if (error) {
        this.metrics.api.errors++;
      }
      this.metrics.api.avgResponseTime = 
        (this.metrics.api.avgResponseTime * (this.metrics.api.requests - 1) + responseTime) / 
        this.metrics.api.requests;

      await this.cacheService.set(this.METRICS_KEY, this.metrics, {
        ttl: this.METRICS_TTL
      });
    } catch (error) {
      logger.error('Failed to record API request:', error);
      throw error;
    }
  }

  // Get system health status
  public async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
  }> {
    const issues: string[] = [];
    const metrics = await this.getCurrentMetrics();

    // Check CPU usage
    if (metrics.system.cpu.usage > 90) {
      issues.push('High CPU usage detected');
    }

    // Check memory usage
    const memoryUsage = (metrics.system.memory.used / metrics.system.memory.total) * 100;
    if (memoryUsage > 90) {
      issues.push('High memory usage detected');
    }

    // Check queue health
    if (metrics.queue.failed > 0) {
      issues.push('Failed jobs detected in queue');
    }

    // Check cache health
    if (metrics.cache.errors > 0) {
      issues.push('Cache errors detected');
    }

    // Check API health
    const errorRate = (metrics.api.errors / metrics.api.requests) * 100;
    if (errorRate > 5) {
      issues.push('High API error rate detected');
    }

    return {
      status: issues.length === 0 ? 'healthy' : issues.length > 2 ? 'critical' : 'warning',
      issues
    };
  }

  // Get performance report
  public async getPerformanceReport(): Promise<{
    metrics: PerformanceMetrics;
    health: {
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
    };
    recommendations: string[];
  }> {
    const metrics = await this.getCurrentMetrics();
    const health = await this.getHealthStatus();
    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (metrics.system.cpu.usage > 80) {
      recommendations.push('Consider scaling horizontally to reduce CPU load');
    }

    if (metrics.queue.waiting > 100) {
      recommendations.push('Consider adding more workers to process queue faster');
    }

    if (metrics.cache.misses > metrics.cache.hits) {
      recommendations.push('Optimize cache strategy to improve hit rate');
    }

    return {
      metrics,
      health,
      recommendations
    };
  }
} 