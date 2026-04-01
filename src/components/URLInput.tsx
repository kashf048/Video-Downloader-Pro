import { useState, useRef } from 'react';
import { Loader2, ClipboardPaste as Paste, Send, X } from 'lucide-react';

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

export default function URLInput({ onSubmit, loading = false }: URLInputProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      // Auto-submit after paste
      setTimeout(() => {
        if (text.trim()) {
          onSubmit(text.trim());
        }
      }, 100);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste video URL here (YouTube, Vimeo, Instagram, TikTok, etc.)"
          className="flex-1 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          disabled={loading}
        />
        {url && (
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="p-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-all duration-200"
            title="Clear URL"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={handlePaste}
          disabled={loading}
          className="p-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-all duration-200"
          title="Paste from clipboard"
        >
          <Paste size={18} />
        </button>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center"
          title="Fetch video information"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      {url && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            URL: {url.length} characters
          </span>
        </div>
      )}
      <p className="text-xs text-slate-500">
        ✓ Supports: YouTube, Vimeo, Twitter, Instagram, TikTok, Facebook, and 1000+ more platforms
      </p>
    </form>
  );
}
