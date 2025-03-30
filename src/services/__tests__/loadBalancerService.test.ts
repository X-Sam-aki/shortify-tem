import { LoadBalancerService } from '../loadBalancerService';
import { QueueService } from '../queueService';
import { PerformanceService } from '../performanceService';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../queueService');
jest.mock('../performanceService');

describe('LoadBalancerService', () => {
  let loadBalancerService: LoadBalancerService;
  let mockQueueService: jest.Mocked<QueueService>;
  let mockPerformanceService: jest.Mocked<PerformanceService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock QueueService
    mockQueueService = {
      getInstance: jest.fn().mockReturnThis(),
      addJob: jest.fn().mockResolvedValue({ id: 'test-job-id' })
    } as any;

    // Mock PerformanceService
    mockPerformanceService = {
      getInstance: jest.fn().mockReturnThis(),
      getCurrentMetrics: jest.fn().mockResolvedValue({
        system: {
          cpu: { usage: 50, cores: 4, load: [1, 2, 3] },
          memory: { total: 1000, used: 500, free: 500, swap: { total: 1000, used: 0, free: 1000 } },
          disk: { total: 1000, used: 500, free: 500 },
          network: { interfaces: {} }
        },
        queue: { waiting: 5, active: 2, completed: 100, failed: 0 },
        cache: { hits: 100, misses: 20, errors: 0, size: 1024 },
        api: { requests: 1000, errors: 10, avgResponseTime: 100 }
      })
    } as any;

    // Get instance
    loadBalancerService = LoadBalancerService.getInstance();
  });

  describe('worker registration', () => {
    it('should register a new worker', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].id).toBe(workerId);
      expect(stats[0].status).toBe('idle');
    });

    it('should not register more workers than maxWorkers', async () => {
      const maxWorkers = 3;
      for (let i = 0; i < maxWorkers + 1; i++) {
        if (i < maxWorkers) {
          await loadBalancerService.registerWorker(`worker-${i}`);
        } else {
          await expect(loadBalancerService.registerWorker(`worker-${i}`))
            .rejects
            .toThrow('Maximum number of workers reached');
        }
      }
    });

    it('should unregister a worker', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);
      await loadBalancerService.unregisterWorker(workerId);

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats).toHaveLength(0);
    });
  });

  describe('worker status updates', () => {
    it('should update worker status', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);
      await loadBalancerService.updateWorkerStatus(workerId, 'busy');

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats[0].status).toBe('busy');
    });

    it('should update worker jobs count', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);
      await loadBalancerService.updateWorkerJobs(workerId, 2);

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats[0].currentJobs).toBe(2);
    });

    it('should throw error when updating non-existent worker', async () => {
      await expect(loadBalancerService.updateWorkerStatus('non-existent', 'busy'))
        .rejects
        .toThrow('Worker non-existent not found');
    });
  });

  describe('job distribution', () => {
    it('should distribute job to optimal worker', async () => {
      // Register workers with different loads
      await loadBalancerService.registerWorker('worker-1');
      await loadBalancerService.registerWorker('worker-2');
      await loadBalancerService.updateWorkerJobs('worker-1', 2);

      const jobData = {
        userType: 'premium',
        duration: 20,
        urgent: true
      };

      const jobId = await loadBalancerService.distributeJob(jobData);

      expect(jobId).toBe('test-job-id');
      expect(mockQueueService.addJob).toHaveBeenCalledWith({
        ...jobData,
        workerId: 'worker-2',
        priority: expect.any(Number)
      });
    });

    it('should throw error when no workers available', async () => {
      const jobData = { duration: 30 };
      await expect(loadBalancerService.distributeJob(jobData))
        .rejects
        .toThrow('No available workers');
    });
  });

  describe('load statistics', () => {
    it('should return correct load stats', async () => {
      // Register and update workers
      await loadBalancerService.registerWorker('worker-1');
      await loadBalancerService.registerWorker('worker-2');
      await loadBalancerService.updateWorkerStatus('worker-1', 'busy');
      await loadBalancerService.updateWorkerJobs('worker-1', 2);
      await loadBalancerService.updateWorkerJobs('worker-2', 1);

      const stats = await loadBalancerService.getLoadStats();

      expect(stats).toEqual({
        totalWorkers: 2,
        activeWorkers: 1,
        totalJobs: 3,
        averageLoad: 0.75
      });
    });
  });

  describe('worker health check', () => {
    it('should mark worker as error when unresponsive', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);

      // Simulate time passing
      jest.advanceTimersByTime(61000); // More than workerTimeout

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats[0].status).toBe('error');
    });

    it('should remove dead workers', async () => {
      const workerId = 'worker-1';
      await loadBalancerService.registerWorker(workerId);
      await loadBalancerService.updateWorkerStatus(workerId, 'error');

      // Simulate time passing
      jest.advanceTimersByTime(61000);

      const stats = await loadBalancerService.getWorkerStats();
      expect(stats).toHaveLength(0);
    });
  });
}); 