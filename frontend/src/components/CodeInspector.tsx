import React, { useRef, useEffect } from 'react';
import { Code2, Download, Info } from 'lucide-react';
import { linkedListApi } from '../services/api';

interface CodeInspectorProps {
  cCode: string;
  activeLine: number;
  cStruct?: string;
  explanation?: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  cCode,
  activeLine,
  cStruct,
  explanation,
}) => {
  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (lineRefs.current[activeLine]) {
      lineRefs.current[activeLine]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLine]);

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-navy-700/60 mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent-violet" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            ANSI C Source Inspector
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {cStruct && (
            <span className="text-[10px] font-mono text-accent-blue bg-navy-800 px-2 py-0.5 rounded border border-navy-700" title={cStruct}>
              typedef struct Node* NODE
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
            singly_linked_list.c
          </span>
          <a
            href={linkedListApi.downloadCSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700 transition"
            title="Download full .c source file"
          >
            <Download className="w-3.5 h-3.5 text-accent-emerald" />
          </a>
        </div>
      </div>

      {/* C Code Box */}
      <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs overflow-x-auto custom-scrollbar border border-navy-800 text-slate-300 max-h-64">
        {cCode.split('\n').map((line, lIdx) => {
          const lineNumber = lIdx + 1;
          const isLineActive = lineNumber === activeLine;

          return (
            <div
              key={lineNumber}
              ref={(el) => (lineRefs.current[lineNumber] = el)}
              className={`flex items-center py-0.5 px-2 rounded transition-colors ${
                isLineActive
                  ? 'code-line-active text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-8 select-none text-[10px] text-slate-600 text-right pr-3 font-mono">
                {lineNumber}
              </span>
              <span className="flex-1 whitespace-pre font-mono">{line}</span>
            </div>
          );
        })}
      </div>

      {/* Synchronized C Line Explanation Card */}
      {explanation && (
        <div className="mt-3 p-3 rounded-xl bg-accent-indigo/10 border border-accent-indigo/30 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-slate-300 leading-relaxed">
            <span className="text-accent-blue font-bold uppercase mr-1.5">[Line {activeLine}]:</span>
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
