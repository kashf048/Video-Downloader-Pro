import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Download {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  selectedFormat: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  speed?: string;
  eta?: string;
  error?: string;
  filePath?: string;
  timestamp: number;
}

export interface VideoInfo {
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

interface AppStore {
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  
  downloads: Download[];
  addDownload: (download: Download) => void;
  updateDownload: (id: string, updates: Partial<Download>) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
  
  downloadQueue: string[];
  addToQueue: (downloadId: string) => void;
  removeFromQueue: (downloadId: string) => void;
  
  currentDownloadId: string | null;
  setCurrentDownload: (id: string | null) => void;
  
  downloadFolder: string;
  setDownloadFolder: (folder: string) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      setDarkMode: (dark: boolean) => set({ isDarkMode: dark }),
      
      downloads: [],
      addDownload: (download: Download) =>
        set((state) => ({
          downloads: [download, ...state.downloads],
        })),
      updateDownload: (id: string, updates: Partial<Download>) =>
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      removeDownload: (id: string) =>
        set((state) => ({
          downloads: state.downloads.filter((d) => d.id !== id),
        })),
      clearCompleted: () =>
        set((state) => ({
          downloads: state.downloads.filter((d) => d.status !== 'completed'),
        })),
      
      downloadQueue: [],
      addToQueue: (downloadId: string) =>
        set((state) => ({
          downloadQueue: [...state.downloadQueue, downloadId],
        })),
      removeFromQueue: (downloadId: string) =>
        set((state) => ({
          downloadQueue: state.downloadQueue.filter((id) => id !== downloadId),
        })),
      
      currentDownloadId: null,
      setCurrentDownload: (id: string | null) => set({ currentDownloadId: id }),
      
      downloadFolder: '',
      setDownloadFolder: (folder: string) => set({ downloadFolder: folder }),
    }),
    {
      name: 'video-downloader-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        downloads: state.downloads,
        downloadFolder: state.downloadFolder,
      }),
    }
  )
);
