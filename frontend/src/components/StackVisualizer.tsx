import React, { useState, useEffect } from 'react';
import { stackApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { Layers, ArrowUp, ArrowDown, Eye, RefreshCw, Trash2 } from 'lucide-react';

export const StackVisualizer: React.FC = () => {
  const [elements, setElements] = useState<any[]>([]);
  const [top, setTop] = useState<number>(-1);
  const [capacity, setCapacity] = useState<number>(8);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Stack Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('LIFO (Last In First Out) Stack initialized.');
  const [cCode, setCCode] = useState<string>(
    'int push(ArrayStack *s, int val) {\n' +
    '    if (s->top >= MAX_STACK - 1) return -1; // Overflow\n' +
    '    s->top++;\n' +
    '    s->items[s->top] = val;\n' +
    '    return 0;\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>('#define MAX_STACK 8\ntypedef struct { int items[MAX_STACK]; int top; } ArrayStack;');
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(1)',
    time_worst: 'O(1)',
    space_auxiliary: 'O(1)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 4
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Stack module loaded with LIFO memory configuration.', type: 'info' }
  ]);

  const [pushVal, setPushVal] = useState<number>(55);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => stackApi.reset(), 'Reset Stack');
      setLogs([{ step: '00', text: 'Stack LIFO buffer reset to initial state.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-stacks', handleReset);
    return () => window.removeEventListener('dsverse-reset-stacks', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await stackApi.getState();
      setElements(res.elements || []);
      setTop(res.top);
      setCapacity(res.capacity);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Stack fetch state error:', e);
    }
  };

  const handleOp = async (action: () => Promise<any>, opName: string) => {
    setIsPlaying(false);
    try {
      const data = await action();
      if (data.steps && data.steps.length > 0) {
        setSteps(data.steps);
        setCurrentStepIndex(0);
        setCurrentOperation(data.operation || opName);
        if (data.c_code) setCCode(data.c_code);
        if (data.c_struct) setCStruct(data.c_struct);
        if (data.complexity) setComplexity(data.complexity);
        if (data.metrics) setMetrics(data.metrics);

        applyStep(data.steps[0]);

        const newLogs: LogEntry[] = data.steps.map((s: any) => ({
          step: s.step_number.toString().padStart(2, '0'),
          text: s.description,
          type: s.log_type || 'info'
        }));
        setLogs(newLogs);

        if (data.steps.length > 1) {
          setIsPlaying(true);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Stack operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.elements) {
      setElements(s.elements);
      const topEl = s.elements.findIndex((e: any) => e.is_top);
      if (topEl !== -1) setTop(topEl);
    }
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        pointer_assignments: s.pointer_assignments ?? prev.pointer_assignments,
        total_nodes: s.elements ? s.elements.filter((e: any) => e.is_occupied).length : prev.total_nodes
      }));
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      applyStep(steps[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      applyStep(steps[prevIdx]);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0) {
      const interval = 1200 / speed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            applyStep(steps[next]);
            return next;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps]);

  // Reverse elements for vertical bottom-to-top rendering
  const reversedElements = [...elements].reverse();

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-violet/15 text-accent-violet flex items-center justify-center border border-accent-violet/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">LIFO Stack Visualizer</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Top-of-Stack Tracking & Boundary Enforcement (Capacity: {capacity} Slots)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Top Index: <strong className="text-accent-blue">{top}</strong></span>
            <span className="text-slate-400">Used: <strong className="text-accent-emerald">{top + 1} / {capacity}</strong></span>
            <button
              onClick={() => handleOp(() => stackApi.reset(), 'Reset Stack')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Stack Canvas Display */}
        <div className="min-h-[280px] flex items-center justify-center p-6 bg-navy-950/60 rounded-xl border border-navy-800/80">
          <div className="flex items-center gap-8">
            {/* The Vertical Stack Container */}
            <div className="w-64 border-2 border-dashed border-slate-700 rounded-xl p-2 bg-navy-900/50 flex flex-col gap-1.5 shadow-inner">
              {reversedElements.map((el) => {
                const isTop = el.is_top;
                const isOccupied = el.is_occupied;
                const isPushing = el.is_pushing;
                const isPopping = el.is_popping;
                const isPeek = el.is_peek;

                let rowStyle = 'border-slate-800 bg-navy-950/40 text-slate-500';
                if (isPushing) rowStyle = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald font-bold scale-105';
                else if (isPopping) rowStyle = 'border-accent-rose bg-accent-rose/20 text-accent-rose font-bold scale-95 opacity-60';
                else if (isPeek) rowStyle = 'border-accent-cyan bg-accent-cyan/20 text-accent-cyan font-bold scale-105 shadow-glow-blue';
                else if (isTop) rowStyle = 'border-accent-violet bg-accent-violet/20 text-white font-bold shadow-glow-violet';
                else if (isOccupied) rowStyle = 'border-slate-700 bg-navy-800/80 text-white font-medium';

                return (
                  <div
                    key={el.index}
                    className={`h-9 px-3 rounded-lg border flex items-center justify-between text-xs font-mono transition-all duration-300 ${rowStyle}`}
                  >
                    <span className="text-[10px] text-slate-400">items[{el.index}]</span>
                    <span className="text-sm font-bold">
                      {el.value !== null && el.value !== undefined ? el.value : '—'}
                    </span>
                    <span className="text-[9px] text-slate-500">{el.address}</span>
                  </div>
                );
              })}
            </div>

            {/* Pointer & Status Indicator */}
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-navy-900 border border-navy-700 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Pointer Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-violet animate-pulse" />
                  <span className="text-white font-semibold">
                    TOP ➔ {top >= 0 ? `items[${top}] (${elements[top]?.value})` : 'NULL (Empty)'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-navy-900 border border-navy-700 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Stack State</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${top === -1 ? 'bg-accent-rose/20 text-accent-rose' : 'bg-navy-800 text-slate-400'}`}>
                    {top === -1 ? 'EMPTY' : 'NOT EMPTY'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${top >= capacity - 1 ? 'bg-accent-amber/20 text-accent-amber' : 'bg-navy-800 text-slate-400'}`}>
                    {top >= capacity - 1 ? 'FULL (OVERFLOW RISK)' : 'AVAILABLE SLOTS'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Controls */}
        <ExecutionControls
          steps={steps}
          currentStepIndex={currentStepIndex}
          currentOperation={currentOperation}
          isPlaying={isPlaying}
          speed={speed}
          onPlayToggle={() => {
            if (!isPlaying && steps.length > 0 && currentStepIndex >= steps.length - 1) {
              setCurrentStepIndex(0);
              applyStep(steps[0]);
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
          onNext={handleNext}
          onPrev={handlePrev}
          onRestart={() => {
            if (steps.length > 0) {
              setCurrentStepIndex(0);
              applyStep(steps[0]);
              setIsPlaying(true);
            }
          }}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* Grid: Controls and Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="border-b border-navy-700 pb-3">
            <h3 className="text-sm font-semibold text-white tracking-wide">Stack Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">LIFO Constant Time O(1) Primitives</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Push Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Push Element</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={pushVal}
                  onChange={(e) => setPushVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-violet"
                />
                <button
                  onClick={() => handleOp(() => stackApi.push(pushVal), `Push ${pushVal}`)}
                  className="flex-1 bg-accent-violet hover:bg-accent-violet/80 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Push
                </button>
              </div>
            </div>

            {/* Pop & Peek Operations */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOp(() => stackApi.pop(), 'Pop')}
                className="bg-accent-rose hover:bg-accent-rose/80 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <ArrowDown className="w-3.5 h-3.5" /> Pop Top
              </button>
              <button
                onClick={() => handleOp(() => stackApi.peek(), 'Peek')}
                className="bg-navy-800 hover:bg-navy-700 text-accent-cyan border border-accent-cyan/30 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Peek Top
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={() => handleOp(() => stackApi.clear(), 'Clear Stack')}
              className="w-full bg-navy-950 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-700 py-2 rounded-lg flex items-center justify-center gap-1.5 transition font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 text-accent-rose" /> Clear Stack Memory
            </button>
          </div>
        </div>

        {/* C Code Inspector & Complexity */}
        <div className="lg:col-span-7 space-y-6">
          <CodeInspector
            cCode={cCode}
            activeLine={activeCLine}
            cStruct={cStruct}
            explanation={explanation}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExecutionLog logs={logs} onClear={() => setLogs([])} />
            <ComplexityPanel
              complexity={complexity}
              metrics={metrics}
              currentOperation={currentOperation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

