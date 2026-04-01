import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for Electron
 * Exposes safe IPC methods to the renderer process
 */

const electronAPI = {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      // Whitelist allowed channels
      const allowedChannels = [
        'fetch-video-info',
        'start-download',
        'pause-download',
        'resume-download',
        'cancel-download',
        'select-folder',
        'open-file',
        'open-folder',
      ];

      if (allowedChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }

      throw new Error(`Unauthorized IPC channel: ${channel}`);
    },

    on: (channel: string, callback: (...args: any[]) => void) => {
      // Whitelist allowed event channels
      const allowedChannels = [
        'download-progress',
        'download-completed',
        'download-error',
      ];

      if (allowedChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => {
          callback(...args);
        });
      }
    },

    off: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, callback as any);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
