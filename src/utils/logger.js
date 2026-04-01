/**
 * Logger utility for consistent logging across the application
 */
const isDev = import.meta.env.DEV;
class Logger {
    constructor() {
        this.prefix = '[Video Downloader Pro]';
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `${this.prefix} [${level.toUpperCase()}] ${timestamp}`;
        if (isDev) {
            console.log(`${prefix}: ${message}`, data || '');
        }
        // Store logs for debugging
        this.storeLog(level, message, data);
    }
    debug(message, data) {
        if (isDev) {
            this.log('debug', message, data);
        }
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, error) {
        this.log('error', message, error);
    }
    storeLog(level, message, data) {
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
        }
        catch (err) {
            // Silently fail if localStorage is not available
        }
    }
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem('app-logs') || '[]');
        }
        catch {
            return [];
        }
    }
    clearLogs() {
        try {
            localStorage.removeItem('app-logs');
        }
        catch {
            // Silently fail
        }
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map