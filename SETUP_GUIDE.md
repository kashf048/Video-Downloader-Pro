# Video Downloader Pro - Setup & Build Guide

## Overview

**Video Downloader Pro** is a production-ready desktop application for downloading videos and audio from URLs using Electron, React, and yt-dlp. This guide provides step-by-step instructions for development setup, building, and packaging the application.

## System Requirements

- **Node.js**: v16 or higher
- **npm/pnpm**: Latest version
- **yt-dlp**: Must be installed on the system or bundled with the app
- **Python**: v3.7+ (required by yt-dlp)
- **Operating System**: Windows, macOS, or Linux

## Project Structure

```
video-downloader-pro/
├── electron/                    # Electron main process
│   ├── main.ts                 # Main process entry point
│   ├── preload.ts              # Preload script for IPC security
│   ├── downloadManager.ts      # yt-dlp download engine
│   ├── queueManager.ts         # Download queue management
│   └── tsconfig.json           # TypeScript config for Electron
├── src/                         # React frontend
│   ├── pages/                  # Page components
│   │   └── Home.tsx            # Main page
│   ├── components/             # Reusable components
│   │   ├── URLInput.tsx        # URL input component
│   │   ├── VideoInfo.tsx       # Video info display
│   │   └── DownloadList.tsx    # Download history list
│   ├── stores/                 # Zustand state management
│   │   └── appStore.ts         # Global app state
│   ├── hooks/                  # Custom React hooks
│   │   └── useDownload.ts      # Download management hook
│   ├── utils/                  # Utility functions
│   │   ├── ipcBridge.ts        # IPC communication bridge
│   │   └── helpers.ts          # Helper functions
│   ├── types/                  # TypeScript type definitions
│   │   └── ipc.ts              # IPC types
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## Installation & Development

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Install yt-dlp

Before running the application, ensure yt-dlp is installed:

**Windows:**
```bash
# Using pip
pip install yt-dlp

# Or download from: https://github.com/yt-dlp/yt-dlp/releases
```

**macOS:**
```bash
# Using Homebrew
brew install yt-dlp
```

**Linux:**
```bash
# Using pip
pip install yt-dlp

# Or using package manager
sudo apt-get install yt-dlp  # Ubuntu/Debian
sudo yum install yt-dlp      # CentOS/RHEL
```

### 3. Development Mode

Run the application in development mode with hot reload:

```bash
# Start both Vite dev server and Electron
pnpm dev

# Or run them separately
pnpm dev:vite      # Terminal 1
pnpm dev:electron  # Terminal 2
```

The application will open at `http://localhost:5173` in the Electron window with DevTools enabled.

## Building for Production

### 1. Build the Application

```bash
# Build React frontend and compile Electron main process
pnpm build
```

This command:
- Builds the React frontend using Vite
- Compiles TypeScript files in the `electron/` directory
- Outputs to the `dist/` directory

### 2. Create Executable

#### Windows (.exe)

```bash
# Create NSIS installer and portable executable
pnpm build:exe

# Or create only portable executable
pnpm build:portable
```

**Output files:**
- `dist/exe/Video Downloader Pro Setup 1.0.0.exe` (Installer)
- `dist/exe/Video Downloader Pro-1.0.0-portable.exe` (Portable)

#### macOS (.dmg)

```bash
# Requires macOS
pnpm build:exe
```

**Output files:**
- `dist/exe/Video Downloader Pro-1.0.0.dmg`

#### Linux (.AppImage)

```bash
# Requires Linux
pnpm build:exe
```

**Output files:**
- `dist/exe/Video Downloader Pro-1.0.0.AppImage`

## Key Features

### 1. URL Input & Validation

Users can paste video URLs from supported platforms (YouTube, Vimeo, Twitter, Instagram, TikTok, etc.). The application validates URLs before processing.

### 2. Video Information Fetching

The app uses yt-dlp to fetch video metadata including:
- Video title
- Thumbnail image
- Duration
- Available formats and qualities

### 3. Format Selection

Users can choose from:
- **Video Formats**: 144p, 240p, 360p, 480p, 720p, 1080p, 2K, 4K
- **Audio Format**: MP3 extraction from video

### 4. Download Management

**Features:**
- Real-time progress tracking with percentage, speed, and ETA
- Pause/Resume downloads
- Cancel downloads
- Download queue management (max 2 concurrent downloads)
- Download history with status tracking

### 5. File Management

- Select custom download folder
- Automatic file naming with conflict resolution
- Open downloaded files directly
- Open folder in file explorer

### 6. Dark/Light Mode

Toggle between dark and light themes. Theme preference is persisted in local storage.

### 7. Download History

Complete history of all downloads with:
- Video title and thumbnail
- Download status (Pending, Downloading, Paused, Completed, Failed)
- Progress information
- Error messages for failed downloads
- Quick actions (play, open folder, delete)

