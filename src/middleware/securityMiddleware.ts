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

    if (!apiKey || !this.securityService.isValidAPIKey(apiKey)) {
      logger.warn(`Invalid API key attempted: ${apiKey}`);
      res.status(401).send('Unauthorized: Invalid API key');
      return;
    }

    next();
  }

  public sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    try {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = this.securityService.sanitizeString(req.body[key]);
        }
      }
      next();
    } catch (error) {
      logger.error('Error sanitizing input:', error);
      res.status(500).send('Internal Server Error: Failed to sanitize input');
    }
  }
  
  public handleCORS(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    
    if (origin && this.securityService.isOriginAllowed(origin as string)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      
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
      res.status(204).send();
      return;
    }

    next();
  }
}
