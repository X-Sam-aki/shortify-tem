
// Simple logger for browser environment
const createLogMethod = (level: string) => (message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? JSON.stringify(meta) : '';
  
  switch (level) {
    case 'error':
      console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
      break;
    case 'warn':
      console.warn(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
      break;
    case 'info':
      console.info(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
      break;
    case 'debug':
      console.debug(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
      break;
    default:
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
  }
  
  // You can implement additional logging here like sending logs to a service
};

export const logger = {
  error: createLogMethod('error'),
  warn: createLogMethod('warn'),
  info: createLogMethod('info'),
  debug: createLogMethod('debug')
};

// Export logging functions
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Simplified versions of middleware functions for browser
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get && req.get('user-agent')
    });
  });
  
  if (next) next();
};

export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get && req.get('user-agent')
  });
  
  if (next) next(err);
};

// Export logger instance
export default logger;
