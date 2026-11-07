import React, { useState, useEffect } from 'react';
import { circularLinkedListApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { Repeat, Plus, Trash2, RefreshCw, Compass } from 'lucide-react';

export const CircularLinkedListVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [headId, setHeadId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Circular List Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Circular Linked List initialized (tail links back to head).');
  const [cCode, setCCode] = useState<string>(
    'CNODE insert_beginning(CNODE head, int val) {\n' +
    '    CNODE temp = (CNODE)malloc(sizeof(struct CNode));\n' +
    '    temp->data = val;\n' +
    '    if (head == NULL) { temp->next = temp; return temp; }\n' +
    '    CNODE curr = head;\n' +
    '    while (curr->next != head) curr = curr->next;\n' +
    '    curr->next = temp;\n' +
    '    temp->next = head;\n' +
    '    return temp;\n}'
  );
  const [cStruct, setCStruct] = useState<string>(
    'struct CNode {\n    int data;\n    struct CNode* next;\n};\ntypedef struct CNode* CNODE;'
  );
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
    total_nodes: 4
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Circular Linked List initialized with closed pointer cycle.', type: 'info' }
  ]);

  const [inputVal, setInputVal] = useState<number>(65);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const res = await circularLinkedListApi.getState();
      setNodes(res.nodes || []);
      setHeadId(res.head_id);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('CLL fetch state error:', e);
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
      alert(err.message || 'Circular Linked List operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.nodes) setNodes(s.nodes);
    if (s.head_id !== undefined) setHeadId(s.head_id);
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined || s.pointer_assignments !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        traversals: s.pointers_traversed ?? prev.traversals,
        pointer_assignments: s.pointer_assignments ?? prev.pointer_assignments,
        total_nodes: s.nodes ? s.nodes.length : prev.total_nodes
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
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Circular Linked List Visualizer</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Closed Loop Topology: <code>tail-&gt;next == head</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Nodes: <strong className="text-accent-blue">{nodes.length}</strong></span>
            <button
              onClick={() => handleOp(() => circularLinkedListApi.reset(), 'Reset Circular List')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Circular Canvas Display */}
        <div className="min-h-[220px] flex flex-col items-center justify-center p-6 bg-navy-950/60 rounded-xl border border-navy-800/80 relative overflow-hidden">
          {/* Node Chain */}
          <div className="flex items-center gap-3 z-10">
            {nodes.map((node, idx) => {
              const isHead = node.id === headId || node.is_head || idx === 0;
              const isTail = idx === nodes.length - 1;
              const isActive = node.is_active;
              const isSlow = node.is_slow;
              const isFast = node.is_fast;

              let nodeClass = 'border-slate-700 bg-navy-800/90 text-white';
              if (isActive) nodeClass = 'border-accent-blue bg-accent-blue/20 text-white shadow-glow-blue scale-105';
              else if (isSlow && isFast) nodeClass = 'border-accent-rose bg-accent-rose/25 text-white font-bold scale-110 shadow-glow-rose';
              else if (isSlow) nodeClass = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald font-bold scale-105';
              else if (isFast) nodeClass = 'border-accent-amber bg-accent-amber/20 text-accent-amber font-bold scale-105';

              return (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center">
                    {/* Tortoise & Hare / Pointer Tags */}
                    <div className="h-6 flex items-center gap-1 text-[9px] font-mono font-bold">
                      {isSlow && <span className="bg-accent-emerald/20 text-accent-emerald px-1.5 py-0.5 rounded">🐢 SLOW</span>}
                      {isFast && <span className="bg-accent-amber/20 text-accent-amber px-1.5 py-0.5 rounded">🐇 FAST</span>}
                      {!isSlow && !isFast && isHead && <span className="bg-accent-blue/20 text-accent-blue px-1.5 py-0.5 rounded">HEAD</span>}
                      {!isSlow && !isFast && isTail && <span className="bg-accent-violet/20 text-accent-violet px-1.5 py-0.5 rounded">TAIL</span>}
                    </div>

                    {/* Node Container */}
                    <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-between p-2 transition-all duration-300 shadow-md ${nodeClass}`}>
                      <span className="text-[9px] font-mono text-slate-400">Node</span>
                      <span className="text-xl font-bold font-mono">{node.value}</span>
                      <span className="text-[8px] font-mono text-slate-400 truncate max-w-[60px]">{node.id}</span>
                    </div>
                  </div>

                  {/* Standard forward arrow between nodes */}
                  {idx < nodes.length - 1 && (
                    <div className="text-accent-blue font-mono font-bold text-lg">➔</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Curved Circular Return Path (Tail back to Head) */}
          {nodes.length > 0 && (
            <div className="w-full max-w-lg mt-4 px-4 py-2 rounded-xl bg-navy-900/80 border border-accent-violet/40 flex items-center justify-between text-xs font-mono text-accent-violet shadow-sm">
              <span className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-accent-violet animate-spin" style={{ animationDuration: '8s' }} />
                <span>Tail Node({nodes[nodes.length - 1]?.value}).next</span>
              </span>
              <span className="font-bold text-accent-blue flex items-center gap-1.5">
                ────── Loopback ➔ Head Node({nodes[0]?.value})
              </span>
            </div>
          )}
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Circular Linked List Controls</h3>
            <p className="text-[11px] font-mono text-slate-400">Closed Loop Invariant &amp; Cycle Verification</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Value Input */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Node Data Value</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={inputVal}
                  onChange={(e) => setInputVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-violet"
                />
                <button
                  onClick={() => handleOp(() => circularLinkedListApi.insertBeginning(inputVal), `Insert Head ${inputVal}`)}
                  className="flex-1 bg-accent-violet hover:bg-accent-violet/80 text-white font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> At Head
                </button>
                <button
                  onClick={() => handleOp(() => circularLinkedListApi.insertEnd(inputVal), `Insert Tail ${inputVal}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-violet border border-accent-violet/30 font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> At Tail
                </button>
              </div>
            </div>

            {/* Delete Head */}
            <button
              onClick={() => handleOp(() => circularLinkedListApi.deleteBeginning(), 'Delete Beginning')}
              className="w-full bg-accent-rose hover:bg-accent-rose/80 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Head Node
            </button>

            {/* Floyd's Cycle Detection */}
            <button
              onClick={() => handleOp(() => circularLinkedListApi.detectCycle(), "Floyd's Cycle Detection")}
              className="w-full bg-gradient-to-r from-accent-emerald/20 to-accent-cyan/20 hover:from-accent-emerald/30 hover:to-accent-cyan/30 text-accent-emerald border border-accent-emerald/40 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition shadow-sm"
            >
              <Compass className="w-4 h-4 text-accent-emerald animate-pulse" /> Run Floyd's Cycle Detection (Tortoise &amp; Hare)
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

