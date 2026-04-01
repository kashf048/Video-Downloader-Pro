/**
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = (import.meta as any).env.DEV;

class Logger {
  private prefix = '[Video Downloader Pro]';

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `${this.prefix} [${level.toUpperCase()}] ${timestamp}`;

    if (isDev) {
      console.log(`${prefix}: ${message}`, data || '');
    }

    // Store logs for debugging
    this.storeLog(level, message, data);
  }

  debug(message: string, data?: any) {
    if (isDev) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error);
  }

  private storeLog(level: LogLevel, message: string, data?: any) {
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
      });

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('app-logs', JSON.stringify(logs));
    } catch (err) {
      // Silently fail if localStorage is not available
    }
  }

  getLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('app-logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs() {
    try {
      localStorage.removeItem('app-logs');
    } catch {
      // Silently fail
    }
  }
}

export const logger = new Logger();
