import React, { useState } from 'react';
import { algorithmApi } from '../services/api';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Code2, Cpu } from 'lucide-react';

export const AlgorithmLab: React.FC = () => {
  const [algoCategory, setAlgoCategory] = useState<'sort' | 'search'>('sort');
  const [selectedAlgo, setSelectedAlgo] = useState<string>('bubble_sort');
  const [inputArrayStr, setInputArrayStr] = useState<string>('45, 12, 89, 34, 23, 7, 56');
  const [searchKey, setSearchKey] = useState<number>(34);

  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [cCode, setCCode] = useState<string>('');
  const [complexity, setComplexity] = useState<any>({
    time_best: 'O(n)', time_avg: 'O(n²)', time_worst: 'O(n²)', space_auxiliary: 'O(1)'
  });
  const [metrics, setMetrics] = useState<any>({ total_comparisons: 0, total_swaps: 0 });

  const runAlgorithm = async () => {
    setIsPlaying(false);
    try {
      const parsedArr = inputArrayStr.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      if (algoCategory === 'sort') {
        const data = await algorithmApi.sort(selectedAlgo, parsedArr);
        setSteps(data.steps);
        setCurrentStepIdx(0);
        setCCode(data.c_code);
        setComplexity(data.complexity);
        setMetrics(data.metrics);
        if (data.steps && data.steps.length > 1) {
          setIsPlaying(true);
        }
      } else {
        const data = await algorithmApi.search(selectedAlgo, parsedArr, searchKey);
        setSteps(data.steps);
        setCurrentStepIdx(0);
        setCCode(data.c_code);
        setComplexity(data.complexity);
        setMetrics(data.metrics);
        if (data.steps && data.steps.length > 1) {
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps]);

  const currentStep = steps[currentStepIdx] || null;
  const currentArray = currentStep ? currentStep.array : inputArrayStr.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
  const activeIndices = currentStep ? (currentStep.active_indices || (currentStep.active_index !== null ? [currentStep.active_index] : [])) : [];
  const sortedIndices = currentStep ? (currentStep.sorted_indices || []) : [];
  const activeCLine = currentStep ? currentStep.c_line : 1;

  return (
    <div className="space-y-6">
      {/* Configuration & Controls */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-navy-800 p-1 rounded-lg border border-navy-700 text-xs">
            <button
              onClick={() => { setAlgoCategory('sort'); setSelectedAlgo('bubble_sort'); }}
              className={`px-3 py-1.5 rounded font-medium transition ${algoCategory === 'sort' ? 'bg-accent-indigo text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Sorting
            </button>
            <button
              onClick={() => { setAlgoCategory('search'); setSelectedAlgo('binary_search'); }}
              className={`px-3 py-1.5 rounded font-medium transition ${algoCategory === 'search' ? 'bg-accent-indigo text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Searching
            </button>
          </div>

          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 text-xs text-white font-mono focus:outline-none"
          >
            {algoCategory === 'sort' ? (
              <>
                <option value="bubble_sort">Bubble Sort</option>
                <option value="selection_sort">Selection Sort</option>
                <option value="insertion_sort">Insertion Sort</option>
              </>
            ) : (
              <>
                <option value="binary_search">Binary Search (Sorted)</option>
                <option value="linear_search">Linear Search</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <input
            type="text"
            value={inputArrayStr}
            onChange={(e) => setInputArrayStr(e.target.value)}
            placeholder="Array (e.g. 45, 12, 89, 34)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white font-mono focus:outline-none"
          />
          {algoCategory === 'search' && (
            <input
              type="number"
              value={searchKey}
              onChange={(e) => setSearchKey(parseInt(e.target.value) || 0)}
              placeholder="Key"
              className="w-20 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-600 text-xs text-white font-mono focus:outline-none"
            />
          )}
          <button
            onClick={runAlgorithm}
            className="px-4 py-1.5 rounded-lg bg-accent-indigo hover:bg-accent-indigo/90 text-white font-semibold text-xs transition shadow-sm"
          >
            Execute
          </button>
        </div>
      </div>

      {/* Main Algorithm Visualization Canvas */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-indigo animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase text-slate-300">
              Array State & Comparison Topology
            </span>
          </div>
          {currentStep && (
            <span className="text-xs font-mono text-accent-blue font-semibold">
              Step {currentStepIdx + 1} of {steps.length}
            </span>
          )}
        </div>

        {/* Bar Visualizer */}
        <div className="h-56 flex items-end justify-center gap-3 p-4 bg-navy-950 rounded-xl border border-navy-800">
          {currentArray.map((val: number, idx: number) => {
            const isActive = activeIndices.includes(idx);
            const isSorted = sortedIndices.includes(idx);
            const heightPercent = Math.min(100, Math.max(15, (val / Math.max(...currentArray, 1)) * 100));

            return (
              <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px]">
                <span className="text-[10px] font-mono text-slate-400 mb-1 font-semibold">{val}</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-accent-amber shadow-glow-emerald ring-2 ring-accent-amber/50'
                      : isSorted
                      ? 'bg-accent-emerald shadow-glow-emerald'
                      : 'bg-accent-indigo'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-1">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Step description */}
        {currentStep && (
          <div className="mt-3 p-3 rounded-lg bg-navy-800/60 border border-navy-700 text-xs font-mono text-slate-300">
            <span className="text-accent-blue font-bold mr-2">LOG:</span>
            {currentStep.description}
          </div>
        )}

        {/* Execution Controls */}
        <div className="mt-4 pt-3 border-t border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentStepIdx(0);
                if (steps.length > 1) setIsPlaying(true);
              }}
              disabled={steps.length === 0}
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
              title="Restart and Auto-Play"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0 || steps.length === 0}
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (!isPlaying && steps.length > 0 && currentStepIdx >= steps.length - 1) {
                  setCurrentStepIdx(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              disabled={steps.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs bg-accent-indigo text-white border border-accent-indigo transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : (currentStepIdx >= steps.length - 1 && steps.length > 0 ? 'Replay' : 'Play')}
            </button>
            <button
              onClick={() => setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStepIdx >= steps.length - 1 || steps.length === 0}
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-navy-800 rounded-lg p-0.5 border border-navy-700 ml-2">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-[11px] font-mono rounded ${speed === s ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-400'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Comparisons: <b className="text-white">{currentStep ? currentStep.comparisons : metrics.total_comparisons}</b></span>
            {algoCategory === 'sort' && <span>Swaps: <b className="text-white">{currentStep ? currentStep.swaps : metrics.total_swaps}</b></span>}
          </div>
        </div>
      </div>

      {/* C Code Inspector & Complexity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-accent-violet" /> Synchronized C Source Code
            </span>
          </div>
          <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs overflow-x-auto custom-scrollbar border border-navy-800 text-slate-300 max-h-56">
            {cCode.split('\n').map((line, lIdx) => {
              const lineNum = lIdx + 1;
              const isLineActive = lineNum === activeCLine;
              return (
                <div key={lineNum} className={`flex items-center py-0.5 px-2 rounded ${isLineActive ? 'code-line-active text-white font-semibold' : 'text-slate-400'}`}>
                  <span className="w-8 select-none text-[10px] text-slate-600 text-right pr-3">{lineNum}</span>
                  <span className="flex-1 whitespace-pre">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-navy-700">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-amber" /> Theoretical Complexity
            </span>
          </div>
          <div className="space-y-3 my-auto">
            <div className="flex justify-between text-xs font-mono p-2 bg-navy-800 rounded-lg">
              <span className="text-slate-400">Best Case:</span>
              <span className="text-accent-emerald font-bold">{complexity.time_best}</span>
            </div>
            <div className="flex justify-between text-xs font-mono p-2 bg-navy-800 rounded-lg">
              <span className="text-slate-400">Average Case:</span>
              <span className="text-accent-blue font-bold">{complexity.time_avg}</span>
            </div>
            <div className="flex justify-between text-xs font-mono p-2 bg-navy-800 rounded-lg">
              <span className="text-slate-400">Worst Case:</span>
              <span className="text-accent-amber font-bold">{complexity.time_worst}</span>
            </div>
            <div className="flex justify-between text-xs font-mono p-2 bg-navy-800 rounded-lg">
              <span className="text-slate-400">Aux Space:</span>
              <span className="text-white font-bold">{complexity.space_auxiliary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

