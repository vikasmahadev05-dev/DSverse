import React from 'react';
import { RotateCcw, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { ExecutionStep } from '../types';

interface ExecutionControlsProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
  currentOperation: string;
  isPlaying: boolean;
  speed: number;
  onPlayToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  steps,
  currentStepIndex,
  currentOperation,
  isPlaying,
  speed,
  onPlayToggle,
  onNext,
  onPrev,
  onRestart,
  onSpeedChange,
}) => {
  const total = steps.length;
  const progressPercent = total > 0 ? ((currentStepIndex + 1) / total) * 100 : 0;

  return (
    <div className="mt-4 pt-3 border-t border-navy-700/80 flex flex-wrap items-center justify-between gap-4">
      {/* Step Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRestart}
          disabled={total === 0}
          className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
          title="Restart Execution"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0 || total === 0}
          className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
          title="Previous Step"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={onPlayToggle}
          disabled={total === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs border transition ${
            isPlaying
              ? 'bg-accent-amber/20 border-accent-amber text-accent-amber'
              : 'bg-accent-indigo hover:bg-accent-indigo/90 border-accent-indigo text-white shadow-glow-violet'
          }`}
          title={isPlaying ? 'Pause step execution' : (currentStepIndex >= total - 1 && total > 0 ? 'Replay execution from start' : 'Play execution steps')}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : (currentStepIndex >= total - 1 && total > 0 ? 'Replay' : 'Play')}
        </button>
        <button
          onClick={onNext}
          disabled={currentStepIndex >= total - 1 || total === 0}
          className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-slate-300 border border-navy-600 transition"
          title="Next Step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-navy-800 rounded-lg p-0.5 border border-navy-700 ml-2">
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-[11px] font-mono rounded ${
                speed === s ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex-1 max-w-xs flex flex-col items-center">
        <div className="w-full flex justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>Step {total > 0 ? currentStepIndex + 1 : 0} of {total}</span>
          <span className="text-accent-blue font-semibold truncate max-w-[140px]">{currentOperation}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-navy-800 overflow-hidden border border-navy-700">
          <div
            className="h-full bg-gradient-to-r from-accent-indigo to-accent-blue transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Engine Status Tag */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400">Status:</span>
        {isPlaying ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
            Auto-Playing...
          </span>
        ) : (
          <span className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
            Execution Engine Ready
          </span>
        )}
      </div>
    </div>
  );
};

