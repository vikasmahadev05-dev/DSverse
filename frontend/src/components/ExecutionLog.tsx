import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface ExecutionLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 shadow-card flex flex-col h-52">
      <div className="flex items-center justify-between pb-2 border-b border-navy-700/60 mb-2">
        <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent-emerald" /> Execution Log
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">{logs.length} entries</span>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-navy-800 text-slate-400 hover:text-accent-rose transition"
            title="Clear Log"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 font-mono text-[11px] pr-1">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-xs py-4 text-center">Log is empty.</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-accent-blue font-semibold shrink-0">[{log.step}]</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-accent-emerald font-semibold'
                    : log.type === 'error'
                    ? 'text-accent-rose font-semibold'
                    : log.type === 'pointer'
                    ? 'text-accent-violet'
                    : log.type === 'warning'
                    ? 'text-accent-amber'
                    : 'text-slate-300'
                }
              >
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
