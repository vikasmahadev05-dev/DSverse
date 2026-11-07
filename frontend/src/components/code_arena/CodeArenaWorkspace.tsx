import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Send, Terminal, Eye, Code2,
  PanelLeftOpen, PanelRightOpen,
  RotateCcw, GripVertical, SlidersHorizontal, Trash2
} from 'lucide-react';
import { ProblemDetails } from './ProblemDetails';
import { CodeEditor } from './CodeEditor';
import { ExecutionPanel } from './ExecutionPanel';
import { ProblemLibrary } from './ProblemLibrary';
import { OnlineCompiler } from './OnlineCompiler';
import { SubmissionsHistory } from './SubmissionsHistory';
import { arenaApi } from '../../services/api';

interface CodeArenaWorkspaceProps {
  initialSubView?: 'practice' | 'compiler' | 'debugger' | 'submissions' | 'library';
  onSubViewChange?: (view: string) => void;
}

export const CodeArenaWorkspace: React.FC<CodeArenaWorkspaceProps> = ({
  initialSubView = 'practice',
  onSubViewChange
}) => {
  const [subView, setSubView] = useState<'practice' | 'compiler' | 'debugger' | 'submissions' | 'library'>(initialSubView);
  
  // Initialize problem ID from URL query or localStorage so refresh preserves the challenge
  const getInitialProblemId = (): string => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('problem');
      if (q) return q;
      const stored = localStorage.getItem('dsverse_arena_problem_id');
      if (stored) return stored;
    } catch {
      // fallback
    }
    return 'll-insert-beginning';
  };

  const [selectedProblemId, setSelectedProblemId] = useState<string>(getInitialProblemId);
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [mode, setMode] = useState<'function' | 'full_program'>('function');
  const [activeTab, setActiveTab] = useState<'results' | 'compiler' | 'debugger' | 'variables' | 'error_demo'>('results');

  // Split Screen & Resizing State
  const [leftWidth, setLeftWidth] = useState<number>(30); // percentage
  const [rightWidth, setRightWidth] = useState<number>(35); // percentage
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [isRightMaximized, setIsRightMaximized] = useState<boolean>(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Execution & Judge Results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [trace, setTrace] = useState<any>(null);

  // Visual Debugger Stepping
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);

  const playTimerRef = useRef<any>(null);

  // Load problem details & saved code with strict stale-data clearing
  useEffect(() => {
    // Erase stale test results and traces when problem changes
    setResult(null);
    setTrace(null);
    setCurrentStepIndex(0);
    setHighlightLine(null);
    setIsPlaying(false);
    setActiveTab('results');

    // Persist active problem ID
    try {
      localStorage.setItem('dsverse_arena_problem_id', selectedProblemId);
      const url = new URL(window.location.href);
      url.searchParams.set('problem', selectedProblemId);
      window.history.replaceState({}, '', url);
    } catch {
      // ignore
    }

    arenaApi.getProblem(selectedProblemId)
      .then((data) => {
        setProblem(data);
        arenaApi.getSavedSolution(selectedProblemId)
          .then((saved) => {
            if (saved?.saved_code) {
              setCode(saved.saved_code);
            } else {
              setCode(data.starter_code);
            }
          })
          .catch(() => setCode(data.starter_code));
      })
      .catch((err) => console.error('Failed to load problem:', err));
  }, [selectedProblemId]);

  // Listen to Global Reset event from Header
  useEffect(() => {
    const onResetArena = () => {
      if (problem) {
        setCode(problem.starter_code);
        setResult(null);
        setTrace(null);
        setCurrentStepIndex(0);
        setHighlightLine(null);
        setIsPlaying(false);
        setActiveTab('results');
      }
    };
    window.addEventListener('dsverse-reset-arena', onResetArena);
    return () => window.removeEventListener('dsverse-reset-arena', onResetArena);
  }, [problem]);

  // Sync subView if parent prop changes
  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
      if (initialSubView === 'debugger') {
        setActiveTab('debugger');
        setIsRightCollapsed(false);
      }
    }
  }, [initialSubView]);

  // Stepping timer for Visual Debugger
  useEffect(() => {
    if (isPlaying && trace?.steps) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= trace.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const nextStep = trace.steps[nextIdx];
          if (nextStep?.c_line) {
            setHighlightLine(nextStep.c_line);
          }
          return nextIdx;
        });
      }, 1500 / speed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, trace, speed]);

  // Update line highlight when manual step changes
  useEffect(() => {
    if (trace?.steps && trace.steps[currentStepIndex]) {
      setHighlightLine(trace.steps[currentStepIndex].c_line || trace.steps[currentStepIndex].line);
    }
  }, [currentStepIndex, trace]);

  // Dragging Handlers for Split Screen
  const handleLeftPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;

      if (newPct < 12) {
        setIsLeftCollapsed(true);
      } else {
        setIsLeftCollapsed(false);
        setLeftWidth(Math.min(Math.max(newPct, 18), 45));
      }
    };

    const onPointerUp = () => {
      setIsDraggingLeft(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleRightPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPct = ((rect.right - moveEvent.clientX) / rect.width) * 100;

      if (newPct < 12) {
        setIsRightCollapsed(true);
      } else {
        setIsRightCollapsed(false);
        setRightWidth(Math.min(Math.max(newPct, 20), 55));
      }
    };

    const onPointerUp = () => {
      setIsDraggingRight(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResetLayout = () => {
    setLeftWidth(30);
    setRightWidth(35);
    setIsLeftCollapsed(false);
    setIsRightCollapsed(false);
    setIsRightMaximized(false);
  };

  const handleLayoutPreset = (preset: 'all' | 'code_console' | 'code_specs' | 'focus') => {
    if (preset === 'all') {
      setIsLeftCollapsed(false);
      setIsRightCollapsed(false);
      setIsRightMaximized(false);
      setLeftWidth(30);
      setRightWidth(35);
    } else if (preset === 'code_console') {
      setIsLeftCollapsed(true);
      setIsRightCollapsed(false);
      setIsRightMaximized(false);
      setRightWidth(40);
    } else if (preset === 'code_specs') {
      setIsLeftCollapsed(false);
      setIsRightCollapsed(true);
      setIsRightMaximized(false);
      setLeftWidth(38);
    } else if (preset === 'focus') {
      setIsLeftCollapsed(true);
      setIsRightCollapsed(true);
      setIsRightMaximized(false);
    }
  };

  // Actions
  const handleRunCode = async () => {
    setIsLoading(true);
    setHighlightLine(null);
    setIsRightCollapsed(false);
    try {
      const res = await arenaApi.runCode(selectedProblemId, code, mode);
      setResult(res);
      if (res.errors && res.errors.length > 0) {
        setActiveTab('compiler');
        setHighlightLine(res.errors[0].line);
      } else {
        setActiveTab('results');
      }
    } catch (err: any) {
      setResult({ success: false, verdict: 'ERROR', stderr: err.message });
      setActiveTab('compiler');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsLoading(true);
    setHighlightLine(null);
    setIsRightCollapsed(false);
    try {
      const res = await arenaApi.submitCode(selectedProblemId, code);
      setResult(res);
      setActiveTab('results');
      if (res.errors && res.errors.length > 0) {
        setHighlightLine(res.errors[0].line);
      }
    } catch (err: any) {
      setResult({ success: false, verdict: 'ERROR', stderr: err.message });
      setActiveTab('compiler');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompileCode = async () => {
    setIsLoading(true);
    setHighlightLine(null);
    setIsRightCollapsed(false);
    try {
      const res = await arenaApi.compileCode(code);
      setResult(res);
      setActiveTab('compiler');
      if (res.diagnostics && res.diagnostics.length > 0) {
        setHighlightLine(res.diagnostics[0].line);
      }
    } catch (err: any) {
      setResult({ success: false, verdict: 'ERROR', stderr: err.message });
      setActiveTab('compiler');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualizeExecution = async () => {
    setIsLoading(true);
    setIsRightCollapsed(false);
    try {
      const res = await arenaApi.visualize(selectedProblemId, code);
      setTrace(res);
      setCurrentStepIndex(0);
      if (res.steps && res.steps.length > 0) {
        setHighlightLine(res.steps[0].c_line || res.steps[0].line);
      }
      if (res.error_details) {
        setActiveTab('error_demo');
      } else {
        setActiveTab('debugger');
      }
      if (res.steps && res.steps.length > 1) {
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('Visualization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProblemFromLibrary = (problemId: string) => {
    setSelectedProblemId(problemId);
    setSubView('practice');
    if (onSubViewChange) onSubViewChange('practice');
  };

  const handleLoadCodeFromSubmission = (problemId: string, sourceCode: string) => {
    setSelectedProblemId(problemId);
    setCode(sourceCode);
    setResult(null);
    setTrace(null);
    setCurrentStepIndex(0);
    setHighlightLine(null);
    setIsPlaying(false);
    setActiveTab('results');
    setSubView('practice');
    if (onSubViewChange) onSubViewChange('practice');
  };

  const handleResetCode = () => {
    if (problem) {
      setCode(problem.starter_code);
      setResult(null);
      setTrace(null);
      setCurrentStepIndex(0);
      setHighlightLine(null);
      setIsPlaying(false);
      setActiveTab('results');
    }
  };

  const handleClearOutput = () => {
    setResult(null);
    setTrace(null);
    setCurrentStepIndex(0);
    setHighlightLine(null);
    setIsPlaying(false);
  };

  // Render Sub-Views
  if (subView === 'compiler') {
    return <OnlineCompiler />;
  }

  if (subView === 'library') {
    return <ProblemLibrary onSelectProblem={handleSelectProblemFromLibrary} />;
  }

  if (subView === 'submissions') {
    return <SubmissionsHistory onLoadCode={handleLoadCodeFromSubmission} />;
  }

  // Default: Practice / Visual Debugger Workspace
  return (
    <div className="space-y-3">
      {/* Action Header Bar with Ergonomic Layout Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        {/* Left: Problem Quick Switcher */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-cyan font-semibold">
                {problem?.category || 'Linked Lists'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {problem?.difficulty || 'Easy'}
              </span>
            </div>
            <h1 className="text-base lg:text-lg font-bold text-white font-sans truncate max-w-sm lg:max-w-md">
              {problem?.title || 'Loading Problem...'}
            </h1>
          </div>
        </div>

        {/* Center: Layout Presets Controls */}
        <div className="hidden xl:flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800 text-[11px] font-mono text-slate-400">
          <span className="px-2 text-slate-500 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Split:
          </span>
          <button
            onClick={() => handleLayoutPreset('all')}
            className={`px-2.5 py-1 rounded-lg transition ${
              !isLeftCollapsed && !isRightCollapsed && !isRightMaximized
                ? 'bg-navy-800 text-white font-bold border border-navy-700'
                : 'hover:text-slate-200'
            }`}
            title="Standard 3-Panel Split View"
          >
            3-Cols
          </button>
          <button
            onClick={() => handleLayoutPreset('code_console')}
            className={`px-2.5 py-1 rounded-lg transition ${
              isLeftCollapsed && !isRightCollapsed
                ? 'bg-navy-800 text-white font-bold border border-navy-700'
                : 'hover:text-slate-200'
            }`}
            title="Code + Execution Console"
          >
            Code+Console
          </button>
          <button
            onClick={() => handleLayoutPreset('code_specs')}
            className={`px-2.5 py-1 rounded-lg transition ${
              !isLeftCollapsed && isRightCollapsed
                ? 'bg-navy-800 text-white font-bold border border-navy-700'
                : 'hover:text-slate-200'
            }`}
            title="Problem Specs + Code"
          >
            Specs+Code
          </button>
          <button
            onClick={() => handleLayoutPreset('focus')}
            className={`px-2.5 py-1 rounded-lg transition ${
              isLeftCollapsed && isRightCollapsed
                ? 'bg-navy-800 text-accent-blue font-bold border border-accent-blue/30'
                : 'hover:text-slate-200'
            }`}
            title="Focus Mode (Full Width Editor)"
          >
            Focus
          </button>
          <button
            onClick={handleResetLayout}
            className="p-1 hover:text-white rounded hover:bg-navy-800 text-slate-400 transition"
            title="Reset Split Layout to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Controls & Execution Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-navy-950 p-1 rounded-xl border border-navy-800 text-xs font-mono">
            <button
              onClick={() => setMode('function')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mode === 'function'
                  ? 'bg-navy-800 text-accent-blue font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Function Mode
            </button>
            <button
              onClick={() => setMode('full_program')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mode === 'full_program'
                  ? 'bg-navy-800 text-accent-cyan font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Program
            </button>
          </div>

          {/* Clear Output Button */}
          <button
            onClick={handleClearOutput}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white text-xs font-mono border border-navy-700 transition"
            title="Erase all test results, compiler diagnostics, and debugger traces"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Clear Output
          </button>

          {/* Compile Button */}
          <button
            onClick={handleCompileCode}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
            title="GCC Syntax Check"
          >
            <Terminal className="w-3.5 h-3.5 text-accent-cyan" /> Compile
          </button>

          {/* Visualize Execution Button */}
          <button
            onClick={handleVisualizeExecution}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-violet/20 hover:bg-accent-violet/30 text-accent-violet hover:text-white text-xs font-mono font-bold border border-accent-violet/50 shadow-glow-violet transition"
            title="Step-by-Step C Memory Execution"
          >
            <Eye className="w-3.5 h-3.5" /> Visualize
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-accent-blue text-xs font-mono font-bold border border-accent-blue/40 transition"
            title="Run Sample Tests (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Code
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-accent-emerald to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-navy-950 text-xs font-mono font-bold shadow-glow-emerald transition"
            title="Submit to Automated Judge"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Submit
          </button>
        </div>
      </div>

      {/* Main Adjustable & Tab-Closable Split Screen Container */}
      <div
        ref={containerRef}
        className={`flex flex-row items-stretch h-[calc(100vh-210px)] min-h-[580px] w-full relative ${
          isDraggingLeft || isDraggingRight ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* ============================================================== */}
        {/* PANEL 1: PROBLEM SPECIFICATION (LEFT)                          */}
        {/* ============================================================== */}
        {isLeftCollapsed ? (
          /* Slim Collapsed Vertical Tab Ribbon */
          <div
            onClick={() => setIsLeftCollapsed(false)}
            className="w-10 flex-shrink-0 h-full bg-navy-950 border border-navy-800 hover:border-accent-blue/50 rounded-2xl flex flex-col items-center py-4 gap-3 cursor-pointer transition shadow-card group"
            title="Click to Expand Problem Specifications"
          >
            <PanelLeftOpen className="w-4 h-4 text-slate-400 group-hover:text-accent-blue transition" />
            <div className="[writing-mode:vertical-lr] text-[11px] font-mono tracking-widest text-slate-500 group-hover:text-slate-300 rotate-180 uppercase font-semibold">
              Problem Description
            </div>
          </div>
        ) : !isRightMaximized ? (
          /* Expanded Left Panel */
          <div
            style={{ width: `${leftWidth}%` }}
            className="flex-shrink-0 h-full overflow-hidden transition-all duration-75"
          >
            {problem && (
              <ProblemDetails
                problem={problem}
                onClose={() => setIsLeftCollapsed(true)}
              />
            )}
          </div>
        ) : null}

        {/* LEFT DRAGGABLE DIVIDER GUTTER */}
        {!isLeftCollapsed && !isRightMaximized && (
          <div
            onPointerDown={handleLeftPointerDown}
            onDoubleClick={handleResetLayout}
            className={`w-3 flex-shrink-0 h-full flex items-center justify-center cursor-col-resize group relative z-10 transition ${
              isDraggingLeft ? 'bg-accent-blue/20' : 'hover:bg-accent-blue/10'
            }`}
            title="Drag to resize • Double-click to reset"
          >
            <div
              className={`w-[2px] h-full transition-all ${
                isDraggingLeft
                  ? 'bg-accent-blue shadow-glow-blue'
                  : 'bg-navy-700/60 group-hover:bg-accent-blue/80'
              }`}
            />
            <div
              className={`absolute p-1 rounded bg-navy-800 border border-navy-700 shadow-md transition-all ${
                isDraggingLeft
                  ? 'bg-accent-blue text-navy-950 scale-110'
                  : 'text-slate-500 group-hover:text-white group-hover:border-accent-blue/50'
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PANEL 2: MONACO CODE EDITOR (CENTER)                           */}
        {/* ============================================================== */}
        {!isRightMaximized ? (
          <div
            className={`flex-1 min-w-[280px] h-full flex flex-col overflow-hidden transition-all duration-75 ${
              isDraggingLeft || isDraggingRight ? 'pointer-events-none' : ''
            }`}
          >
            <CodeEditor
              value={code}
              onChange={(newVal) => setCode(newVal)}
              highlightLine={highlightLine}
              onReset={handleResetCode}
            />
          </div>
        ) : null}

        {/* RIGHT DRAGGABLE DIVIDER GUTTER */}
        {!isRightCollapsed && !isRightMaximized && (
          <div
            onPointerDown={handleRightPointerDown}
            onDoubleClick={handleResetLayout}
            className={`w-3 flex-shrink-0 h-full flex items-center justify-center cursor-col-resize group relative z-10 transition ${
              isDraggingRight ? 'bg-accent-violet/20' : 'hover:bg-accent-violet/10'
            }`}
            title="Drag to resize • Double-click to reset"
          >
            <div
              className={`w-[2px] h-full transition-all ${
                isDraggingRight
                  ? 'bg-accent-violet shadow-glow-violet'
                  : 'bg-navy-700/60 group-hover:bg-accent-violet/80'
              }`}
            />
            <div
              className={`absolute p-1 rounded bg-navy-800 border border-navy-700 shadow-md transition-all ${
                isDraggingRight
                  ? 'bg-accent-violet text-white scale-110'
                  : 'text-slate-500 group-hover:text-white group-hover:border-accent-violet/50'
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PANEL 3: EXECUTION RESULTS & VISUAL DEBUGGER (RIGHT)           */}
        {/* ============================================================== */}
        {isRightCollapsed ? (
          /* Slim Collapsed Vertical Tab Ribbon */
          <div
            onClick={() => setIsRightCollapsed(false)}
            className="w-10 flex-shrink-0 h-full bg-navy-950 border border-navy-800 hover:border-accent-violet/50 rounded-2xl flex flex-col items-center py-4 gap-3 cursor-pointer transition shadow-card group"
            title="Click to Expand Execution Console & Debugger"
          >
            <PanelRightOpen className="w-4 h-4 text-slate-400 group-hover:text-accent-violet transition" />
            <div className="[writing-mode:vertical-lr] text-[11px] font-mono tracking-widest text-slate-500 group-hover:text-slate-300 rotate-180 uppercase font-semibold">
              Console &amp; Debugger
            </div>
          </div>
        ) : (
          /* Expanded Right Panel */
          <div
            style={{ width: isRightMaximized ? '100%' : `${rightWidth}%` }}
            className="flex-shrink-0 h-full overflow-hidden transition-all duration-75"
          >
            <ExecutionPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              result={result}
              trace={trace}
              currentStepIndex={currentStepIndex}
              isPlaying={isPlaying}
              speed={speed}
              onPlayToggle={() => {
                if (!isPlaying && trace?.steps && currentStepIndex >= trace.steps.length - 1) {
                  setCurrentStepIndex(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              onNextStep={() => {
                if (trace?.steps && currentStepIndex < trace.steps.length - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                }
              }}
              onPrevStep={() => {
                if (currentStepIndex > 0) {
                  setCurrentStepIndex(currentStepIndex - 1);
                }
              }}
              onRestartTrace={() => {
                setCurrentStepIndex(0);
                setIsPlaying(true);
              }}
              onSpeedChange={setSpeed}
              onSeekStep={setCurrentStepIndex}
              onJumpToLine={(line) => setHighlightLine(line)}
              isLoading={isLoading}
              onClose={() => setIsRightCollapsed(true)}
              isMaximized={isRightMaximized}
              onToggleMaximize={() => setIsRightMaximized(!isRightMaximized)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
