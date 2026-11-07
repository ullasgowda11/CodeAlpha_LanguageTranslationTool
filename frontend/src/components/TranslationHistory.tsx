import React from 'react';
import { History, Trash2, ArrowRight, Copy, Check, RotateCcw } from 'lucide-react';
import type { HistoryItem } from '../types/translation';

interface TranslationHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({
  history,
  onClearHistory,
  onSelectHistory,
  onDeleteItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  if (history.length === 0) {
    return (
      <div className="mt-8 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
        <History className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2 opacity-60" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No translation history yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Your completed translations will automatically be archived here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Translations</h3>
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[11px]">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {item.detectedSourceLang || item.sourceLang}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-indigo-600 dark:text-indigo-400">{item.targetLang}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 italic">
                "{item.originalText}"
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                {item.translatedText}
              </p>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                via {item.providerUsed}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(item.id, item.translatedText)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Copy translation"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onSelectHistory(item)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 font-medium transition"
                  title="Load into editor"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reuse</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
