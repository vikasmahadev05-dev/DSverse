import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Binary } from 'lucide-react';
import { ListNodeData } from '../types';

interface CanvasProps {
  nodes: ListNodeData[];
  headId: string | null;
  onReset: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({ nodes, headId, onReset }) => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card relative flex flex-col min-h-[300px]">
      {/* Canvas Header & Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse"></span>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Pointer Topology Canvas
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-2">
            ({nodes.length} nodes active)
          </span>
        </div>

        {/* Canvas Toolbar: Zoom In, Zoom Out, Center, Reset */}
        <div className="flex items-center gap-1 bg-navy-800 p-1 rounded-lg border border-navy-700 text-slate-400">
          <button
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            className="p-1.5 hover:text-white hover:bg-navy-700 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
            className="p-1.5 hover:text-white hover:bg-navy-700 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 hover:text-white hover:bg-navy-700 rounded transition"
            title="Center View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-navy-700 mx-1"></div>
          <button
            onClick={onReset}
            className="p-1.5 hover:text-accent-rose hover:bg-navy-700 rounded transition"
            title="Reset Visualization"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Render Area */}
      <div className="flex-1 w-full overflow-x-auto custom-scrollbar canvas-grid rounded-xl p-8 flex items-center justify-start min-h-[200px] border border-navy-800/80 bg-navy-950/70">
        <div
          className="flex items-center transition-transform duration-300 origin-left"
          style={{ transform: `scale(${zoom})` }}
        >
          {nodes.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center mb-3">
                <Binary className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300 font-mono">Linked List is Empty</p>
              <p className="text-xs text-slate-500 mt-1">HEAD pointer currently references NULL. Insert a node to begin.</p>
            </div>
          ) : (
            <>
              {/* HEAD Pointer Flag */}
              <div className="flex items-center mr-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-accent-blue uppercase bg-accent-blue/10 border border-accent-blue/30 px-2 py-0.5 rounded shadow-glow-blue">
                    HEAD
                  </span>
                  <span className="text-accent-blue font-mono text-sm mt-1">➔</span>
                </div>
              </div>

              {/* Node Sequence */}
              {nodes.map((node, idx) => {
                const isHead = node.is_head || node.id === headId || idx === 0;
                const isActive = node.is_active;
                const isNew = node.is_new;
                const isDeleted = node.is_deleted;

                return (
                  <div key={node.id} className="flex items-center">
                    {/* Node Card */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 mb-1">
                        {isHead && (
                          <span className="text-[9px] font-mono text-accent-blue font-bold px-1 rounded bg-accent-blue/10">
                            HEAD
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          [{idx}]
                        </span>
                      </div>

                      <div
                        className={`flex h-16 rounded-xl border transition-all duration-300 overflow-hidden ${
                          isDeleted
                            ? "border-accent-rose bg-accent-rose/20 opacity-40 line-through"
                            : isNew
                            ? "border-accent-emerald bg-accent-emerald/15 node-new-glow"
                            : isActive
                            ? "border-accent-violet bg-accent-violet/20 node-active-glow ring-2 ring-accent-violet/50"
                            : "border-navy-600 bg-navy-800 hover:border-accent-blue/60 hover:bg-navy-800/90 shadow-card"
                        }`}
                      >
                        {/* Data Partition */}
                        <div className="px-5 flex flex-col justify-center items-center border-r border-navy-700/80 bg-navy-900/60 min-w-[70px]">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">val</span>
                          <span className="text-lg font-bold font-mono text-white tracking-tight">{node.value}</span>
                        </div>

                        {/* Next Pointer Partition */}
                        <div className="px-3 flex flex-col justify-center items-center bg-navy-950/40 min-w-[55px]">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">next</span>
                          <span className="text-xs font-mono font-semibold text-accent-blue flex items-center gap-0.5">
                            {idx < nodes.length - 1 ? "•➔" : "NULL"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-slate-500 mt-1">
                        {node.id}
                      </span>
                    </div>

                    {/* Animated Directional Connection Arrow */}
                    {idx < nodes.length - 1 && (
                      <div className="mx-3 flex items-center text-accent-blue">
                        <svg width="40" height="18" viewBox="0 0 40 18" fill="none">
                          <path
                            d="M2 9H34M34 9L26 3M34 9L26 15"
                            stroke="#38BDF8"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Terminal NULL Anchor */}
              <div className="flex items-center ml-3">
                <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
                  <path
                    d="M2 9H26M26 9L18 3M26 9L18 15"
                    stroke="#64748B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="px-3 py-1.5 rounded-lg border border-navy-700 bg-navy-900/90 text-accent-rose font-mono text-xs font-bold tracking-wider">
                  NULL
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

