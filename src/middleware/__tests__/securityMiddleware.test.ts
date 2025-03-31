
import { SecurityMiddleware } from '../securityMiddleware';
import { SecurityService } from '@/services/securityService';
import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('@/services/securityService');

describe('SecurityMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;
  let mockSecurityService: jest.Mocked<SecurityService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      body: {},
      query: {},
      params: {},
      user: undefined
    };

    // Mock response with properly typed methods
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn(),
      sendStatus: jest.fn(),
      on: jest.fn()
    };

    // Mock next function
    nextFunction = jest.fn();

    // Mock SecurityService
    mockSecurityService = {
      getInstance: jest.fn().mockReturnThis(),
      getSecurityHeaders: jest.fn().mockReturnValue({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }),
      validateApiKey: jest.fn(),
      checkRateLimit: jest.fn(),
      isOriginAllowed: jest.fn(),
      validateInput: jest.fn(),
      sanitizeInput: jest.fn(),
      logSecurityEvent: jest.fn()
    } as any;
  });

  describe('applySecurityHeaders', () => {
    it('should apply security headers to response', () => {
      SecurityMiddleware.applySecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.setHeader).toHaveBeenCalledTimes(2);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateApiKey', () => {
    it('should reject requests without API key', () => {
      SecurityMiddleware.validateApiKey(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key is required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should validate API key and proceed if valid', async () => {
      mockReq.headers = { 'x-api-key': 'test-key' };
      mockSecurityService.validateApiKey.mockResolvedValue({
        key: 'test-key',
        name: 'Test API Key',
        userId: 'test-user',
        permissions: ['read'],
        createdAt: new Date(),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true
      });

      await SecurityMiddleware.validateApiKey(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockReq.user).toBeDefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject invalid API key', async () => {
      mockReq.headers = { 'x-api-key': 'invalid-key' };
      mockSecurityService.validateApiKey.mockResolvedValue(null);

      await SecurityMiddleware.validateApiKey(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired API key' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('rateLimit', () => {
    it('should allow requests within rate limit', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(true);

      await SecurityMiddleware.rateLimit('default')(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject requests exceeding rate limit', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(false);

      await SecurityMiddleware.rateLimit('default')(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('cors', () => {
    it('should handle CORS preflight requests', () => {
      mockReq.method = 'OPTIONS';
      mockReq.headers = { origin: 'https://allowed-domain.com' };
      mockSecurityService.isOriginAllowed.mockReturnValue(true);

      SecurityMiddleware.cors(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow requests from configured origins', () => {
      mockReq.headers = { origin: 'https://allowed-domain.com' };
      mockSecurityService.isOriginAllowed.mockReturnValue(true);

      SecurityMiddleware.cors(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://allowed-domain.com');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject requests from unconfigured origins', () => {
      mockReq.headers = { origin: 'https://unallowed-domain.com' };
      mockSecurityService.isOriginAllowed.mockReturnValue(false);

      SecurityMiddleware.cors(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateInput', () => {
    it('should validate and sanitize input', () => {
      const schema = { type: 'object' };
      mockSecurityService.validateInput.mockReturnValue(true);
      mockSecurityService.sanitizeInput.mockReturnValue({ sanitized: true });

      SecurityMiddleware.validateInput(schema)(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject invalid input', () => {
      const schema = { type: 'object' };
      mockSecurityService.validateInput.mockReturnValue(false);

      SecurityMiddleware.validateInput(schema)(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid input' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('should allow access with required permission', () => {
      mockReq.user = { id: 'test-user', permissions: ['read', 'write'] };

      SecurityMiddleware.checkPermission('read')(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject access without required permission', () => {
      mockReq.user = { id: 'test-user', permissions: ['read'] };

      SecurityMiddleware.checkPermission('write')(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject access without user context', () => {
      SecurityMiddleware.checkPermission('read')(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events', () => {
      SecurityMiddleware.logSecurityEvent(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    it('should handle errors and log security events', () => {
      const error = new Error('Test error');

      SecurityMiddleware.errorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalled();
    });
  });
});
