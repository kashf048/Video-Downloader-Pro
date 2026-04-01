import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

export interface DownloadProgress {
  downloadId: string;
  progress: number;
  speed?: string;
  eta?: string;
}

export interface DownloadResult {
  downloadId: string;
  success: boolean;
  filePath?: string;
  error?: string;
}

export class DownloadManager {
  private activeDownloads: Map<string, ChildProcess> = new Map();
  private pausedDownloads: Map<string, boolean> = new Map();

  /**
   * Get the path to yt-dlp executable
   * In production, yt-dlp should be bundled with the app
   */
  private getYtDlpPath(): string {
    const platform = os.platform();
    const isWindows = platform === 'win32';

    // Try to find yt-dlp in common locations
    const possiblePaths = [
      path.join(__dirname, '..', 'bin', isWindows ? 'yt-dlp.exe' : 'yt-dlp'),
      path.join(__dirname, 'bin', isWindows ? 'yt-dlp.exe' : 'yt-dlp'),
      isWindows ? 'yt-dlp.exe' : 'yt-dlp',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Fallback to system yt-dlp
    return isWindows ? 'yt-dlp.exe' : 'yt-dlp';
  }

  /**
   * Fetch video metadata using yt-dlp
   */
  async fetchVideoInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const ytDlpPath = this.getYtDlpPath();

      const args = [
        url,
        '--dump-json',
        '--no-warnings',
        '--no-playlist',
        '--skip-download',
      ];

      const process = spawn(ytDlpPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(stdout);
            resolve({
              id: info.id,
              title: info.title,
              thumbnail: info.thumbnail,
              duration: info.duration,
              formats: this.parseFormats(info.formats || []),
            });
          } catch (err) {
            reject(new Error('Failed to parse video info'));
          }
        } else {
          reject(new Error(stderr || 'Failed to fetch video info'));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Parse yt-dlp formats into a comprehensive list
   */
  private parseFormats(formats: any[]): any[] {
    const videoFormats: any[] = [];
    const audioFormats: any[] = [];

    for (const f of formats) {
      const isAudioOnly = !f.vcodec || f.vcodec === 'none';
      const isVideoOnly = !f.acodec || f.acodec === 'none';
      const hasBoth = f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none';

      const filesize = f.filesize || f.filesize_approx || 0;

      if (isAudioOnly) {
        // Only keep the best audio format per extension (preferring m4a or mp3)
        const ext = f.ext || 'audio';
        const quality = f.abr || f.tbr || 0;
        audioFormats.push({
          id: f.format_id,
          format: `${ext.toUpperCase()} Audio`,
          ext: ext,
          quality: quality,
          filesize: filesize,
        });
      } else if (f.height) {
        // Keep track of all distinct resolutions
        videoFormats.push({
          id: f.format_id,
          format: `MP4 ${f.height}p`,
          ext: f.ext || 'mp4',
          resolution: `${f.height}p`,
          height: f.height,
          filesize: filesize,
          tbr: f.tbr || 0,
          quality_label: f.format_note || `${f.height}p`,
        });
      }
    }

    // Sort audio by quality and keep only the best one per extension or unique bitrate
    const sortedAudio = audioFormats.sort((a, b) => b.quality - a.quality);
    const uniqueAudioMap = new Map();
    for (const a of sortedAudio) {
      if (!uniqueAudioMap.has(a.ext)) {
        uniqueAudioMap.set(a.ext, a);
      }
    }

    // Sort video by height (descending) and bitrate (descending)
    const sortedVideo = videoFormats.sort((a, b) => {
      if (b.height !== a.height) return b.height - a.height;
      return b.tbr - a.tbr;
    });

    // Keep only the best bitrate for each resolution
    const bestVideoPerResolution = new Map();
    for (const v of sortedVideo) {
      if (!bestVideoPerResolution.has(v.resolution)) {
        bestVideoPerResolution.set(v.resolution, v);
      }
    }

    return [
      ...Array.from(bestVideoPerResolution.values()),
      ...Array.from(uniqueAudioMap.values()),
    ];
  }

  /**
   * Start downloading a video
   */
  async startDownload(
    downloadId: string,
    url: string,
    formatId: string,
    outputPath: string,
    onProgress: (data: DownloadProgress) => void,
    onComplete: (data: DownloadResult) => void,
    onError: (data: DownloadResult) => void
  ): Promise<void> {
    try {
      const ytDlpPath = this.getYtDlpPath();

      // Ensure output directory exists
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');

      const args = [
        url,
        '-f',
        formatId === 'best' ? 'bestvideo+bestaudio/best' : `${formatId}+bestaudio/best`,
        '-o',
        outputTemplate,
        '--newline',
        '--progress',
        '--progress-template',
        '[download] %(progress)s%(progress.eta)s%(progress.speed)s',
        '--no-warnings',
        '--no-playlist',
      ];

      const process = spawn(ytDlpPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.activeDownloads.set(downloadId, process);
      this.pausedDownloads.set(downloadId, false);

      let lastFile = '';

      process.stdout?.on('data', (data) => {
        const output = data.toString();

        // Parse progress from yt-dlp output
        const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1]);

          // With our custom template: [download] %(progress)s%(progress.eta)s%(progress.speed)s
          // The output looks like: [download]  10.0% 00:05 1.2MiB/s
          const parts = output.split(/\s+/).filter((p: string) => p.trim() !== '');
          // parts might be ["[download]", "10.0%", "00:05", "1.2MiB/s"]
          
          let eta: string | undefined = undefined;
          let speed: string | undefined = undefined;
          
          if (parts.length >= 3) eta = parts[2];
          if (parts.length >= 4) speed = parts[3];

          onProgress({
            downloadId,
            progress,
            speed: speed,
            eta: eta,
          });
        }

        // Capture the final filename
        const fileMatch = output.match(/\[download\]\s+Destination:\s+(.+)/);
        if (fileMatch) {
          lastFile = fileMatch[1].trim();
        }
      });

      process.stderr?.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });

      process.on('close', (code) => {
        this.activeDownloads.delete(downloadId);
        this.pausedDownloads.delete(downloadId);

        if (code === 0) {
          onComplete({
            downloadId,
            success: true,
            filePath: lastFile,
          });
        } else {
          onError({
            downloadId,
            success: false,
            error: 'Download failed',
          });
        }
      });

      process.on('error', (err) => {
        this.activeDownloads.delete(downloadId);
        this.pausedDownloads.delete(downloadId);

        onError({
          downloadId,
          success: false,
          error: err.message,
        });
      });
    } catch (err) {
      onError({
        downloadId,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  /**
   * Pause an active download
   */
  pauseDownload(downloadId: string): void {
    const process = this.activeDownloads.get(downloadId);
    if (process && process.pid) {
      this.pausedDownloads.set(downloadId, true);
      // Send SIGSTOP to pause the process
      try {
        process.kill('SIGSTOP');
      } catch (err) {
        console.error('Failed to pause download:', err);
      }
    }
  }

  /**
   * Resume a paused download
   */
  resumeDownload(downloadId: string): void {
    const process = this.activeDownloads.get(downloadId);
    if (process && process.pid) {
      this.pausedDownloads.set(downloadId, false);
      // Send SIGCONT to resume the process
      try {
        process.kill('SIGCONT');
      } catch (err) {
        console.error('Failed to resume download:', err);
      }
    }
  }

  /**
   * Cancel an active download
   */
  cancelDownload(downloadId: string): void {
    const process = this.activeDownloads.get(downloadId);
    if (process) {
      process.kill('SIGTERM');
      this.activeDownloads.delete(downloadId);
      this.pausedDownloads.delete(downloadId);
    }
  }

  /**
   * Get list of active downloads
   */
  getActiveDownloads(): string[] {
    return Array.from(this.activeDownloads.keys());
  }

  /**
   * Check if a download is paused
   */
  isPaused(downloadId: string): boolean {
    return this.pausedDownloads.get(downloadId) || false;
  }
}

export default new DownloadManager();
