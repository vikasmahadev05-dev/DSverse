import React, { useState, useEffect } from 'react';
import { heapApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { MountainSnow, Plus, RefreshCw, ArrowLeftRight } from 'lucide-react';

export const HeapVisualizer: React.FC = () => {
  const [heapNodes, setHeapNodes] = useState<any[]>([]);
  const [heapArray, setHeapArray] = useState<any[]>([]);
  const [isMinHeap, setIsMinHeap] = useState<boolean>(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Binary Heap Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Binary Min-Heap initialized.');
  const [cCode, setCCode] = useState<string>(
    'void insert_heap(BinaryHeap *h, int val) {\n' +
    '    if (h->size >= MAX_HEAP_SIZE) return;\n' +
    '    int i = h->size;\n' +
    '    h->data[i] = val;\n' +
    '    h->size++;\n' +
    '    while (i != 0 && h->data[(i - 1) / 2] > h->data[i]) {\n' +
    '        int temp = h->data[i];\n' +
    '        h->data[i] = h->data[(i - 1) / 2];\n' +
    '        h->data[(i - 1) / 2] = temp;\n' +
    '        i = (i - 1) / 2; // Bubble up\n' +
    '    }\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>(
    '#define MAX_HEAP_SIZE 15\n' +
    'typedef struct { int data[MAX_HEAP_SIZE]; int size; int is_min_heap; } BinaryHeap;'
  );
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(log n)',
    time_worst: 'O(log n)',
    space_auxiliary: 'O(1)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 5
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Binary Heap dual-view initialized with complete binary tree structure.', type: 'info' }
  ]);

  const [insertVal, setInsertVal] = useState<number>(5);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      loadState();
      setLogs([{ step: '00', text: 'Binary Heap reset to initial state.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-heaps', handleReset);
    return () => window.removeEventListener('dsverse-reset-heaps', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await heapApi.getState();
      setHeapNodes(res.nodes || []);
      setHeapArray(res.array || []);
      setIsMinHeap(res.is_min_heap);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Heap state fetch error:', e);
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
      alert(err.message || 'Heap operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.heap_state) {
      if (s.heap_state.nodes) setHeapNodes(s.heap_state.nodes);
      if (s.heap_state.array) setHeapArray(s.heap_state.array);
    }
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        pointer_assignments: s.pointer_assignments ?? prev.pointer_assignments,
        total_nodes: s.heap_state ? s.heap_state.size : prev.total_nodes
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

  // Generate tree branch lines
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  heapNodes.forEach((n) => {
    if (n.left_index !== null && n.left_index < heapNodes.length) {
      const child = heapNodes[n.left_index];
      edges.push({ x1: n.x, y1: n.y, x2: child.x, y2: child.y });
    }
    if (n.right_index !== null && n.right_index < heapNodes.length) {
      const child = heapNodes[n.right_index];
      edges.push({ x1: n.x, y1: n.y, x2: child.x, y2: child.y });
    }
  });

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-amber/15 text-accent-amber flex items-center justify-center border border-accent-amber/30">
              <MountainSnow className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Binary Heap Dual Visualizer ({isMinHeap ? 'Min-Heap' : 'Max-Heap'})
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Synchronized Complete Binary Tree &amp; Contiguous Array Representation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={async () => {
                await heapApi.toggleMode();
                await loadState();
              }}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-accent-violet border border-accent-violet/30 rounded flex items-center gap-1.5 transition font-semibold"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Toggle to {isMinHeap ? 'Max-Heap' : 'Min-Heap'}
            </button>
            <button
              onClick={loadState}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Tree SVG Canvas */}
        <div className="w-full h-[240px] bg-navy-950/80 rounded-xl border border-navy-800/80 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid meet">
            {edges.map((e, idx) => (
              <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#334155" strokeWidth="2" />
            ))}
            {heapNodes.map((node) => {
              const isActive = node.is_active;
              const isComparing = node.is_comparing;
              let fill = '#0F172A';
              let stroke = '#475569';
              if (isActive) { fill = '#1E1B4B'; stroke = '#38BDF8'; }
              else if (isComparing) { fill = '#311042'; stroke = '#F59E0B'; }

              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="20" fill={fill} stroke={stroke} strokeWidth="2" />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.value}
                  </text>
                  <text
                    x={node.x}
                    y={node.y - 24}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    [{node.index}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Underlying Array View */}
        <div className="p-4 bg-navy-950/70 rounded-xl border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Underlying Array: <code>parent = (i-1)/2 | left = 2*i+1 | right = 2*i+2</code></span>
            <span>Capacity: 15</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {heapArray.map((el) => (
              <div
                key={el.index}
                className={`min-w-[50px] h-14 rounded-lg border-2 flex flex-col items-center justify-between p-1 font-mono transition-all duration-300 ${
                  el.is_active
                    ? 'border-accent-blue bg-accent-blue/20 text-white font-bold'
                    : 'border-navy-700 bg-navy-900 text-slate-300'
                }`}
              >
                <span className="text-[9px] text-slate-500">[{el.index}]</span>
                <span className="text-sm font-bold">{el.value}</span>
              </div>
            ))}
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Heap Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">Complete Binary Tree Invariant</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Insert Element */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Insert Element (Bubble-Up)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={insertVal}
                  onChange={(e) => setInsertVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-amber"
                />
                <button
                  onClick={() => handleOp(() => heapApi.insert(insertVal), `Insert ${insertVal}`)}
                  className="flex-1 bg-accent-amber hover:bg-accent-amber/80 text-navy-950 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>
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

