/**
 * Validation utilities for input validation and format checking
 */

/**
 * Validate video URL format
 */
export const validateVideoUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  if (trimmedUrl.length > 2048) {
    return { valid: false, error: 'URL is too long' };
  }

  try {
    const urlObj = new URL(trimmedUrl);

    const supportedDomains = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'twitter.com',
      'x.com',
      'instagram.com',
      'tiktok.com',
      'facebook.com',
      'dailymotion.com',
      'twitch.tv',
      'reddit.com',
      'bilibili.com',
      'nicovideo.jp',
      'soundcloud.com',
      'spotify.com',
    ];

    const isSupported = supportedDomains.some((domain) =>
      urlObj.hostname.includes(domain)
    );

    if (!isSupported) {
      return {
        valid: false,
        error: 'URL domain is not supported. Supported platforms: YouTube, Vimeo, Twitter, Instagram, TikTok, and more.',
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate download format ID
 */
export const validateFormatId = (formatId: string): boolean => {
  if (!formatId || typeof formatId !== 'string') {
    return false;
  }

  // Format ID should be alphanumeric and short
  return /^[a-zA-Z0-9_-]{1,20}$/.test(formatId);
};

/**
 * Validate folder path
 */
export const validateFolderPath = (path: string): boolean => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Basic path validation - should not be empty and should have reasonable length
  return path.length > 0 && path.length < 500;
};

/**
 * Validate download ID
 */
export const validateDownloadId = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return /^download-\d+$/.test(id);
};

/**
 * Sanitize and validate filename
 */
export const validateFilename = (filename: string): { valid: boolean; sanitized?: string; error?: string } => {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Filename is required' };
  }

  if (filename.length === 0) {
    return { valid: false, error: 'Filename cannot be empty' };
  }

  if (filename.length > 255) {
    return { valid: false, error: 'Filename is too long' };
  }

  // Remove invalid characters
  const sanitized = filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, ''); // Remove trailing dots

  if (sanitized.length === 0) {
    return { valid: false, error: 'Filename contains only invalid characters' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate video metadata
 */
export const validateVideoMetadata = (metadata: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!metadata) {
    return { valid: false, errors: ['Metadata is required'] };
  }

  if (!metadata.id || typeof metadata.id !== 'string') {
    errors.push('Video ID is missing or invalid');
  }

  if (!metadata.title || typeof metadata.title !== 'string') {
    errors.push('Video title is missing or invalid');
  }

  if (metadata.duration && typeof metadata.duration !== 'number') {
    errors.push('Video duration is invalid');
  }

  if (!Array.isArray(metadata.formats)) {
    errors.push('Video formats are missing or invalid');
  } else if (metadata.formats.length === 0) {
    errors.push('No video formats available');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate download status
 */
export const isValidDownloadStatus = (
  status: string
): status is 'pending' | 'downloading' | 'completed' | 'failed' | 'paused' => {
  return ['pending', 'downloading', 'completed', 'failed', 'paused'].includes(status);
};

/**
 * Validate progress percentage
 */
export const validateProgress = (progress: number): boolean => {
  return typeof progress === 'number' && progress >= 0 && progress <= 100;
};
