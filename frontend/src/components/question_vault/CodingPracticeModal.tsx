import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Terminal, 
  RotateCcw, 
  Eye,
  FileCode
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { vaultApi } from '../../services/api';

interface CodingPracticeModalProps {
  question: any;
  onClose: () => void;
  onOpenVisualizer?: (route: string) => void;
}

export const CodingPracticeModal: React.FC<CodingPracticeModalProps> = ({
  question,
  onClose,
  onOpenVisualizer
}) => {
  const defaultCode = question.c_starter_code || (
    "#include <stdio.h>\n" +
    "#include <stdlib.h>\n\n" +
    "// Function implementation for: " + question.question_number + "\n" +
    "void solution() {\n" +
    "    // User writes code here\n" +
    "}\n"
  );

  const [code, setCode] = useState<string>(defaultCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleExecuteCode = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await vaultApi.executeCode(question.question_id, code, 'Student');
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        verdict: 'ERROR',
        stderr: err.message || 'Execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    setCode(defaultCode);
    setResult(null);
  };

  const handleOpenVisualizerRoute = () => {
    const route = result?.visualizer_link || 'linked-list/singly';
    if (onOpenVisualizer) {
      onOpenVisualizer(route);
    } else {
      window.location.hash = route;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-3 lg:p-6">
      <div className="bg-navy-900 border border-navy-700 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-card overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-navy-950 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-violet/15 text-accent-violet border border-accent-violet/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-accent-blue">{question.question_number}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs font-mono text-accent-cyan uppercase font-semibold">{question.topic_id}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs font-mono text-accent-amber font-semibold">{question.marks} Marks</span>
              </div>
              <h2 className="text-sm font-bold text-white font-sans truncate max-w-md lg:max-w-xl">
                C Systems Programming Workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenVisualizerRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-violet/20 hover:bg-accent-violet/30 text-accent-violet text-xs font-mono font-bold border border-accent-violet/40 transition"
              title="Open full interactive visualizer for this topic"
            >
              <Eye className="w-3.5 h-3.5" /> Visualize in DSVERSE
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: Split into Specs (Left), Editor & Console (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Problem Specification */}
          <div className="lg:col-span-5 p-5 border-r border-navy-800 overflow-y-auto custom-scrollbar space-y-4 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                Problem Description
              </span>
              <p className="text-sm font-sans text-white leading-relaxed select-text cursor-text whitespace-pre-wrap">
                {question.question_text}
              </p>
            </div>

            {question.explanation && (
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
                <span className="text-accent-cyan font-bold block">Academic Explanation:</span>
                <p className="text-slate-300 font-sans">{question.explanation}</p>
              </div>
            )}

            <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1 text-slate-400 text-[11px]">
              <span className="text-accent-blue font-bold block">GCC Isolated Environment:</span>
              <p>Standard: ANSI C11 (GCC -O0 -Wall -Wextra)</p>
              <p>Memory bounds &amp; timeout safety enforced (3.0s limit).</p>
            </div>
          </div>

          {/* Right Panel: Monaco Editor & Output Console */}
          <div className="lg:col-span-7 flex flex-col h-full bg-navy-950 overflow-hidden">
            {/* Editor Action Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-navy-900 border-b border-navy-800">
              <span className="text-xs font-mono text-slate-300">solution.c</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-800 text-slate-400 hover:text-white text-xs font-mono border border-navy-700"
                  title="Reset starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={handleExecuteCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1 rounded-lg bg-accent-blue text-navy-950 font-bold text-xs font-mono hover:bg-accent-blue/90 disabled:opacity-40 transition shadow-glow-blue"
                >
                  <Play className="w-3.5 h-3.5" /> {isRunning ? 'Compiling...' : 'Run C Code'}
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-[260px]">
              <Editor
                height="100%"
                language="c"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  bracketPairColorization: { enabled: true }
                }}
              />
            </div>

            {/* Execution Console Output Area */}
            <div className="h-44 border-t border-navy-800 bg-navy-950 flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-1.5 bg-navy-900/80 border-b border-navy-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Terminal Console Output</span>
                </div>
                {result && (
                  <span className={`font-bold ${result.success ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                    Verdict: {result.verdict} ({result.execution_time_ms} ms)
                  </span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar select-text cursor-text text-slate-300 whitespace-pre-wrap leading-relaxed">
                {isRunning ? (
                  <div className="text-slate-500 animate-pulse">Compiling source with GCC 16.2.0 C11...</div>
                ) : result ? (
                  result.stderr ? (
                    <span className="text-rose-400">{result.stderr}</span>
                  ) : result.stdout ? (
                    <span className="text-slate-200">{result.stdout}</span>
                  ) : (
                    <span className="text-accent-emerald">Program compiled and executed successfully with zero runtime errors.</span>
                  )
                ) : (
                  <span className="text-slate-600">// Click "Run C Code" to compile and execute in GCC sandbox.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
