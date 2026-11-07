import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Play, 
  Upload, 
  Sparkles, 
  TrendingUp,
  Trash2
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface QuestionVaultOverviewProps {
  stats: any;
  onNavigateSubView: (view: string) => void;
  onStartPracticeQuiz: () => void;
  onStartExam: () => void;
  onRefreshStats?: () => void;
}

export const QuestionVaultOverview: React.FC<QuestionVaultOverviewProps> = ({
  stats,
  onNavigateSubView,
  onStartPracticeQuiz,
  onStartExam,
  onRefreshStats
}) => {
  const totalDocs = stats?.total_documents || 0;
  const totalQuestions = stats?.total_questions || 0;
  const pendingReviews = stats?.pending_reviews || 0;
  const accuracyPct = stats?.overall_accuracy_pct || 0;
  const totalAttempts = stats?.total_attempts || 0;
  const recentDocs = stats?.recent_documents || [];
  const weakTopics = stats?.weak_topics || [];
  const recentQuizzes = stats?.recent_quizzes || [];

  const handleDeleteDoc = async (docId: string, filename: string) => {
    if (window.confirm(`Are you sure you want to delete '${filename}' and its extracted questions from the vault?`)) {
      try {
        await vaultApi.deleteDocument(docId);
        if (onRefreshStats) {
          onRefreshStats();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700/80 p-6 lg:p-8 shadow-card overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-60 h-60 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-[11px] font-mono font-bold text-accent-cyan tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            PDF Intelligence &amp; Interactive Question Bank
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            QUESTION VAULT
          </h1>
          <p className="text-sm font-sans text-slate-300 leading-relaxed">
            Upload course PDFs, past exam papers, and lab manuals. Automatically extract verified question banks, generate timed mock examinations, practice real C code implementations, and visualize Data Structures.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateSubView('documents')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white text-xs font-semibold shadow-glow-violet transition"
            >
              <Upload className="w-4 h-4" /> Upload Course PDF
            </button>
            <button
              onClick={onStartPracticeQuiz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white text-xs font-semibold border border-navy-600 transition"
            >
              <Play className="w-4 h-4 text-accent-emerald" /> Quick Practice Quiz
            </button>
            <button
              onClick={onStartExam}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white text-xs font-semibold border border-navy-600 transition"
            >
              <Clock className="w-4 h-4 text-accent-amber" /> Timed Mock Exam
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Course Documents</span>
            <FileText className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalDocs}</div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Processed PDF libraries</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Question Bank</span>
            <HelpCircle className="w-4 h-4 text-accent-violet" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalQuestions}</div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">Approved &amp; active items</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{accuracyPct}%</div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">{totalAttempts} total attempts</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-amber">{pendingReviews}</div>
          <button
            onClick={() => onNavigateSubView('review')}
            className="text-[11px] font-mono text-accent-blue hover:underline flex items-center gap-1 mt-1"
          >
            Review extracted drafts &rarr;
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Documents & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Recent Documents */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-700">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                Uploaded PDF Documents
              </h2>
            </div>
            <button
              onClick={() => onNavigateSubView('documents')}
              className="text-xs font-mono text-accent-blue hover:underline flex items-center gap-1"
            >
              View all ({totalDocs}) &rarr;
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No documents uploaded yet. Upload a syllabus or question paper PDF to begin.
            </div>
          ) : (
            <div className="divide-y divide-navy-800">
              {recentDocs.map((doc: any) => (
                <div key={doc.document_id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-navy-800 border border-navy-700 text-accent-blue flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate max-w-xs md:max-w-md">
                        {doc.filename}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                        <span>{doc.page_count} pages</span>
                        <span>&bull;</span>
                        <span>{doc.extracted_count} questions</span>
                        <span>&bull;</span>
                        <span className={`capitalize font-semibold ${
                          doc.processing_status === 'approved'
                            ? 'text-accent-emerald'
                            : doc.processing_status === 'review_required'
                            ? 'text-accent-amber'
                            : 'text-accent-blue'
                        }`}>
                          {doc.processing_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.processing_status === 'review_required' ? (
                      <button
                        onClick={() => onNavigateSubView('review')}
                        className="px-2.5 py-1 rounded-lg bg-accent-amber/15 text-accent-amber hover:bg-accent-amber/25 text-xs font-mono font-semibold border border-accent-amber/30 transition"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateSubView('bank')}
                        className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
                      >
                        Browse Bank
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDoc(doc.document_id, doc.filename)}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-mono transition border border-navy-700"
                      title="Delete PDF document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Revision Recommendations & Weak Topics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weak Topics Card */}
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent-amber" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Adaptive Revision Focus
                </h3>
              </div>
              <button
                onClick={() => onNavigateSubView('revision')}
                className="text-xs font-mono text-accent-cyan hover:underline"
              >
                Revision Center &rarr;
              </button>
            </div>

            {weakTopics.length === 0 ? (
              <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs font-mono text-accent-emerald flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>All attempted topics currently maintain &gt;65% accuracy. Solid mastery!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((wt: any) => (
                  <div key={wt.topic_id} className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white">{wt.topic_name}</span>
                      <span className="text-accent-rose font-bold">{wt.accuracy_pct}% Mastery</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{wt.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Attempted Quizzes */}
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-navy-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-blue" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Recent Examination Sessions
                </h3>
              </div>
            </div>

            {recentQuizzes.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-3 text-center">
                No recent quizzes recorded. Start a practice quiz to record your mastery metrics.
              </p>
            ) : (
              <div className="divide-y divide-navy-800 text-xs font-mono">
                {recentQuizzes.slice(0, 3).map((qz: any) => (
                  <div key={qz.quiz_id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{qz.quiz_name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{qz.quiz_mode} Mode</div>
                    </div>
                    <div className="text-right">
                      <div className="text-accent-emerald font-bold">{qz.score}/{qz.total_marks} Marks</div>
                      <div className="text-[10px] text-slate-500">{qz.completed_at ? 'Finished' : 'In Progress'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
