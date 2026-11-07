import React, { useState, useEffect } from 'react';
import { skipListApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { FastForward, Plus, Search, Trash2, RefreshCw } from 'lucide-react';

export const SkipListVisualizer: React.FC = () => {
  const [header, setHeader] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [maxLevel, setMaxLevel] = useState<number>(4);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Skip List Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Skip List initialized with multi-level express lanes.');
  const [cCode, setCCode] = useState<string>(
    'SKIP_NODE search_skiplist(SkipList *list, int key) {\n' +
    '    SKIP_NODE curr = list->header;\n' +
    '    for (int i = list->level - 1; i >= 0; i--) {\n' +
    '        while (curr->forward[i] != NULL && curr->forward[i]->key < key) {\n' +
    '            curr = curr->forward[i]; // Move forward on express lane\n' +
    '        }\n' +
    '    }\n' +
    '    curr = curr->forward[0]; // Drop to base level 0\n' +
    '    if (curr != NULL && curr->key == key) return curr;\n' +
    '    return NULL;\n}'
  );
  const [cStruct, setCStruct] = useState<string>(
    '#define MAX_LEVEL 4\n' +
    'struct SkipNode { int key; int value; struct SkipNode* forward[MAX_LEVEL]; };\n' +
    'typedef struct { int level; struct SkipNode* header; } SkipList;'
  );
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(log n)',
    time_worst: 'O(n)',
    space_auxiliary: 'O(n)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 6
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Skip List initialized with 4 levels of probabilistic express lanes.', type: 'info' }
  ]);

  const [insertKey, setInsertKey] = useState<number>(35);
  const [insertVal, setInsertVal] = useState<number>(350);
  const [searchKey, setSearchKey] = useState<number>(40);
  const [deleteKey, setDeleteKey] = useState<number>(20);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const res = await skipListApi.getState();
      setHeader(res.header);
      setNodes(res.nodes || []);
      setMaxLevel(res.max_level || 4);
      setActiveLevel(res.active_level);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Skip List fetch state error:', e);
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
      alert(err.message || 'Skip List operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.skip_state) {
      if (s.skip_state.header) setHeader(s.skip_state.header);
      if (s.skip_state.nodes) setNodes(s.skip_state.nodes);
      setActiveLevel(s.skip_state.active_level);
    }
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        traversals: s.traversals ?? prev.traversals,
        total_nodes: s.skip_state ? s.skip_state.nodes.length : prev.total_nodes
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

  // Combine header + nodes for columns
  const allColumns = header ? [header, ...nodes] : nodes;

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 text-accent-cyan flex items-center justify-center border border-accent-cyan/30">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Skip List Visualizer (Probabilistic Indexing)</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Multi-Level Express Lanes with Expected O(log n) Search, Insertion &amp; Deletion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Max Levels: <strong className="text-accent-cyan">{maxLevel}</strong></span>
            <span className="text-slate-400">Total Nodes: <strong className="text-accent-blue">{nodes.length}</strong></span>
            <button
              onClick={() => handleOp(() => skipListApi.reset(), 'Reset Skip List')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Multi-Level Skip List Grid Canvas */}
        <div className="min-h-[260px] p-6 bg-navy-950/60 rounded-xl border border-navy-800/80 overflow-x-auto custom-scrollbar flex flex-col justify-center">
          <div className="space-y-3 min-w-[700px]">
            {/* Render Each Level as an Express Track (From Level 3 down to Level 0) */}
            {[3, 2, 1, 0].map((lvl) => {
              const isLevelActive = activeLevel === lvl;
              return (
                <div
                  key={lvl}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all duration-300 ${
                    isLevelActive
                      ? 'bg-accent-cyan/10 border-accent-cyan/40 shadow-sm'
                      : 'bg-navy-900/40 border-navy-800/60'
                  }`}
                >
                  {/* Level Lane Badge */}
                  <div className="w-20 flex-shrink-0 font-mono text-xs font-bold flex items-center justify-between px-2 py-1 rounded bg-navy-950 border border-navy-700">
                    <span className={isLevelActive ? 'text-accent-cyan' : 'text-slate-400'}>Level {lvl}</span>
                    {lvl > 0 && <span className="text-[9px] text-accent-violet">EXP</span>}
                  </div>

                  {/* Nodes on this Level */}
                  <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                    {allColumns.map((col, cIdx) => {
                      const participates = col.is_header || col.level > lvl;
                      const isNodeActive = col.is_active;

                      if (!participates) {
                        return (
                          <div key={col.id} className="w-16 h-8 flex items-center justify-center opacity-20">
                            <span className="text-slate-700 font-mono text-xs">───</span>
                          </div>
                        );
                      }

                      let pillStyle = 'border-slate-700 bg-navy-800 text-slate-300';
                      if (isNodeActive && isLevelActive) {
                        pillStyle = 'border-accent-cyan bg-accent-cyan/25 text-white font-bold shadow-glow-blue scale-105';
                      } else if (isNodeActive) {
                        pillStyle = 'border-accent-blue bg-accent-blue/20 text-white font-bold';
                      }

                      return (
                        <React.Fragment key={col.id}>
                          <div className={`w-16 h-8 rounded-lg border flex items-center justify-center font-mono text-xs transition-all duration-300 ${pillStyle}`}>
                            {col.is_header ? (
                              <span className="text-[10px] text-accent-blue font-bold">HEAD</span>
                            ) : (
                              <span>{col.key}</span>
                            )}
                          </div>

                          {cIdx < allColumns.length - 1 && (
                            <div className="text-accent-cyan font-bold text-xs opacity-75">➔</div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    <div className="text-slate-600 font-mono text-xs italic ml-2">➔ NULL</div>
                  </div>
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Skip List Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">Probabilistic Promotion &amp; Express Lane Search</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Insert Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Insert (Coin-Toss Level Promotion)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={insertKey}
                  onChange={(e) => setInsertKey(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={insertVal}
                  onChange={(e) => setInsertVal(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-cyan"
                />
                <button
                  onClick={() => handleOp(() => skipListApi.insert(insertKey, insertVal), `Insert Key ${insertKey}`)}
                  className="flex-1 bg-accent-cyan hover:bg-accent-cyan/80 text-navy-950 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>

            {/* Search Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Express Lane Search</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={searchKey}
                  onChange={(e) => setSearchKey(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => skipListApi.search(searchKey), `Search Key ${searchKey}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-blue border border-accent-blue/30 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" /> Express Search
                </button>
              </div>
            </div>

            {/* Delete Operation */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Delete Key Across Levels</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={deleteKey}
                  onChange={(e) => setDeleteKey(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-rose"
                />
                <button
                  onClick={() => handleOp(() => skipListApi.delete(deleteKey), `Delete Key ${deleteKey}`)}
                  className="flex-1 bg-accent-rose hover:bg-accent-rose/80 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
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

