/**
 * Structured Logger
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article VII
 * Purpose: Production-grade logging with levels, context, and correlation IDs
 * 
 * Replaces console.log() with structured, traceable logs
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  userRole?: string;
  requestPath?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Format log entry
   */
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const ctx = Object.keys(this.context).length > 0 ? JSON.stringify(this.context) : '';
    const metaStr = meta ? JSON.stringify(meta) : '';
    
    return `[${timestamp}] [${level}] ${message} ${ctx} ${metaStr}`.trim();
  }

  /**
   * Debug-level log (development only)
   */
  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.format(LogLevel.DEBUG, message, meta));
    }
  }

  /**
   * Info-level log (general information)
   */
  info(message: string, meta?: any): void {
    console.log(this.format(LogLevel.INFO, message, meta));
  }

  /**
   * Warning-level log (non-critical issues)
   */
  warn(message: string, meta?: any): void {
    console.warn(this.format(LogLevel.WARN, message, meta));
  }

  /**
   * Error-level log (critical failures)
   */
  error(message: string, error?: Error | any, meta?: any): void {
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(this.format(LogLevel.ERROR, message, { ...meta, error: errorInfo }));
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const child = new Logger();
    child.setContext({ ...this.context, ...context });
    return child;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for creating contextual loggers
export function createLogger(context: LogContext): Logger {
  return logger.child(context);
}
