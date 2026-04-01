# YouTube Data API Integration Guide

**Status**: ✅ **FULLY INTEGRATED**  
**Version**: 1.0.0  
**Last Updated**: March 28, 2026

---

## Overview

Video Downloader Pro now includes complete YouTube Data API v3 integration, enabling:

- Direct YouTube video metadata fetching
- Advanced video search functionality
- Playlist support and management
- Channel information retrieval
- Video ID and playlist ID extraction
- Real-time video information display

---

## Getting Started

### 1. Obtain YouTube API Key

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name: "Video Downloader Pro"
4. Click "Create"

#### Step 2: Enable YouTube Data API v3
1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

#### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Click "Edit API key" to restrict it to your app

#### Step 4: Add API Key to Environment
```bash
# In your .env file
VITE_YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_API_KEY=your_api_key_here
```

### 2. Initialize YouTube API in Your App

```typescript
import { youtubeApiBridge } from '@/utils/youtubeApiBridge';

// Initialize the API with your key
const result = await youtubeApiBridge.initializeApi(process.env.VITE_YOUTUBE_API_KEY!);
if (result.success) {
  console.log('YouTube API initialized successfully');
}
```

---

## API Methods

### Video Operations

#### Get Video Metadata
```typescript
const metadata = await youtubeApiBridge.getVideoMetadata('dQw4w9WgXcQ');

// Returns:
{
  id: 'dQw4w9WgXcQ',
  title: 'Rick Astley - Never Gonna Give You Up',
  description: 'Official video...',
  thumbnail: 'https://i.ytimg.com/vi/...',
  duration: '3m 32s',
  viewCount: '1,234,567,890',
  likeCount: '12,345,678',
  commentCount: '2,345,678',
  channelTitle: 'Rick Astley',
  channelId: 'UCuAXFkgsw1L7xaCfnd5J-xQ',
  publishedAt: '2009-10-25T06:57:33Z',
  tags: ['rickroll', 'music', 'official'],
  category: 'Music'
}
```

#### Search Videos
```typescript
const results = await youtubeApiBridge.searchVideos({
  query: 'React tutorial',
  maxResults: 10,
  order: 'relevance'
});

// Returns array of search results:
[
  {
    id: 'video_id_1',
    title: 'React Tutorial for Beginners',
    description: 'Learn React from scratch...',
    thumbnail: 'https://i.ytimg.com/vi/...',
    channelTitle: 'Web Dev Channel',
    publishedAt: '2024-01-15T10:30:00Z'
  },
  // ... more results
]
```

#### Extract Video ID from URL
```typescript
const videoId = await youtubeApiBridge.extractVideoId(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);
// Returns: 'dQw4w9WgXcQ'

// Supports multiple URL formats:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/embed/VIDEO_ID
// - https://www.youtube.com/v/VIDEO_ID
```

### Playlist Operations

#### Get Playlist Metadata
```typescript
const playlist = await youtubeApiBridge.getPlaylistMetadata('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');

// Returns:
{
  id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
  title: 'My Awesome Playlist',
  description: 'Collection of great videos...',
  thumbnail: 'https://i.ytimg.com/vi/...',
  channelTitle: 'My Channel',
  itemCount: 42
}
```

#### Get Playlist Items
```typescript
const items = await youtubeApiBridge.getPlaylistItems({
  playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
  maxResults: 50
});

// Returns array of videos in playlist
```

#### Extract Playlist ID from URL
```typescript
const playlistId = await youtubeApiBridge.extractPlaylistId(
  'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'
);
// Returns: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'
```

### Channel Operations

#### Get Channel Information
```typescript
const channelInfo = await youtubeApiBridge.getChannelInfo('UCuAXFkgsw1L7xaCfnd5J-xQ');

// Returns:
{
  id: 'UCuAXFkgsw1L7xaCfnd5J-xQ',
  title: 'Rick Astley',
  description: 'Official Rick Astley channel...',
  thumbnail: 'https://yt3.ggpht.com/...',
  subscriberCount: '12,345,678',
  videoCount: '456',
  viewCount: '1,234,567,890'
}
```

### Utility Methods

#### Format View Count
```typescript
const formatted = youtubeApiBridge.formatViewCount('1234567890');
// Returns: '1.2B'

const formatted2 = youtubeApiBridge.formatViewCount('1234567');
// Returns: '1.2M'

const formatted3 = youtubeApiBridge.formatViewCount('1234');
// Returns: '1.2K'
```

---

## Integration with Download Manager

### Automatic Metadata Fetching

When a user provides a YouTube URL, the app automatically:

1. Extracts the video ID using `extractVideoId()`
2. Fetches metadata using `getVideoMetadata()`
3. Displays video information (title, thumbnail, duration, etc.)
4. Allows quality selection based on available formats

### Example Flow

```typescript
// User enters URL
const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// Extract video ID
const videoId = await youtubeApiBridge.extractVideoId(url);

// Get metadata
const metadata = await youtubeApiBridge.getVideoMetadata(videoId);

// Display in UI
displayVideoInfo({
  title: metadata.title,
  thumbnail: metadata.thumbnail,
  duration: metadata.duration,
  views: youtubeApiBridge.formatViewCount(metadata.viewCount),
  channel: metadata.channelTitle,
  description: metadata.description
});
```

---

## Error Handling

All API methods include comprehensive error handling:

