
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '@/services/securityService';
import { logger } from '@/utils/logger';

export class SecurityMiddleware {
  private securityService: SecurityService;
  
  private constructor() {
    this.securityService = SecurityService.getInstance();
  }

  public static getInstance(): SecurityMiddleware {
    return new SecurityMiddleware();
  }

  public verifyAPIKey(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey || !this.securityService.validateApiKey(apiKey)) {
      logger.warn(`Invalid API key attempted: ${apiKey}`);
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    next();
  }

  public sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    try {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = this.securityService.sanitizeInput(req.body[key]);
        }
      }
      next();
    } catch (error) {
      logger.error('Error sanitizing input:', error);
      res.status(500).json({ error: 'Internal Server Error: Failed to sanitize input' });
    }
  }
  
  public handleCORS(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    
    if (origin && this.securityService.isOriginAllowed(origin.toString())) {
      res.setHeader('Access-Control-Allow-Origin', origin.toString());
      
      // Handle methods and headers correctly with proper type handling
      const requestMethod = req.headers['access-control-request-method'];
      const methods = Array.isArray(requestMethod) 
        ? requestMethod.join(', ')
        : requestMethod || 'GET, POST, PUT, DELETE, OPTIONS';
        
      const requestHeaders = req.headers['access-control-request-headers'];
      const headers = Array.isArray(requestHeaders) 
        ? requestHeaders.join(', ')
        : requestHeaders || 'Content-Type, Authorization, X-API-Key';
      
      // Ensure we're sending strings, not arrays
      res.setHeader('Access-Control-Allow-Methods', methods.toString());
      res.setHeader('Access-Control-Allow-Headers', headers.toString());
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).json({});
      return;
    }

    next();
  }

  // Static method implementations to match test file expectations
  public static applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    const securityService = SecurityService.getInstance();
    const headers = securityService.getSecurityHeaders();
    
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    
    next();
  }

  public static async validateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }
    
    const securityService = SecurityService.getInstance();
    const apiKeyData = await securityService.validateApiKey(apiKey);
    
    if (!apiKeyData) {
      res.status(401).json({ error: 'Invalid or expired API key' });
      return;
    }
    
    req.user = {
      id: apiKeyData.userId,
      permissions: apiKeyData.permissions
    };
    
    next();
  }

  public static rateLimit(userType: 'default' | 'premium' | 'admin' = 'default') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const securityService = SecurityService.getInstance();
      const identifier = req.ip || 'unknown';
      
      const allowed = await securityService.checkRateLimit(identifier, userType);
      
      if (!allowed) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }
      
      next();
    };
  }

  public static cors(req: Request, res: Response, next: NextFunction): void {
    const securityService = SecurityService.getInstance();
    const origin = req.headers.origin as string;
    
    if (origin && securityService.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  }

  public static validateInput(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const securityService = SecurityService.getInstance();
      
      if (!securityService.validateInput(req.body, schema)) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }
      
      req.body = securityService.sanitizeInput(req.body);
      next();
    };
  }

  public static checkPermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      if (!req.user.permissions || !req.user.permissions.includes(permission)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      next();
    };
  }

  public static logSecurityEvent(req: Request, res: Response, next: NextFunction): void {
    const securityService = SecurityService.getInstance();
    
    securityService.logSecurityEvent({
      type: 'request',
      severity: 'low',
      details: {
        path: req.path,
        method: req.method,
        ip: req.ip
      },
      userId: req.user?.id,
      ip: req.ip
    });
    
    next();
  }

  public static errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    const securityService = SecurityService.getInstance();
    
    securityService.logSecurityEvent({
      type: 'error',
      severity: 'medium',
      details: {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      },
      userId: req.user?.id,
      ip: req.ip
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
