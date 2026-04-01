# Environment Configuration Guide

## Overview

This document describes all environment variables used by Video Downloader Pro. The application uses environment variables for configuration management, allowing easy customization without code changes.

## Environment Variables

### Application Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_APP_NAME` | string | Video Downloader Pro | Application display name |
| `VITE_APP_VERSION` | string | 1.0.0 | Application version |
| `VITE_APP_AUTHOR` | string | Manus AI | Application author |

### Development Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_DEV_SERVER_URL` | string | http://localhost:5173 | Development server URL |
| `NODE_ENV` | string | development | Environment mode (development/production) |

### Feature Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_ENABLE_LOGGING` | boolean | true | Enable application logging |
| `VITE_ENABLE_MOCK_MODE` | boolean | false | Enable mock mode for testing |
| `VITE_ENABLE_ANALYTICS` | boolean | false | Enable analytics tracking |

### Download Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_MAX_CONCURRENT_DOWNLOADS` | number | 2 | Maximum concurrent downloads |
| `VITE_DEFAULT_QUALITY` | string | 720 | Default video quality (144, 240, 360, 480, 720, 1080, 1440, 2160) |
| `VITE_DEFAULT_FORMAT` | string | mp4 | Default video format |

### UI Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_THEME_DEFAULT` | string | light | Default theme (light/dark) |
| `VITE_ENABLE_DARK_MODE` | boolean | true | Enable dark mode toggle |

### API Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_TIMEOUT` | number | 30000 | API request timeout in milliseconds |
| `VITE_RETRY_ATTEMPTS` | number | 3 | Number of retry attempts for failed requests |

### yt-dlp Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_YT_DLP_PATH` | string | yt-dlp | Path to yt-dlp executable |
| `VITE_YT_DLP_TIMEOUT` | number | 300000 | yt-dlp operation timeout in milliseconds |

### Storage Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_STORAGE_KEY_PREFIX` | string | video-downloader | LocalStorage key prefix |
| `VITE_MAX_HISTORY_ITEMS` | number | 100 | Maximum download history items |

### Logging

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_LOG_LEVEL` | string | info | Log level (debug, info, warn, error) |
| `VITE_ENABLE_CONSOLE_LOG` | boolean | true | Enable console logging |
| `VITE_ENABLE_FILE_LOG` | boolean | false | Enable file logging |

## Configuration Files

### Development (.env.local)

For local development, create a `.env.local` file with development-specific settings:

```env
NODE_ENV=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_MOCK_MODE=false
VITE_LOG_LEVEL=debug
```

### Production (.env.production)

For production builds, create a `.env.production` file:

```env
NODE_ENV=production
VITE_ENABLE_LOGGING=false
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

## Accessing Environment Variables

### In React Components

```typescript
import { useEnvironment } from '@/hooks/useEnvironment';

function MyComponent() {
  const { appName, appVersion } = useEnvironment();
  return <div>{appName} v{appVersion}</div>;
}
```

### In Utilities

```typescript
const appName = import.meta.env.VITE_APP_NAME;
const maxConcurrent = parseInt(import.meta.env.VITE_MAX_CONCURRENT_DOWNLOADS);
```

### In Electron Main Process

```typescript
const isDev = !app.isPackaged;
const ytDlpPath = process.env.VITE_YT_DLP_PATH || 'yt-dlp';
```

## Best Practices

1. **Never commit sensitive data**: Don't commit `.env` files with secrets
2. **Use .env.example**: Keep a template file for documentation
3. **Type safety**: Create TypeScript interfaces for environment variables
4. **Validation**: Validate environment variables on app startup
5. **Defaults**: Always provide sensible defaults for optional variables

## Troubleshooting

### Variables not loading

- Ensure the `.env` file is in the project root
- Restart the development server after changing `.env`
- Check that variable names start with `VITE_` for frontend access

### Type errors

- Environment variables are strings by default
- Use `parseInt()` for numbers, `JSON.parse()` for booleans
- Create type definitions for better IDE support

### Production builds

- Environment variables are embedded at build time
- Rebuild the application after changing environment variables
- Use `.env.production` for production-specific settings

## Example Configuration

### For Development

```env
NODE_ENV=development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_MOCK_MODE=false
VITE_LOG_LEVEL=debug
VITE_MAX_CONCURRENT_DOWNLOADS=2
VITE_DEFAULT_QUALITY=720
```

### For Production

```env
NODE_ENV=production
VITE_ENABLE_LOGGING=false
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
VITE_MAX_CONCURRENT_DOWNLOADS=3
VITE_DEFAULT_QUALITY=1080
```

---

**Last Updated**: March 28, 2026
