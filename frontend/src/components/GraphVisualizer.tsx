import React, { useState, useEffect } from 'react';
import { graphApi } from '../services/api';
import { CodeInspector } from './CodeInspector';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionLog } from './ExecutionLog';
import { ComplexityPanel } from './ComplexityPanel';
import { ComplexityData, MetricsData, LogEntry } from '../types';
import { Network, Play, RefreshCw, Table2, List } from 'lucide-react';

export const GraphVisualizer: React.FC = () => {
  const [vertices, setVertices] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [adjMatrix, setAdjMatrix] = useState<number[][]>([]);
  const [adjList, setAdjList] = useState<any>({});
  const [labels, setLabels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'canvas' | 'matrix' | 'list'>('canvas');

  const [queueState, setQueueState] = useState<string[]>([]);
  const [stackState, setStackState] = useState<string[]>([]);

  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('Graph Ready');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('Weighted Undirected Graph initialized.');
  const [cCode, setCCode] = useState<string>(
    'void bfs(int adj[MAX_V][MAX_V], int start_v, int n) {\n' +
    '    int visited[MAX_V] = {0};\n' +
    '    int queue[MAX_V], front = 0, rear = 0;\n' +
    '    visited[start_v] = 1;\n' +
    '    queue[rear++] = start_v;\n' +
    '    while (front < rear) {\n' +
    '        int curr = queue[front++];\n' +
    '        printf("%d ", curr);\n' +
    '        for (int i = 0; i < n; i++) {\n' +
    '            if (adj[curr][i] && !visited[i]) {\n' +
    '                visited[i] = 1;\n' +
    '                queue[rear++] = i;\n' +
    '            }\n' +
    '        }\n' +
    '    }\n' +
    '}'
  );
  const [cStruct, setCStruct] = useState<string>(
    '#define MAX_VERTICES 6\ntypedef struct { int num_vertices; int adj_matrix[MAX_VERTICES][MAX_VERTICES]; } GraphMatrix;'
  );
  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(V + E)',
    time_avg: 'O(V + E)',
    time_worst: 'O(V + E)',
    space_auxiliary: 'O(V)'
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 5
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'Graph visualizer initialized with 5 vertices (A, B, C, D, E) and weighted edges.', type: 'info' }
  ]);

  const [startVertex, setStartVertex] = useState<number>(0);

  useEffect(() => {
    loadState();
    const handleReset = () => {
      handleOp(() => graphApi.reset(), 'Reset Graph');
      setLogs([{ step: '00', text: 'Graph network reset to initial topology.', type: 'info' }]);
    };
    window.addEventListener('dsverse-reset-graphs', handleReset);
    return () => window.removeEventListener('dsverse-reset-graphs', handleReset);
  }, []);

  const loadState = async () => {
    try {
      const res = await graphApi.getState();
      setVertices(res.vertices || []);
      setEdges(res.edges || []);
      setAdjMatrix(res.adj_matrix || []);
      setAdjList(res.adj_list || {});
      setLabels(res.vertex_labels || []);
      if (res.c_struct) setCStruct(res.c_struct);
    } catch (e) {
      console.warn('Graph state fetch error:', e);
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
      alert(err.message || 'Graph algorithm failed');
    }
  };

  const applyStep = (s: any) => {
    if (!s) return;
    if (s.graph_state) {
      if (s.graph_state.vertices) setVertices(s.graph_state.vertices);
      if (s.graph_state.edges) setEdges(s.graph_state.edges);
    }
    if (s.queue_state) setQueueState(s.queue_state);
    if (s.stack_state) setStackState(s.stack_state);
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

  // Vertex position lookup
  const vertexPosMap = new Map<number, { x: number; y: number }>();
  vertices.forEach((v) => vertexPosMap.set(v.id, { x: v.x, y: v.y }));

  return (
    <div className="space-y-6">
      {/* Canvas Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 text-accent-indigo flex items-center justify-center border border-accent-indigo/30">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Graph Visualizer &amp; Algorithms Lab</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Adjacency Matrix, Adjacency List &amp; Classical Graph Traversal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* View Mode Toggle */}
            <div className="flex bg-navy-950 p-0.5 rounded-lg border border-navy-800">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-2.5 py-1 rounded text-xs transition ${viewMode === 'canvas' ? 'bg-navy-800 text-white font-bold' : 'text-slate-400'}`}
              >
                Canvas
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${viewMode === 'matrix' ? 'bg-navy-800 text-white font-bold' : 'text-slate-400'}`}
              >
                <Table2 className="w-3 h-3" /> Matrix
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${viewMode === 'list' ? 'bg-navy-800 text-white font-bold' : 'text-slate-400'}`}
              >
                <List className="w-3 h-3" /> List
              </button>
            </div>

            <button
              onClick={() => handleOp(() => graphApi.reset(), 'Reset Graph')}
              className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-600 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* View Mode 1: Graphical Canvas */}
        {viewMode === 'canvas' && (
          <div className="w-full h-[320px] bg-navy-950/80 rounded-xl border border-navy-800/80 relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 580 340" preserveAspectRatio="xMidYMid meet">
              {/* Draw Edges */}
              {edges.map((edge, idx) => {
                const uPos = vertexPosMap.get(edge.u);
                const vPos = vertexPosMap.get(edge.v);
                if (!uPos || !vPos) return null;

                const midX = (uPos.x + vPos.x) / 2;
                const midY = (uPos.y + vPos.y) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={uPos.x}
                      y1={uPos.y}
                      x2={vPos.x}
                      y2={vPos.y}
                      stroke={edge.is_active ? '#38BDF8' : '#334155'}
                      strokeWidth={edge.is_active ? '3.5' : '2'}
                      className={edge.is_active ? 'filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}
                    />
                    {/* Edge Weight Pill */}
                    <circle cx={midX} cy={midY} r="10" fill="#0B0F19" stroke="#475569" strokeWidth="1" />
                    <text
                      x={midX}
                      y={midY + 3.5}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Draw Vertices */}
              {vertices.map((v) => {
                const isActive = v.is_active;
                const isVisited = v.is_visited;
                const isFrontier = v.is_in_frontier;

                let fill = '#0F172A';
                let stroke = '#475569';
                let textFill = '#F8FAFC';

                if (isActive) {
                  fill = '#1E1B4B';
                  stroke = '#38BDF8';
                } else if (isVisited) {
                  fill = '#064E3B';
                  stroke = '#10B981';
                } else if (isFrontier) {
                  fill = '#311042';
                  stroke = '#A855F7';
                }

                return (
                  <g key={v.id} className="transition-all duration-300">
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r="22"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isActive ? '3' : '2'}
                      className={isActive ? 'filter drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]' : ''}
                    />
                    <text
                      x={v.x}
                      y={v.y + 5}
                      textAnchor="middle"
                      fill={textFill}
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {v.label}
                    </text>

                    {/* Tentative Distance badge for Dijkstra */}
                    {v.distance !== undefined && v.distance !== null && (
                      <g>
                        <rect
                          x={v.x - 16}
                          y={v.y - 34}
                          width="32"
                          height="14"
                          rx="4"
                          fill="#1E293B"
                          stroke="#64748B"
                          strokeWidth="1"
                        />
                        <text
                          x={v.x}
                          y={v.y - 24}
                          textAnchor="middle"
                          fill="#38BDF8"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          d:{v.distance}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* View Mode 2: Adjacency Matrix */}
        {viewMode === 'matrix' && (
          <div className="p-4 bg-navy-950/80 rounded-xl border border-navy-800 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs font-mono text-slate-400">Adjacency Matrix (Row: From, Col: To)</span>
            <table className="border-collapse font-mono text-xs text-center">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500"></th>
                  {labels.map((l) => (
                    <th key={l} className="p-2 text-accent-blue font-bold">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adjMatrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2 text-accent-blue font-bold">{labels[rIdx]}</td>
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2 border border-slate-800 min-w-[36px] ${val > 0 ? 'bg-navy-800 text-white font-bold' : 'text-slate-600'}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Mode 3: Adjacency List */}
        {viewMode === 'list' && (
          <div className="p-4 bg-navy-950/80 rounded-xl border border-navy-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 block mb-2 font-bold">Adjacency List Representation:</span>
            {Object.entries(adjList).map(([vertex, neighbors]: [string, any]) => (
              <div key={vertex} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-accent-blue">
                  {vertex}
                </span>
                <span className="text-slate-500">➔</span>
                <div className="flex gap-2">
                  {neighbors.map((n: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-navy-900 border border-navy-700 rounded text-slate-300">
                      {n.neighbor} <strong className="text-accent-emerald">(w:{n.weight})</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Traversal State (Queue or Stack) */}
        {(queueState.length > 0 || stackState.length > 0) && (
          <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl flex items-center gap-3 text-xs font-mono">
            {queueState.length > 0 && (
              <>
                <span className="text-accent-blue font-bold">FIFO Queue:</span>
                <div className="flex gap-1.5">
                  {queueState.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/30 font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}
            {stackState.length > 0 && (
              <>
                <span className="text-accent-violet font-bold">Call Stack (LIFO):</span>
                <div className="flex gap-1.5">
                  {stackState.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-accent-violet/20 text-accent-violet border border-accent-violet/30 font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
            <h3 className="text-sm font-semibold text-white tracking-wide">Graph Algorithms</h3>
            <p className="text-[11px] font-mono text-slate-400">Breadth-First, Depth-First &amp; Shortest Path</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Start Vertex Selector */}
            <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
              <span className="text-slate-300 font-semibold block">Source Vertex</span>
              <select
                value={startVertex}
                onChange={(e) => setStartVertex(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-accent-blue"
              >
                {labels.map((l, idx) => (
                  <option key={idx} value={idx}>Vertex {l} (index {idx})</option>
                ))}
              </select>
            </div>

            {/* Algorithm Triggers */}
            <div className="space-y-2">
              <button
                onClick={() => handleOp(() => graphApi.bfs(startVertex), `BFS Traversal from ${labels[startVertex]}`)}
                className="w-full py-2 px-3 bg-accent-blue/15 hover:bg-accent-blue/25 text-accent-blue border border-accent-blue/40 rounded-lg flex items-center justify-between font-bold transition"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Breadth-First Search (BFS)
                </span>
                <span className="text-[10px] bg-navy-900 px-2 py-0.5 rounded border border-accent-blue/30">O(V + E)</span>
              </button>

              <button
                onClick={() => handleOp(() => graphApi.dfs(startVertex), `DFS Traversal from ${labels[startVertex]}`)}
                className="w-full py-2 px-3 bg-accent-violet/15 hover:bg-accent-violet/25 text-accent-violet border border-accent-violet/40 rounded-lg flex items-center justify-between font-bold transition"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Depth-First Search (DFS)
                </span>
                <span className="text-[10px] bg-navy-900 px-2 py-0.5 rounded border border-accent-violet/30">O(V + E)</span>
              </button>

              <button
                onClick={() => handleOp(() => graphApi.dijkstra(startVertex), `Dijkstra Shortest Path from ${labels[startVertex]}`)}
                className="w-full py-2 px-3 bg-accent-emerald/15 hover:bg-accent-emerald/25 text-accent-emerald border border-accent-emerald/40 rounded-lg flex items-center justify-between font-bold transition"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Dijkstra Shortest Path
                </span>
                <span className="text-[10px] bg-navy-900 px-2 py-0.5 rounded border border-accent-emerald/30">O(V²)</span>
              </button>
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

