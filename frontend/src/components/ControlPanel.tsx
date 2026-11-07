import React, { useState } from 'react';
import { Sliders, Plus, CornerDownRight, Trash2, Trash, Search, Repeat, Disc, Sparkles, XCircle } from 'lucide-react';

interface ControlPanelProps {
  onInsertBeginning: (val: number) => void;
  onInsertEnd: (val: number) => void;
  onInsertPosition: (val: number, pos: number) => void;
  onDeleteBeginning: () => void;
  onDeleteEnd: () => void;
  onDeletePosition: (pos: number) => void;
  onDeleteValue: (val: number) => void;
  onSearch: (target: number) => void;
  onReverse: () => void;
  onFindMiddle: () => void;
  onDetectCycle: () => void;
  onClear: () => void;
  nodeCount: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onInsertBeginning,
  onInsertEnd,
  onInsertPosition,
  onDeleteBeginning,
  onDeleteEnd,
  onDeletePosition,
  onDeleteValue,
  onSearch,
  onReverse,
  onFindMiddle,
  onDetectCycle,
  onClear,
  nodeCount,
}) => {
  const [activeTab, setActiveTab] = useState<'insert' | 'delete' | 'search' | 'other'>('insert');
  const [insertBegVal, setInsertBegVal] = useState(15);
  const [insertEndVal, setInsertEndVal] = useState(50);
  const [insertPosVal, setInsertPosVal] = useState(25);
  const [insertPosIdx, setInsertPosIdx] = useState(1);
  const [deletePosIdx, setDeletePosIdx] = useState(1);
  const [deleteVal, setDeleteVal] = useState(20);
  const [searchTarget, setSearchTarget] = useState(30);

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-navy-700/60 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Operation Controls
          </h3>
        </div>

        <div className="flex bg-navy-800 p-1 rounded-lg border border-navy-700 text-xs">
          {(['insert', 'delete', 'search', 'other'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded capitalize font-medium transition ${
                activeTab === tab
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* INSERT OPERATIONS */}
      {activeTab === 'insert' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Insert at Beginning (Prepend)</span>
              <span className="text-[10px] font-mono text-accent-blue font-bold">O(1)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={insertBegVal}
                onChange={(e) => setInsertBegVal(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Value"
              />
              <button
                onClick={() => onInsertBeginning(insertBegVal)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-accent-indigo hover:bg-accent-indigo/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Execute insert_beginning()
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Insert at End (Append)</span>
              <span className="text-[10px] font-mono text-accent-amber font-bold">O(n)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={insertEndVal}
                onChange={(e) => setInsertEndVal(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Value"
              />
              <button
                onClick={() => onInsertEnd(insertEndVal)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-navy-600 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Execute insert_end()
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Insert at Position</span>
              <span className="text-[10px] font-mono text-accent-amber font-bold">O(n)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={insertPosVal}
                onChange={(e) => setInsertPosVal(parseInt(e.target.value) || 0)}
                className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Value"
              />
              <input
                type="number"
                min="0"
                max={nodeCount}
                value={insertPosIdx}
                onChange={(e) => setInsertPosIdx(parseInt(e.target.value) || 0)}
                className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Index (0..N)"
              />
            </div>
            <button
              onClick={() => onInsertPosition(insertPosVal, insertPosIdx)}
              className="w-full px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-navy-600 transition"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> Execute insert_at_position()
            </button>
          </div>
        </div>
      )}

      {/* DELETE OPERATIONS */}
      {activeTab === 'delete' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Delete from Beginning</p>
              <p className="text-[10px] font-mono text-slate-400">Promotes start-&gt;next to HEAD, free(old_head)</p>
            </div>
            <button
              onClick={onDeleteBeginning}
              className="px-3 py-1.5 rounded-lg bg-accent-rose/20 hover:bg-accent-rose/30 text-accent-rose border border-accent-rose/40 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> delete_beginning()
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Delete from End</p>
              <p className="text-[10px] font-mono text-slate-400">Traverses to penultimate, free(tail)</p>
            </div>
            <button
              onClick={onDeleteEnd}
              className="px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-200 border border-navy-600 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> delete_end()
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Delete at Index</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={Math.max(0, nodeCount - 1)}
                value={deletePosIdx}
                onChange={(e) => setDeletePosIdx(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Index"
              />
              <button
                onClick={() => onDeletePosition(deletePosIdx)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-navy-600 transition"
              >
                <Trash className="w-3.5 h-3.5" /> delete_at_position()
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Delete by Value</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={deleteVal}
                onChange={(e) => setDeleteVal(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Target Value"
              />
              <button
                onClick={() => onDeleteValue(deleteVal)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-navy-600 transition"
              >
                <Trash className="w-3.5 h-3.5" /> delete_by_value()
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH OPERATIONS */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Linear Search Key</span>
              <span className="text-[10px] font-mono text-accent-blue font-bold">O(n)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={searchTarget}
                onChange={(e) => setSearchTarget(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white focus:outline-none focus:border-accent-blue font-mono"
                placeholder="Key"
              />
              <button
                onClick={() => onSearch(searchTarget)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-accent-violet hover:bg-accent-violet/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Search className="w-3.5 h-3.5" /> Execute search_element()
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER ADVANCED OPERATIONS */}
      {activeTab === 'other' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReverse}
              className="px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Repeat className="w-3.5 h-3.5 text-accent-blue" /> reverse_list()
            </button>
            <button
              onClick={onFindMiddle}
              className="px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Disc className="w-3.5 h-3.5 text-accent-emerald" /> find_middle()
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDetectCycle}
              className="px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> detect_cycle()
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2.5 rounded-xl bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose border border-accent-rose/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <XCircle className="w-3.5 h-3.5" /> clear_list()
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
