
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '@/services/securityService';
import { logger } from '@/utils/logger';

// Define the explicit severity type
type SecuritySeverity = "high" | "low" | "medium" | "critical";

export class SecurityMiddleware {
  private static securityService = SecurityService.getInstance();

  // Apply security headers to all responses
  public static applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    const headers = this.securityService.getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  }

  // Validate API key
  public static validateApiKey(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }

    this.securityService.validateApiKey(apiKey)
      .then(validKey => {
        if (!validKey) {
          res.status(401).json({ error: 'Invalid or expired API key' });
          return;
        }
        req.user = { id: validKey.userId, permissions: validKey.permissions };
        next();
      })
      .catch(error => {
        logger.error('API key validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  }

  // Rate limiting middleware
  public static rateLimit(userType: 'default' | 'premium' | 'admin' = 'default') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const identifier = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      
      try {
        const allowed = await this.securityService.checkRateLimit(identifier, userType);
        if (!allowed) {
          res.status(429).json({ error: 'Rate limit exceeded' });
          return;
        }
        next();
      } catch (error) {
        logger.error('Rate limiting error:', error);
        next();
      }
    };
  }

  // CORS middleware
  public static cors(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    
    if (origin && this.securityService.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }

  // Input validation middleware
  public static validateInput(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const input = { ...req.body, ...req.query, ...req.params };
      
      if (!this.securityService.validateInput(input, schema)) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      // Sanitize input
      req.body = this.securityService.sanitizeInput(req.body);
      req.query = this.securityService.sanitizeInput(req.query);
      req.params = this.securityService.sanitizeInput(req.params);

      next();
    };
  }

  // Permission check middleware
  public static checkPermission(requiredPermission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !req.user.permissions) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const hasPermission = req.user.permissions.includes(requiredPermission);
      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }

  // Security event logging middleware
  public static logSecurityEvent(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const resStatusCode = res.statusCode;
      
      // Determine severity based on status code
      let severity: SecuritySeverity = "low";
      if (resStatusCode >= 500) severity = "high";
      else if (resStatusCode >= 400) severity = "medium"; 

      const event = {
        type: 'api_request',
        severity,
        details: {
          method: req.method,
          path: req.path,
          statusCode: resStatusCode,
          duration,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        },
        userId: req.user?.id
      };

      this.securityService.logSecurityEvent(event).catch(error => {
        logger.error('Security event logging error:', error);
      });
    });

    next();
  }

  // Error handling middleware
  public static errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    logger.error('Unhandled error:', error);

    const event = {
      type: 'error',
      severity: "high" as SecuritySeverity,
      details: {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      },
      userId: req.user?.id
    };

    this.securityService.logSecurityEvent(event).catch(logError => {
      logger.error('Error logging error event:', logError);
    });

    res.status(500).json({ error: 'Internal server error' });
  }
}
