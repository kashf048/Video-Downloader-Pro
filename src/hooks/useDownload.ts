import { useCallback } from 'react';
import { useStore } from '@stores/appStore';
import { ipcBridge } from '@utils/ipcBridge';
import { generateId } from '@utils/helpers';
import type { Download } from '@stores/appStore';

export const useDownload = () => {
  const { addDownload, updateDownload, downloads } = useStore();

  /**
   * Start a new download
   */
  const startDownload = useCallback(
    async (url: string, format: string, title: string, thumbnail?: string, duration?: number) => {
      const downloadId = generateId();

      const download: Download = {
        id: downloadId,
        url,
        title,
        thumbnail,
        duration,
        selectedFormat: format,
        status: 'pending',
        progress: 0,
        timestamp: Date.now(),
      };

      addDownload(download);

      try {
        const downloadFolder = useStore.getState().downloadFolder;
        if (!downloadFolder) {
          throw new Error('Download folder not selected');
        }

        await ipcBridge.startDownload(downloadId, url, format, downloadFolder);
        updateDownload(downloadId, { status: 'downloading' });
      } catch (error) {
        updateDownload(downloadId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Download failed',
        });
      }

      return downloadId;
    },
    [addDownload, updateDownload]
  );

  /**
   * Pause a download
   */
  const pauseDownload = useCallback(
    async (downloadId: string) => {
      try {
        await ipcBridge.pauseDownload(downloadId);
        updateDownload(downloadId, { status: 'paused' });
      } catch (error) {
        console.error('Failed to pause download:', error);
      }
    },
    [updateDownload]
  );

  /**
   * Resume a paused download
   */
  const resumeDownload = useCallback(
    (downloadId: string) => {
      updateDownload(downloadId, { status: 'downloading' });
    },
    [updateDownload]
  );

  /**
   * Cancel a download
   */
  const cancelDownload = useCallback(
    async (downloadId: string) => {
      try {
        await ipcBridge.cancelDownload(downloadId);
        updateDownload(downloadId, { status: 'failed', error: 'Cancelled by user' });
      } catch (error) {
        console.error('Failed to cancel download:', error);
      }
    },
    [updateDownload]
  );

  /**
   * Retry a failed download
   */
  const retryDownload = useCallback(
    async (downloadId: string) => {
      const download = downloads.find((d) => d.id === downloadId);
      if (!download) return;

      updateDownload(downloadId, {
        status: 'pending',
        progress: 0,
        error: undefined,
      });

      try {
        const downloadFolder = useStore.getState().downloadFolder;
        if (!downloadFolder) {
          throw new Error('Download folder not selected');
        }

        await ipcBridge.startDownload(
          downloadId,
          download.url,
          download.selectedFormat,
          downloadFolder
        );
        updateDownload(downloadId, { status: 'downloading' });
      } catch (error) {
        updateDownload(downloadId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Download failed',
        });
      }
    },
    [downloads, updateDownload]
  );

  return {
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
  };
};
