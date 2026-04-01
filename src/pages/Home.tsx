import { useState, useEffect } from 'react';
import {
  Download,
  Folder,
  Play,
  Pause,
  X,
  Trash2,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Music,
  Video,
  Settings,
} from 'lucide-react';
import { useStore } from '@stores/appStore';
import { ipcBridge } from '@utils/ipcBridge';
import URLInput from '@components/URLInput';
import VideoInfo from '@components/VideoInfo';
import DownloadList from '@components/DownloadList';
import type { VideoMetadata } from '@/types/ipc';
import { validateVideoUrl } from '@utils/validators';
import { logger } from '@utils/logger';

export default function Home() {
  const {
    downloads,
    addDownload,
    updateDownload,
    removeDownload,
    downloadFolder,
    setDownloadFolder,
  } = useStore();

  const [videoInfo, setVideoInfo] = useState<VideoMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Listen for IPC events
  useEffect(() => {
    logger.info('Setting up IPC listeners');

    ipcBridge.onDownloadProgress((data) => {
      updateDownload(data.downloadId, {
        progress: data.progress,
        speed: data.speed,
        eta: data.eta,
      });
    });

    ipcBridge.onDownloadCompleted((data) => {
      updateDownload(data.downloadId, {
        status: 'completed',
        filePath: data.filePath,
        progress: 100,
      });

      // System Notification
      if (Notification.permission === 'granted') {
        const download = downloads.find(d => d.id === data.downloadId);
        new Notification('Download Complete', {
          body: `"${download?.title || 'Video'}" has been downloaded.`,
          icon: download?.thumbnail,
        });
      }

      setSuccess('Download completed successfully!');
      logger.info('Download completed', { downloadId: data.downloadId });
    });

    ipcBridge.onDownloadError((data) => {
      updateDownload(data.downloadId, {
        status: 'failed',
        error: data.error,
      });
      setError(`Download failed: ${data.error}`);
      logger.error('Download error', { downloadId: data.downloadId, error: data.error });
    });
  }, [updateDownload]);

  const handleFetchInfo = async (url: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setVideoInfo(null);
    setOriginalUrl('');
    setSelectedFormat(null);

    try {
      // Validate URL
      const validation = validateVideoUrl(url);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      logger.info('Fetching video info', { url });
      const info = await ipcBridge.fetchVideoInfo(url);
      setVideoInfo(info as VideoMetadata);
      setOriginalUrl(url);
      setSuccess('Video information loaded successfully!');
      logger.info('Video info fetched', { title: info.title });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch video info';
      setError(errorMsg);
      logger.error('Failed to fetch video info', { error: errorMsg });
      setVideoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      logger.info('Opening folder selection dialog');
      const folder = await ipcBridge.selectFolder();
      if (folder) {
        setDownloadFolder(folder);
        setSuccess(`Download folder set to: ${folder}`);
        logger.info('Download folder selected', { folder });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to select folder';
      setError(errorMsg);
      logger.error('Failed to select folder', { error: errorMsg });
    }
  };

  const handleDownload = async (format: string, qualityLabel: string) => {
    if (!videoInfo) {
      setError('No video information available');
      return;
    }

    let targetFolder = downloadFolder;
    
    // Auto-prompt for folder if not set
    if (!targetFolder) {
      logger.info('No download folder set, prompting user');
      const folder = await ipcBridge.selectFolder();
      if (!folder) {
        setError('Please select a download folder to start the download');
        return;
      }
      setDownloadFolder(folder);
      targetFolder = folder;
    }

    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const downloadId = `download-${Date.now()}`;
    const download = {
      id: downloadId,
      url: originalUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration,
      selectedFormat: format,
      qualityLabel: qualityLabel,
      status: 'pending' as const,
      progress: 0,
      timestamp: Date.now(),
    };

    try {
      setIsDownloading(true);
      addDownload(download);
      logger.info('Starting download', { downloadId, format, title: videoInfo.title });

      await ipcBridge.startDownload(downloadId, originalUrl, format, targetFolder);
      updateDownload(downloadId, { status: 'downloading' });
      setSuccess(`Download started: ${videoInfo.title}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Download failed';
      updateDownload(downloadId, {
        status: 'failed',
        error: errorMsg,
      });
      setError(errorMsg);
      logger.error('Download failed', { downloadId, error: errorMsg });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePauseDownload = async (downloadId: string) => {
    try {
      logger.info('Pausing download', { downloadId });
      await ipcBridge.pauseDownload(downloadId);
      updateDownload(downloadId, { status: 'paused' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to pause download';
      setError(errorMsg);
      logger.error('Failed to pause download', { downloadId, error: errorMsg });
    }
  };

  const handleResumeDownload = async (downloadId: string) => {
    try {
      logger.info('Resuming download', { downloadId });
      await ipcBridge.resumeDownload(downloadId);
      updateDownload(downloadId, { status: 'downloading' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resume download';
      setError(errorMsg);
      logger.error('Failed to resume download', { downloadId, error: errorMsg });
    }
  };

  const handleCancelDownload = async (downloadId: string) => {
    try {
      logger.info('Cancelling download', { downloadId });
      await ipcBridge.cancelDownload(downloadId);
      removeDownload(downloadId);
      setSuccess('Download cancelled');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel download';
      setError(errorMsg);
      logger.error('Failed to cancel download', { downloadId, error: errorMsg });
    }
  };

  const handleOpenFile = async (downloadId: string) => {
    try {
      const download = downloads.find((d) => d.id === downloadId);
      if (download?.filePath) {
        logger.info('Opening file', { downloadId, filePath: download.filePath });
        await ipcBridge.openFile(download.filePath);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open file';
      setError(errorMsg);
      logger.error('Failed to open file', { error: errorMsg });
    }
  };

  const handleOpenFolder = async () => {
    try {
      if (downloadFolder) {
        logger.info('Opening download folder', { folder: downloadFolder });
        await ipcBridge.openFolder(downloadFolder);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open folder';
      setError(errorMsg);
      logger.error('Failed to open folder', { error: errorMsg });
    }
  };

  const completedCount = downloads.filter((d) => d.status === 'completed').length;
  const failedCount = downloads.filter((d) => d.status === 'failed').length;
  const downloadingCount = downloads.filter((d) => d.status === 'downloading').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">


        {/* Messages */}
        {error && (
          <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top">
            <div className="bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white px-4 py-3 rounded-lg flex items-start gap-3 shadow-lg">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm text-red-100">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top">
            <div className="bg-green-500/90 backdrop-blur-sm border border-green-400/50 text-white px-4 py-3 rounded-lg flex items-start gap-3 shadow-lg">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Success</p>
                <p className="text-sm text-green-100">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-3">Download Videos Effortlessly</h2>
              <p className="text-slate-300 mb-6">
                Paste any video URL and download in your preferred quality. Supports YouTube, Vimeo, Instagram, TikTok, and 1000+ more platforms.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap size={18} className="text-yellow-400" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Video size={18} className="text-blue-400" />
                  <span>Multiple Formats</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Music size={18} className="text-purple-400" />
                  <span>Audio Extraction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Input & Video Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* URL Input */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Download size={20} className="text-blue-400" />
                  Paste Video URL
                </h3>
                <URLInput onSubmit={handleFetchInfo} loading={loading} />
              </div>

              {/* Video Info */}
              {videoInfo && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Video size={20} className="text-purple-400" />
                    Video Details
                  </h3>
                  <VideoInfo
                    videoInfo={videoInfo}
                    onDownload={handleDownload}
                    downloadFolder={downloadFolder}
                    isDownloading={isDownloading}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Download Folder */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Folder size={20} className="text-orange-400" />
                  Download Folder
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-slate-400 bg-slate-900/50 rounded-lg p-3 break-all min-h-[60px] flex items-center">
                    {downloadFolder ? (
                      <span className="text-slate-200">{downloadFolder}</span>
                    ) : (
                      <span className="text-slate-500 italic">No folder selected</span>
                    )}
                  </div>
                  <button
                    onClick={handleSelectFolder}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FolderOpen size={18} />
                    Choose Folder
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-cyan-400" />
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Downloads:</span>
                    <span className="text-white font-semibold text-lg">{downloads.length}</span>
                  </div>
                  <div className="h-px bg-slate-700/50"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Completed:
                    </span>
                    <span className="text-green-400 font-semibold">{completedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock size={16} className="text-yellow-400" />
                      Downloading:
                    </span>
                    <span className="text-yellow-400 font-semibold">{downloadingCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-400" />
                      Failed:
                    </span>
                    <span className="text-red-400 font-semibold">{failedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download History */}
          {downloads.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-cyan-400" />
                Download History ({downloads.length})
              </h3>
              <DownloadList
                downloads={downloads}
                onPause={handlePauseDownload}
                onResume={handleResumeDownload}
                onCancel={handleCancelDownload}
                onOpen={handleOpenFile}
              />
            </div>
          )}

          {/* Empty State */}
          {downloads.length === 0 && videoInfo && (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No downloads yet. Select a format above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