## IPC Communication

The application uses Electron's IPC (Inter-Process Communication) for secure communication between the renderer (React) and main (Node.js) processes.

### Available IPC Channels

**Main Process → Renderer:**
- `download-progress`: Sends download progress updates
- `download-completed`: Notifies download completion
- `download-error`: Notifies download errors

**Renderer → Main Process:**
- `fetch-video-info`: Fetch video metadata
- `start-download`: Start a download
- `pause-download`: Pause an active download
- `cancel-download`: Cancel a download
- `select-folder`: Open folder selection dialog
- `open-file`: Open file in default application
- `open-folder`: Open folder in file explorer

## Configuration

### Environment Variables

Create a `.env` file in the project root if needed:

```env
# Development
VITE_DEV_SERVER_URL=http://localhost:5173

# Production
NODE_ENV=production
```

### Electron Builder Configuration

The `package.json` includes electron-builder configuration:

```json
{
  "build": {
    "appId": "com.videodownloaderpro.app",
    "productName": "Video Downloader Pro",
    "directories": {
      "buildResources": "assets",
      "output": "dist/exe"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## Bundling yt-dlp

For production distribution without requiring users to install yt-dlp:

1. Download yt-dlp binary from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Place in `bin/` directory:
   - `bin/yt-dlp` (macOS/Linux)
   - `bin/yt-dlp.exe` (Windows)
3. Update `downloadManager.ts` to use bundled binary
4. Include `bin/` in electron-builder configuration

## Troubleshooting

### yt-dlp Not Found

**Error:** `yt-dlp: command not found`

**Solution:**
```bash
# Install yt-dlp globally
pip install --upgrade yt-dlp

# Or specify full path in downloadManager.ts
```

### Build Fails

**Error:** `Cannot find module 'electron'`

**Solution:**
```bash
# Rebuild native modules
pnpm add -D @electron/rebuild
pnpm rebuild
```

### IPC Communication Issues

**Error:** `Unauthorized IPC channel`

**Solution:**
- Check that channel name is in the whitelist in `electron/preload.ts`
- Ensure preload script is properly loaded in main process
- Check browser console for security errors

### Download Progress Not Updating

**Error:** Progress bar stuck at 0%

**Solution:**
- Verify yt-dlp output format matches regex in `downloadManager.ts`
- Check that IPC event listeners are properly registered
- Monitor yt-dlp stderr for error messages

## Performance Optimization

### 1. Code Splitting

Vite automatically splits code for optimal loading:
- Main bundle: Core application
- Chunk files: Route-specific code

### 2. Asset Optimization

- Images are automatically optimized
- CSS is minified and tree-shaken
- JavaScript is minified and compressed

### 3. Download Concurrency

Default maximum concurrent downloads is set to 2. Adjust in `electron/queueManager.ts`:

```typescript
export default new QueueManager(2); // Change to desired number
```

## Security Considerations

1. **IPC Whitelisting**: Only allowed channels can be invoked from renderer
2. **Context Isolation**: Enabled to prevent direct access to Node.js APIs
3. **Preload Script**: Exposes only necessary APIs through `contextBridge`
4. **Sandbox**: Renderer process runs in sandbox mode
5. **Input Validation**: All URLs are validated before processing

## API Reference

### Download Manager

```typescript
// Fetch video information
await downloadManager.fetchVideoInfo(url: string)

// Start download
await downloadManager.startDownload(
  downloadId: string,
  url: string,
  formatId: string,
  outputPath: string,
  onProgress: (data: DownloadProgress) => void,
  onComplete: (data: DownloadResult) => void,
  onError: (data: DownloadResult) => void
)

// Pause download
downloadManager.pauseDownload(downloadId: string)

// Resume download
downloadManager.resumeDownload(downloadId: string)

// Cancel download
downloadManager.cancelDownload(downloadId: string)
```

### App Store (Zustand)

```typescript
// Get store
const { downloads, isDarkMode, downloadFolder } = useStore()

// Update download
updateDownload(id: string, updates: Partial<Download>)

// Add download
addDownload(download: Download)

// Remove download
removeDownload(id: string)

// Set theme
setDarkMode(dark: boolean)

// Set download folder
setDownloadFolder(folder: string)
```

## Publishing & Distribution

### Automated Builds

For CI/CD pipelines, use:

```bash
pnpm build:exe:publish
```

This requires GitHub token for publishing releases.

### Manual Distribution

1. Build the application: `pnpm build:exe`
2. Sign executables (recommended for Windows)
3. Create release notes
4. Upload to distribution platform (GitHub, website, etc.)

## License

MIT License - See LICENSE file for details

## Support & Contributing

For issues, feature requests, or contributions, please visit the project repository or contact the development team.

---

**Last Updated:** March 2026  
**Version:** 1.0.0
