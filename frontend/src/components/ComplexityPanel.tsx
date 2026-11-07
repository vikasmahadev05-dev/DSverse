import React from 'react';
import { Cpu } from 'lucide-react';
import { ComplexityData, MetricsData } from '../types';

interface ComplexityPanelProps {
  complexity: ComplexityData;
  metrics: MetricsData;
  currentOperation: string;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({
  complexity,
  metrics,
  currentOperation,
}) => {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 shadow-card flex flex-col justify-between h-52">
      <div className="flex items-center justify-between pb-2 border-b border-navy-700/60">
        <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-accent-amber" /> Algorithm Complexity & Metrics
        </span>
        <span className="text-[10px] font-mono text-accent-blue font-semibold">{currentOperation}</span>
      </div>

      {/* Theoretical Complexity */}
      <div className="grid grid-cols-4 gap-2 my-2 text-center">
        <div className="p-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
          <p className="text-[9px] font-mono text-slate-400 uppercase">Best Time</p>
          <p className="text-xs font-bold font-mono text-accent-emerald">{complexity.time_best}</p>
        </div>
        <div className="p-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
          <p className="text-[9px] font-mono text-slate-400 uppercase">Avg Time</p>
          <p className="text-xs font-bold font-mono text-accent-blue">{complexity.time_avg}</p>
        </div>
        <div className="p-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
          <p className="text-[9px] font-mono text-slate-400 uppercase">Worst Time</p>
          <p className="text-xs font-bold font-mono text-accent-amber">{complexity.time_worst}</p>
        </div>
        <div className="p-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
          <p className="text-[9px] font-mono text-slate-400 uppercase">Aux Space</p>
          <p className="text-xs font-bold font-mono text-white">{complexity.space_auxiliary}</p>
        </div>
      </div>

      {/* Live Operation Metrics */}
      <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-navy-800">
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase">Comparisons</p>
          <p className="text-xs font-bold font-mono text-slate-200">{metrics.comparisons}</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase">Traversals</p>
          <p className="text-xs font-bold font-mono text-accent-amber">{metrics.traversals}</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase">Pointer Writes</p>
          <p className="text-xs font-bold font-mono text-accent-violet">{metrics.pointer_assignments}</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase">Total Nodes</p>
          <p className="text-xs font-bold font-mono text-accent-blue">{metrics.total_nodes}</p>
        </div>
      </div>
    </div>
  );
};
