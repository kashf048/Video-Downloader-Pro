import { useEffect, useState } from 'react';
import { Moon, Sun, Download } from 'lucide-react';
import Home from '@pages/Home';
import ErrorBoundary from '@components/ErrorBoundary';
import { useStore } from '@stores/appStore';

function App() {
  const { isDarkMode, setDarkMode } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
    const root = document.documentElement;
    if (!isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Fixed Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-50 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm sticky top-0">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Download className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Video Downloader Pro</h1>
                <p className="text-xs text-slate-400">Download videos from anywhere</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-400" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          <Home />
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
            <p>© 2026 Video Downloader Pro. All rights reserved.</p>
            <p className="mt-2 text-slate-500">Download videos from 1000+ platforms with ease</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
