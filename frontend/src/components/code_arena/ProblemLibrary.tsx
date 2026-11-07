import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, Circle, Eye } from 'lucide-react';
import { arenaApi } from '../../services/api';

interface ProblemSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  visualizer_type: string;
  function_signature: string;
  examples_count: number;
  test_cases_count: number;
}

interface ProblemLibraryProps {
  onSelectProblem: (problemId: string) => void;
}

export const ProblemLibrary: React.FC<ProblemLibraryProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    arenaApi.getProblems()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load problems:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Linked Lists', 'Arrays', 'Stacks', 'Trees'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30';
      case 'medium':
        return 'bg-accent-amber/15 text-accent-amber border-accent-amber/30';
      case 'hard':
        return 'bg-accent-rose/15 text-accent-rose border-accent-rose/30';
      default:
        return 'bg-navy-800 text-slate-300 border-navy-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-navy-700 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent-violet/20 text-accent-violet border border-accent-violet/40">
                Automated Judge Library
              </span>
              <span className="text-xs font-mono text-slate-400">
                {problems.length} Curated Challenges
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-sans">
              Data Structures Problem Library
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              Master C memory manipulation, pointer links, and algorithmic invariants through automated test evaluation and live visual debugging.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-navy-900 border border-navy-700 p-4 rounded-2xl shadow-card">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by name or category..."
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition ${selectedCategory === cat
                    ? 'bg-accent-blue text-navy-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulties */}
          <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${selectedDifficulty === diff
                    ? 'bg-navy-800 text-white font-bold border border-navy-600'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-navy-950 text-slate-400 border-b border-navy-700/80">
              <tr>
                <th className="py-3.5 px-6">Problem Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Test Cases</th>
                <th className="py-3.5 px-4">Visualizer Mode</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading problem repository...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching problems found.
                  </td>
                </tr>
              ) : (
                filtered.map((prob) => (
                  <tr
                    key={prob.id}
                    className="hover:bg-navy-800/40 transition group cursor-pointer"
                    onClick={() => onSelectProblem(prob.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Circle className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent-blue transition" />
                        <div>
                          <span className="font-semibold text-white group-hover:text-accent-blue transition font-sans text-sm">
                            {prob.title}
                          </span>
                          <span className="text-[11px] text-slate-500 block font-mono">
                            {prob.function_signature}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {prob.category}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getDifficultyBadge(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {prob.test_cases_count} cases
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1.5 text-accent-cyan font-mono text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> {prob.visualizer_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProblem(prob.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-accent-blue hover:text-navy-950 text-slate-200 font-bold border border-navy-700 transition"
                      >
                        Solve <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
