# Build & Deployment Instructions

## Overview

This document provides comprehensive instructions for building, packaging, and deploying Video Downloader Pro for different platforms.

## Prerequisites

Before building, ensure you have:

1. **Node.js 16+** - [Download](https://nodejs.org/)
2. **pnpm 8+** - `npm install -g pnpm`
3. **yt-dlp** - `pip install yt-dlp`
4. **Python 3.7+** - [Download](https://www.python.org/)
5. **Git** - For version control

## Development Build

### Setup Development Environment

```bash
# 1. Install dependencies
pnpm install

# 2. Verify yt-dlp installation
yt-dlp --version

# 3. Start development server
pnpm dev
```

The application will:
- Start Vite dev server on `http://localhost:5173`
- Launch Electron with DevTools open
- Enable hot module replacement (HMR)

### Development Commands

```bash
# Run Vite dev server only
pnpm dev:vite

# Run Electron only (requires Vite running)
pnpm dev:electron

# Type checking
pnpm type-check

# Linting
pnpm lint

# Code formatting
pnpm format
```

## Production Build

### Step 1: Build the Application

```bash
pnpm build
```

This command:
- Builds React frontend to `dist/` directory
- Compiles Electron main process TypeScript
- Optimizes and minifies all assets
- Generates source maps for debugging

**Output:**
```
dist/
├── index.html              # Main HTML file
├── assets/                 # Bundled JS/CSS
│   ├── main.js
│   ├── main.css
│   └── ...
└── electron/
    └── main.js             # Compiled Electron main
```

### Step 2: Create Executable

#### Windows

**NSIS Installer + Portable:**
```bash
pnpm build:exe
```

**Output:**
```
dist/exe/
├── Video Downloader Pro Setup 1.0.0.exe    # Installer
└── Video Downloader Pro-1.0.0-portable.exe # Portable
```

**Portable Only:**
```bash
pnpm build:portable
```

**Features:**
- NSIS installer with custom dialogs
- Portable executable (no installation needed)
- Desktop shortcuts
- Start menu entries
- Uninstaller

#### macOS

```bash
pnpm build:exe
```

**Output:**
```
dist/exe/
├── Video Downloader Pro-1.0.0.dmg         # Disk image
└── Video Downloader Pro-1.0.0.zip         # Zip archive
```

**Requirements:**
- Must be built on macOS
- Code signing certificate (optional but recommended)
- Apple Developer account for notarization (optional)

#### Linux

```bash
pnpm build:exe
```

**Output:**
```
dist/exe/
├── Video Downloader Pro-1.0.0.AppImage    # AppImage
├── Video Downloader Pro-1.0.0.tar.gz      # Tarball
└── video-downloader-pro-1.0.0.deb         # Debian package
```

## Advanced Configuration

### Code Signing (Windows)

To sign the executable with a certificate:

1. Obtain a code signing certificate
2. Update `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password",
      "signingHashAlgorithms": ["sha256"],
      "sign": "./customSign.js"
    }
  }
}
```

### Bundling yt-dlp

For distribution without requiring users to install yt-dlp:

1. **Download yt-dlp binary:**
   - Windows: `yt-dlp.exe` from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases)
   - macOS/Linux: `yt-dlp` binary

2. **Create bin directory:**
```bash
mkdir -p bin
# Place yt-dlp binary in bin/
```

3. **Update `electron/downloadManager.ts`:**
```typescript
private getYtDlpPath(): string {
  const platform = os.platform();
  const isWindows = platform === 'win32';
  
  // Check bundled binary first
  const bundledPath = path.join(
    __dirname, '..', 'bin',
    isWindows ? 'yt-dlp.exe' : 'yt-dlp'
  );
  
  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }
  
  // Fallback to system yt-dlp
  return isWindows ? 'yt-dlp.exe' : 'yt-dlp';
}
```

4. **Update `package.json` build config:**
```json
{
  "build": {
    "files": [
      "dist/electron/**/*",
      "dist/index.html",
      "dist/assets/**/*",
      "bin/**/*",
      "node_modules/**/*",
      "package.json"
    ]
  }
}
```

### Custom Installer Configuration

Edit `package.json` to customize the installer:

```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Video Downloader Pro",
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico",
      "installerHeaderIcon": "assets/icon.ico",
      "license": "LICENSE"
    }
  }
}
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build:exe
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}
          path: dist/exe/
```

## Distribution

### GitHub Releases

1. **Create release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **GitHub Actions** will automatically build and create release

3. **Upload manually:**
```bash
# Create release on GitHub
# Upload dist/exe/* files
```

### Website Distribution

1. **Host on web server:**
```bash
# Copy dist/exe/* to web server
scp dist/exe/* user@server:/var/www/downloads/
```

2. **Create download page:**
```html
<a href="/downloads/Video-Downloader-Pro-1.0.0-portable.exe">
  Download (Windows)
</a>
```

### Direct Distribution

1. **Package for distribution:**
```bash
# Create zip archive
zip -r Video-Downloader-Pro-1.0.0-win.zip dist/exe/
```

2. **Upload to distribution service:**
   - GitHub Releases
   - SourceForge
   - Softpedia
   - etc.

## Troubleshooting

### Build Fails

**Error:** `Cannot find module 'electron'`

```bash
# Rebuild native modules
pnpm add -D @electron/rebuild
pnpm rebuild
```

**Error:** `ENOSPC: no space left on device`

```bash
# Clean build artifacts
rm -rf node_modules dist
pnpm install
pnpm build
```

### Installer Issues

**Error:** `NSIS error`

```bash
# Update electron-builder
pnpm add -D electron-builder@latest

# Rebuild
pnpm build:exe
```

### Code Signing Issues

**Error:** `Certificate not found`

```bash
# Verify certificate path
ls -la path/to/certificate.pfx

# Update package.json with correct path
```

## Performance Optimization

### Reduce Bundle Size

1. **Tree-shake unused code:**
```typescript
// Use named imports
import { startDownload } from './downloadManager';

// Not default imports
import downloadManager from './downloadManager';
```

2. **Lazy load components:**
```typescript
const Home = lazy(() => import('./pages/Home'));
```

3. **Optimize dependencies:**
```bash
# Analyze bundle
pnpm add -D webpack-bundle-analyzer
```

### Improve Startup Time

1. **Preload critical resources:**
```html
<link rel="preload" href="/assets/main.js" as="script">
```

2. **Minimize Electron preload:**
```typescript
// Only expose necessary APIs
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: { /* ... */ }
});
```

## Version Management

### Update Version

1. **Update package.json:**
```json
{
  "version": "1.1.0"
}
```

2. **Update electron/main.ts:**
```typescript
const APP_VERSION = '1.1.0';
```

3. **Create git tag:**
```bash
git tag v1.1.0
git push origin v1.1.0
```

## Rollback

If build has issues:

```bash
# Revert to previous version
git checkout v1.0.0

# Rebuild
pnpm install
pnpm build:exe
```

## Monitoring

### Check Application Logs

```bash
# Windows
%APPDATA%\Video Downloader Pro\logs\

# macOS
~/Library/Logs/Video Downloader Pro/

# Linux
~/.config/Video Downloader Pro/logs/
```

### Enable Debug Mode

Set environment variable:
```bash
DEBUG=* pnpm dev
```

## Support

For build issues:

1. Check [electron-builder documentation](https://www.electron.build/)
2. Review [Electron documentation](https://www.electronjs.org/docs)
3. Check GitHub Issues
4. Review application logs

---

**Last Updated:** March 2026  
**Version:** 1.0.0
