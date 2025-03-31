import Redis from 'ioredis';
import { logger } from '@/utils/logger';
import { Product } from '@/types/product';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  size: number;
}

export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private stats: CacheStats;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly DEFAULT_PREFIX = 'shortify:';

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      size: 0
    };

    this.client.on('error', (error) => {
      logger.error('Redis connection error:', error);
      this.stats.errors++;
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  private getKey(key: string, prefix: string = this.DEFAULT_PREFIX): string {
    return `${prefix}${key}`;
  }

  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { prefix = this.DEFAULT_PREFIX } = options;
    const fullKey = `${prefix}${key}`;

    try {
      const value = await this.client.get(fullKey);
      if (value) {
        this.stats.hits++;
        return JSON.parse(value) as T;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache get error:', error);
      return null;
    }
  }

  public async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.DEFAULT_TTL, prefix = this.DEFAULT_PREFIX } = options;
    const fullKey = `${prefix}${key}`;

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(fullKey, serializedValue, 'EX', ttl);
      this.stats.size += serializedValue.length;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache set error:', error);
    }
  }

  public async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const { prefix = this.DEFAULT_PREFIX } = options;
    const fullKey = `${prefix}${key}`;

    try {
      await this.client.del(fullKey);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete error:', error);
    }
  }

  public async clear(pattern: string, options: CacheOptions = {}): Promise<void> {
    const { prefix = this.DEFAULT_PREFIX } = options;
    const fullPattern = `${prefix}${pattern}`;

    try {
      const keys = await this.client.keys(fullPattern);
      if (keys.length > 0) {
        // Handle keys correctly: use spread for multiple keys but as separate arguments
        await this.client.del(...keys);
      }
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache clear error:', error);
    }
  }

  public async getProduct(url: string): Promise<Product | null> {
    return this.get<Product>(url, { prefix: 'product:' });
  }

  public async setProduct(url: string, product: Product): Promise<void> {
    await this.set(url, product, { prefix: 'product:' });
  }

  public async deleteProduct(url: string): Promise<void> {
    await this.delete(url, { prefix: 'product:' });
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      size: 0
    };
  }

  public async getSize(): Promise<number> {
    try {
      const info = await this.client.info('memory');
      const usedMemory = info.match(/used_memory_human:(\d+)/)?.[1];
      return usedMemory ? parseInt(usedMemory) : 0;
    } catch (error) {
      logger.error('Failed to get cache size:', error);
      return 0;
    }
  }

  public async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const { prefix = this.DEFAULT_PREFIX } = options;
    const fullKey = `${prefix}${key}`;

    try {
      return (await this.client.exists(fullKey)) === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  public async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    const { prefix = this.DEFAULT_PREFIX } = options;
    const fullKeys = keys.map(key => `${prefix}${key}`);

    try {
      // The Redis mget method accepts a rest parameter (...keys) or an array
      // We need to handle both cases, so we spread the array for Redis
      const values = await this.client.mget(...fullKeys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  public async mset(entries: { key: string; value: any }[], options: CacheOptions = {}): Promise<void> {
    const { ttl = this.DEFAULT_TTL, prefix = this.DEFAULT_PREFIX } = options;
    const pipeline = this.client.pipeline();

    try {
      entries.forEach(({ key, value }) => {
        const fullKey = `${prefix}${key}`;
        const serializedValue = JSON.stringify(value);
        pipeline.set(fullKey, serializedValue, 'EX', ttl);
        this.stats.size += serializedValue.length;
      });
      await pipeline.exec();
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mset error:', error);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Failed to close Redis connection:', error);
    }
  }
}
