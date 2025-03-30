import { CacheService } from '@/services/cacheService';
import { QueueService } from '@/services/queueService';
import { PerformanceService } from '@/services/performanceService';
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(async () => {
  // Clear Redis cache
  const cacheService = CacheService.getInstance();
  await cacheService.clear('*');

  // Clear queue
  const queueService = QueueService.getInstance();
  await queueService.cleanOldJobs(0);

  // Reset performance metrics
  const performanceService = PerformanceService.getInstance();
  await performanceService.getCurrentMetrics();
});

// Clean up after all tests
afterAll(async () => {
  // Close Redis connection
  const cacheService = CacheService.getInstance();
  await cacheService.close();

  // Close queue connection
  const queueService = QueueService.getInstance();
  await queueService.close();
}); 