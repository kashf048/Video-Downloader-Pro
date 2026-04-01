import { Download, Music, AlertCircle, Loader2 } from 'lucide-react';
import type { VideoMetadata } from '@/types/ipc';

interface VideoInfoProps {
  videoInfo: VideoMetadata;
  onDownload: (format: string) => void;
  downloadFolder?: string;
  isDownloading?: boolean;
}

export default function VideoInfo({
  videoInfo,
  onDownload,
  downloadFolder,
  isDownloading = false,
}: VideoInfoProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Group formats by quality
  const videoFormats = videoInfo.formats
    .filter((f) => f.ext === 'mp4' || f.ext === 'webm' || f.ext === 'mkv')
    .sort((a, b) => {
      const resA = parseInt(a.resolution || '0');
      const resB = parseInt(b.resolution || '0');
      return resB - resA;
    });

  const audioFormats = videoInfo.formats.filter((f) => f.ext === 'mp3' || f.ext === 'aac' || f.ext === 'm4a');

  const qualityOptions = [
    { label: '4K', resolution: 2160, color: 'from-red-500 to-red-600' },
    { label: '2K', resolution: 1440, color: 'from-purple-500 to-purple-600' },
    { label: '1080p', resolution: 1080, color: 'from-blue-500 to-blue-600' },
    { label: '720p', resolution: 720, color: 'from-green-500 to-green-600' },
    { label: '480p', resolution: 480, color: 'from-yellow-500 to-yellow-600' },
    { label: '360p', resolution: 360, color: 'from-orange-500 to-orange-600' },
  ];

  const bestFormats = qualityOptions
    .map((opt) => {
      const format = videoFormats.find(
        (f) => parseInt(f.resolution || '0') >= opt.resolution
      );
      return format ? { ...opt, format } : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="space-y-4">
        <div className="aspect-video bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden flex items-center justify-center">
          {videoInfo.thumbnail ? (
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-500">No thumbnail available</div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white line-clamp-2">{videoInfo.title}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              ⏱️ Duration: {formatDuration(videoInfo.duration)}
            </span>
            <span className="flex items-center gap-1">
              📊 {videoFormats.length} formats available
            </span>
          </div>
        </div>
      </div>

      {/* Video Quality Selection */}
      {bestFormats.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Download size={18} className="text-blue-400" />
            Select Video Quality
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {bestFormats.map((item) => (
              <button
                key={item!.format.id}
                onClick={() => onDownload(item!.format.id)}
                disabled={!downloadFolder || isDownloading}
                className={`relative overflow-hidden p-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item!.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                ></div>
                <div className="relative">
                  <div className="font-semibold text-white text-lg">{item!.label}</div>
                  <div className="text-xs text-slate-400">
                    {formatFileSize(item!.format.filesize)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Format */}
      {audioFormats.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Music size={18} className="text-purple-400" />
            Extract Audio
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {audioFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => onDownload(format.id)}
                disabled={!downloadFolder || isDownloading}
                className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
              >
                <div className="font-semibold text-purple-300">MP3 Audio</div>
                <div className="text-xs text-slate-400">
                  {formatFileSize(format.filesize)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {!downloadFolder && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>Please select a download folder to start downloading</span>
        </div>
      )}

      {isDownloading && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
          <Loader2 size={18} className="animate-spin flex-shrink-0" />
          <span>Download in progress...</span>
        </div>
      )}
    </div>
  );
}
