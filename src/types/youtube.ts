/**
 * YouTube API Types
 * Type definitions for YouTube Data API integration
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

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YouTubeApiConfig {
  apiKey: string;
  enabled: boolean;
}

export interface YouTubeSearchQuery {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
}

export interface YouTubePlaylistQuery {
  playlistId: string;
  maxResults?: number;
}
