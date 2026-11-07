import React from 'react';
import { AppLogo } from './AppLogo';
import { 
  Orbit, 
  FlaskConical, 
  BarChart3,
  ShieldAlert, 
  Rows3, 
  GitCommit, 
  Layers, 
  ListOrdered, 
  GitBranch, 
  Network, 
  Hash, 
  MountainSnow, 
  TerminalSquare,
  Code2,
  Terminal,
  Eye,
  History,
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Play,
  Clock,
  RotateCcw
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNavChange }) => {
  return (
    <aside className="w-64 border-r border-navy-700 bg-navy-900 flex flex-col justify-between flex-shrink-0 z-20 select-none cursor-default">
      <div>
        {/* Brand Header with Unique Mixed-Font Styling & Custom App Icon */}
        <div className="p-5 border-b border-navy-700/60 flex items-center gap-3 bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950/60">
          <AppLogo size={40} withGlow={true} />
          <div className="flex items-baseline leading-none">
            {/* Font 1: Futuristic Heavy Orbitron */}
            <span className="font-orbitron font-black text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 drop-shadow-[0_0_14px_rgba(56,189,248,0.55)]">
              DS
            </span>
            {/* Font 2: High-contrast Glowing Cursive Signature */}
            <span className="font-cursive font-bold text-[26px] text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300 ml-1.5 drop-shadow-[0_0_14px_rgba(216,180,254,0.65)] select-none">
              verse
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-170px)]">
          {/* WORKSPACE */}
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase px-3 mb-2 font-medium">Workspace</p>
            <nav className="space-y-1">
              <button
                onClick={() => onNavChange('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'overview'
                    ? 'bg-navy-800 text-white font-medium border border-accent-cyan/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Orbit className="w-4 h-4 text-accent-cyan" /> Overview Hub
              </button>
              <button
                onClick={() => onNavChange('linked-list')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'linked-list'
                    ? 'bg-navy-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Orbit className="w-4 h-4 text-accent-blue" /> Linked List Lab
              </button>
              <button
                onClick={() => onNavChange('algorithm-lab')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'algorithm-lab'
                    ? 'bg-navy-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-accent-emerald" /> Algorithm Lab
              </button>
              <button
                onClick={() => onNavChange('comparison')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'comparison'
                    ? 'bg-navy-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-accent-amber" /> Algorithm Comparison
              </button>
              <button
                onClick={() => onNavChange('detective')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'detective'
                    ? 'bg-navy-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-accent-rose" /> DS Detective
              </button>
            </nav>
          </div>

          {/* CODE ARENA */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-mono tracking-wider text-accent-blue uppercase font-bold">Code Arena</p>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-semibold">
                GCC
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => onNavChange('arena-practice')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arena-practice'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Code2 className="w-4 h-4 text-accent-blue" /> Practice Problems
              </button>

              <button
                onClick={() => onNavChange('arena-compiler')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arena-compiler'
                    ? 'bg-navy-800 text-white font-medium border border-accent-cyan/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Terminal className="w-4 h-4 text-accent-cyan" /> C Online Compiler
              </button>

              <button
                onClick={() => onNavChange('arena-debugger')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arena-debugger'
                    ? 'bg-navy-800 text-white font-medium border border-accent-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Eye className="w-4 h-4 text-accent-violet" /> Visual Debugger
              </button>

              <button
                onClick={() => onNavChange('arena-submissions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arena-submissions'
                    ? 'bg-navy-800 text-white font-medium border border-accent-emerald/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <History className="w-4 h-4 text-accent-emerald" /> My Submissions
              </button>

              <button
                onClick={() => onNavChange('arena-library')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arena-library'
                    ? 'bg-navy-800 text-white font-medium border border-accent-amber/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-accent-amber" /> Problem Library
              </button>
            </nav>
          </div>

          {/* QUESTION VAULT */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-mono tracking-wider text-accent-violet uppercase font-bold">Question Vault</p>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-violet/15 text-accent-violet border border-accent-violet/30 font-semibold">
                PDF AI
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => onNavChange('vault-overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-overview'
                    ? 'bg-navy-800 text-white font-medium border border-accent-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-accent-cyan" /> Overview
              </button>

              <button
                onClick={() => onNavChange('vault-documents')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-documents'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-accent-blue" /> My Documents
              </button>

              <button
                onClick={() => onNavChange('vault-bank')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-bank'
                    ? 'bg-navy-800 text-white font-medium border border-accent-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-accent-violet" /> Question Bank
              </button>

              <button
                onClick={() => onNavChange('vault-coding')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-coding'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Code2 className="w-4 h-4 text-accent-blue" /> Coding Practice
              </button>

              <button
                onClick={() => onNavChange('vault-quiz')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-quiz'
                    ? 'bg-navy-800 text-white font-medium border border-accent-emerald/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Play className="w-4 h-4 text-accent-emerald" /> Practice Quiz
              </button>

              <button
                onClick={() => onNavChange('vault-exam')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-exam'
                    ? 'bg-navy-800 text-white font-medium border border-accent-amber/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Clock className="w-4 h-4 text-accent-amber" /> Mock Examination
              </button>

              <button
                onClick={() => onNavChange('vault-revision')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-revision'
                    ? 'bg-navy-800 text-white font-medium border border-accent-cyan/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-accent-cyan" /> Revision Center
              </button>

              <button
                onClick={() => onNavChange('vault-analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'vault-analytics'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-accent-blue" /> Performance Analytics
              </button>
            </nav>
          </div>

          {/* DATA STRUCTURES */}
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase px-3 mb-2 font-medium">Data Structures</p>
            <nav className="space-y-1">
              <button
                onClick={() => onNavChange('arrays')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'arrays'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Rows3 className="w-4 h-4 text-accent-blue" /> Arrays
              </button>

              <button
                onClick={() => onNavChange('linked-list')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'linked-list'
                    ? 'bg-gradient-to-r from-accent-indigo/20 to-accent-violet/10 text-accent-blue border border-accent-blue/30 shadow-sm font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <GitCommit className="w-4 h-4 text-accent-blue" /> Linked Lists
                </span>
                {activeNav === 'linked-list' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-glow-blue animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => onNavChange('stacks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'stacks'
                    ? 'bg-navy-800 text-white font-medium border border-accent-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Layers className="w-4 h-4 text-accent-violet" /> Stacks
              </button>

              <button
                onClick={() => onNavChange('queues')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'queues'
                    ? 'bg-navy-800 text-white font-medium border border-accent-emerald/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <ListOrdered className="w-4 h-4 text-accent-emerald" /> Queues
              </button>

              <button
                onClick={() => onNavChange('trees')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'trees'
                    ? 'bg-navy-800 text-white font-medium border border-accent-blue/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <GitBranch className="w-4 h-4 text-accent-blue" /> Trees (BST)
              </button>

              <button
                onClick={() => onNavChange('heaps')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'heaps'
                    ? 'bg-navy-800 text-white font-medium border border-accent-amber/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <MountainSnow className="w-4 h-4 text-accent-amber" /> Heaps
              </button>

              <button
                onClick={() => onNavChange('graphs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'graphs'
                    ? 'bg-navy-800 text-white font-medium border border-accent-indigo/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Network className="w-4 h-4 text-accent-indigo" /> Graphs
              </button>

              <button
                onClick={() => onNavChange('hash-tables')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === 'hash-tables'
                    ? 'bg-navy-800 text-white font-medium border border-accent-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Hash className="w-4 h-4 text-accent-violet" /> Hash Tables
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Academic User Profile Card (No gaming / XP) */}
      <div className="p-4 border-t border-navy-700/60 bg-navy-950/40">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-navy-800/60 border border-navy-700">
          <div className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-600 flex items-center justify-center font-mono font-bold text-xs text-accent-blue">
            <TerminalSquare className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">CS Researcher Vikas</p>
            <p className="text-[10px] text-slate-400 font-mono">Academic Lab Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
