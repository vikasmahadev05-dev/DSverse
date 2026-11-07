import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RefreshCw
} from 'lucide-react';
import { vaultApi } from '../../services/api';

export const VaultAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await vaultApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overallAccuracy = analytics?.overall_accuracy_pct || 0;
  const totalAttempts = analytics?.total_attempts || 0;
  const correctAttempts = analytics?.correct_attempts || 0;
  const incorrectAttempts = analytics?.incorrect_attempts || 0;
  const topicBreakdown = analytics?.topic_breakdown || [];
  const recentQuizzes = analytics?.recent_quizzes || [];

    if (isLoading && !analytics) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs animate-pulse">
        Loading Question Vault Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        <div>
          <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-blue" /> Performance Intelligence &amp; Mastery Matrix
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Granular empirical metrics across topics, examination attempts, and test case success rates.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition border border-navy-700"
          title="Refresh analytics data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <span className="text-xs font-mono uppercase font-semibold text-slate-400 block mb-2">
            Global Accuracy
          </span>
          <div className="text-3xl font-extrabold font-mono text-accent-cyan">
            {overallAccuracy}%
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Weighted across all attempts</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <span className="text-xs font-mono uppercase font-semibold text-slate-400 block mb-2">
            Total Solved
          </span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {totalAttempts}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Individual item evaluations</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <span className="text-xs font-mono uppercase font-semibold text-slate-400 block mb-2">
            Correct Answers
          </span>
          <div className="text-3xl font-extrabold font-mono text-accent-emerald">
            {correctAttempts}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Validated correct submissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <span className="text-xs font-mono uppercase font-semibold text-slate-400 block mb-2">
            Errors / Fallacies
          </span>
          <div className="text-3xl font-extrabold font-mono text-accent-rose">
            {incorrectAttempts}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Queued for revision</p>
        </div>
      </div>

      {/* Topic-Wise Accuracy Breakdown */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-navy-800">
          Domain-Level Knowledge Mastery
        </h3>

        {topicBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No attempt data available. Complete a practice quiz or mock exam to generate topic analytics.
          </div>
        ) : (
          <div className="space-y-4">
            {topicBreakdown.map((t: any) => {
              const pct = t.accuracy_pct;
              let barColor = 'from-accent-emerald to-teal-400';
              if (pct < 50) barColor = 'from-accent-rose to-red-400';
              else if (pct < 70) barColor = 'from-accent-amber to-yellow-400';

              return (
                <div key={t.topic_id} className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t.topic_name}</span>
                    <span className="text-slate-400">
                      <strong className="text-white">{t.correct_attempts}</strong>/{t.total_attempts} Correct ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden border border-navy-800">
                    <div
                      className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Exam History */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-navy-800">
          Examination History &amp; Timings
        </h3>

        {recentQuizzes.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No historical examinations recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-navy-800 font-mono text-xs">
            {recentQuizzes.map((qz: any) => (
              <div key={qz.quiz_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{qz.quiz_name}</div>
                  <div className="text-[10px] text-slate-500">
                    Mode: <span className="capitalize text-accent-cyan">{qz.quiz_mode}</span> &bull; {qz.total_questions} Questions
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-accent-emerald font-bold text-sm">
                    {qz.score} / {qz.total_marks}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {qz.status === 'completed' ? 'Submitted' : 'In Progress'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
