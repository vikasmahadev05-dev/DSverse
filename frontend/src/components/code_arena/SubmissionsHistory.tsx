import React, { useState, useEffect } from 'react';
import { History, Code2 } from 'lucide-react';
import { arenaApi } from '../../services/api';

interface Submission {
  id: number;
  problem_id: string;
  source_code: string;
  verdict: string;
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  submitted_at: string;
}

interface SubmissionsHistoryProps {
  onLoadCode: (problemId: string, code: string) => void;
}

export const SubmissionsHistory: React.FC<SubmissionsHistoryProps> = ({ onLoadCode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    arenaApi.getSubmissions('Vikas')
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load submissions:', err);
        setLoading(false);
      });
  }, []);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/40';
      case 'WRONG_ANSWER':
        return 'bg-accent-rose/15 text-accent-rose border-accent-rose/40';
      case 'COMPILATION_ERROR':
        return 'bg-accent-amber/15 text-accent-amber border-accent-amber/40';
      default:
        return 'bg-navy-800 text-slate-300 border-navy-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-700 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-violet/15 text-accent-violet border border-accent-violet/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-sans">My Submissions &amp; Verdicts</h2>
            <p className="text-xs font-mono text-slate-400">
              Evaluated and verified through the Automated GCC Judge
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Submissions: <strong className="text-white font-bold">{submissions.length}</strong>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl border border-navy-700 bg-navy-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-navy-950 text-slate-400 border-b border-navy-700/80">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Passed Tests</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading submission history...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No submissions recorded yet. Submit your first challenge in the Practice workspace!
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-400">#{sub.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white font-sans">
                      {sub.problem_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVerdictBadge(sub.verdict)}`}>
                        {sub.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {sub.passed_tests} / {sub.total_tests}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {sub.execution_time_ms} ms
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {sub.submitted_at}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs border border-navy-700 transition"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onLoadCode(sub.problem_id, sub.source_code)}
                        className="px-2.5 py-1 rounded bg-accent-blue/15 hover:bg-accent-blue text-accent-blue hover:text-navy-950 font-bold text-xs border border-accent-blue/30 transition"
                      >
                        Load Code
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-navy-900 border border-navy-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 bg-navy-950 border-b border-navy-700">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent-blue" />
                <span className="font-mono text-sm font-bold text-white">
                  Submission #{selectedSub.id} — {selectedSub.problem_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getVerdictBadge(selectedSub.verdict)}`}>
                  {selectedSub.verdict}
                </span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-navy-950">
              <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedSub.source_code}
              </pre>
            </div>

            <div className="p-4 bg-navy-900 border-t border-navy-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  onLoadCode(selectedSub.problem_id, selectedSub.source_code);
                  setSelectedSub(null);
                }}
                className="px-4 py-2 rounded-xl bg-accent-blue text-navy-950 font-mono text-xs font-bold hover:bg-sky-400 transition"
              >
                Load into Code Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
