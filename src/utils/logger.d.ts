/**
 * Logger utility for consistent logging across the application
 */
declare class Logger {
    private prefix;
    private log;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error | any): void;
    private storeLog;
    getLogs(): any[];
    clearLogs(): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map