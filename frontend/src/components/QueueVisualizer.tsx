import React, { useState, useEffect } from 'react';
import { queueApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { ListOrdered, ArrowRightToLine, ArrowLeftFromLine, Eye, RefreshCw, Trash2, Repeat } from 'lucide-react';

export const QueueVisualizer: React.FC = () => {
  const [cells, setCells] = useState<any[]>([]);
  const [front, setFront] = useState<number>(-1);
  const [rear, setRear] = useState<number>(-1);
  const [count, setCount] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(8);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Queue Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('FIFO (First In First Out) Circular Queue initialized.');
  const [cCode, setCCode] = useState<string>(
    'int enqueue(CircularQueue *q, int value) {\n' +
    '    if (q->count == MAX_QUEUE) return -1;\n' +
    '    if (q->front == -1) q->front = 0;\n' +
    '    q->rear = (q->rear + 1) % MAX_QUEUE;\n' +
    '    q->items[q->rear] = value;\n' +
    '    q->count++;\n' +
    '    return 0;\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>(
    '#define MAX_QUEUE 8\n' +
    'typedef struct { int items[MAX_QUEUE]; int front; int rear; int count; } CircularQueue;'
  );
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
    { step: '00', text: 'Circular Queue module loaded with modulo arithmetic pointer tracking.', type: 'info' }
  ]);

  const [enqueueVal, setEnqueueVal] = useState<number>(77);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => queueApi.reset(), 'Reset Queue');
      setLogs([{ step: '00', text: 'Queue buffer reset to initial state.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-queues', handleReset);
    return () => window.removeEventListener('dsverse-reset-queues', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await queueApi.getState();
      setCells(res.cells || []);
      setFront(res.front);
      setRear(res.rear);
      setCount(res.count);
      setCapacity(res.capacity);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Queue state fetch error:', e);
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
      alert(err.message || 'Queue operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.cells) {
      setCells(s.cells);
      const fIdx = s.cells.findIndex((c: any) => c.is_front);
      const rIdx = s.cells.findIndex((c: any) => c.is_rear);
      setFront(fIdx);
      setRear(rIdx);
    }
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        pointer_assignments: s.pointer_assignments ?? prev.pointer_assignments,
        total_nodes: s.cells ? s.cells.filter((c: any) => c.is_occupied).length : prev.total_nodes
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

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/15 text-accent-emerald flex items-center justify-center border border-accent-emerald/30">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Circular FIFO Queue Visualizer</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Modulo Arithmetic Wrap-around (rear = (rear + 1) % MAX, Capacity: {capacity})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Front: <strong className="text-accent-blue">{front}</strong></span>
            <span className="text-slate-400">Rear: <strong className="text-accent-emerald">{rear}</strong></span>
            <span className="text-slate-400">Count: <strong className="text-accent-violet">{count} / {capacity}</strong></span>
            <button
              onClick={() => handleOp(() => queueApi.reset(), 'Reset Queue')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Horizontal Queue Canvas */}
        <div className="min-h-[180px] flex items-center justify-center overflow-x-auto custom-scrollbar p-6 bg-navy-950/60 rounded-xl border border-navy-800/80">
          <div className="flex items-center gap-3">
            {cells.map((cell) => {
              const isFront = cell.is_front;
              const isRear = cell.is_rear;
              const isEnqueuing = cell.is_enqueuing;
              const isDequeuing = cell.is_dequeuing;
              const isActive = cell.is_active;
              const isOccupied = cell.is_occupied;

              let borderClass = 'border-navy-700 bg-navy-900/60 text-slate-500';
              if (isEnqueuing) borderClass = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald font-bold scale-105';
              else if (isDequeuing) borderClass = 'border-accent-rose bg-accent-rose/20 text-accent-rose font-bold scale-95 opacity-60';
              else if (isActive) borderClass = 'border-accent-blue bg-accent-blue/20 text-white font-bold shadow-glow-blue scale-105';
              else if (isFront && isRear) borderClass = 'border-accent-violet bg-accent-violet/20 text-white font-bold shadow-glow-violet';
              else if (isFront) borderClass = 'border-accent-blue bg-accent-blue/15 text-white font-bold';
              else if (isRear) borderClass = 'border-accent-emerald bg-accent-emerald/15 text-white font-bold';
              else if (isOccupied) borderClass = 'border-slate-700 bg-navy-800/80 text-white';

              return (
                <div key={cell.index} className="flex flex-col items-center">
                  {/* Pointer Labels Header */}
                  <div className="h-6 flex items-center justify-center gap-1 text-[10px] font-mono font-bold">
                    {isFront && <span className="text-accent-blue px-1.5 py-0.5 rounded bg-accent-blue/20">FRONT</span>}
                    {isRear && <span className="text-accent-emerald px-1.5 py-0.5 rounded bg-accent-emerald/20">REAR</span>}
                  </div>

                  {/* Cell Box */}
                  <div className={`w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-between p-2 transition-all duration-300 ${borderClass}`}>
                    <span className="text-[10px] font-mono text-slate-400">q[{cell.index}]</span>
                    <span className="text-lg font-bold font-mono">
                      {cell.value !== null && cell.value !== undefined ? cell.value : '—'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{cell.address}</span>
                  </div>

                  {/* Index badge */}
                  <span className="text-[10px] font-mono text-slate-400 mt-2">Idx {cell.index}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circular Pointer Wraparound Diagram */}
        <div className="flex items-center justify-between px-4 py-2 bg-navy-950/40 rounded-lg border border-navy-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-accent-blue animate-spin" style={{ animationDuration: '6s' }} />
            <span>Wrap-around arithmetic: Index advances modulo 8: <code>(index + 1) % 8</code></span>
          </div>
          <span className="text-slate-300">
            Enqueue at <strong>REAR</strong> | Dequeue from <strong>FRONT</strong>
          </span>
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Queue Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">FIFO Constant Time O(1) Primitives</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Enqueue */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Enqueue Element (at Rear)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={enqueueVal}
                  onChange={(e) => setEnqueueVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-emerald"
                />
                <button
                  onClick={() => handleOp(() => queueApi.enqueue(enqueueVal), `Enqueue ${enqueueVal}`)}
                  className="flex-1 bg-accent-emerald hover:bg-accent-emerald/80 text-navy-950 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowRightToLine className="w-3.5 h-3.5" /> Enqueue
                </button>
              </div>
            </div>

            {/* Dequeue & Peek */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOp(() => queueApi.dequeue(), 'Dequeue')}
                className="bg-accent-rose hover:bg-accent-rose/80 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeftFromLine className="w-3.5 h-3.5" /> Dequeue Front
              </button>
              <button
                onClick={() => handleOp(() => queueApi.peek(), 'Peek Front')}
                className="bg-navy-800 hover:bg-navy-700 text-accent-cyan border border-accent-cyan/30 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Peek Front
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={() => handleOp(() => queueApi.clear(), 'Clear Queue')}
              className="w-full bg-navy-950 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-700 py-2 rounded-lg flex items-center justify-center gap-1.5 transition font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 text-accent-rose" /> Clear Queue Memory
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

