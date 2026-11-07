import React, { useState } from 'react';
import { Copy, Check, Lightbulb, ShieldAlert, PanelLeftClose } from 'lucide-react';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDetailsProps {
  problem: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    description: string;
    function_signature: string;
    struct_definition?: string;
    examples?: Example[];
    constraints?: string[];
    hints?: string[];
  };
  onClose?: () => void;
}

export const ProblemDetails: React.FC<ProblemDetailsProps> = ({ problem, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30';
      case 'medium':
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber/30';
      case 'hard':
        return 'bg-accent-rose/10 text-accent-rose border-accent-rose/30';
      default:
        return 'bg-navy-800 text-slate-300 border-navy-700';
    }
  };

  const handleCopySignature = () => {
    navigator.clipboard.writeText(problem.function_signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card overflow-y-auto custom-scrollbar space-y-6">
      {/* Title & Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
              {problem.category}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              title="Collapse Problem Specifications"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight font-sans">
          {problem.title}
        </h2>
      </div>

      {/* Description */}
      <div className="text-sm text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-line select-text cursor-text">
        {problem.description}
      </div>

      {/* Function Signature & Struct Definition */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Function Signature
          </span>
          <button
            onClick={handleCopySignature}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono text-xs text-accent-cyan overflow-x-auto">
          <code>{problem.function_signature}</code>
        </div>

        {problem.struct_definition && (
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
              C Struct Definition
            </span>
            <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre className="text-accent-violet">{problem.struct_definition}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block">
            Examples
          </span>
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <div key={i} className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 space-y-1.5 text-xs font-mono">
                <p className="text-slate-400"><strong className="text-slate-200">Input:</strong> {ex.input}</p>
                <p className="text-accent-emerald"><strong className="text-slate-200">Output:</strong> {ex.output}</p>
                {ex.explanation && (
                  <p className="text-slate-400 font-sans text-xs pt-1 border-t border-navy-800">
                    <strong className="text-slate-300 font-mono">Explanation:</strong> {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" /> Constraints
          </span>
          <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-400 bg-navy-950/60 p-3 rounded-xl border border-navy-800">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hints Accordion */}
      {problem.hints && problem.hints.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-xs font-mono text-accent-amber border border-navy-700 transition"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Hints &amp; Edge Cases ({problem.hints.length})
            </span>
            <span>{showHints ? 'Hide' : 'Show'}</span>
          </button>

          {showHints && (
            <div className="mt-2 p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2 text-xs font-sans text-slate-300">
              {problem.hints.map((hint, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-accent-amber">{idx + 1}.</span> {hint}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
