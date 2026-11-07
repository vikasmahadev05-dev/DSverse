import React, { useState, useEffect } from 'react';
import { doublyLinkedListApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { ArrowLeftRight, Plus, Trash2, RotateCcw, RefreshCw } from 'lucide-react';

export const DoublyLinkedListVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [headId, setHeadId] = useState<string | null>(null);
  const [tailId, setTailId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Doubly Linked List Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Doubly Linked List with prev and next pointers initialized.');
  const [cCode, setCCode] = useState<string>(
    'DNODE insert_beginning(DNODE start, int info)\n{\n' +
    '    DNODE temp = (DNODE)malloc(sizeof(struct DNode));\n' +
    '    temp->data = info;\n' +
    '    temp->prev = NULL;\n' +
    '    temp->next = start;\n' +
    '    if (start != NULL) start->prev = temp;\n' +
    '    start = temp;\n' +
    '    return start;\n}'
  );
  const [cStruct, setCStruct] = useState<string>(
    'struct DNode {\n    int data;\n    struct DNode* prev;\n    struct DNode* next;\n};\ntypedef struct DNode* DNODE;'
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
    { step: '00', text: 'Doubly Linked List initialized with two-way pointer links.', type: 'info' }
  ]);

  const [inputVal, setInputVal] = useState<number>(55);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const res = await doublyLinkedListApi.getState();
      setNodes(res.nodes || []);
      setHeadId(res.head_id);
      setTailId(res.tail_id);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('DLL fetch state error:', e);
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
      alert(err.message || 'Doubly Linked List operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.nodes) setNodes(s.nodes);
    if (s.head_id !== undefined) setHeadId(s.head_id);
    if (s.tail_id !== undefined) setTailId(s.tail_id);
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
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center border border-accent-blue/30">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Doubly Linked List Visualizer</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Bidirectional Pointer Semantics: <code>prev ⮜ [Node] ➔ next</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Nodes: <strong className="text-accent-blue">{nodes.length}</strong></span>
            <button
              onClick={() => handleOp(() => doublyLinkedListApi.reset(), 'Reset Doubly List')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Canvas Display with Bidirectional Arrows */}
        <div className="min-h-[180px] flex items-center justify-center overflow-x-auto custom-scrollbar p-6 bg-navy-950/60 rounded-xl border border-navy-800/80">
          <div className="flex items-center gap-2">
            {/* Left NULL */}
            <div className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-500 font-mono text-xs font-bold">
              NULL
            </div>

            <div className="flex items-center text-slate-500 font-mono text-xs">⮜➔</div>

            {nodes.map((node, idx) => {
              const isHead = node.id === headId || node.is_head || idx === 0;
              const isTail = node.id === tailId || node.is_tail || idx === nodes.length - 1;
              const isActive = node.is_active;
              const isNew = node.is_new;

              let nodeClass = 'border-slate-700 bg-navy-800/90 text-white';
              if (isActive) nodeClass = 'border-accent-blue bg-accent-blue/20 text-white shadow-glow-blue scale-105';
              else if (isNew) nodeClass = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald scale-105';

              return (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center">
                    {/* Header Pointers */}
                    <div className="h-5 flex items-center gap-1 text-[9px] font-mono font-bold">
                      {isHead && <span className="text-accent-blue bg-accent-blue/20 px-1.5 py-0.5 rounded">HEAD</span>}
                      {isTail && <span className="text-accent-violet bg-accent-violet/20 px-1.5 py-0.5 rounded">TAIL</span>}
                    </div>

                    {/* DNode Card with 3 Compartments: prev, data, next */}
                    <div className={`rounded-xl border-2 overflow-hidden flex transition-all duration-300 shadow-md ${nodeClass}`}>
                      {/* Prev pointer partition */}
                      <div className="w-8 bg-navy-950/80 border-r border-navy-700 flex flex-col items-center justify-center p-1 text-[8px] font-mono text-slate-400">
                        <span>PREV</span>
                        <span className="text-[10px] text-accent-cyan font-bold">⮜</span>
                      </div>

                      {/* Value partition */}
                      <div className="px-4 py-2 flex flex-col items-center justify-center min-w-[50px]">
                        <span className="text-base font-bold font-mono">{node.value}</span>
                        <span className="text-[8px] font-mono text-slate-400 truncate max-w-[45px]">{node.id}</span>
                      </div>

                      {/* Next pointer partition */}
                      <div className="w-8 bg-navy-950/80 border-l border-navy-700 flex flex-col items-center justify-center p-1 text-[8px] font-mono text-slate-400">
                        <span>NEXT</span>
                        <span className="text-[10px] text-accent-blue font-bold">➔</span>
                      </div>
                    </div>
                  </div>

                  {/* Two-way Link Arrows between nodes */}
                  {idx < nodes.length - 1 && (
                    <div className="flex flex-col items-center justify-center px-1 text-slate-400 font-mono text-xs">
                      <span className="text-accent-blue font-bold text-sm leading-none">➔</span>
                      <span className="text-accent-cyan font-bold text-sm leading-none">⮜</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            <div className="flex items-center text-slate-500 font-mono text-xs">⮜➔</div>

            {/* Right NULL */}
            <div className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-500 font-mono text-xs font-bold">
              NULL
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
            <h3 className="text-sm font-semibold text-white tracking-wide">Doubly Linked List Controls</h3>
            <p className="text-[11px] font-mono text-slate-400">Bidirectional Head &amp; Tail Manipulation</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Input Value */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Node Data Value</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={inputVal}
                  onChange={(e) => setInputVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => doublyLinkedListApi.insertBeginning(inputVal), `Insert Beginning ${inputVal}`)}
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> At Head
                </button>
                <button
                  onClick={() => handleOp(() => doublyLinkedListApi.insertEnd(inputVal), `Insert End ${inputVal}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-blue border border-accent-blue/30 font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> At Tail
                </button>
              </div>
            </div>

            {/* Deletion Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOp(() => doublyLinkedListApi.deleteBeginning(), 'Delete Beginning')}
                className="bg-accent-rose hover:bg-accent-rose/80 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Head
              </button>
              <button
                onClick={() => handleOp(() => doublyLinkedListApi.deleteEnd(), 'Delete End')}
                className="bg-navy-800 hover:bg-navy-700 text-accent-rose border border-accent-rose/30 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Tail
              </button>
            </div>

            {/* Reverse Doubly List */}
            <button
              onClick={() => handleOp(() => doublyLinkedListApi.reverse(), 'Reverse Doubly List')}
              className="w-full bg-gradient-to-r from-accent-indigo/20 to-accent-violet/20 hover:from-accent-indigo/30 hover:to-accent-violet/30 text-accent-violet border border-accent-violet/40 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" /> Reverse (Swap Prev &amp; Next Pointers)
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