```typescript
try {
  const metadata = await youtubeApiBridge.getVideoMetadata('invalid_id');
} catch (error) {
  console.error('Failed to fetch video:', error);
  // Show user-friendly error message
  showError('Unable to fetch video information. Please check the URL.');
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| API key not set | YouTube API not initialized | Call `initializeApi()` first |
| Invalid video ID | Video doesn't exist or is private | Verify URL is correct |
| Quota exceeded | Too many API requests | Wait before making more requests |
| Network error | Connection issue | Check internet connection |

---

## Development Mode

In development mode (`pnpm dev`), the YouTube API uses mock data:

```typescript
// Mock data is returned instantly without API calls
const metadata = await youtubeApiBridge.getVideoMetadata('any_id');
// Returns sample data for testing UI
```

This allows you to:
- Test UI without API key
- Avoid quota limits during development
- Work offline
- Rapid iteration

### Enable/Disable Mock Mode

Mock mode is automatically enabled in development. To use real API in development:

```typescript
// In youtubeApiBridge.ts
const isDev = false; // Override to use real API
```

---

## Production Deployment

### API Key Security

**Important**: Never commit API keys to version control!

1. Add `.env` to `.gitignore`
2. Store API key in environment variables
3. Use different keys for development and production
4. Rotate keys periodically
5. Monitor API usage in Google Cloud Console

### API Quotas

YouTube Data API has quotas:
- **Default quota**: 10,000 units per day
- **Each request costs**: 1-100 units depending on operation

**Optimization tips**:
- Cache results when possible
- Use pagination for large result sets
- Implement rate limiting
- Monitor quota usage

### Monitoring

Monitor API usage in Google Cloud Console:
1. Go to "APIs & Services" → "Quotas"
2. Check "YouTube Data API v3"
3. View usage charts and set alerts

---

## Advanced Features

### Caching

Implement caching to reduce API calls:

```typescript
const cache = new Map<string, YouTubeVideoMetadata>();

async function getCachedVideoMetadata(videoId: string) {
  if (cache.has(videoId)) {
    return cache.get(videoId);
  }
  
  const metadata = await youtubeApiBridge.getVideoMetadata(videoId);
  cache.set(videoId, metadata);
  return metadata;
}
```

### Batch Operations

Process multiple videos efficiently:

```typescript
const videoIds = ['id1', 'id2', 'id3'];
const metadataList = await Promise.all(
  videoIds.map(id => youtubeApiBridge.getVideoMetadata(id))
);
```

### Search Filters

Enhance search with filters:

```typescript
const results = await youtubeApiBridge.searchVideos({
  query: 'React tutorial',
  maxResults: 20,
  order: 'viewCount' // Sort by views
});
```

---

## Troubleshooting

### API Key Not Working

```
Error: Invalid API key
```

**Solution**:
1. Verify API key in Google Cloud Console
2. Check API is enabled for YouTube Data v3
3. Ensure key has correct permissions
4. Try creating a new API key

### Quota Exceeded

```
Error: Quota exceeded
```

**Solution**:
1. Wait 24 hours for quota to reset
2. Implement caching to reduce requests
3. Upgrade to higher quota tier
4. Optimize API usage

### Video Not Found

```
Error: Video not found
```

**Solution**:
1. Verify video ID is correct
2. Check video is not private or deleted
3. Try different video URL format
4. Check video region restrictions

### Network Errors

```
Error: Network timeout
```

**Solution**:
1. Check internet connection
2. Verify API endpoint is accessible
3. Increase timeout duration
4. Retry with exponential backoff

---

## API Reference

### Types

```typescript
interface YouTubeVideoMetadata {
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

interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  itemCount: number;
}

interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}
```

---

## Examples

### Complete Example: Download Video with Metadata

```typescript
import { youtubeApiBridge } from '@/utils/youtubeApiBridge';
import { ipcBridge } from '@/utils/ipcBridge';

async function downloadYouTubeVideo(url: string, downloadPath: string) {
  try {
    // Extract video ID
    const videoId = await youtubeApiBridge.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get metadata
    const metadata = await youtubeApiBridge.getVideoMetadata(videoId);
    if (!metadata) {
      throw new Error('Video not found');
    }

    // Display info
    console.log(`Downloading: ${metadata.title}`);
    console.log(`Channel: ${metadata.channelTitle}`);
    console.log(`Duration: ${metadata.duration}`);
    console.log(`Views: ${youtubeApiBridge.formatViewCount(metadata.viewCount)}`);

    // Start download
    const downloadId = `yt-${videoId}-${Date.now()}`;
    await ipcBridge.startDownload(downloadId, url, '18', downloadPath);

    return {
      downloadId,
      metadata,
      success: true
    };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
```

### Search and Download

```typescript
async function searchAndDownload(query: string, downloadPath: string) {
  // Search videos
  const results = await youtubeApiBridge.searchVideos({
    query,
    maxResults: 5
  });

  // Download first result
  if (results.length > 0) {
    const videoUrl = `https://www.youtube.com/watch?v=${results[0].id}`;
    return downloadYouTubeVideo(videoUrl, downloadPath);
  }
}
```

---

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review YouTube API documentation: https://developers.google.com/youtube/v3
3. Check Google Cloud Console for API errors
4. Review application logs for detailed error messages

---

## Updates & Maintenance

This integration is actively maintained and will receive:
- Regular security updates
- Performance improvements
- New feature additions
- Bug fixes

---

**Version**: 1.0.0  
**Last Updated**: March 28, 2026  
**Status**: ✅ Production Ready
