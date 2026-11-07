import React from 'react';
import { 
  Rows3, 
  GitCommit, 
  Layers, 
  ListOrdered, 
  GitBranch, 
  Network, 
  Hash, 
  MountainSnow, 
  FlaskConical, 
  BarChart3, 
  ShieldAlert, 
  ArrowRight, 
  Cpu, 
  Code2, 
  Activity
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface DashboardOverviewProps {
  onNavigate: (nav: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const dataStructures = [
    {
      id: 'arrays',
      name: 'Arrays',
      category: 'Linear Contiguous',
      description: 'Sequential physical memory allocation with O(1) random index access and element shifting.',
      icon: Rows3,
      color: 'accent-blue',
      timeAvg: 'O(1) Access / O(n) Insert',
      space: 'O(1) Aux',
      stats: 'Hex addresses: 0x2000'
    },
    {
      id: 'linked-list',
      name: 'Linked Lists (4 Variants)',
      category: 'Linear Dynamic',
      description: 'Singly, Doubly, Circular, and Skip List express lanes with pointer-level manipulation.',
      icon: GitCommit,
      color: 'accent-violet',
      timeAvg: 'O(1) Prepend / O(log n) Skip',
      space: 'O(n) Dynamic',
      stats: '4 Architectures'
    },
    {
      id: 'stacks',
      name: 'Stacks (LIFO)',
      category: 'Restricted Linear',
      description: 'Last-In First-Out vertical pointer container with capacity boundaries and underflow protection.',
      icon: Layers,
      color: 'accent-violet',
      timeAvg: 'O(1) Push / Pop / Peek',
      space: 'O(1) Aux',
      stats: '8 Slots Capacity'
    },
    {
      id: 'queues',
      name: 'Circular Queues (FIFO)',
      category: 'Restricted Linear',
      description: 'First-In First-Out circular buffer utilizing modulo arithmetic rear = (rear + 1) % MAX.',
      icon: ListOrdered,
      color: 'accent-emerald',
      timeAvg: 'O(1) Enqueue / Dequeue',
      space: 'O(1) Aux',
      stats: 'Circular Modulo 8'
    },
    {
      id: 'trees',
      name: 'Binary Search Trees',
      category: 'Non-Linear Hierarchical',
      description: 'Hierarchical node branching preserving Left < Root < Right invariant with full traversals.',
      icon: GitBranch,
      color: 'accent-blue',
      timeAvg: 'O(log n) Search / Insert',
      space: 'O(h) Stack',
      stats: 'Inorder / Pre / Post / BFS'
    },
    {
      id: 'heaps',
      name: 'Binary Heaps',
      category: 'Priority Queues',
      description: 'Complete binary tree dual-view synchronized with underlying array indexing formulas.',
      icon: MountainSnow,
      color: 'accent-amber',
      timeAvg: 'O(log n) Sift / Heapify',
      space: 'O(1) Aux',
      stats: 'Min & Max Heap Modes'
    },
    {
      id: 'graphs',
      name: 'Graphs & Networks',
      category: 'Non-Linear Relational',
      description: 'Adjacency Matrix, Adjacency List, Breadth-First, Depth-First, and Dijkstra shortest path.',
      icon: Network,
      color: 'accent-indigo',
      timeAvg: 'O(V + E) BFS/DFS / O(V²) Dijkstra',
      space: 'O(V) Frontier',
      stats: '5 Vertices / 6 Edges'
    },
    {
      id: 'hash-tables',
      name: 'Hash Tables',
      category: 'Direct Addressing',
      description: 'Hash mapping h(k) = k % 7 with Separate Chaining linked lists and Open Addressing linear probing.',
      icon: Hash,
      color: 'accent-violet',
      timeAvg: 'O(1) Expected Insert / Search',
      space: 'O(n) Buckets',
      stats: 'Chaining & Linear Probing'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Laboratory Card */}
      <div className="relative overflow-hidden rounded-3xl border border-navy-700 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 p-8 shadow-card">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-blue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-violet/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <AppLogo size={48} withGlow={true} />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-orbitron font-black text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]">
                    DS
                  </span>
                  <span className="font-cursive font-bold text-[34px] text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300 ml-1.5 drop-shadow-[0_0_16px_rgba(216,180,254,0.7)] select-none">
                    verse
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 tracking-wider">
                  Interactive Computer Science &amp; Algorithm Visualization Environment
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              DSVERSE is a high-performance academic laboratory engineered to help computer science students understand internal pointer manipulation, contiguous memory addressing, and algorithm execution through synchronized ANSI C source tracking.
            </p>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800/80 border border-navy-700 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-accent-blue" />
                <span><strong>11</strong> Data Structures</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800/80 border border-navy-700 text-slate-300">
                <Code2 className="w-3.5 h-3.5 text-accent-violet" />
                <span><strong>100%</strong> Compilable ANSI C Mapped</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800/80 border border-navy-700 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Zero Gamification / Academic Standard</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('linked-list')}
              className="px-5 py-2.5 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition shadow-glow-blue"
            >
              <span>Explore Linked Lists</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('algorithm-lab')}
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-600 rounded-xl font-semibold font-mono text-xs flex items-center justify-center gap-2 transition"
            >
              <FlaskConical className="w-4 h-4 text-accent-emerald" />
              <span>Algorithm Laboratory</span>
            </button>
            <button
              onClick={() => onNavigate('comparison')}
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-600 rounded-xl font-semibold font-mono text-xs flex items-center justify-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-accent-amber" />
              <span>Algorithm Comparison</span>
            </button>
            <button
              onClick={() => onNavigate('detective')}
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-600 rounded-xl font-semibold font-mono text-xs flex items-center justify-center gap-2 transition"
            >
              <ShieldAlert className="w-4 h-4 text-accent-rose" />
              <span>DS Detective: Code Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section: Data Structures Universe Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Data Structures Universe</h3>
            <p className="text-xs font-mono text-slate-400">Select a data structure to open its interactive pointer canvas and C inspector</p>
          </div>
          <span className="text-xs font-mono text-slate-500">8 Modules Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataStructures.map((ds) => {
            const Icon = ds.icon;
            return (
              <div
                key={ds.id}
                onClick={() => onNavigate(ds.id)}
                className="group p-5 rounded-2xl bg-navy-900 border border-navy-700/80 hover:border-accent-blue/50 hover:bg-navy-850 cursor-pointer transition-all duration-300 shadow-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-5 h-5 text-accent-blue" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-slate-400 border border-navy-800">
                      {ds.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-accent-blue transition">
                      {ds.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {ds.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-800 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Time (Avg):</span>
                    <strong className="text-slate-200">{ds.timeAvg}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Space (Aux):</span>
                    <strong className="text-slate-200">{ds.space}</strong>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-accent-blue font-semibold group-hover:translate-x-1 transition">
                    <span>Launch Visualizer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Academic Complexity Reference Table */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Asymptotic Complexity Reference Matrix</h3>
            <p className="text-[11px] font-mono text-slate-400">Worst and Average Case Time &amp; Auxiliary Space Bounds</p>
          </div>
          <span className="text-xs font-mono text-accent-emerald">Standard CS Invariant</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full font-mono text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 bg-navy-950/60">
                <th className="py-2.5 px-4 font-semibold">Data Structure</th>
                <th className="py-2.5 px-4 font-semibold">Access</th>
                <th className="py-2.5 px-4 font-semibold">Search</th>
                <th className="py-2.5 px-4 font-semibold">Insertion</th>
                <th className="py-2.5 px-4 font-semibold">Deletion</th>
                <th className="py-2.5 px-4 font-semibold">Space Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300">
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-blue">Array</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-violet">Singly Linked List</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)*</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)*</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-violet">Doubly Linked List</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-cyan">Skip List</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4">O(n log n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-emerald">Stack</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-emerald">Queue</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-blue">Binary Search Tree</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-amber">Binary Heap</td>
                <td className="py-2.5 px-4">—</td>
                <td className="py-2.5 px-4">O(n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4 text-accent-blue font-bold">O(log n)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
              <tr className="hover:bg-navy-800/40 transition">
                <td className="py-2.5 px-4 font-bold text-accent-violet">Hash Table</td>
                <td className="py-2.5 px-4">—</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4 text-accent-emerald font-bold">O(1)</td>
                <td className="py-2.5 px-4">O(n)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
