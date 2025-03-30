import { RateLimiter } from 'limiter';
import { CacheService } from './cacheService';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

interface ApiKey {
  key: string;
  userId: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  lastUsed: Date;
  expiresAt?: Date;
  isActive: boolean;
}

interface RateLimitConfig {
  points: number;
  duration: number;
}

interface SecurityConfig {
  rateLimits: {
    default: RateLimitConfig;
    premium: RateLimitConfig;
    admin: RateLimitConfig;
  };
  apiKeyExpiry: number;
  maxApiKeysPerUser: number;
  allowedOrigins: string[];
  securityHeaders: Record<string, string>;
}

export class SecurityService {
  private static instance: SecurityService;
  private cacheService: CacheService;
  private rateLimiters: Map<string, RateLimiter>;
  private config: SecurityConfig;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.rateLimiters = new Map();
    this.config = {
      rateLimits: {
        default: {
          points: parseInt(process.env.RATE_LIMIT_POINTS || '100'),
          duration: parseInt(process.env.RATE_LIMIT_DURATION || '3600')
        },
        premium: {
          points: parseInt(process.env.PREMIUM_RATE_LIMIT_POINTS || '500'),
          duration: parseInt(process.env.PREMIUM_RATE_LIMIT_DURATION || '3600')
        },
        admin: {
          points: parseInt(process.env.ADMIN_RATE_LIMIT_POINTS || '1000'),
          duration: parseInt(process.env.ADMIN_RATE_LIMIT_DURATION || '3600')
        }
      },
      apiKeyExpiry: parseInt(process.env.API_KEY_EXPIRY || '86400'),
      maxApiKeysPerUser: parseInt(process.env.MAX_API_KEYS_PER_USER || '5'),
      allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
      securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      }
    };
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // API Key Management
  public async generateApiKey(userId: string, name: string, permissions: string[]): Promise<ApiKey> {
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey: ApiKey = {
      key,
      userId,
      name,
      permissions,
      createdAt: new Date(),
      lastUsed: new Date(),
      expiresAt: new Date(Date.now() + this.config.apiKeyExpiry * 1000),
      isActive: true
    };

    await this.cacheService.set(`apiKey:${key}`, apiKey, { ttl: this.config.apiKeyExpiry });
    await this.updateUserApiKeys(userId, key);

    return apiKey;
  }

  private async updateUserApiKeys(userId: string, key: string): Promise<void> {
    const userKeys = await this.cacheService.get<string[]>(`userApiKeys:${userId}`) || [];
    userKeys.push(key);

    if (userKeys.length > this.config.maxApiKeysPerUser) {
      const oldestKey = userKeys[0];
      await this.revokeApiKey(oldestKey);
      userKeys.shift();
    }

    await this.cacheService.set(`userApiKeys:${userId}`, userKeys);
  }

  public async validateApiKey(key: string): Promise<ApiKey | null> {
    const apiKey = await this.cacheService.get<ApiKey>(`apiKey:${key}`);
    
    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      await this.revokeApiKey(key);
      return null;
    }

    // Update last used timestamp
    apiKey.lastUsed = new Date();
    await this.cacheService.set(`apiKey:${key}`, apiKey);

    return apiKey;
  }

  public async revokeApiKey(key: string): Promise<void> {
    const apiKey = await this.cacheService.get<ApiKey>(`apiKey:${key}`);
    if (apiKey) {
      const userKeys = await this.cacheService.get<string[]>(`userApiKeys:${apiKey.userId}`);
      if (userKeys) {
        const updatedKeys = userKeys.filter(k => k !== key);
        await this.cacheService.set(`userApiKeys:${apiKey.userId}`, updatedKeys);
      }
      await this.cacheService.delete(`apiKey:${key}`);
    }
  }

  // Rate Limiting
  public async checkRateLimit(identifier: string, userType: 'default' | 'premium' | 'admin' = 'default'): Promise<boolean> {
    const limiter = this.getRateLimiter(identifier, userType);
    const hasToken = await limiter.tryRemoveTokens(1);
    return hasToken;
  }

  private getRateLimiter(identifier: string, userType: 'default' | 'premium' | 'admin'): RateLimiter {
    const key = `${userType}:${identifier}`;
    let limiter = this.rateLimiters.get(key);

    if (!limiter) {
      const config = this.config.rateLimits[userType];
      limiter = new RateLimiter({
        tokensPerInterval: config.points,
        interval: config.duration * 1000
      });
      this.rateLimiters.set(key, limiter);
    }

    return limiter;
  }

  // Input Validation
  public validateInput(input: any, schema: any): boolean {
    try {
      // Implement JSON Schema validation
      // This is a placeholder for actual validation logic
      return true;
    } catch (error) {
      logger.error('Input validation error:', error);
      return false;
    }
  }

  // Security Headers
  public getSecurityHeaders(): Record<string, string> {
    return { ...this.config.securityHeaders };
  }

  // CORS Configuration
  public isOriginAllowed(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin);
  }

  // Request Sanitization
  public sanitizeInput(input: any): any {
    if (typeof input !== 'object') {
      return input;
    }

    const sanitized: any = Array.isArray(input) ? [] : {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[&]/g, '&amp;')
      .replace(/["]/g, '&quot;')
      .replace(/[']/g, '&#x27;')
      .replace(/[/]/g, '&#x2F;')
      .trim();
  }

  // Security Monitoring
  public async logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    userId?: string;
    ip?: string;
  }): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event
    };

    await this.cacheService.set(
      `security:event:${timestamp}`,
      logEntry,
      { ttl: 86400 * 7 } // Keep logs for 7 days
    );

    if (event.severity === 'critical') {
      // Implement critical event notification
      logger.error('Critical security event:', logEntry);
    }
  }

  public async getSecurityEvents(
    startDate: Date,
    endDate: Date,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<any[]> {
    // Implement security event retrieval
    return [];
  }

  public async close(): Promise<void> {
    // Clean up resources
    this.rateLimiters.clear();
  }
} 