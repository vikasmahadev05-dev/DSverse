import React from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Terminal, Eye,
  Sliders, Play, Pause, SkipBack, SkipForward, RotateCcw,
  Bug, ArrowRight, ShieldAlert, Cpu, Maximize2, Minimize2, PanelRightClose
} from 'lucide-react';

interface TestCase {
  test_idx: number;
  status: string;
  label?: string;
  actual?: any;
  expected?: any;
}

interface Diagnostic {
  filename?: string;
  line: number;
  column: number;
  type: string;
  message: string;
  raw: string;
}

interface TraceStep {
  step: number;
  type: string;
  line: number;
  c_line: number;
  explanation: string;
  nodes?: any[];
  array?: any[];
  indices?: Record<string, number>;
  head?: string;
  new_node?: any;
  variables?: Record<string, any>;
}

interface ExecutionPanelProps {
  activeTab: 'results' | 'compiler' | 'debugger' | 'variables' | 'error_demo';
  onTabChange: (tab: 'results' | 'compiler' | 'debugger' | 'variables' | 'error_demo') => void;
  result: {
    success?: boolean;
    verdict?: string;
    tests?: TestCase[];
    passed_count?: number;
    total_count?: number;
    execution_time_ms?: number;
    compilation_time_ms?: number;
    stdout?: string;
    stderr?: string;
    diagnostics?: Diagnostic[];
    errors?: Diagnostic[];
    warnings?: Diagnostic[];
  } | null;
  trace: {
    total_steps?: number;
    steps?: TraceStep[];
    error_details?: any;
    visualizer_type?: string;
  } | null;
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onPlayToggle: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onRestartTrace: () => void;
  onSpeedChange: (speed: number) => void;
  onSeekStep: (stepIdx: number) => void;
  onJumpToLine: (line: number) => void;
  isLoading: boolean;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  activeTab,
  onTabChange,
  result,
  trace,
  currentStepIndex,
  isPlaying,
  speed,
  onPlayToggle,
  onNextStep,
  onPrevStep,
  onRestartTrace,
  onSpeedChange,
  onSeekStep,
  onJumpToLine,
  isLoading,
  onClose,
  isMaximized,
  onToggleMaximize
}) => {
  const currentStep: TraceStep | null =
    trace && trace.steps && trace.steps[currentStepIndex] ? trace.steps[currentStepIndex] : null;

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict?.toUpperCase()) {
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          color: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/40',
          icon: <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
        };
      case 'WRONG_ANSWER':
        return {
          label: 'Wrong Answer',
          color: 'bg-accent-rose/15 text-accent-rose border-accent-rose/40',
          icon: <XCircle className="w-4 h-4 text-accent-rose" />
        };
      case 'COMPILATION_ERROR':
        return {
          label: 'Compilation Error',
          color: 'bg-accent-amber/15 text-accent-amber border-accent-amber/40',
          icon: <AlertTriangle className="w-4 h-4 text-accent-amber" />
        };
      case 'RUNTIME_ERROR':
        return {
          label: 'Runtime Error (Crash)',
          color: 'bg-accent-rose/15 text-accent-rose border-accent-rose/40',
          icon: <ShieldAlert className="w-4 h-4 text-accent-rose" />
        };
      case 'TIME_LIMIT_EXCEEDED':
        return {
          label: 'Time Limit Exceeded',
          color: 'bg-accent-amber/15 text-accent-amber border-accent-amber/40',
          icon: <AlertTriangle className="w-4 h-4 text-accent-amber" />
        };
      default:
        return {
          label: verdict || 'Ready',
          color: 'bg-navy-800 text-slate-300 border-navy-700',
          icon: <Cpu className="w-4 h-4 text-slate-400" />
        };
    }
  };

  const badge = getVerdictBadge(result?.verdict);

  return (
    <div className="flex flex-col h-full bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden shadow-card">
      {/* Tabs Header */}
      <div className="flex items-center justify-between px-4 bg-navy-950 border-b border-navy-700/80">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => onTabChange('results')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-navy-800 text-white border border-accent-blue/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Test Results
            {result?.passed_count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-900 text-slate-300">
                {result.passed_count}/{result.total_count}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('compiler')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
              activeTab === 'compiler'
                ? 'bg-navy-800 text-white border border-accent-blue/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-accent-cyan" /> Compiler Output
            {result?.errors && result.errors.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-rose/20 text-accent-rose font-bold">
                {result.errors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('debugger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
              activeTab === 'debugger'
                ? 'bg-navy-800 text-white border border-accent-violet/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-accent-violet" /> Live Visual Debugger
          </button>

          <button
            onClick={() => onTabChange('variables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
              activeTab === 'variables'
                ? 'bg-navy-800 text-white border border-accent-blue/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-accent-blue" /> Variable Inspector
          </button>

          {trace?.error_details && (
            <button
              onClick={() => onTabChange('error_demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 animate-pulse ${
                activeTab === 'error_demo'
                  ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/50 shadow-sm'
                  : 'text-accent-rose hover:bg-accent-rose/10'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-accent-rose" /> Error Demonstration
            </button>
          )}
        </div>

        {/* Actions & Verdict Badge in Header */}
        <div className="flex items-center gap-2">
          {result?.verdict && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${badge.color}`}>
              {badge.icon} {badge.label}
            </div>
          )}

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              title={isMaximized ? 'Restore Split View' : 'Maximize Execution Panel'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              title="Collapse Execution Panel"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Compiling with GCC &amp; Executing Test Suite...</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: TEST RESULTS */}
        {/* ========================================================= */}
        {!isLoading && activeTab === 'results' && (
          <div className="space-y-4">
            {result?.verdict ? (
              <>
                {/* Metrics Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-navy-950 border border-navy-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${badge.color}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{badge.label}</h4>
                      <p className="text-xs font-mono text-slate-400">
                        Passed {result.passed_count ?? 0} of {result.total_count ?? 0} test cases
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Execution:</span>
                      <span className="text-slate-200 font-semibold">{result.execution_time_ms ?? 0} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Compilation:</span>
                      <span className="text-slate-200 font-semibold">{result.compilation_time_ms ?? 0} ms</span>
                    </div>
                  </div>
                </div>

                {/* Test Cases Table/Cards */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block">
                    Detailed Test Cases
                  </span>

                  {result.tests && result.tests.length > 0 ? (
                    result.tests.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition ${
                          tc.status === 'PASSED'
                            ? 'bg-navy-950/70 border-navy-800'
                            : 'bg-accent-rose/10 border-accent-rose/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold text-slate-200">
                            {tc.label || `Test Case ${idx + 1}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              tc.status === 'PASSED'
                                ? 'bg-accent-emerald/20 text-accent-emerald'
                                : 'bg-accent-rose/20 text-accent-rose'
                            }`}
                          >
                            {tc.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 rounded bg-navy-900 border border-navy-800">
                            <span className="text-slate-500 block text-[10px]">EXPECTED OUTPUT:</span>
                            <span className="text-slate-300">{JSON.stringify(tc.expected)}</span>
                          </div>
                          <div className="p-2 rounded bg-navy-900 border border-navy-800">
                            <span className="text-slate-500 block text-[10px]">ACTUAL OUTPUT:</span>
                            <span className={tc.status === 'PASSED' ? 'text-accent-emerald' : 'text-accent-rose font-bold'}>
                              {JSON.stringify(tc.actual)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs font-mono text-slate-500 bg-navy-950 rounded-xl border border-navy-800">
                      No test case details available for this run.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Click <strong className="text-accent-blue">"Run Code"</strong> to evaluate sample tests, or <strong className="text-accent-emerald">"Submit"</strong> to run the full automated judge.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COMPILER OUTPUT */}
        {/* ========================================================= */}
        {!isLoading && activeTab === 'compiler' && (
          <div className="space-y-4">
            {/* Clickable Errors List */}
            {result?.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-accent-rose uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Compiler Diagnostics ({result.errors.length} Errors)
                </span>
                <div className="space-y-1.5">
                  {result.errors.map((err, i) => (
                    <button
                      key={i}
                      onClick={() => onJumpToLine(err.line)}
                      className="w-full text-left p-3 rounded-xl bg-accent-rose/10 hover:bg-accent-rose/20 border border-accent-rose/30 font-mono text-xs text-rose-300 transition flex items-start gap-2"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-accent-rose/30 text-white font-bold text-[10px]">
                        Line {err.line}:{err.column}
                      </span>
                      <span className="flex-1">{err.message}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal Raw Console */}
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                GCC Terminal Console (stdout &amp; stderr)
              </span>
              <pre className="p-4 bg-navy-950 rounded-xl border border-navy-800 font-mono text-xs text-slate-300 overflow-x-auto custom-scrollbar max-h-80 leading-relaxed whitespace-pre-wrap">
                {result?.stderr ? (
                  <span className="text-rose-400">{result.stderr}</span>
                ) : result?.stdout ? (
                  <span className="text-slate-300">{result.stdout}</span>
                ) : (
                  <span className="text-slate-500">// Terminal idle. Click "Compile" or "Run Code" to inspect output.</span>
                )}
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LIVE VISUAL DEBUGGER */}
        {/* ========================================================= */}
        {!isLoading && activeTab === 'debugger' && (
          <div className="space-y-4">
            {trace && trace.steps && trace.steps.length > 0 ? (
              <>
                {/* Visual Canvas Area */}
                <div className="p-6 bg-navy-950 rounded-2xl border border-navy-800 min-h-[220px] flex flex-col justify-between">
                  {/* Nodes Horizontal Visualization */}
                  <div className="flex flex-wrap items-center gap-3 overflow-x-auto py-4 custom-scrollbar">
                    {/* Head Indicator */}
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-accent-cyan bg-navy-900 px-2.5 py-1.5 rounded-lg border border-navy-700">
                      HEAD <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    {/* Nodes Chain */}
                    {currentStep?.nodes && currentStep.nodes.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={`rounded-xl border p-2.5 min-w-[90px] font-mono shadow-md transition-all ${
                            node.status === 'head_active'
                              ? 'bg-accent-blue/15 border-accent-blue shadow-glow-blue'
                              : 'bg-navy-900 border-navy-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-navy-800 pb-1 mb-1">
                            <span>#{node.index ?? i}</span>
                            <span>{node.address}</span>
                          </div>
                          <div className="text-center font-bold text-sm text-white py-1">
                            {node.info}
                          </div>
                          <div className="text-[10px] text-slate-400 border-t border-navy-800 pt-1 text-center">
                            next: <span className="text-accent-cyan">{node.next}</span>
                          </div>
                        </div>

                        {node.next !== 'NULL' && (
                          <ArrowRight className="w-4 h-4 text-accent-blue flex-shrink-0" />
                        )}
                      </div>
                    ))}

                    {/* NULL Terminator */}
                    <div className="px-3 py-2 rounded-lg bg-navy-900/60 border border-navy-800 text-xs font-mono text-slate-500 font-semibold">
                      NULL
                    </div>
                  </div>

                  {/* Floating New Node if currently allocating */}
                  {currentStep?.new_node && (
                    <div className="mt-4 p-3 rounded-xl bg-accent-violet/10 border border-accent-violet/40 font-mono text-xs text-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
                        <span>Allocated Heap Node <strong>temp ({currentStep.new_node.address})</strong></span>
                      </div>
                      <div className="text-accent-violet font-semibold">
                        temp-&gt;info = {currentStep.new_node.info} | temp-&gt;next = {currentStep.new_node.next}
                      </div>
                    </div>
                  )}

                  {/* Step Explanation Bar */}
                  <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      <strong className="text-accent-blue">Step {currentStep?.step}:</strong> {currentStep?.explanation}
                    </span>
                    <button
                      onClick={() => currentStep?.c_line && onJumpToLine(currentStep.c_line)}
                      className="text-[11px] text-accent-violet hover:underline flex items-center gap-1"
                    >
                      C Line {currentStep?.c_line}
                    </button>
                  </div>
                </div>

                {/* Execution Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-navy-950 rounded-xl border border-navy-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onRestartTrace}
                      className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300 border border-navy-700 transition"
                      title="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onPrevStep}
                      disabled={currentStepIndex === 0}
                      className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-30 text-slate-300 border border-navy-700 transition"
                      title="Previous Step"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onPlayToggle}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
                        isPlaying
                          ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/50'
                          : 'bg-accent-violet hover:bg-accent-violet/90 text-white shadow-glow-violet'
                      }`}
                      title={isPlaying ? 'Pause visual debug execution' : (currentStepIndex >= (trace?.steps?.length || 1) - 1 ? 'Replay execution from start' : 'Play visual execution')}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : (currentStepIndex >= (trace?.steps?.length || 1) - 1 ? 'Replay' : 'Play')}
                    </button>
                    {isPlaying && (
                      <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-[10px] font-mono font-bold text-accent-cyan animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
                        Auto-Playing...
                      </span>
                    )}
                    <button
                      onClick={onNextStep}
                      disabled={!trace.steps || currentStepIndex >= trace.steps.length - 1}
                      className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-30 text-slate-300 border border-navy-700 transition"
                      title="Next Step"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Speed Controls */}
                    <div className="flex items-center bg-navy-900 rounded-lg p-0.5 border border-navy-700 ml-2">
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => onSpeedChange(s)}
                          className={`px-2 py-1 text-[10px] font-mono rounded ${
                            speed === s ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step Timeline Progress */}
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span>Step {currentStepIndex + 1} of {trace.steps.length}</span>
                    <input
                      type="range"
                      min={0}
                      max={trace.steps.length - 1}
                      value={currentStepIndex}
                      onChange={(e) => onSeekStep(Number(e.target.value))}
                      className="w-32 accent-accent-blue cursor-pointer"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Click <strong className="text-accent-violet">"Visualize Execution"</strong> to trace pointer updates and heap allocations in real-time.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: VARIABLE & MEMORY INSPECTOR */}
        {/* ========================================================= */}
        {!isLoading && activeTab === 'variables' && (
          <div className="space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block">
              Live Stack &amp; Heap Variable Inspection
            </span>

            {currentStep?.variables && Object.keys(currentStep.variables).length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-navy-800 bg-navy-950">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-navy-900 text-slate-400 border-b border-navy-800">
                    <tr>
                      <th className="py-2.5 px-4">Identifier</th>
                      <th className="py-2.5 px-4">Target / Value</th>
                      <th className="py-2.5 px-4">Memory Address</th>
                      <th className="py-2.5 px-4">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-slate-200">
                    {Object.entries(currentStep.variables).map(([key, val], idx) => (
                      <tr key={idx} className="hover:bg-navy-900/50">
                        <td className="py-2.5 px-4 text-accent-cyan font-bold">{key}</td>
                        <td className="py-2.5 px-4 text-slate-300 font-semibold">{String(val)}</td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {String(val).startsWith('0x') ? String(val) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-accent-violet">
                          {key.includes('info') ? 'int' : 'struct node* (NODE)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Run the Live Visual Debugger to inspect variables at the active execution step.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ERROR DEMONSTRATION */}
        {/* ========================================================= */}
        {!isLoading && activeTab === 'error_demo' && trace?.error_details && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent-rose/15 border border-accent-rose/40 text-xs font-mono space-y-3">
              <div className="flex items-center gap-2 text-accent-rose font-bold text-sm">
                <Bug className="w-5 h-5" />
                <span>{trace.error_details.title}</span>
              </div>
              <p className="text-slate-200 font-sans leading-relaxed">
                {trace.error_details.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-navy-950 rounded-lg border border-accent-rose/40">
                  <span className="text-[10px] text-accent-rose font-bold block mb-1">OFFENDING CODE:</span>
                  <code className="text-rose-300 font-bold">{trace.error_details.actual_statement}</code>
                </div>
                <div className="p-3 bg-navy-950 rounded-lg border border-accent-emerald/40">
                  <span className="text-[10px] text-accent-emerald font-bold block mb-1">RECOMMENDED REMEDY:</span>
                  <code className="text-emerald-300 font-bold">{trace.error_details.expected_statement}</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
