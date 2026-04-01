import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import downloadManager from './downloadManager';
import YouTubeService from './youtubeService';

const isDev = !app.isPackaged;


let youtubeService: YouTubeService | null = null;

let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App event handlers
 */
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC Handlers
 */

// Fetch video information
ipcMain.handle('fetch-video-info', async (_event, url: string) => {
  try {
    const info = await downloadManager.fetchVideoInfo(url);
    return info;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch video info');
  }
});

// Start download
ipcMain.handle(
  'start-download',
  async (_event, downloadId: string, url: string, formatId: string, outputPath: string) => {
    try {
      downloadManager.startDownload(
        downloadId,
        url,
        formatId,
        outputPath,
        (data) => {
          if (mainWindow) {
            mainWindow.webContents.send('download-progress', data);
          }
        },
        (data) => {
          if (mainWindow) {
            mainWindow.webContents.send('download-completed', data);
          }
        },
        (data) => {
          if (mainWindow) {
            mainWindow.webContents.send('download-error', data);
          }
        }
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to start download');
    }
  }
);

// Pause download
ipcMain.handle('pause-download', async (_event, downloadId: string) => {
  try {
    downloadManager.pauseDownload(downloadId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to pause download');
  }
});

// Cancel download
ipcMain.handle('cancel-download', async (_event, downloadId: string) => {
  try {
    downloadManager.cancelDownload(downloadId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel download');
  }
});

// Select folder
ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }

    return null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to select folder');
  }
});

// Open file
ipcMain.handle('open-file', async (_event, filePath: string) => {
  try {
    await shell.openPath(filePath);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to open file');
  }
});

// Open folder
ipcMain.handle('open-folder', async (_event, folderPath: string) => {
  try {
    shell.openPath(folderPath);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to open folder');
  }
});

/**
 * YouTube API Handlers
 */

// Initialize YouTube API
ipcMain.handle('youtube-init', async (_event, apiKey: string) => {
  try {
    youtubeService = new YouTubeService(apiKey);
    const isValid = await youtubeService.validateApiKey();
    return { success: isValid, message: isValid ? 'API key validated' : 'Invalid API key' };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to initialize YouTube API');
  }
});

// Get YouTube video metadata
ipcMain.handle('youtube-get-video', async (_event, videoId: string) => {
  try {
    if (!youtubeService) {
      throw new Error('YouTube API not initialized');
    }
    const metadata = await youtubeService.getVideoMetadata(videoId);
    return metadata;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get video metadata');
  }
});

// Search YouTube videos
ipcMain.handle('youtube-search', async (_event, query: string, maxResults: number = 10) => {
  try {
    if (!youtubeService) {
      throw new Error('YouTube API not initialized');
    }
    const results = await youtubeService.searchVideos(query, maxResults);
    return results;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to search videos');
  }
});

// Get YouTube playlist metadata
ipcMain.handle('youtube-get-playlist', async (_event, playlistId: string) => {
  try {
    if (!youtubeService) {
      throw new Error('YouTube API not initialized');
    }
    const playlist = await youtubeService.getPlaylistMetadata(playlistId);
    return playlist;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get playlist metadata');
  }
});

// Get YouTube playlist items
ipcMain.handle('youtube-get-playlist-items', async (_event, playlistId: string, maxResults: number = 50) => {
  try {
    if (!youtubeService) {
      throw new Error('YouTube API not initialized');
    }
    const items = await youtubeService.getPlaylistItems(playlistId, maxResults);
    return items;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get playlist items');
  }
});

// Get YouTube channel info
ipcMain.handle('youtube-get-channel', async (_event, channelId: string) => {
  try {
    if (!youtubeService) {
      throw new Error('YouTube API not initialized');
    }
    const channelInfo = await youtubeService.getChannelInfo(channelId);
    return channelInfo;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get channel info');
  }
});

// Extract video ID from URL
ipcMain.handle('youtube-extract-video-id', async (_event, url: string) => {
  try {
    if (!youtubeService) {
      youtubeService = new YouTubeService(''); // Create temporary instance for utility
    }
    const videoId = youtubeService.extractVideoId(url);
    return videoId;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to extract video ID');
  }
});

// Extract playlist ID from URL
ipcMain.handle('youtube-extract-playlist-id', async (_event, url: string) => {
  try {
    if (!youtubeService) {
      youtubeService = new YouTubeService(''); // Create temporary instance for utility
    }
    const playlistId = youtubeService.extractPlaylistId(url);
    return playlistId;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to extract playlist ID');
  }
});

export default app;
