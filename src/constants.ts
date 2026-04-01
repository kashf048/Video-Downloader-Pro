/**
 * Application constants and configuration
 */

export const APP_NAME = 'Video Downloader Pro';
export const APP_VERSION = '1.0.0';
export const APP_AUTHOR = 'Manus AI';

// Supported video platforms
export const SUPPORTED_PLATFORMS = [
  { name: 'YouTube', domain: 'youtube.com' },
  { name: 'YouTube Shorts', domain: 'youtu.be' },
  { name: 'Vimeo', domain: 'vimeo.com' },
  { name: 'Twitter/X', domain: 'twitter.com' },
  { name: 'Instagram', domain: 'instagram.com' },
  { name: 'TikTok', domain: 'tiktok.com' },
  { name: 'Facebook', domain: 'facebook.com' },
  { name: 'Dailymotion', domain: 'dailymotion.com' },
  { name: 'Twitch', domain: 'twitch.tv' },
  { name: 'Reddit', domain: 'reddit.com' },
  { name: 'Bilibili', domain: 'bilibili.com' },
  { name: 'Niconico', domain: 'nicovideo.jp' },
  { name: 'SoundCloud', domain: 'soundcloud.com' },
  { name: 'Spotify', domain: 'spotify.com' },
];

// Video quality options
export const VIDEO_QUALITIES = [
  { id: '144', label: '144p', resolution: 144 },
  { id: '240', label: '240p', resolution: 240 },
  { id: '360', label: '360p', resolution: 360 },
  { id: '480', label: '480p', resolution: 480 },
  { id: '720', label: '720p', resolution: 720 },
  { id: '1080', label: '1080p', resolution: 1080 },
  { id: '1440', label: '2K', resolution: 1440 },
  { id: '2160', label: '4K', resolution: 2160 },
];

// Download status
export const DOWNLOAD_STATUS = {
  PENDING: 'pending',
  DOWNLOADING: 'downloading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_URL: 'Invalid video URL. Please check and try again.',
  UNSUPPORTED_PLATFORM: 'This platform is not supported.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
  FOLDER_NOT_SELECTED: 'Please select a download folder first.',
  YT_DLP_NOT_FOUND: 'yt-dlp is not installed. Please install it first.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_FORMAT: 'Invalid format selected.',
  FILE_WRITE_ERROR: 'Failed to write file. Check permissions.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DOWNLOAD_STARTED: 'Download started successfully.',
  DOWNLOAD_COMPLETED: 'Download completed successfully.',
  FOLDER_SELECTED: 'Download folder selected.',
  THEME_CHANGED: 'Theme changed successfully.',
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  THROTTLE_DELAY: 500, // milliseconds
  MAX_CONCURRENT_DOWNLOADS: 2,
  PROGRESS_UPDATE_INTERVAL: 500, // milliseconds
} as const;

// Storage keys
export const STORAGE_KEYS = {
  DOWNLOAD_HISTORY: 'video-downloader-history',
  DOWNLOAD_FOLDER: 'video-downloader-folder',
  THEME_PREFERENCE: 'video-downloader-theme',
  APP_LOGS: 'app-logs',
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // milliseconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
} as const;

// File extensions
export const FILE_EXTENSIONS = {
  VIDEO: ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv'],
  AUDIO: ['mp3', 'aac', 'wav', 'flac', 'm4a', 'opus'],
} as const;

// Size limits
export const SIZE_LIMITS = {
  MAX_FILENAME_LENGTH: 255,
  MAX_URL_LENGTH: 2048,
  MAX_LOGS: 100,
} as const;
