import React from 'react';
import { X, Layers, Cpu, Server, Globe2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              System Architecture & AI Engineering
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CodeAlpha Task 1: AI Language Translation Architecture Breakdown
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1: Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              1. Full-Stack Layered Separation
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              The project enforces strict separation of concerns across presentation, API communication, and service orchestration:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Frontend Layer</span>
                React 19 + TypeScript + Vite + Tailwind CSS. Responsive glassmorphic UI, local storage history, speech synthesis.
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">REST API Gateway</span>
                Python FastAPI with Pydantic validation, CORS middleware, typed error handlers, and OpenAPI documentation (/docs).
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Provider Engine</span>
                Polymorphic translation provider interface featuring automated multi-tier fallback and language detection.
              </div>
            </div>
          </div>

          {/* Section 2: Strategy Pattern */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-indigo-500" />
              2. Resilient Multi-Provider Fallback Pattern
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
              Rather than binding tightly to a single fragile endpoint, the system adopts the <strong>Provider & Strategy Design Pattern</strong>:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Tier 1 — Google Cloud Translation Provider:</strong> Activated if enterprise Google Cloud API keys are specified in <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">.env</code>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Tier 2 — MyMemory Translation REST Provider:</strong> High-speed free REST translation memory supporting 100+ languages without upfront billing requirements.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Tier 3 — DeepGoogle Machine Translator:</strong> Secondary fallback proxy providing seamless translation redundancy with zero downtime.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Language Detection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Globe2 className="w-4 h-4 text-indigo-500" />
              3. Automatic Language Detection Pipeline
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              When the source is set to <em>Auto Detect</em>, the text is processed using Bayesian probabilistic n-gram profile matching via <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">langdetect</code> with deterministic seed control. The detected ISO code dynamically maps to the translation provider and updates the client UI in real time.
            </p>
          </div>

          {/* Section 4: Security & Quality */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              4. Code Quality & Security Compliance
            </h3>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
              <li>No credentials committed to version control; 100% .env and .env.example compliance.</li>
              <li>Input validation with strict Pydantic schemas preventing injection and empty-payload crashes.</li>
              <li>Asynchronous execution using <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">async/await</code> and thread pooling to prevent event loop blocking.</li>
              <li>Unit test suite verified with Pytest and ASGI test transport.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};

