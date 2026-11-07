import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCode, 
  BookOpen,
  Keyboard,
  Sparkles
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { vaultApi } from '../../services/api';

interface CodingWorkspaceProps {
  initialQuestion?: any;
  onOpenVisualizer?: (route: string) => void;
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  initialQuestion,
  onOpenVisualizer
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(initialQuestion || null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Editor states
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13);
  const [stdinInput, setStdinInput] = useState<string>('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'stdin' | 'explanation'>('console');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Load documents and coding questions
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoadingQuestions(true);
      try {
        const [docsData, qsData] = await Promise.all([
          vaultApi.getDocuments(),
          vaultApi.getQuestions({ limit: 100 })
        ]);

        setDocuments(docsData || []);
        
        // Filter questions suitable for coding practice (programming, debugging, or code snippet questions)
        const codingQs = (qsData || []).filter(
          (q: any) => q.c_starter_code || q.question_type === 'programming' || q.question_type === 'debugging' || q.question_type === 'code_output'
        );

        setQuestions(codingQs);

        if (!selectedQuestion && codingQs.length > 0) {
          selectQuestionAndLoadCode(codingQs[0]);
        } else if (selectedQuestion) {
          selectQuestionAndLoadCode(selectedQuestion);
        }
      } catch (err: any) {
        console.error('Failed to load coding catalog:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchCatalog();
  }, []);

  // Update when initialQuestion prop changes
  useEffect(() => {
    if (initialQuestion) {
      selectQuestionAndLoadCode(initialQuestion);
    }
  }, [initialQuestion]);

  const selectQuestionAndLoadCode = (q: any) => {
    setSelectedQuestion(q);
    setResult(null);

    // Check localStorage for autosaved draft
    const storageKey = `dsverse_code_${q.question_id}`;
    const savedDraft = localStorage.getItem(storageKey);

    if (savedDraft) {
      setCode(savedDraft);
    } else if (q.c_starter_code) {
      setCode(q.c_starter_code);
    } else {
      setCode(
        `#include <stdio.h>\n#include <stdlib.h>\n\n// Solution for ${q.question_number}\nint main(void) {\n    printf("Running C program in GCC sandbox...\\n");\n    return 0;\n}\n`
      );
    }
  };

  const handleCodeChange = (newCode?: string) => {
    const updated = newCode || '';
    setCode(updated);
    if (selectedQuestion) {
      localStorage.setItem(`dsverse_code_${selectedQuestion.question_id}`, updated);
    }
  };

  const handleResetCode = () => {
    if (!selectedQuestion) return;
    const defaultCode = selectedQuestion.c_starter_code || (
      `#include <stdio.h>\n#include <stdlib.h>\n\n// Solution for ${selectedQuestion.question_number}\nint main(void) {\n    return 0;\n}\n`
    );
    setCode(defaultCode);
    localStorage.removeItem(`dsverse_code_${selectedQuestion.question_id}`);
    setResult(null);
  };

  const handleRunCode = async () => {
    if (!selectedQuestion || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setActiveConsoleTab('console');

    try {
      const res = await vaultApi.executeCode(
        selectedQuestion.question_id,
        code,
        'Student',
        stdinInput
      );
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        verdict: 'COMPILATION_ERROR',
        stderr: err.message || 'Execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  const handleLaunchVisualizer = () => {
    const route = result?.visualizer_link || 'linked-list/singly';
    if (onOpenVisualizer) {
      onOpenVisualizer(route);
    } else {
      window.location.hash = route;
    }
  };

  // Filter questions by document if selected
  const displayedQuestions = selectedDocId === 'all'
    ? questions
    : questions.filter((q) => q.document_id === selectedDocId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[650px] bg-navy-950 rounded-2xl border border-navy-800 shadow-card overflow-hidden" onKeyDown={handleKeyDown}>
      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-navy-900 border-b border-navy-800 flex-shrink-0">
        {/* Left: Document & Question Pickers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
              <FileCode className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-white uppercase hidden sm:inline">
              C Systems Workspace
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">&bull;</span>

          {/* Document filter dropdown */}
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-accent-blue"
          >
            <option value="all">All Documents ({questions.length} Coding Problems)</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>
                {d.filename}
              </option>
            ))}
          </select>

          {/* Question selector dropdown */}
          <select
            value={selectedQuestion?.question_id || ''}
            onChange={(e) => {
              const q = questions.find((item) => item.question_id === e.target.value);
              if (q) selectQuestionAndLoadCode(q);
            }}
            disabled={displayedQuestions.length === 0}
            className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700 text-xs font-mono text-accent-cyan font-bold focus:outline-none focus:border-accent-cyan max-w-[240px] truncate"
          >
            {displayedQuestions.map((q) => (
              <option key={q.question_id} value={q.question_id}>
                {q.question_number}: {q.question_text.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions & Execution Button */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjuster */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-navy-950 border border-navy-800 text-[11px] font-mono text-slate-400">
            <span>Font:</span>
            {[12, 13, 14, 16].map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`px-1.5 py-0.5 rounded ${fontSize === sz ? 'bg-navy-800 text-accent-blue font-bold' : 'hover:text-white'}`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCode}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white text-xs font-mono border border-navy-700 transition"
            title="Reset code to original starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleLaunchVisualizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-violet/15 hover:bg-accent-violet/25 text-accent-violet border border-accent-violet/40 text-xs font-mono font-bold transition"
            title="Launch interactive pointer visualizer for this topic"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visualize</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || !selectedQuestion}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-blue text-navy-950 hover:bg-accent-blue/90 font-mono font-bold text-xs shadow-glow-blue transition disabled:opacity-40"
            title="Compile with GCC 16.2.0 and run in sandbox (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Split Left (Specs) & Right (Editor & Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 4 Cols: Problem Specification Panel */}
        <div className="lg:col-span-4 bg-navy-900 border-r border-navy-800 p-4 lg:p-5 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          {isLoadingQuestions ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              Loading questions repository...
            </div>
          ) : selectedQuestion ? (
            <>
              {/* Question Header Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold border border-accent-blue/30">
                  {selectedQuestion.question_number}
                </span>
                <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan uppercase text-[10px] font-bold border border-accent-cyan/30">
                  {selectedQuestion.topic_id}
                </span>
                <span className="px-2 py-0.5 rounded bg-navy-950 text-accent-amber text-[10px] font-bold border border-navy-700">
                  {selectedQuestion.marks} Marks
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedQuestion.difficulty === 'Hard'
                    ? 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30'
                    : selectedQuestion.difficulty === 'Medium'
                    ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                    : 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                }`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>

              {/* Subtopic / Learning Outcome */}
              {selectedQuestion.subtopic && (
                <div className="text-[11px] font-mono text-slate-400 bg-navy-950/60 p-2.5 rounded-xl border border-navy-800/80">
                  {selectedQuestion.subtopic}
                </div>
              )}

              {/* Problem Statement */}
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block">
                  Problem Description
                </span>
                <div className="text-sm font-sans text-slate-100 leading-relaxed select-text cursor-text whitespace-pre-wrap">
                  {selectedQuestion.question_text}
                </div>
              </div>

              {/* Pedagogical Explanation & Invariants */}
              {selectedQuestion.explanation && (
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1 text-xs">
                  <span className="text-accent-cyan font-mono font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Academic Guidelines:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Environment Information Card */}
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1 text-[11px] font-mono text-slate-400">
                <span className="text-white font-bold block">Execution Harness:</span>
                <p>&bull; Standard: ANSI C11 (GCC -O0 -Wall -Wextra)</p>
                <p>&bull; Memory bounds &amp; timeout safety enforced (3.0s limit)</p>
                <p>&bull; Use <kbd className="px-1 py-0.5 bg-navy-800 rounded text-slate-300">Ctrl+Enter</kbd> to run</p>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No question selected. Select a question from the toolbar above.
            </div>
          )}
        </div>

        {/* Right 8 Cols: Monaco Code Editor (Top) & Execution Console (Bottom) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-navy-950 overflow-hidden">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-navy-900/90 border-b border-navy-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-accent-cyan font-bold">solution.c</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] text-slate-400">Autosaved to browser storage</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Keyboard className="w-3 h-3" />
              <span>C11 GCC Sandbox</span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[280px]">
            <Editor
              height="100%"
              language="c"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: fontSize,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                tabSize: 4
              }}
            />
          </div>

          {/* Bottom Execution Results & Diagnostics Panel */}
          <div className="h-56 border-t border-navy-800 bg-navy-950 flex flex-col font-mono text-xs flex-shrink-0">
            {/* Console Tabs Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-navy-900 border-b border-navy-800 text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    activeConsoleTab === 'console'
                      ? 'bg-navy-800 text-white font-bold border border-navy-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Output Console</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('stdin')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    activeConsoleTab === 'stdin'
                      ? 'bg-navy-800 text-white font-bold border border-navy-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5 text-accent-blue" />
                  <span>Standard Input (stdin)</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('explanation')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    activeConsoleTab === 'explanation'
                      ? 'bg-navy-800 text-white font-bold border border-navy-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                  <span>Reference Notes</span>
                </button>
              </div>

              {/* Execution Result Verdict */}
              {result && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-accent-amber" />
                    <span>{result.execution_time_ms} ms</span>
                  </span>
                  <span className={`font-bold flex items-center gap-1 ${
                    result.success ? 'text-accent-emerald' : 'text-accent-rose'
                  }`}>
                    {result.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{result.verdict}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Console Content Area */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar select-text cursor-text text-slate-300">
              {activeConsoleTab === 'console' && (
                <div className="whitespace-pre-wrap leading-relaxed text-xs">
                  {isRunning ? (
                    <div className="text-slate-400 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
                      <span>Compiling and executing in GCC sandbox...</span>
                    </div>
                  ) : result ? (
                    <>
                      {result.stderr && (
                        <div className="text-rose-400 mb-2 font-mono">
                          {result.stderr}
                        </div>
                      )}
                      {result.stdout ? (
                        <div className="text-slate-200 font-mono">
                          {result.stdout}
                        </div>
                      ) : !result.stderr ? (
                        <div className="text-accent-emerald font-mono">
                          Program compiled and executed successfully with zero runtime errors.
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-slate-500 font-mono">
                      // Press "Run Code" or use Ctrl+Enter to compile with GCC and view stdout/stderr.
                    </span>
                  )}
                </div>
              )}

              {activeConsoleTab === 'stdin' && (
                <div className="h-full flex flex-col space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Custom Standard Input (Provided to scanf / getchar):
                  </span>
                  <textarea
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Enter interactive standard input data here..."
                    className="flex-1 w-full p-2 bg-navy-950 border border-navy-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-accent-blue resize-none"
                  />
                </div>
              )}

              {activeConsoleTab === 'explanation' && (
                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-accent-amber font-bold block mb-1">Source Invariants &amp; Verification Criteria:</span>
                    <p className="text-slate-300 font-sans leading-relaxed text-xs">
                      {selectedQuestion?.explanation || 'Follow standard C structures, ensure dynamic memory bounds, and handle zero-division or boundary edge cases.'}
                    </p>
                    {selectedQuestion?.subtopic && (
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Domain: {selectedQuestion.subtopic}
                      </div>
                    )}
                  </div>

                  {selectedQuestion?.c_starter_code && (
                    <div className="pt-2 border-t border-navy-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-accent-cyan font-mono">Starter Implementation Reference:</span>
                        <button
                          onClick={() => setCode(selectedQuestion.c_starter_code)}
                          className="px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue text-[10px] font-mono hover:bg-accent-blue/25 border border-accent-blue/30"
                        >
                          Load into Editor
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36">
                        {selectedQuestion.c_starter_code}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
