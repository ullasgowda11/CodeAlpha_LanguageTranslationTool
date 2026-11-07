import React from 'react';
import { Languages, Moon, Sun, Cpu } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  backendStatus: 'healthy' | 'degraded' | 'offline';
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  backendStatus,
  onOpenArchitecture,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                LinguaPulse AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                CodeAlpha Task 1
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Neural Language Translation & Multi-Provider Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Health indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize">{backendStatus} API</span>
          </div>

          {/* Architecture / Technical modal trigger */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            title="View AI Engine Architecture"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Architecture</span>
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
