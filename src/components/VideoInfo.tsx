import { Download, Music, AlertCircle, Loader2, Clock, Video } from 'lucide-react';
import type { VideoMetadata } from '@/types/ipc';

interface VideoInfoProps {
  videoInfo: VideoMetadata;
  onDownload: (format: string, qualityLabel: string) => void;
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

  // Separate audio and video formats
  const videoFormats = videoInfo.formats
    .filter((f) => f.resolution) // Has resolution
    .sort((a, b) => {
      const resA = parseInt(a.resolution || '0');
      const resB = parseInt(b.resolution || '0');
      return resB - resA;
    });

  const audioFormats = videoInfo.formats.filter((f) => !f.resolution);

  // Get unique resolutions with best bitrate
  const uniqueResolutions = videoFormats.reduce((acc: any[], format) => {
    const existing = acc.find((f) => f.resolution === format.resolution);
    if (!existing) {
      acc.push(format);
    }
    return acc;
  }, []);

  const getResolutionColor = (res: string) => {
    const p = parseInt(res);
    if (p >= 2160) return 'from-amber-400 to-orange-500'; // 4K+
    if (p >= 1440) return 'from-purple-400 to-indigo-500'; // 2K
    if (p >= 1080) return 'from-blue-400 to-cyan-500'; // 1080p
    if (p >= 720) return 'from-emerald-400 to-teal-500'; // 720p
    return 'from-slate-400 to-slate-500'; // SD
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Video Preview Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="aspect-video bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl relative group">
            {videoInfo.thumbnail ? (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Video size={48} className="opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-white leading-tight">{videoInfo.title}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm flex items-center gap-2">
              <Clock size={14} /> {formatDuration(videoInfo.duration)}
            </span>
            <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm flex items-center gap-2">
              <Video size={14} /> {videoFormats.length} Qualities
            </span>
          </div>
        </div>
      </div>

      {/* Video Quality Selection */}
      {uniqueResolutions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Download size={20} className="text-blue-400" />
              Choose Video Quality
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uniqueResolutions.map((format) => (
              <button
                key={format.id}
                onClick={() => onDownload(format.id, format.resolution === 'unknown' ? 'Auto' : format.resolution)}
                disabled={isDownloading}
                className="group relative p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getResolutionColor(format.resolution)} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
                
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getResolutionColor(format.resolution)}`}>
                        {format.resolution === 'unknown' ? 'Auto' : format.resolution}
                      </span>
                      {parseInt(format.resolution) >= 1080 && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-white/50">HD</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{format.ext.toUpperCase()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{formatFileSize(format.filesize)}</span>
                    </div>
                  </div>
                  <Download size={20} className="text-white/20 group-hover:text-white/60 group-hover:translate-y-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Selection */}
      {audioFormats.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-700/30">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music size={20} className="text-purple-400" />
            Audio Only
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {audioFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => onDownload(format.id, 'MP3 Audio')}
                disabled={isDownloading}
                className="group relative p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-5 group-hover:opacity-10 blur-2xl transition-opacity" />
                
                <div className="relative flex items-center justify-between gap-4 text-left">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-purple-300">
                      High Quality Audio
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{format.ext.toUpperCase()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{formatFileSize(format.filesize)}</span>
                    </div>
                  </div>
                  <Music size={20} className="text-purple-400/20 group-hover:text-purple-400/60 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
