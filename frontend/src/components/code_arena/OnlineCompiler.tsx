import React, { useState } from 'react';
import { Play, Download, Trash2, Terminal } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { arenaApi } from '../../services/api';

const DEFAULT_C_PROGRAM = `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("===========================================\\n");
    printf("  DSVERSE - ONLINE C COMPILER (C11 / GCC) \\n");
    printf("===========================================\\n\\n");
    
    int numbers[] = {10, 20, 30, 40, 50};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Contiguous Array Traversal:\\n");
    for (int i = 0; i < n; i++) {
        printf("Index [%d] = %d (Address: %p)\\n", i, numbers[i], (void*)&numbers[i]);
    }
    
    return 0;
}
`;

export const OnlineCompiler: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_C_PROGRAM);
  const [stdin, setStdin] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [result, setResult] = useState<{
    success?: boolean;
    status?: string;
    stdout?: string;
    stderr?: string;
    exit_code?: number;
    compilation_time_ms?: number;
    execution_time_ms?: number;
    diagnostics?: any[];
  } | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setHighlightLine(null);
    try {
      const res = await arenaApi.executeRaw(code, stdin);
      setResult(res);
      if (res.diagnostics && res.diagnostics.length > 0) {
        setHighlightLine(res.diagnostics[0].line);
      }
    } catch (err: any) {
      setResult({
        success: false,
        status: 'ERROR',
        stderr: err.message || 'Execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-c' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dsverse_program.c';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Run Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans">
              C Online Compiler &amp; Sandbox
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Native GCC 16 C11 compiler with dynamic memory allocation, pointers, and structures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
            title="Download C source file"
          >
            <Download className="w-3.5 h-3.5" /> Download .c
          </button>
          <button
            onClick={() => setResult(null)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
            title="Clear terminal output"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-blue hover:bg-sky-400 text-navy-950 text-xs font-mono font-bold shadow-glow-blue disabled:opacity-40 transition"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Compile &amp; Run
          </button>
        </div>
      </div>

      {/* Editor & Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Left: Code Editor */}
        <div className="h-full flex flex-col">
          <CodeEditor
            value={code}
            onChange={setCode}
            highlightLine={highlightLine}
            onReset={() => setCode(DEFAULT_C_PROGRAM)}
          />
        </div>

        {/* Right: Terminal & Input */}
        <div className="h-full flex flex-col gap-4">
          {/* Terminal Console */}
          <div className="flex-1 bg-navy-950 rounded-2xl border border-navy-700 flex flex-col overflow-hidden shadow-card">
            <div className="flex items-center justify-between px-4 py-2.5 bg-navy-900 border-b border-navy-700/80">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <span>Interactive Terminal</span>
              </div>

              {result && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500">
                    Exit: <strong className={result.exit_code === 0 ? 'text-accent-emerald' : 'text-accent-rose'}>
                      {result.exit_code}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Time: <strong className="text-slate-200">{result.execution_time_ms} ms</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar leading-relaxed">
              {isRunning ? (
                <div className="text-slate-400 animate-pulse">
                  Compiling source with GCC -O0 -std=c11...
                </div>
              ) : result ? (
                <div className="space-y-2">
                  {result.stdout && (
                    <pre className="text-slate-200 whitespace-pre-wrap">{result.stdout}</pre>
                  )}
                  {result.stderr && (
                    <pre className="text-rose-400 whitespace-pre-wrap">{result.stderr}</pre>
                  )}
                  {result.diagnostics && result.diagnostics.length > 0 && (
                    <div className="pt-2 border-t border-navy-800 space-y-1">
                      {result.diagnostics.map((d, i) => (
                        <div
                          key={i}
                          onClick={() => setHighlightLine(d.line)}
                          className="cursor-pointer text-accent-amber hover:underline text-[11px]"
                        >
                          Line {d.line}:{d.column}: {d.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500">
                  Ready. Click &quot;Compile &amp; Run&quot; to execute your program.
                </div>
              )}
            </div>
          </div>

          {/* Standard Input (stdin) Box */}
          <div className="h-32 bg-navy-900 rounded-2xl border border-navy-700 p-3 flex flex-col shadow-card">
            <span className="text-xs font-mono text-slate-400 font-semibold mb-1 block">
              Standard Input (stdin)
            </span>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter inputs here if your program uses scanf() or getchar()..."
              className="flex-1 w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent-blue resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
