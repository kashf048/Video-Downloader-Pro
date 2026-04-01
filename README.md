# Video Downloader Pro

A **production-ready desktop application** for downloading videos and audio from URLs using modern technologies. Built with Electron, React, Tailwind CSS, and yt-dlp.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## ✨ Features

### Core Functionality

- **🎬 Multi-Platform Support**: Download from YouTube, Vimeo, Twitter, Instagram, TikTok, and 1000+ platforms
- **📊 Multiple Qualities**: Support for 144p, 240p, 360p, 480p, 720p, 1080p, 2K, and 4K
- **🎵 Audio Extraction**: Extract audio as MP3 from any video
- **📋 Video Preview**: View video title, thumbnail, duration, and available formats before downloading
- **⚡ Real-Time Progress**: Live progress tracking with speed and ETA
- **⏸️ Download Control**: Pause, resume, and cancel downloads at any time
- **📚 Download History**: Complete history with status tracking and quick actions
- **🌓 Dark/Light Mode**: Toggle between themes with persistent preference
- **📁 Custom Download Folder**: Choose where to save downloaded files
- **🔄 Queue Management**: Handle multiple downloads with intelligent queue system

### Advanced Features

- **🖱️ Drag & Drop Support**: Drag URLs directly into the application
- **📋 Clipboard Detection**: Auto-detect video URLs from clipboard
- **🔒 Secure IPC Communication**: Sandboxed renderer process with whitelisted channels
- **💾 Persistent Storage**: Download history and preferences saved locally
- **⚙️ Configurable Settings**: Adjust concurrent downloads and other parameters
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- pnpm or npm
- yt-dlp (Python package)
- Python 3.7+

### Installation

```bash
# Clone or extract the project
cd video-downloader-pro

# Install dependencies
pnpm install

# Install yt-dlp
pip install yt-dlp
```

### Development

```bash
# Start development mode
pnpm dev

# The app will open with hot reload enabled
```

### Production Build

```bash
# Build for your platform
pnpm build:exe          # Windows
pnpm build:portable     # Windows (portable)
```

## 📁 Project Structure

```
video-downloader-pro/
├── electron/                    # Electron main process
│   ├── main.ts                 # Application entry point
│   ├── preload.ts              # Secure IPC bridge
│   ├── downloadManager.ts      # yt-dlp integration
│   ├── queueManager.ts         # Download queue
│   └── tsconfig.json
├── src/                         # React frontend
│   ├── pages/                  # Page components
│   ├── components/             # UI components
│   ├── stores/                 # Zustand state
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utilities
│   ├── types/                  # TypeScript types
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── vite.config.ts              # Vite config
├── package.json                # Dependencies
└── SETUP_GUIDE.md              # Detailed setup guide
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop Framework** | Electron 29+ | Cross-platform desktop app |
| **Frontend** | React 18+ | UI components and state |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Build Tool** | Vite 5+ | Fast module bundler |
| **State Management** | Zustand | Lightweight state store |
| **Download Engine** | yt-dlp | Video/audio downloading |
| **IPC Communication** | Electron IPC | Process communication |
| **Packaging** | electron-builder | Create installers |

## 📖 Usage Guide

### 1. Paste Video URL

Enter or paste a video URL from any supported platform. The application validates the URL format.

### 2. Fetch Video Info

Click "Fetch Video Info" to retrieve:
- Video title and thumbnail
- Duration
- Available formats and qualities
- File sizes

### 3. Select Download Folder

Choose where to save files using the folder picker. This setting is remembered for future downloads.

### 4. Choose Format

Select your preferred:
- **Video Quality**: 144p through 4K
- **Audio Format**: MP3 extraction

### 5. Download

Click the format button to start downloading. Monitor progress in real-time:
- Progress percentage
- Download speed
- Estimated time remaining

### 6. Manage Downloads

From the download history:
- **Pause/Resume**: Control active downloads
- **Cancel**: Stop and remove downloads
- **Open File**: Play downloaded media
- **Open Folder**: View in file explorer
- **Delete**: Remove from history

## 🔧 Configuration

### Download Settings

Edit `electron/queueManager.ts` to adjust:

```typescript
// Maximum concurrent downloads (default: 2)
export default new QueueManager(2);
```

### Application Settings

Modify `package.json` build configuration:

```json
{
  "build": {
    "appId": "com.videodownloaderpro.app",
    "productName": "Video Downloader Pro"
  }
}
```

### yt-dlp Options

Customize yt-dlp behavior in `electron/downloadManager.ts`:

```typescript
const args = [
  url,
  '-f', formatId,
  '-o', outputTemplate,
  // Add more yt-dlp options here
];
```

## 🔐 Security

- **Context Isolation**: Renderer process isolated from Node.js
- **IPC Whitelisting**: Only approved channels accessible
- **Preload Script**: Secure API exposure via `contextBridge`
- **Sandbox Mode**: Renderer runs in restricted environment
- **Input Validation**: All URLs validated before processing

## 🐛 Troubleshooting

### yt-dlp Not Found

```bash
# Verify installation
yt-dlp --version

# Reinstall if needed
pip install --upgrade yt-dlp
```

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### IPC Communication Issues

- Check browser DevTools console for errors
- Verify channel names in `electron/preload.ts`
- Ensure preload script is loaded in main process

## 📊 Performance

- **Code Splitting**: Automatic by Vite
- **Asset Optimization**: Minified CSS/JS
- **Concurrent Downloads**: Limited to 2 by default
- **Memory Efficient**: Zustand for minimal overhead

## 🎨 Customization

### Theme Colors

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: 0 0% 9%;
  --accent: 0 84.2% 60.2%;
  /* ... more colors */
}
```

### UI Components

Modify components in `src/components/`:
- `URLInput.tsx`: Input interface
- `VideoInfo.tsx`: Video details display
- `DownloadList.tsx`: Download history

## 📦 Distribution

### Create Installer

```bash
# Windows NSIS installer
pnpm build:exe

# Portable executable
pnpm build:portable
```

### Output Files

- `dist/exe/Video Downloader Pro Setup 1.0.0.exe` (Installer)
- `dist/exe/Video Downloader Pro-1.0.0-portable.exe` (Portable)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is provided for educational and personal use. Users are responsible for ensuring they have the right to download content from the platforms they use. Always respect copyright and platform terms of service.

## 🔗 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For issues, questions, or suggestions:

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Review troubleshooting section above
3. Check application logs in `.manus-logs/` directory
4. Open an issue on the project repository

---

**Made with ❤️ by Manus AI**

**Version:** 1.0.0  
**Last Updated:** March 2026
