import axios, { AxiosInstance } from 'axios';
import { logger } from './logger';

/**
 * YouTube Data API v3 Service
 * Handles authentication and API requests to YouTube
 */

export interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  tags: string[];
  category: string;
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  itemCount: number;
}

class YouTubeService {
  private apiKey: string;
  private client: AxiosInstance;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch (error) {
      logger.error('Failed to extract video ID', { error });
      return null;
    }
  }

  /**
   * Extract playlist ID from YouTube URL
   */
  extractPlaylistId(url: string): string | null {
    try {
      const pattern = /[?&]list=([a-zA-Z0-9_-]+)/;
      const match = url.match(pattern);
      return match ? match[1] : null;
    } catch (error) {
      logger.error('Failed to extract playlist ID', { error });
      return null;
    }
  }

  /**
   * Get video metadata from YouTube API
   */
  async getVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata | null> {
    try {
      logger.info('Fetching YouTube video metadata', { videoId });

      const response = await this.client.get('/videos', {
        params: {
          id: videoId,
          key: this.apiKey,
          part: 'snippet,contentDetails,statistics',
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        logger.warn('Video not found on YouTube', { videoId });
        return null;
      }

      const item = response.data.items[0];
      const snippet = item.snippet;
      const statistics = item.statistics;
      const contentDetails = item.contentDetails;

      const metadata: YouTubeVideoMetadata = {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail:
          snippet.thumbnails.high?.url ||
          snippet.thumbnails.medium?.url ||
          snippet.thumbnails.default?.url ||
          '',
        duration: this.parseDuration(contentDetails.duration),
        viewCount: statistics.viewCount || '0',
        likeCount: statistics.likeCount || '0',
        commentCount: statistics.commentCount || '0',
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        tags: snippet.tags || [],
        category: snippet.categoryId || 'Unknown',
      };

      logger.info('YouTube video metadata fetched successfully', { title: metadata.title });
      return metadata;
    } catch (error) {
      logger.error('Failed to fetch YouTube video metadata', { videoId, error });
      return null;
    }
  }

  /**
   * Search YouTube videos
   */
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> {
    try {
      logger.info('Searching YouTube videos', { query, maxResults });

      const response = await this.client.get('/search', {
        params: {
          q: query,
          key: this.apiKey,
          part: 'snippet',
          type: 'video',
          maxResults,
          order: 'relevance',
        },
      });

      const results: YouTubeSearchResult[] = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));

      logger.info('YouTube search completed', { query, resultCount: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to search YouTube videos', { query, error });
      return [];
    }
  }

  /**
   * Get playlist metadata
   */
  async getPlaylistMetadata(playlistId: string): Promise<YouTubePlaylist | null> {
    try {
      logger.info('Fetching YouTube playlist metadata', { playlistId });

      const response = await this.client.get('/playlists', {
        params: {
          id: playlistId,
          key: this.apiKey,
          part: 'snippet,contentDetails',
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        logger.warn('Playlist not found on YouTube', { playlistId });
        return null;
      }

      const item = response.data.items[0];
      const snippet = item.snippet;
      const contentDetails = item.contentDetails;

      const playlist: YouTubePlaylist = {
        id: playlistId,
        title: snippet.title,
        description: snippet.description,
        thumbnail:
          snippet.thumbnails.high?.url ||
          snippet.thumbnails.medium?.url ||
          snippet.thumbnails.default?.url ||
          '',
        channelTitle: snippet.channelTitle,
        itemCount: contentDetails.itemCount,
      };

      logger.info('YouTube playlist metadata fetched successfully', { title: playlist.title });
      return playlist;
    } catch (error) {
      logger.error('Failed to fetch YouTube playlist metadata', { playlistId, error });
      return null;
    }
  }

  /**
   * Get playlist items (videos)
   */
  async getPlaylistItems(
    playlistId: string,
    maxResults: number = 50
  ): Promise<YouTubeSearchResult[]> {
    try {
      logger.info('Fetching YouTube playlist items', { playlistId, maxResults });

      const response = await this.client.get('/playlistItems', {
        params: {
          playlistId,
          key: this.apiKey,
          part: 'snippet',
          maxResults,
        },
      });

      const results: YouTubeSearchResult[] = response.data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));

      logger.info('YouTube playlist items fetched successfully', { playlistId, itemCount: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to fetch YouTube playlist items', { playlistId, error });
      return [];
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string) {
    try {
      logger.info('Fetching YouTube channel info', { channelId });

      const response = await this.client.get('/channels', {
        params: {
          id: channelId,
          key: this.apiKey,
          part: 'snippet,statistics',
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        logger.warn('Channel not found on YouTube', { channelId });
        return null;
      }

      const item = response.data.items[0];
      const channelInfo = {
        id: channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default?.url || '',
        subscriberCount: item.statistics.subscriberCount || '0',
        videoCount: item.statistics.videoCount || '0',
        viewCount: item.statistics.viewCount || '0',
      };

      logger.info('YouTube channel info fetched successfully', { title: channelInfo.title });
      return channelInfo;
    } catch (error) {
      logger.error('Failed to fetch YouTube channel info', { channelId, error });
      return null;
    }
  }

  /**
   * Parse ISO 8601 duration to human-readable format
   */
  private parseDuration(duration: string): string {
    try {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return 'Unknown';

      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const seconds = match[3] ? parseInt(match[3]) : 0;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    } catch (error) {
      logger.error('Failed to parse duration', { duration, error });
      return 'Unknown';
    }
  }

  /**
   * Format view count to human-readable format
   */
  static formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Validate YouTube API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      logger.info('Validating YouTube API key');

      const response = await this.client.get('/videos', {
        params: {
          id: 'dQw4w9WgXcQ', // Rick Roll video ID (always available)
          key: this.apiKey,
          part: 'id',
        },
      });

      const isValid = response.data.items && response.data.items.length > 0;
      logger.info('YouTube API key validation result', { isValid });
      return isValid;
    } catch (error) {
      logger.error('YouTube API key validation failed', { error });
      return false;
    }
  }
}

export default YouTubeService;
