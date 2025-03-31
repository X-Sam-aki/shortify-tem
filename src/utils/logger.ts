/**
 * Browser-friendly logger utility
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogOptions {
  prefix?: string;
  showTimestamp?: boolean;
  level?: LogLevel;
}

class Logger {
  private prefix: string;
  private showTimestamp: boolean;
  private level: LogLevel;
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor(options: LogOptions = {}) {
    this.prefix = options.prefix || 'App';
    this.showTimestamp = options.showTimestamp !== false;
    this.level = options.level || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    let formattedMessage = '';
    
    if (this.showTimestamp) {
      formattedMessage += `[${new Date().toISOString()}] `;
    }
    
    formattedMessage += `[${this.prefix}] [${level.toUpperCase()}] ${message}`;
    
    return formattedMessage;
  }

  error(message: string, meta?: any): void {
    if (!this.shouldLog('error')) return;
    
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage, meta !== undefined ? meta : '');
    
    // Also save logs to localStorage for debugging
    this.saveLog('error', message, meta);
  }

  warn(message: string, meta?: any): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage, meta !== undefined ? meta : '');
    
    this.saveLog('warn', message, meta);
  }

  info(message: string, meta?: any): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, meta);
    console.info(formattedMessage, meta !== undefined ? meta : '');
    
    this.saveLog('info', message, meta);
  }

  debug(message: string, meta?: any): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, meta);
    console.debug(formattedMessage, meta !== undefined ? meta : '');
    
    this.saveLog('debug', message, meta);
  }

  /**
   * Saves logs to localStorage for persistence and debugging
   */
  private saveLog(level: LogLevel, message: string, meta?: any): void {
    try {
      const maxLogEntries = 100;
      const storageKey = 'app_logs';
      const storedLogs = localStorage.getItem(storageKey);
      
      let logs = storedLogs ? JSON.parse(storedLogs) : [];
      
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        meta: meta ? JSON.stringify(meta) : undefined
      });
      
      // Keep only the last N logs to prevent localStorage from getting too large
      if (logs.length > maxLogEntries) {
        logs = logs.slice(-maxLogEntries);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (e) {
      // If we can't save to localStorage, just log the error but don't throw
      console.error('Failed to save log to localStorage:', e);
    }
  }

  /**
   * Gets logs from localStorage
   */
  getLogs(): any[] {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (e) {
      console.error('Failed to get logs from localStorage:', e);
      return [];
    }
  }

  /**
   * Clears all stored logs
   */
  clearLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch (e) {
      console.error('Failed to clear logs from localStorage:', e);
    }
  }
}

// Create and export a default logger instance
export const logger = new Logger({
  prefix: import.meta.env.VITE_LOG_PREFIX || 'Shortify',
  level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'debug',
  showTimestamp: true
});

// Export log functions for direct use
export const logError = (message: string, meta?: any) => logger.error(message, meta);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);

export default logger;
