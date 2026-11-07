import React, { useState } from 'react';
import { algorithmApi } from '../services/api';
import { BarChart3, Zap, Info } from 'lucide-react';

export const AlgorithmComparison: React.FC = () => {
  const [algo1, setAlgo1] = useState<string>('bubble_sort');
  const [algo2, setAlgo2] = useState<string>('quick_sort');
  const [inputStr, setInputStr] = useState<string>('84, 19, 45, 62, 31, 95, 12, 70, 53, 28');
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const arr = inputStr.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      const res = await algorithmApi.compare(algo1, algo2, arr);
      setBenchmarkResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Setup Header */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-700">
          <BarChart3 className="w-5 h-5 text-accent-amber" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Comparative Benchmark Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Execute dual sorting algorithms under identical dataset constraints to contrast empirical vs theoretical complexity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Algorithm A (Baseline)</label>
            <select
              value={algo1}
              onChange={(e) => setAlgo1(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-600 text-xs text-white font-mono focus:outline-none"
            >
              <option value="bubble_sort">Bubble Sort</option>
              <option value="selection_sort">Selection Sort</option>
              <option value="insertion_sort">Insertion Sort</option>
              <option value="quick_sort">Quick Sort</option>
            </select>
          </div>

          <div className="flex justify-center">
            <span className="w-8 h-8 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-accent-blue font-mono font-bold text-xs">
              VS
            </span>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Algorithm B (Challenger)</label>
            <select
              value={algo2}
              onChange={(e) => setAlgo2(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-600 text-xs text-white font-mono focus:outline-none"
            >
              <option value="quick_sort">Quick Sort</option>
              <option value="bubble_sort">Bubble Sort</option>
              <option value="selection_sort">Selection Sort</option>
              <option value="insertion_sort">Insertion Sort</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-navy-950 border border-navy-600 text-xs text-white font-mono focus:outline-none"
            placeholder="Dataset array (comma-separated)"
          />
          <button
            onClick={runBenchmark}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-accent-amber" /> {loading ? 'Benchmarking...' : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {/* Benchmark Results */}
      {benchmarkResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Algorithm A Card */}
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-navy-800">
                <h4 className="text-sm font-bold text-white font-mono">{benchmarkResult.algorithm_1.display_name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
                  {benchmarkResult.algorithm_1.time_complexity}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Comparisons</p>
                  <p className="text-lg font-bold text-white mt-1">{benchmarkResult.algorithm_1.comparisons}</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Memory Swaps</p>
                  <p className="text-lg font-bold text-accent-amber mt-1">{benchmarkResult.algorithm_1.swaps}</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Execution Time</p>
                  <p className="text-lg font-bold text-accent-emerald mt-1">{benchmarkResult.algorithm_1.time_ms} ms</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Stability</p>
                  <p className="text-lg font-bold text-slate-300 mt-1">{benchmarkResult.algorithm_1.stable ? 'Stable' : 'Unstable'}</p>
                </div>
              </div>
            </div>

            {/* Algorithm B Card */}
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-navy-800">
                <h4 className="text-sm font-bold text-white font-mono">{benchmarkResult.algorithm_2.display_name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                  {benchmarkResult.algorithm_2.time_complexity}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Comparisons</p>
                  <p className="text-lg font-bold text-white mt-1">{benchmarkResult.algorithm_2.comparisons}</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Memory Swaps</p>
                  <p className="text-lg font-bold text-accent-amber mt-1">{benchmarkResult.algorithm_2.swaps}</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Execution Time</p>
                  <p className="text-lg font-bold text-accent-emerald mt-1">{benchmarkResult.algorithm_2.time_ms} ms</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-slate-400 text-[10px] uppercase">Stability</p>
                  <p className="text-lg font-bold text-slate-300 mt-1">{benchmarkResult.algorithm_2.stable ? 'Stable' : 'Unstable'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Comparative Synthesis Card */}
          <div className="bg-navy-900 border border-accent-blue/40 rounded-2xl p-5 shadow-card flex items-start gap-3">
            <Info className="w-5 h-5 text-accent-blue shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold font-mono text-accent-blue uppercase mb-1">
                Computer Science Pedagogical Analysis
              </h4>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {benchmarkResult.comparative_analysis}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
