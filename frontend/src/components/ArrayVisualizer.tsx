import React, { useState, useEffect } from 'react';
import { arrayApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { Rows3, Plus, Trash2, Search, Edit3, RotateCcw, RefreshCw } from 'lucide-react';

export const ArrayVisualizer: React.FC = () => {
  const [cells, setCells] = useState<any[]>([]);
  const [size, setSize] = useState<number>(5);
  const [capacity, setCapacity] = useState<number>(10);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Array Initialized');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Static contiguous memory array ready.');
  const [cCode, setCCode] = useState<string>(
    'int insert_at(int arr[], int *size, int capacity, int index, int value) {\n' +
    '    if (*size >= capacity) return -1; // Overflow\n' +
    '    if (index < 0 || index > *size) return -2;\n' +
    '    for (int i = *size - 1; i >= index; i--) {\n' +
    '        arr[i + 1] = arr[i]; // Shift right\n' +
    '    }\n' +
    '    arr[index] = value;\n' +
    '    (*size)++;\n' +
    '    return 0;\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>('#define MAX_CAPACITY 10\ntypedef struct { int data[MAX_CAPACITY]; int size; int capacity; } Array;');
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(n)',
    time_worst: 'O(n)',
    space_auxiliary: 'O(1)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 5
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Array module initialized with contiguous memory buffer.', type: 'info' }
  ]);

  // Form Inputs
  const [insertIdx, setInsertIdx] = useState<number>(2);
  const [insertVal, setInsertVal] = useState<number>(50);
  const [deleteIdx, setDeleteIdx] = useState<number>(0);
  const [updateIdx, setUpdateIdx] = useState<number>(1);
  const [updateVal, setUpdateVal] = useState<number>(99);
  const [searchTarget, setSearchTarget] = useState<number>(47);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => arrayApi.reset(), 'Reset Array');
      setLogs([{ step: '00', text: 'Array memory reset to initial state.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-arrays', handleReset);
    return () => window.removeEventListener('dsverse-reset-arrays', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await arrayApi.getState();
      setCells(res.cells || []);
      setSize(res.size);
      setCapacity(res.capacity);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Array state fetch error:', e);
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
      alert(err.message || 'Operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.cells) setCells(s.cells);
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined || s.shifts !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        traversals: s.shifts ?? prev.traversals,
        pointer_assignments: s.shifts ?? prev.pointer_assignments
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
      {/* Visualizer Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center border border-accent-blue/30">
              <Rows3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Array Visualizer Canvas</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Contiguous Physical Memory Layout (Base Address: 0x2000, 4 Bytes / Integer)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Size: <strong className="text-accent-blue">{size}</strong></span>
            <span className="text-slate-400">Capacity: <strong className="text-accent-violet">{capacity}</strong></span>
            <button
              onClick={() => handleOp(() => arrayApi.reset(), 'Reset Array')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Array Cells Display */}
        <div className="min-h-[160px] flex items-center justify-center overflow-x-auto custom-scrollbar p-6 bg-navy-950/60 rounded-xl border border-navy-800/80">
          <div className="flex items-center gap-3">
            {cells.map((cell) => {
              const isOccupied = cell.is_occupied;
              const isActive = cell.is_active;
              const isShifting = cell.is_shifting;
              const isComparing = cell.is_comparing;
              const isInserted = cell.is_inserted;

              let borderClass = 'border-navy-700 bg-navy-900/60 text-slate-400';
              if (isActive) borderClass = 'border-accent-blue bg-accent-blue/15 text-white shadow-glow-blue scale-105';
              else if (isShifting) borderClass = 'border-accent-amber bg-accent-amber/15 text-accent-amber scale-105';
              else if (isComparing) borderClass = 'border-accent-violet bg-accent-violet/15 text-white scale-105';
              else if (isInserted) borderClass = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald scale-105';
              else if (isOccupied) borderClass = 'border-slate-700 bg-navy-800/80 text-white';

              return (
                <div key={cell.index} className="flex flex-col items-center">
                  {/* Pointer Label */}
                  <div className="h-5 mb-1 text-[10px] font-mono font-bold text-accent-cyan tracking-wider">
                    {cell.pointer_label || (cell.index === size - 1 ? 'LAST' : '')}
                  </div>

                  {/* Cell Box */}
                  <div className={`w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-between p-2 transition-all duration-300 ${borderClass}`}>
                    <span className="text-[10px] font-mono text-slate-400">arr[{cell.index}]</span>
                    <span className="text-lg font-bold font-mono">
                      {cell.value !== null && cell.value !== undefined ? cell.value : '—'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 tracking-tighter">{cell.address}</span>
                  </div>

                  {/* Index badge */}
                  <span className="text-[10px] font-mono text-slate-400 mt-2">Idx {cell.index}</span>
                </div>
              );
            })}
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

      {/* Grid: Controls and C Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="border-b border-navy-700 pb-3">
            <h3 className="text-sm font-semibold text-white tracking-wide">Array Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">Contiguous Buffer Manipulation</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Insert Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Insert Element</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Index"
                  value={insertIdx}
                  onChange={(e) => setInsertIdx(parseInt(e.target.value) || 0)}
                  className="w-20 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={insertVal}
                  onChange={(e) => setInsertVal(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => arrayApi.insert(insertIdx, insertVal), `Insert ${insertVal} at [${insertIdx}]`)}
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>

            {/* Delete Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Delete at Index</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Index"
                  value={deleteIdx}
                  onChange={(e) => setDeleteIdx(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => arrayApi.delete(deleteIdx), `Delete at [${deleteIdx}]`)}
                  className="flex-1 bg-accent-rose hover:bg-accent-rose/80 text-white font-semibold py-1.5 px-3 rounded flex items-center justify-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Update Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Update Element (O(1) Access)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Index"
                  value={updateIdx}
                  onChange={(e) => setUpdateIdx(parseInt(e.target.value) || 0)}
                  className="w-20 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <input
                  type="number"
                  placeholder="New Val"
                  value={updateVal}
                  onChange={(e) => setUpdateVal(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => arrayApi.update(updateIdx, updateVal), `Update [${updateIdx}] = ${updateVal}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-cyan border border-accent-cyan/30 py-1.5 px-3 rounded flex items-center justify-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Update
                </button>
              </div>
            </div>

            {/* Search Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Linear Search</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Target key"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(parseInt(e.target.value) || 0)}
                  className="w-36 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => arrayApi.search(searchTarget), `Search ${searchTarget}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-emerald border border-accent-emerald/30 py-1.5 px-3 rounded flex items-center justify-center gap-1 transition"
                >
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
              </div>
            </div>

            {/* In-Place Reversal */}
            <button
              onClick={() => handleOp(() => arrayApi.reverse(), 'Reverse Array In-Place')}
              className="w-full bg-gradient-to-r from-accent-indigo/20 to-accent-violet/20 hover:from-accent-indigo/30 hover:to-accent-violet/30 text-accent-violet border border-accent-violet/40 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" /> Reverse Array In-Place (Two Pointers)
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

