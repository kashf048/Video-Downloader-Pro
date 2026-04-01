import type { VideoMetadata, DownloadProgress, DownloadResult } from '@/types/ipc';
import { logger } from './logger';

/**
 * IPC Bridge for communication between Renderer and Main process
 * Uses window.electron.ipcRenderer when running in Electron.
 * Falls back to mock for plain browser previews (no Electron context).
 */

const isElectron = typeof window !== 'undefined' && typeof window.electron !== 'undefined';

// Type definitions for electron API
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, callback: (...args: any[]) => void) => void;
    off: (channel: string, callback: (...args: any[]) => void) => void;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export const ipcBridge = {
  /**
   * Fetch video metadata from URL
   */
  async fetchVideoInfo(url: string): Promise<VideoMetadata> {
    logger.info('Fetching video info', { url });

    if (!isElectron) {
      logger.warn('Electron not available — cannot fetch real video info');
      throw new Error('This feature requires the Electron desktop app.');
    }

    try {
      const result = await window.electron!.ipcRenderer.invoke('fetch-video-info', url);
      logger.info('Video info fetched successfully', { title: result?.title });
      if (!result) throw new Error('No data returned from backend');
      return result as VideoMetadata;
    } catch (error) {
      logger.error('Failed to fetch video info', { error });
      throw error;
    }
  },

  /**
   * Start downloading a video
   */
  async startDownload(
    downloadId: string,
    url: string,
    format: string,
    outputPath: string
  ): Promise<void> {
    logger.info('Starting download', { downloadId, url, format, outputPath });

    if (!isElectron) {
      logger.warn('Electron not available — cannot start real download');
      throw new Error('This feature requires the Electron desktop app.');
    }

    try {
      await window.electron!.ipcRenderer.invoke('start-download', downloadId, url, format, outputPath);
      logger.info('Download started successfully', { downloadId });
    } catch (error) {
      logger.error('Failed to start download', { downloadId, error });
      throw error;
    }
  },

  /**
   * Resume a paused download
   */
  async resumeDownload(downloadId: string): Promise<void> {
    logger.info('Resuming download', { downloadId });

    if (!isElectron) {
      logger.warn('Electron not available — cannot resume download');
      return;
    }

    try {
      await window.electron!.ipcRenderer.invoke('resume-download', downloadId);
      logger.info('Download resumed successfully', { downloadId });
    } catch (error) {
      logger.error('Failed to resume download', { downloadId, error });
      throw error;
    }
  },

  /**
   * Pause an active download
   */
  async pauseDownload(downloadId: string): Promise<void> {
    logger.info('Pausing download', { downloadId });

    if (!isElectron) {
      logger.warn('Electron not available — cannot pause download');
      return;
    }

    try {
      await window.electron!.ipcRenderer.invoke('pause-download', downloadId);
      logger.info('Download paused successfully', { downloadId });
    } catch (error) {
      logger.error('Failed to pause download', { downloadId, error });
      throw error;
    }
  },

  /**
   * Cancel an active download
   */
  async cancelDownload(downloadId: string): Promise<void> {
    logger.info('Cancelling download', { downloadId });

    if (!isElectron) {
      logger.warn('Electron not available — cannot cancel download');
      return;
    }

    try {
      await window.electron!.ipcRenderer.invoke('cancel-download', downloadId);
      logger.info('Download cancelled successfully', { downloadId });
    } catch (error) {
      logger.error('Failed to cancel download', { downloadId, error });
      throw error;
    }
  },

  /**
   * Open folder selection dialog
   */
  async selectFolder(): Promise<string> {
    logger.info('Opening folder selection dialog');

    if (!isElectron) {
      logger.warn('Electron not available — cannot open folder dialog');
      throw new Error('This feature requires the Electron desktop app.');
    }

    try {
      const result = await window.electron!.ipcRenderer.invoke('select-folder');
      logger.info('Folder selected', { folder: result });
      return result || '';
    } catch (error) {
      logger.error('Failed to select folder', { error });
      throw error;
    }
  },

  /**
   * Open file in default application
   */
  async openFile(filePath: string): Promise<void> {
    logger.info('Opening file', { filePath });

    if (!isElectron) return;

    try {
      await window.electron!.ipcRenderer.invoke('open-file', filePath);
      logger.info('File opened successfully', { filePath });
    } catch (error) {
      logger.error('Failed to open file', { filePath, error });
      throw error;
    }
  },

  /**
   * Open folder in file explorer
   */
  async openFolder(folderPath: string): Promise<void> {
    logger.info('Opening folder', { folderPath });

    if (!isElectron) return;

    try {
      await window.electron!.ipcRenderer.invoke('open-folder', folderPath);
      logger.info('Folder opened successfully', { folderPath });
    } catch (error) {
      logger.error('Failed to open folder', { folderPath, error });
      throw error;
    }
  },

  /**
   * Listen for download progress updates
   */
  onDownloadProgress(callback: (data: DownloadProgress) => void): void {
    if (!isElectron) return;

    window.electron!.ipcRenderer.on('download-progress', (_event: any, data: any) => {
      logger.info('Download progress received', { downloadId: data.downloadId, progress: data.progress });
      callback(data);
    });
  },

  /**
   * Listen for download completion
   */
  onDownloadCompleted(callback: (data: DownloadResult) => void): void {
    if (!isElectron) return;

    window.electron!.ipcRenderer.on('download-completed', (_event: any, data: any) => {
      logger.info('Download completed event received', { downloadId: data.downloadId });
      callback(data);
    });
  },

  /**
   * Listen for download errors
   */
  onDownloadError(callback: (data: DownloadResult) => void): void {
    if (!isElectron) return;

    window.electron!.ipcRenderer.on('download-error', (_event: any, data: any) => {
      logger.error('Download error event received', { downloadId: data.downloadId, error: data.error });
      callback(data);
    });
  },
};
