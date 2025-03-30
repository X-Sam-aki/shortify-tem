import { PerformanceService } from '../performanceService';
import { CacheService } from '../cacheService';
import { QueueService } from '../queueService';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../cacheService');
jest.mock('../queueService');

describe('PerformanceService', () => {
  let performanceService: PerformanceService;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockQueueService: jest.Mocked<QueueService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock CacheService
    mockCacheService = {
      getInstance: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      getStats: jest.fn().mockReturnValue({
        hits: 100,
        misses: 20,
        errors: 0,
        size: 1024
      })
    } as any;

    // Mock QueueService
    mockQueueService = {
      getInstance: jest.fn().mockReturnThis(),
      getStats: jest.fn().mockReturnValue({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 0
      })
    } as any;

    // Get instance
    performanceService = PerformanceService.getInstance();
  });

  describe('getCurrentMetrics', () => {
    it('should return current metrics from cache if available', async () => {
      const mockMetrics = {
        timestamp: Date.now(),
        system: {
          cpu: { usage: 50, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 500, free: 500, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 5, active: 2, completed: 100, failed: 0 },
        cache: { hits: 100, misses: 20, errors: 0, size: 1024 },
        api: { requests: 1000, errors: 10, avgResponseTime: 100 }
      };

      mockCacheService.get.mockResolvedValue(mockMetrics);

      const metrics = await performanceService.getCurrentMetrics();
      expect(metrics).toEqual(mockMetrics);
    });

    it('should return initialized metrics if cache is empty', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const metrics = await performanceService.getCurrentMetrics();
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('system');
      expect(metrics).toHaveProperty('queue');
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('api');
    });
  });

  describe('getMetricsHistory', () => {
    it('should return metrics history with specified limit', async () => {
      const mockHistory = Array(150).fill(null).map((_, i) => ({
        timestamp: Date.now() - i * 60000,
        system: {},
        queue: {},
        cache: {},
        api: {}
      }));

      mockCacheService.get.mockResolvedValue(mockHistory);

      const history = await performanceService.getMetricsHistory(100);
      expect(history).toHaveLength(100);
      expect(history[0].timestamp).toBeGreaterThan(history[99].timestamp);
    });

    it('should return empty array if no history available', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const history = await performanceService.getMetricsHistory();
      expect(history).toEqual([]);
    });
  });

  describe('recordApiRequest', () => {
    it('should update API metrics correctly', async () => {
      const responseTime = 100;
      const error = false;

      await performanceService.recordApiRequest(responseTime, error);

      expect(mockCacheService.set).toHaveBeenCalled();
      const setCall = mockCacheService.set.mock.calls[0];
      expect(setCall[1].api.requests).toBe(1);
      expect(setCall[1].api.errors).toBe(0);
      expect(setCall[1].api.avgResponseTime).toBe(responseTime);
    });

    it('should handle errors correctly', async () => {
      const responseTime = 100;
      const error = true;

      await performanceService.recordApiRequest(responseTime, error);

      expect(mockCacheService.set).toHaveBeenCalled();
      const setCall = mockCacheService.set.mock.calls[0];
      expect(setCall[1].api.requests).toBe(1);
      expect(setCall[1].api.errors).toBe(1);
      expect(setCall[1].api.avgResponseTime).toBe(responseTime);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all metrics are good', async () => {
      const mockMetrics = {
        system: {
          cpu: { usage: 50, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 500, free: 500, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 5, active: 2, completed: 100, failed: 0 },
        cache: { hits: 100, misses: 20, errors: 0, size: 1024 },
        api: { requests: 1000, errors: 10, avgResponseTime: 100 }
      };

      mockCacheService.get.mockResolvedValue(mockMetrics);

      const health = await performanceService.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.issues).toHaveLength(0);
    });

    it('should return warning status when some metrics are concerning', async () => {
      const mockMetrics = {
        system: {
          cpu: { usage: 85, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 500, free: 500, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 5, active: 2, completed: 100, failed: 1 },
        cache: { hits: 100, misses: 20, errors: 0, size: 1024 },
        api: { requests: 1000, errors: 10, avgResponseTime: 100 }
      };

      mockCacheService.get.mockResolvedValue(mockMetrics);

      const health = await performanceService.getHealthStatus();
      expect(health.status).toBe('warning');
      expect(health.issues).toHaveLength(2);
    });

    it('should return critical status when multiple metrics are concerning', async () => {
      const mockMetrics = {
        system: {
          cpu: { usage: 95, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 950, free: 50, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 5, active: 2, completed: 100, failed: 5 },
        cache: { hits: 100, misses: 20, errors: 2, size: 1024 },
        api: { requests: 1000, errors: 100, avgResponseTime: 100 }
      };

      mockCacheService.get.mockResolvedValue(mockMetrics);

      const health = await performanceService.getHealthStatus();
      expect(health.status).toBe('critical');
      expect(health.issues.length).toBeGreaterThan(2);
    });
  });

  describe('getPerformanceReport', () => {
    it('should return complete performance report', async () => {
      const mockMetrics = {
        system: {
          cpu: { usage: 85, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 500, free: 500, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 150, active: 2, completed: 100, failed: 0 },
        cache: { hits: 50, misses: 100, errors: 0, size: 1024 },
        api: { requests: 1000, errors: 10, avgResponseTime: 100 }
      };

      mockCacheService.get.mockResolvedValue(mockMetrics);

      const report = await performanceService.getPerformanceReport();
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('health');
      expect(report).toHaveProperty('recommendations');
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });
}); 