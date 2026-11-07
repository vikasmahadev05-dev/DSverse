import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Bookmark, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  TrendingDown
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface RevisionCenterProps {
  onStartRevisionQuiz: (topics?: string[]) => void;
  onOpenQuestionDetails: (q: any) => void;
}

export const RevisionCenter: React.FC<RevisionCenterProps> = ({
  onStartRevisionQuiz,
  onOpenQuestionDetails
}) => {
  const [revisionData, setRevisionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevision = async () => {
      setIsLoading(true);
      try {
        const data = await vaultApi.getRevision();
        setRevisionData(data);
      } catch (err: any) {
        console.error('Fetch revision error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevision();
  }, []);

  const weakTopics = revisionData?.weak_topics || [];
  const bookmarked = revisionData?.bookmarked_questions || [];

  return (
    <div className="space-y-6">
      {/* Revision Header Banner */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700 shadow-card space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/15 border border-accent-amber/30 text-xs font-mono font-bold text-accent-amber">
          <RotateCcw className="w-3.5 h-3.5" /> Spaced Repetition &amp; Weak Spot Diagnostics
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-white font-sans">
          Adaptive Revision Center
        </h1>
        <p className="text-xs text-slate-300 font-mono leading-relaxed max-w-3xl">
          Reinforce conceptual foundations by drilling previously failed questions, bookmarked examination items, and topics under 65% mastery.
        </p>

        <div className="pt-2">
          <button
            onClick={() => onStartRevisionQuiz(weakTopics.map((w: any) => w.topic_id))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-amber hover:bg-accent-amber/90 text-navy-950 font-bold text-xs font-mono shadow-sm transition"
          >
            <Play className="w-4 h-4" /> Start Targeted Revision Quiz
          </button>
        </div>
      </div>

      {/* Grid: Weak Topics (Left) & Bookmarked Review Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Weak Topics Analysis */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
            <TrendingDown className="w-4 h-4 text-accent-rose" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Diagnosed Vulnerabilities (&lt;65% Accuracy)
            </h3>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Analyzing attempt history...
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="p-6 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs font-mono text-accent-emerald flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block text-white mb-0.5">Zero High-Risk Vulnerabilities!</strong>
                <span>All practiced domains maintain strong accuracy rates. Continue regular quizzes to sustain mastery.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((wt: any) => (
                <div
                  key={wt.topic_id}
                  className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{wt.topic_name}</span>
                    <span className="px-2 py-0.5 rounded bg-accent-rose/15 text-accent-rose font-bold border border-accent-rose/30">
                      {wt.accuracy_pct}% Mastery
                    </span>
                  </div>
                  <p className="text-slate-400 font-sans">{wt.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 6 Cols: Bookmarked Items */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent-amber" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Bookmarked Questions ({bookmarked.length})
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Loading bookmarked questions...
            </div>
          ) : bookmarked.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No bookmarked questions yet. Click the bookmark icon in the Question Bank to queue questions for quick revision.
            </div>
          ) : (
            <div className="divide-y divide-navy-800 max-h-96 overflow-y-auto custom-scrollbar">
              {bookmarked.map((q: any) => (
                <div
                  key={q.question_id}
                  onClick={() => onOpenQuestionDetails(q)}
                  className="py-3 px-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-navy-950/60 rounded-xl transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-accent-blue mb-0.5">
                      <span>{q.question_number}</span>
                      <span>&bull;</span>
                      <span className="text-accent-cyan uppercase">{q.topic_id}</span>
                      <span>&bull;</span>
                      <span className="text-slate-500">Page {q.source_page}</span>
                    </div>
                    <p className="text-xs font-sans text-white truncate max-w-sm">
                      {q.question_text}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
