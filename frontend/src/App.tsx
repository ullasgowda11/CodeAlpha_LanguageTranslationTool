import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TranslationCard } from './components/TranslationCard';
import { TranslationHistory } from './components/TranslationHistory';
import { ArchitectureModal } from './components/ArchitectureModal';
import {
  checkBackendHealth,
  detectLanguage,
  fetchLanguages,
  translateText,
} from './services/api';
import type { HistoryItem, LanguageItem, TranslationResponse } from './types/translation';
import { Sparkles, Globe, Shield, RefreshCw } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'lingua_pulse_history_v1';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es');
  const [sourceText, setSourceText] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'degraded' | 'offline'>('healthy');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage quota or disabled
    }
  }, [history]);

  // Initial load: check health and fetch languages
  useEffect(() => {
    async function init() {
      const health = await checkBackendHealth();
      setBackendStatus(health.status as any);

      try {
        const langs = await fetchLanguages();
        setLanguages(langs);
      } catch (err: any) {
        console.warn('Backend languages offline, using client fallback catalog:', err);
        // Fallback local language catalog if backend hasn't booted yet
        setLanguages([
          { code: 'en', name: 'English', native_name: 'English', rtl: false, flag: '🇺🇸' },
          { code: 'es', name: 'Spanish', native_name: 'Español', rtl: false, flag: '🇪🇸' },
          { code: 'fr', name: 'French', native_name: 'Français', rtl: false, flag: '🇫🇷' },
          { code: 'de', name: 'German', native_name: 'Deutsch', rtl: false, flag: '🇩🇪' },
          { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', rtl: false, flag: '🇮🇳' },
          { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', rtl: false, flag: '🇮🇳' },
          { code: 'ja', name: 'Japanese', native_name: '日本語', rtl: false, flag: '🇯🇵' },
          { code: 'zh', name: 'Chinese', native_name: '简体中文', rtl: false, flag: '🇨🇳' },
          { code: 'ru', name: 'Russian', native_name: 'Русский', rtl: false, flag: '🇷🇺' },
          { code: 'ar', name: 'Arabic', native_name: 'العربية', rtl: true, flag: '🇸🇦' },
        ]);
      }
    }
    init();
  }, []);

  // Auto-detect debounce when user stops typing
  useEffect(() => {
    if (sourceLang !== 'auto' || !sourceText.trim() || sourceText.length < 4) {
      setDetectedLang(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const detection = await detectLanguage(sourceText.slice(0, 300));
        setDetectedLang(detection.detected_lang);
      } catch {
        // ignore background detection error
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLang]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await translateText({
        text: sourceText,
        source_lang: sourceLang,
        target_lang: targetLang,
      });

      setResult(res);
      if (res.detected_source_lang) {
        setDetectedLang(res.detected_source_lang);
      }

      // Add to translation history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        originalText: sourceText,
        translatedText: res.translated_text,
        sourceLang: res.source_lang,
        targetLang: res.target_lang,
        detectedSourceLang: res.detected_source_lang,
        providerUsed: res.provider_used,
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 24)]);
    } catch (err: any) {
      setError(err.message || 'Failed to complete translation. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setResult(null);
    setError(null);
    setDetectedLang(undefined);
  };

  const handleSwap = () => {
    const newTarget = sourceLang === 'auto' ? (detectedLang || 'en') : sourceLang;
    const newSource = targetLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);

    if (result?.translated_text) {
      setSourceText(result.translated_text);
      setResult(null);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setSourceText(item.originalText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setResult({
      original_text: item.originalText,
      translated_text: item.translatedText,
      source_lang: item.sourceLang,
      target_lang: item.targetLang,
      detected_source_lang: item.detectedSourceLang,
      provider_used: item.providerUsed,
      char_count: item.originalText.length,
      word_count: item.originalText.split(/\s+/).length,
      processing_time_ms: 0,
      timestamp: item.timestamp,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your translation history?')) {
      setHistory([]);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 flex flex-col font-sans transition-colors">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        backendStatus={backendStatus}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero badge & title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>CodeAlpha AI Internship — Milestone Project 1</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI-Powered Multi-Language Translation Tool
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            High-accuracy multilingual neural translation platform featuring automatic language detection, resilient multi-provider fallback, and low-latency API architecture.
          </p>
        </div>

        {/* Translation workspace card */}
        <TranslationCard
          sourceText={sourceText}
          setSourceText={setSourceText}
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          languages={languages}
          onTranslate={handleTranslate}
          isLoading={isLoading}
          error={error}
          result={result}
          detectedLang={detectedLang}
          onClear={handleClear}
          onSwap={handleSwap}
        />

        {/* Translation history */}
        <TranslationHistory
          history={history}
          onClearHistory={handleClearHistory}
          onSelectHistory={handleSelectHistory}
          onDeleteItem={handleDeleteHistoryItem}
        />

        {/* Feature highlight cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              35+ Natural Languages
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full support for European, Asian, and Indian languages including Kannada, Hindi, Tamil, and Telugu with native script rendering.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Multi-Provider Fallback
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Robust provider abstraction pattern seamlessly switches between Google Cloud, MyMemory REST, and deep neural engines with zero downtime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Enterprise Grade Code
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              FastAPI backend with Pydantic v2 validation, 100% type safety, responsive Tailwind CSS UI, and complete Pytest test coverage.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <p>
          CodeAlpha Artificial Intelligence Internship (1 Nov 2026 – 30 Nov 2026) • Developed by{' '}
          <strong className="text-slate-800 dark:text-slate-200">Ullas Gowda</strong>
        </p>
      </footer>

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
};

export default App;
