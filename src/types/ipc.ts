export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  formats: {
    id: string;
    format: string;
    ext: string;
    resolution?: string;
    filesize?: number;
  }[];
}

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

export interface IpcEvents {
  'fetch-video-info': (url: string) => Promise<VideoMetadata>;
  'start-download': (downloadId: string, url: string, format: string, outputPath: string) => Promise<void>;
  'pause-download': (downloadId: string) => Promise<void>;
  'cancel-download': (downloadId: string) => Promise<void>;
  'select-folder': () => Promise<string>;
  'open-file': (filePath: string) => Promise<void>;
  'open-folder': (folderPath: string) => Promise<void>;
  'download-progress': (data: DownloadProgress) => void;
  'download-completed': (data: DownloadResult) => void;
  'download-error': (data: DownloadResult) => void;
}
