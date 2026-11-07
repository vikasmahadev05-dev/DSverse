import React, { useState, useEffect } from 'react';
import { hashTableApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { Hash, Plus, Search, RefreshCw, ArrowRight, Layers } from 'lucide-react';

export const HashTableVisualizer: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [tableSize, setTableSize] = useState<number>(7);
  const [mode, setMode] = useState<string>('linear_probing');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Hash Table Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Hash Table with modulo hash function h(k) = k % 7 initialized.');
  const [cCode, setCCode] = useState<string>(
    'int insert_linear_probe(OpenAddrSlot table[], int key, int val) {\n' +
    '    int hash = key % TABLE_SIZE;\n' +
    '    for (int i = 0; i < TABLE_SIZE; i++) {\n' +
    '        int idx = (hash + i) % TABLE_SIZE;\n' +
    '        if (!table[idx].is_occupied || table[idx].is_occupied == -1) {\n' +
    '            table[idx].key = key; table[idx].value = val;\n' +
    '            table[idx].is_occupied = 1;\n' +
    '            return idx;\n' +
    '        }\n' +
    '    }\n' +
    '    return -1;\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>(
    '#define TABLE_SIZE 7\ntypedef struct { int key; int value; int is_occupied; } OpenAddrSlot;'
  );
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(1)',
    time_worst: 'O(n)',
    space_auxiliary: 'O(n)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 7
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Hash Table initialized with size 7 and hash function h(k) = k % 7.', type: 'info' }
  ]);

  const [insertKey, setInsertKey] = useState<number>(29);
  const [insertVal, setInsertVal] = useState<number>(500);
  const [searchKey, setSearchKey] = useState<number>(22);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => hashTableApi.reset(), 'Reset Table');
      setLogs([{ step: '00', text: 'Hash Table buckets reset.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-hash-tables', handleReset);
    return () => window.removeEventListener('dsverse-reset-hash-tables', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await hashTableApi.getState();
      setSlots(res.slots || []);
      setTableSize(res.table_size || 7);
      setMode(res.mode || 'linear_probing');
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Hash table fetch state error:', e);
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
      alert(err.message || 'Hash table operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.hash_state && s.hash_state.slots) {
      setSlots(s.hash_state.slots);
      if (s.hash_state.mode) setMode(s.hash_state.mode);
    }
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        traversals: s.traversals ?? prev.traversals
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
            <div className="w-8 h-8 rounded-lg bg-accent-violet/15 text-accent-violet flex items-center justify-center border border-accent-violet/30">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Hash Table Visualizer ({mode === 'chaining' ? 'Separate Chaining' : 'Linear Probing'})
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Primary Hash: <code>h(k) = k % {tableSize}</code> | Capacity: {tableSize} Buckets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Mode Selector */}
            <div className="flex bg-navy-950 p-0.5 rounded-lg border border-navy-800">
              <button
                onClick={async () => {
                  await hashTableApi.setMode('linear_probing');
                  await loadState();
                }}
                className={`px-2.5 py-1 rounded text-xs transition ${mode === 'linear_probing' ? 'bg-navy-800 text-white font-bold' : 'text-slate-400'}`}
              >
                Linear Probing
              </button>
              <button
                onClick={async () => {
                  await hashTableApi.setMode('chaining');
                  await loadState();
                }}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${mode === 'chaining' ? 'bg-navy-800 text-white font-bold' : 'text-slate-400'}`}
              >
                <Layers className="w-3 h-3" /> Chaining
              </button>
            </div>

            <button
              onClick={() => handleOp(() => hashTableApi.reset(), 'Reset Table')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Hash Table Canvas View */}
        <div className="min-h-[220px] flex flex-col items-center justify-center p-6 bg-navy-950/60 rounded-xl border border-navy-800/80 overflow-x-auto custom-scrollbar">
          <div className="space-y-3 w-full max-w-2xl">
            {slots.map((slot) => {
              const isActive = slot.is_active;
              const isProbed = slot.is_probed;
              const isCollision = slot.is_collision;
              const isOccupied = slot.state === 'occupied';

              let slotClass = 'border-slate-800 bg-navy-900/60 text-slate-400';
              if (isActive) slotClass = 'border-accent-blue bg-accent-blue/15 text-white shadow-glow-blue';
              else if (isCollision) slotClass = 'border-accent-rose bg-accent-rose/15 text-accent-rose';
              else if (isProbed) slotClass = 'border-accent-amber bg-accent-amber/15 text-accent-amber';
              else if (isOccupied) slotClass = 'border-slate-700 bg-navy-800/90 text-white';

              return (
                <div key={slot.index} className="flex items-center gap-3">
                  {/* Bucket Index Indicator */}
                  <div className="w-16 text-right font-mono text-xs font-bold text-slate-400">
                    Bucket [{slot.index}]
                  </div>

                  {/* Primary Slot Card */}
                  <div className={`flex-1 h-11 px-4 rounded-xl border-2 flex items-center justify-between font-mono text-xs transition-all duration-300 ${slotClass}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">h(k)={slot.index}</span>
                      {mode === 'linear_probing' && isOccupied ? (
                        <span className="font-bold text-white">
                          Key: <strong className="text-accent-blue">{slot.key}</strong> (Val: {slot.value})
                        </span>
                      ) : mode === 'linear_probing' ? (
                        <span className="text-slate-600 italic">Empty Slot</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Chain Head Pointer</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCollision && <span className="text-[10px] bg-accent-rose/20 text-accent-rose px-2 py-0.5 rounded font-bold">COLLISION</span>}
                      {isActive && <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded font-bold">ACTIVE</span>}
                    </div>
                  </div>

                  {/* If Separate Chaining: Draw chain of nodes */}
                  {mode === 'chaining' && slot.chain && slot.chain.length > 0 && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {slot.chain.map((cNode: any, cIdx: number) => (
                        <React.Fragment key={cIdx}>
                          <ArrowRight className="w-4 h-4 text-slate-500" />
                          <div className="px-3 py-1.5 bg-navy-800 border border-accent-violet/40 rounded-lg text-white font-bold flex items-center gap-1.5 shadow-sm">
                            <span className="text-accent-blue">{cNode.key}</span>
                            <span className="text-[10px] text-slate-400">({cNode.value})</span>
                          </div>
                        </React.Fragment>
                      ))}
                      <span className="text-slate-600 font-bold ml-1">NULL</span>
                    </div>
                  )}
                  {mode === 'chaining' && (!slot.chain || slot.chain.length === 0) && (
                    <span className="text-slate-600 font-mono text-xs italic">➔ NULL</span>
                  )}
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

      {/* Grid: Controls and Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="border-b border-navy-700 pb-3">
            <h3 className="text-sm font-semibold text-white tracking-wide">Hash Table Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">Direct Addressing &amp; Collision Handling</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Insert Key-Value */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Insert Key-Value Pair</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={insertKey}
                  onChange={(e) => setInsertKey(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-violet"
                />
                <input
                  type="number"
                  placeholder="Val"
                  value={insertVal}
                  onChange={(e) => setInsertVal(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-violet"
                />
                <button
                  onClick={() => handleOp(() => hashTableApi.insert(insertKey, insertVal), `Insert Key ${insertKey}`)}
                  className="flex-1 bg-accent-violet hover:bg-accent-violet/80 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>

            {/* Search Key */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Search by Key</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={searchKey}
                  onChange={(e) => setSearchKey(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => hashTableApi.search(searchKey), `Search Key ${searchKey}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-emerald border border-accent-emerald/30 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" /> Search
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
