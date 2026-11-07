import React, { useState, useEffect } from 'react';
import { treeApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { GitBranch, Plus, Search, RefreshCw, Compass } from 'lucide-react';

export const TreeVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('BST Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Binary Search Tree initialized.');
  const [cCode, setCCode] = useState<string>(
    'BST_NODE insert_bst(BST_NODE root, int val) {\n' +
    '    if (root == NULL) {\n' +
    '        BST_NODE temp = (BST_NODE)malloc(sizeof(struct TreeNode));\n' +
    '        temp->data = val; temp->left = temp->right = NULL;\n' +
    '        return temp;\n' +
    '    }\n' +
    '    if (val < root->data) root->left = insert_bst(root->left, val);\n' +
    '    else if (val > root->data) root->right = insert_bst(root->right, val);\n' +
    '    return root;\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>(
    'struct TreeNode { int data; struct TreeNode* left; struct TreeNode* right; };\n' +
    'typedef struct TreeNode* BST_NODE;'
  );
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(log n)',
    time_avg: 'O(log n)',
    time_worst: 'O(n)',
    space_auxiliary: 'O(log n)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 7
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Binary Search Tree module initialized with balanced node layout.', type: 'info' }
  ]);

  const [insertVal, setInsertVal] = useState<number>(25);
  const [searchKey, setSearchKey] = useState<number>(60);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => treeApi.reset(), 'Reset Tree');
      setLogs([{ step: '00', text: 'Binary Search Tree reset to balanced state.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-trees', handleReset);
    return () => window.removeEventListener('dsverse-reset-trees', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await treeApi.getState();
      setNodes(res.nodes || []);
      if (res.c_struct) setCStruct(res.c_struct);
      setMetrics((prev) => ({ ...prev, total_nodes: res.total_nodes || 7 }));
    } catch (e) {
      console.warn('BST state fetch error:', e);
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
      alert(err.message || 'BST operation failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.nodes) setNodes(s.nodes);
    setActiveCLine(s.c_line_number || 1);
    setExplanation(s.c_line_explanation || s.description);
    if (s.comparisons !== undefined || s.traversals !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: s.comparisons ?? prev.comparisons,
        traversals: s.traversals ?? prev.traversals,
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

  // Build edge connections from nodes
  const nodeMap = new Map<string, any>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  nodes.forEach((n) => {
    if (n.left_id && nodeMap.has(n.left_id)) {
      const child = nodeMap.get(n.left_id);
      edges.push({ x1: n.x, y1: n.y, x2: child.x, y2: child.y });
    }
    if (n.right_id && nodeMap.has(n.right_id)) {
      const child = nodeMap.get(n.right_id);
      edges.push({ x1: n.x, y1: n.y, x2: child.x, y2: child.y });
    }
  });

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center border border-accent-blue/30">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Binary Search Tree (BST) Canvas</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Hierarchical Left &lt; Root &lt; Right Order Invariant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Total Nodes: <strong className="text-accent-blue">{nodes.length}</strong></span>
            <button
              onClick={() => handleOp(() => treeApi.reset(), 'Reset BST')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Tree SVG Visualization Area */}
        <div className="w-full h-[320px] bg-navy-950/80 rounded-xl border border-navy-800/80 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
            {/* Draw Tree Branch Lines */}
            {edges.map((e, idx) => (
              <line
                key={idx}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#334155"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}

            {/* Draw Tree Nodes */}
            {nodes.map((node) => {
              const isActive = node.is_active;
              const isComparing = node.is_comparing;
              const isVisited = node.is_visited;

              let fill = '#0F172A';
              let stroke = '#475569';
              let textFill = '#F8FAFC';

              if (isActive) {
                fill = '#1E1B4B';
                stroke = '#38BDF8';
              } else if (isComparing) {
                fill = '#311042';
                stroke = '#A855F7';
              } else if (isVisited) {
                fill = '#064E3B';
                stroke = '#10B981';
              }

              return (
                <g key={node.id} className="transition-all duration-300">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive ? '3' : '2'}
                    className={isActive ? 'filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
          </svg>
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
            <h3 className="text-sm font-semibold text-white tracking-wide">BST Operations</h3>
            <p className="text-[11px] font-mono text-slate-400">Recursive Pointer Traversal &amp; Mutation</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Insert */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Insert BST Key</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Key"
                  value={insertVal}
                  onChange={(e) => setInsertVal(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => treeApi.insert(insertVal), `Insert ${insertVal}`)}
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Search Key</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Search key"
                  value={searchKey}
                  onChange={(e) => setSearchKey(parseInt(e.target.value) || 0)}
                  className="w-32 px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
                />
                <button
                  onClick={() => handleOp(() => treeApi.search(searchKey), `Search ${searchKey}`)}
                  className="flex-1 bg-navy-800 hover:bg-navy-700 text-accent-emerald border border-accent-emerald/30 font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
              </div>
            </div>

            {/* Tree Traversals */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Tree Traversals</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOp(() => treeApi.traverse('inorder'), 'Inorder Traversal')}
                  className="px-2.5 py-2 bg-navy-800 hover:bg-navy-700 text-accent-blue border border-accent-blue/20 rounded font-bold transition flex items-center justify-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Inorder (Sorted)
                </button>
                <button
                  onClick={() => handleOp(() => treeApi.traverse('preorder'), 'Preorder Traversal')}
                  className="px-2.5 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 rounded font-semibold transition"
                >
                  Preorder
                </button>
                <button
                  onClick={() => handleOp(() => treeApi.traverse('postorder'), 'Postorder Traversal')}
                  className="px-2.5 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 rounded font-semibold transition"
                >
                  Postorder
                </button>
                <button
                  onClick={() => handleOp(() => treeApi.traverse('level_order'), 'Level-Order (BFS)')}
                  className="px-2.5 py-2 bg-navy-800 hover:bg-navy-700 text-accent-emerald border border-accent-emerald/20 rounded font-bold transition"
                >
                  Level-Order
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

