import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Sparkles } from 'lucide-react';
import type { LanguageItem } from '../types/translation';

interface LanguageSelectorProps {
  label: string;
  selectedCode: string;
  onChange: (code: string) => void;
  languages: LanguageItem[];
  allowAuto?: boolean;
  detectedLangCode?: string;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedCode,
  onChange,
  languages,
  allowAuto = false,
  detectedLangCode,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLanguageName = (code: string) => {
    if (code === 'auto') {
      if (detectedLangCode) {
        const found = languages.find((l) => l.code === detectedLangCode);
        return `Auto Detect (${found ? found.name : detectedLangCode})`;
      }
      return 'Auto Detect';
    }
    const found = languages.find((l) => l.code === code);
    return found ? `${found.flag || '🌐'} ${found.name}` : code;
  };

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native_name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-60 flex items-center justify-between px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
      >
        <span className="truncate flex items-center gap-2">
          {selectedCode === 'auto' && <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
          {getLanguageName(selectedCode)}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {allowAuto && (
              <button
                type="button"
                onClick={() => {
                  onChange('auto');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  selectedCode === 'auto'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto Detect Language</span>
                </div>
                {selectedCode === 'auto' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            )}

            {filteredLanguages.map((lang) => {
              const isSelected = selectedCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{lang.flag || '🌐'}</span>
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-slate-400 text-[10px]">({lang.native_name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
