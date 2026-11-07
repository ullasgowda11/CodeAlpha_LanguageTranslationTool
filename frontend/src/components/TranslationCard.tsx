import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Zap,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { LanguageItem, TranslationResponse } from '../types/translation';
import { LanguageSelector } from './LanguageSelector';

interface TranslationCardProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  languages: LanguageItem[];
  onTranslate: () => void;
  isLoading: boolean;
  error: string | null;
  result: TranslationResponse | null;
  detectedLang?: string;
  onClear: () => void;
  onSwap: () => void;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  sourceText,
  setSourceText,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  languages,
  onTranslate,
  isLoading,
  error,
  result,
  detectedLang,
  onClear,
  onSwap,
}) => {
  const [copied, setCopied] = useState(false);
  const [speakingSide, setSpeakingSide] = useState<'source' | 'target' | null>(null);

  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const maxChars = 5000;

  const handleCopy = async () => {
    if (!result?.translated_text) return;
    try {
      await navigator.clipboard.writeText(result.translated_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
      }
    } catch {
      // ignore
    }
  };

  const handleSpeak = (text: string, langCode: string, side: 'source' | 'target') => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingSide(side);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'auto' ? 'en' : langCode;
    utterance.onend = () => setSpeakingSide(null);
    utterance.onerror = () => setSpeakingSide(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (sourceText.trim() && !isLoading) {
        onTranslate();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
      {/* Control bar */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Source selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From:</span>
          <LanguageSelector
            label="Source Language"
            selectedCode={sourceLang}
            onChange={setSourceLang}
            languages={languages}
            allowAuto={true}
            detectedLangCode={detectedLang}
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={onSwap}
          disabled={sourceLang === 'auto' && !detectedLang}
          aria-label="Swap languages"
          className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-300 dark:border-slate-700 transition disabled:opacity-40"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To:</span>
          <LanguageSelector
            label="Target Language"
            selectedCode={targetLang}
            onChange={setTargetLang}
            languages={languages}
            allowAuto={false}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Translation Service Notice</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Source Column */}
        <div className="p-6 flex flex-col justify-between min-h-[320px] bg-white dark:bg-slate-900">
          <div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={maxChars}
              placeholder="Enter text to translate here... (or paste with the button below)"
              rows={8}
              className="w-full bg-transparent resize-none border-0 text-base md:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>
              {sourceText && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSpeak(sourceText, sourceLang, 'source')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className={`w-4 h-4 ${speakingSide === 'source' ? 'text-indigo-600 animate-pulse' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={onClear}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 transition"
                    title="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span className={charCount > maxChars * 0.9 ? 'text-amber-500 font-medium' : ''}>
                {charCount}/{maxChars} chars
              </span>
            </div>
          </div>
        </div>

        {/* Target Column */}
        <div className="p-6 flex flex-col justify-between min-h-[320px] bg-slate-50/50 dark:bg-slate-900/40 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                Translating with neural engine...
              </p>
            </div>
          )}

          <div>
            {result?.translated_text ? (
              <p className="text-base md:text-lg text-slate-900 dark:text-slate-100 leading-relaxed select-text whitespace-pre-wrap">
                {result.translated_text}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-600 select-none">
                <Sparkles className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Translation will appear here</p>
                <p className="text-xs opacity-75 mt-1">Select target language and click Translate or press Ctrl+Enter</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              {result?.translated_text && (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeak(result.translated_text, targetLang, 'target')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                    title="Listen to translation"
                  >
                    <Volume2 className={`w-4 h-4 ${speakingSide === 'target' ? 'text-indigo-600 animate-pulse' : ''}`} />
                  </button>
                </>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  <Zap className="w-3 h-3 text-amber-500" />
                  {result.provider_used}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-mono">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  {result.processing_time_ms} ms
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          Pro-tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-xs">Ctrl + Enter</kbd> to translate instantly
        </div>

        <button
          type="button"
          onClick={onTranslate}
          disabled={!sourceText.trim() || isLoading}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Translate Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
