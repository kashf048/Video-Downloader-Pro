import { CheckCircle, AlertCircle, Clock, Pause, Play, Trash2, FolderOpen, Download } from 'lucide-react';
import type { Download as DownloadType } from '@stores/appStore';

interface DownloadListProps {
  downloads: DownloadType[];
  onPause?: (downloadId: string) => void;
  onResume?: (downloadId: string) => void;
  onCancel?: (downloadId: string) => void;
  onOpen?: (downloadId: string) => void;
}

export default function DownloadList({
  downloads,
  onPause,
  onResume,
  onCancel,
  onOpen,
}: DownloadListProps) {
  const getStatusIcon = (status: DownloadType['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'downloading':
        return <Download size={20} className="text-blue-400 animate-pulse" />;
      case 'paused':
        return <Pause size={20} className="text-yellow-400" />;
      default:
        return <Clock size={20} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: DownloadType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30';
      case 'downloading':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'paused':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-slate-700/30 border-slate-600/30';
    }
  };

  const getStatusText = (status: DownloadType['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'downloading':
        return 'Downloading';
      case 'paused':
        return 'Paused';
      default:
        return 'Pending';
    }
  };

  const getStatusBadgeColor = (status: DownloadType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      case 'downloading':
        return 'bg-blue-500/20 text-blue-300';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-slate-600/20 text-slate-300';
    }
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {downloads.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>No downloads yet</p>
        </div>
      ) : (
        downloads.map((download) => (
          <div
            key={download.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${getStatusColor(download.status)}`}
          >
            {/* Header Row */}
            <div className="flex items-start gap-3 mb-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">{getStatusIcon(download.status)}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white truncate">{download.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(download.status)}`}>
                        {getStatusText(download.status)}
                      </span>
                      {download.selectedFormat && (
                        <span className="text-xs text-slate-400">
                          Format: {download.selectedFormat}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center gap-1">
                {download.status === 'downloading' && onPause && (
                  <button
                    onClick={() => onPause(download.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-yellow-400"
                    title="Pause download"
                  >
                    <Pause size={16} />
                  </button>
                )}

                {download.status === 'paused' && onResume && (
                  <button
                    onClick={() => onResume(download.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-green-400"
                    title="Resume download"
                  >
                    <Play size={16} />
                  </button>
                )}

                {(download.status === 'downloading' || download.status === 'paused') && onCancel && (
                  <button
                    onClick={() => onCancel(download.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-red-400"
                    title="Cancel download"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {download.status === 'completed' && download.filePath && onOpen && (
                  <>
                    <button
                      onClick={() => onOpen(download.id)}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-green-400"
                      title="Open file"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => onOpen(download.id)}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-blue-400"
                      title="Open folder"
                    >
                      <FolderOpen size={16} />
                    </button>
                  </>
                )}

                {(download.status === 'completed' || download.status === 'failed') && onCancel && (
                  <button
                    onClick={() => onCancel(download.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-red-400"
                    title="Remove from history"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {(download.status === 'downloading' || download.status === 'paused') && (
              <div className="space-y-2">
                <div className="w-full bg-slate-900/50 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${download.progress || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{download.progress || 0}%</span>
                  <div className="flex gap-3">
                    {download.speed && <span>{download.speed}</span>}
                    {download.eta && <span>ETA: {download.eta}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {download.status === 'failed' && download.error && (
              <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20">
                {download.error}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
