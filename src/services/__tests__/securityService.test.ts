import { SecurityService } from '../securityService';
import { CacheService } from '../cacheService';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../cacheService');

describe('SecurityService', () => {
  let securityService: SecurityService;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock CacheService
    mockCacheService = {
      getInstance: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    } as any;

    // Get instance
    securityService = SecurityService.getInstance();
  });

  describe('API Key Management', () => {
    it('should generate a new API key', async () => {
      const userId = 'test-user';
      const name = 'Test Key';
      const permissions = ['read', 'write'];

      const apiKey = await securityService.generateApiKey(userId, name, permissions);

      expect(apiKey).toHaveProperty('key');
      expect(apiKey.userId).toBe(userId);
      expect(apiKey.name).toBe(name);
      expect(apiKey.permissions).toEqual(permissions);
      expect(apiKey.isActive).toBe(true);
      expect(mockCacheService.set).toHaveBeenCalledTimes(2);
    });

    it('should validate an API key', async () => {
      const mockApiKey = {
        key: 'test-key',
        userId: 'test-user',
        name: 'Test Key',
        permissions: ['read'],
        createdAt: new Date(),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true
      };

      mockCacheService.get.mockResolvedValue(mockApiKey);

      const result = await securityService.validateApiKey('test-key');

      expect(result).toEqual(mockApiKey);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should reject an expired API key', async () => {
      const mockApiKey = {
        key: 'test-key',
        userId: 'test-user',
        name: 'Test Key',
        permissions: ['read'],
        createdAt: new Date(),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() - 1000),
        isActive: true
      };

      mockCacheService.get.mockResolvedValue(mockApiKey);

      const result = await securityService.validateApiKey('test-key');

      expect(result).toBeNull();
      expect(mockCacheService.delete).toHaveBeenCalled();
    });

    it('should revoke an API key', async () => {
      const mockApiKey = {
        key: 'test-key',
        userId: 'test-user',
        name: 'Test Key',
        permissions: ['read'],
        createdAt: new Date(),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true
      };

      mockCacheService.get.mockResolvedValue(mockApiKey);
      mockCacheService.get.mockResolvedValueOnce(['test-key']);

      await securityService.revokeApiKey('test-key');

      expect(mockCacheService.delete).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const result = await securityService.checkRateLimit('test-ip', 'default');
      expect(result).toBe(true);
    });

    it('should reject requests exceeding rate limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 101; i++) {
        await securityService.checkRateLimit('test-ip', 'default');
      }

      const result = await securityService.checkRateLimit('test-ip', 'default');
      expect(result).toBe(false);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should sanitize input strings', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        description: '&quot;quoted&quot; text'
      };

      const sanitized = securityService.sanitizeInput(input);

      expect(sanitized.name).toBe('scriptalert("xss")/script');
      expect(sanitized.description).toBe('&quot;quoted&quot; text');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<script>alert("xss")</script>',
          profile: {
            bio: '&quot;quoted&quot; text'
          }
        }
      };

      const sanitized = securityService.sanitizeInput(input);

      expect(sanitized.user.name).toBe('scriptalert("xss")/script');
      expect(sanitized.user.profile.bio).toBe('&quot;quoted&quot; text');
    });
  });

  describe('Security Headers', () => {
    it('should return security headers', () => {
      const headers = securityService.getSecurityHeaders();

      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Content-Security-Policy');
    });
  });

  describe('CORS Configuration', () => {
    it('should allow configured origins', () => {
      const origin = 'https://allowed-domain.com';
      const result = securityService.isOriginAllowed(origin);
      expect(result).toBe(true);
    });

    it('should reject unconfigured origins', () => {
      const origin = 'https://unallowed-domain.com';
      const result = securityService.isOriginAllowed(origin);
      expect(result).toBe(false);
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', async () => {
      const event = {
        type: 'test_event',
        severity: 'high' as const,
        details: { test: 'data' },
        userId: 'test-user',
        ip: '127.0.0.1'
      };

      await securityService.logSecurityEvent(event);
      expect(mockCacheService.set).toHaveBeenCalled();
    });
  });
}); 