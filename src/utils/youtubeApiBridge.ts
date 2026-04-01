import type {
  YouTubeVideoMetadata,
  YouTubeSearchResult,
  YouTubePlaylist,
  YouTubeChannelInfo,
  YouTubeSearchQuery,
  YouTubePlaylistQuery,
} from '@/types/youtube';
import { logger } from './logger';

/**
 * YouTube API Bridge for communication between Renderer and Main process
 */

const isDev = (import.meta as any).env.DEV;

interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export const youtubeApiBridge = {
  /**
   * Initialize YouTube API with API key
   */
  async initializeApi(apiKey: string): Promise<{ success: boolean; message: string }> {
    logger.info('Initializing YouTube API', { apiKey: apiKey.substring(0, 10) + '...' });

    if (isDev) {
      logger.info('Using mock YouTube API (development mode)');
      return { success: true, message: 'YouTube API initialized (mock)' };
    }

    try {
      const result = await window.electron?.ipcRenderer.invoke('youtube-init', apiKey);
      logger.info('YouTube API initialized', result);
      return result;
    } catch (error) {
      logger.error('Failed to initialize YouTube API', { error });
      throw error;
    }
  },

  /**
   * Get video metadata from YouTube
   */
  async getVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata | null> {
    logger.info('Fetching YouTube video metadata', { videoId });

    if (isDev) {
      logger.info('Using mock video metadata (development mode)');
      return {
        id: videoId,
        title: 'Sample YouTube Video - ' + new Date().toLocaleTimeString(),
        description: 'This is a sample video description from YouTube API',
        thumbnail: 'https://via.placeholder.com/320x180?text=YouTube+Video',
        duration: '10m 30s',
        viewCount: '1,234,567',
        likeCount: '45,678',
        commentCount: '2,345',
        channelTitle: 'Sample Channel',
        channelId: 'UCxxxx',
        publishedAt: new Date().toISOString(),
        tags: ['sample', 'video', 'youtube'],
        category: 'Entertainment',
      };
    }

    try {
      const result = await window.electron?.ipcRenderer.invoke('youtube-get-video', videoId);
      logger.info('Video metadata fetched successfully', { title: result?.title });
      return result;
    } catch (error) {
      logger.error('Failed to fetch video metadata', { videoId, error });
      throw error;
    }
  },

  /**
   * Search YouTube videos
   */
  async searchVideos(query: YouTubeSearchQuery): Promise<YouTubeSearchResult[]> {
    logger.info('Searching YouTube videos', { query: query.query });

    if (isDev) {
      logger.info('Using mock search results (development mode)');
      return [
        {
          id: 'mock1',
          title: 'Search Result 1: ' + query.query,
          description: 'This is a mock search result',
          thumbnail: 'https://via.placeholder.com/320x180?text=Result+1',
          channelTitle: 'Sample Channel',
          publishedAt: new Date().toISOString(),
        },
        {
          id: 'mock2',
          title: 'Search Result 2: ' + query.query,
          description: 'This is another mock search result',
          thumbnail: 'https://via.placeholder.com/320x180?text=Result+2',
          channelTitle: 'Another Channel',
          publishedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const maxResults = query.maxResults || 10;
      const results = await window.electron?.ipcRenderer.invoke(
        'youtube-search',
        query.query,
        maxResults
      );
      logger.info('YouTube search completed', { resultCount: results?.length });
      return results;
    } catch (error) {
      logger.error('Failed to search YouTube videos', { query: query.query, error });
      throw error;
    }
  },

  /**
   * Get playlist metadata
   */
  async getPlaylistMetadata(playlistId: string): Promise<YouTubePlaylist | null> {
    logger.info('Fetching YouTube playlist metadata', { playlistId });

    if (isDev) {
      logger.info('Using mock playlist metadata (development mode)');
      return {
        id: playlistId,
        title: 'Sample Playlist - ' + new Date().toLocaleTimeString(),
        description: 'This is a sample playlist',
        thumbnail: 'https://via.placeholder.com/320x180?text=Playlist',
        channelTitle: 'Sample Channel',
        itemCount: 25,
      };
    }

    try {
      const result = await window.electron?.ipcRenderer.invoke('youtube-get-playlist', playlistId);
      logger.info('Playlist metadata fetched successfully', { title: result?.title });
      return result;
    } catch (error) {
      logger.error('Failed to fetch playlist metadata', { playlistId, error });
      throw error;
    }
  },

  /**
   * Get playlist items
   */
  async getPlaylistItems(query: YouTubePlaylistQuery): Promise<YouTubeSearchResult[]> {
    logger.info('Fetching YouTube playlist items', { playlistId: query.playlistId });

    if (isDev) {
      logger.info('Using mock playlist items (development mode)');
      return [
        {
          id: 'mock-item-1',
          title: 'Playlist Item 1',
          description: 'First item in playlist',
          thumbnail: 'https://via.placeholder.com/320x180?text=Item+1',
          channelTitle: 'Sample Channel',
          publishedAt: new Date().toISOString(),
        },
        {
          id: 'mock-item-2',
          title: 'Playlist Item 2',
          description: 'Second item in playlist',
          thumbnail: 'https://via.placeholder.com/320x180?text=Item+2',
          channelTitle: 'Sample Channel',
          publishedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const maxResults = query.maxResults || 50;
      const results = await window.electron?.ipcRenderer.invoke(
        'youtube-get-playlist-items',
        query.playlistId,
        maxResults
      );
      logger.info('Playlist items fetched successfully', { itemCount: results?.length });
      return results;
    } catch (error) {
      logger.error('Failed to fetch playlist items', { playlistId: query.playlistId, error });
      throw error;
    }
  },

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<YouTubeChannelInfo | null> {
    logger.info('Fetching YouTube channel info', { channelId });

    if (isDev) {
      logger.info('Using mock channel info (development mode)');
      return {
        id: channelId,
        title: 'Sample Channel - ' + new Date().toLocaleTimeString(),
        description: 'This is a sample channel',
        thumbnail: 'https://via.placeholder.com/88x88?text=Channel',
        subscriberCount: '1,234,567',
        videoCount: '456',
        viewCount: '123,456,789',
      };
    }

    try {
      const result = await window.electron?.ipcRenderer.invoke('youtube-get-channel', channelId);
      logger.info('Channel info fetched successfully', { title: result?.title });
      return result;
    } catch (error) {
      logger.error('Failed to fetch channel info', { channelId, error });
      throw error;
    }
  },

  /**
   * Extract video ID from URL
   */
  async extractVideoId(url: string): Promise<string | null> {
    logger.info('Extracting video ID from URL', { url });

    if (isDev) {
      logger.info('Using mock video ID extraction (development mode)');
      // Simple mock extraction
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    }

    try {
      const videoId = await window.electron?.ipcRenderer.invoke('youtube-extract-video-id', url);
      logger.info('Video ID extracted', { videoId });
      return videoId;
    } catch (error) {
      logger.error('Failed to extract video ID', { url, error });
      throw error;
    }
  },

  /**
   * Extract playlist ID from URL
   */
  async extractPlaylistId(url: string): Promise<string | null> {
    logger.info('Extracting playlist ID from URL', { url });

    if (isDev) {
      logger.info('Using mock playlist ID extraction (development mode)');
      // Simple mock extraction
      const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    try {
      const playlistId = await window.electron?.ipcRenderer.invoke('youtube-extract-playlist-id', url);
      logger.info('Playlist ID extracted', { playlistId });
      return playlistId;
    } catch (error) {
      logger.error('Failed to extract playlist ID', { url, error });
      throw error;
    }
  },

  /**
   * Format view count to human-readable format
   */
  formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
};
