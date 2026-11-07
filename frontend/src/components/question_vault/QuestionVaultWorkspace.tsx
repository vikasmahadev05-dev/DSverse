import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Clock, 
  RotateCcw, 
  BarChart3, 
  Sparkles, 
  Upload,
  FileCode
} from 'lucide-react';
import { QuestionVaultOverview } from './QuestionVaultOverview';
import { DocumentManager } from './DocumentManager';
import { ExtractionReview } from './ExtractionReview';
import { QuestionBank } from './QuestionBank';
import { QuizRunner } from './QuizRunner';
import { MockExamConfig } from './MockExamConfig';
import { RevisionCenter } from './RevisionCenter';
import { VaultAnalytics } from './VaultAnalytics';
import { CodingWorkspace } from './CodingWorkspace';
import { CodingPracticeModal } from './CodingPracticeModal';
import { vaultApi } from '../../services/api';

interface QuestionVaultWorkspaceProps {
  initialSubView?: string;
  onSubViewChange?: (view: string) => void;
  onOpenVisualizer?: (route: string) => void;
}

export const QuestionVaultWorkspace: React.FC<QuestionVaultWorkspaceProps> = ({
  initialSubView = 'overview',
  onSubViewChange,
  onOpenVisualizer
}) => {
  const [subView, setSubView] = useState<string>(initialSubView);
  const [stats, setStats] = useState<any>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeCodingQuestion, setActiveCodingQuestion] = useState<any | null>(null);

  const fetchOverviewStats = async () => {
    try {
      const data = await vaultApi.getOverview();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load vault overview stats:', err);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, [subView]);

  useEffect(() => {
    if (initialSubView && initialSubView !== subView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  const handleNavigate = (view: string) => {
    setSubView(view);
    if (onSubViewChange) onSubViewChange(view);
  };

  const handleStartPracticeQuiz = async () => {
    try {
      const quiz = await vaultApi.generateQuiz({
        quiz_name: 'Fast Practice Drill',
        quiz_mode: 'practice',
        num_questions: 5
      });
      if (quiz && quiz.quiz_id) {
        setActiveQuizId(quiz.quiz_id);
        handleNavigate('quiz');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start practice quiz');
    }
  };

  const handleStartExamSession = (quizId: string) => {
    setActiveQuizId(quizId);
    handleNavigate('quiz');
  };

  const handleStartQuizWithFilter = async (filters: any) => {
    try {
      const quiz = await vaultApi.generateQuiz({
        quiz_name: filters.topic ? `${filters.topic.replace('-', ' ').toUpperCase()} Quiz` : 'Custom Filter Quiz',
        quiz_mode: 'practice',
        topics: filters.topic ? [filters.topic] : undefined,
        difficulties: filters.difficulty ? [filters.difficulty] : undefined,
        num_questions: 10
      });
      if (quiz && quiz.quiz_id) {
        setActiveQuizId(quiz.quiz_id);
        handleNavigate('quiz');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Navigation Pills Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <button
            onClick={() => handleNavigate('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${
              subView === 'overview'
                ? 'bg-navy-800 text-white font-bold border border-accent-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavigate('documents')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'documents'
                ? 'bg-navy-800 text-white font-bold border border-accent-blue/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-accent-blue" /> My Documents
          </button>
          <button
            onClick={() => handleNavigate('review')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'review'
                ? 'bg-navy-800 text-white font-bold border border-accent-amber/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> Extraction Review
            {stats?.pending_reviews > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent-amber text-navy-950 font-bold">
                {stats.pending_reviews}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavigate('bank')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'bank'
                ? 'bg-navy-800 text-white font-bold border border-accent-violet/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent-violet" /> Question Bank
          </button>
          <button
            onClick={() => handleNavigate('coding')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'coding'
                ? 'bg-navy-800 text-white font-bold border border-accent-blue/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-accent-blue" /> Coding Practice
          </button>
          <button
            onClick={() => handleNavigate('exam')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'exam'
                ? 'bg-navy-800 text-white font-bold border border-accent-amber/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-accent-amber" /> Mock Exam
          </button>
          <button
            onClick={() => handleNavigate('revision')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'revision'
                ? 'bg-navy-800 text-white font-bold border border-accent-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-accent-cyan" /> Revision Center
          </button>
          <button
            onClick={() => handleNavigate('analytics')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              subView === 'analytics'
                ? 'bg-navy-800 text-white font-bold border border-accent-emerald/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-accent-emerald" /> Analytics
          </button>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('documents')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-blue text-navy-950 font-bold text-xs font-mono shadow-sm hover:bg-accent-blue/90 transition"
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF
          </button>
        </div>
      </div>

      {/* Main View Router */}
      {subView === 'overview' && (
        <QuestionVaultOverview
          stats={stats}
          onNavigateSubView={handleNavigate}
          onStartPracticeQuiz={handleStartPracticeQuiz}
          onStartExam={() => handleNavigate('exam')}
          onRefreshStats={fetchOverviewStats}
        />
      )}

      {subView === 'documents' && (
        <DocumentManager
          onNavigateToReview={(docId) => {
            if (docId) setSelectedDocId(docId);
            handleNavigate('review');
          }}
          onNavigateToBank={(docId) => {
            if (docId) setSelectedDocId(docId);
            handleNavigate('bank');
          }}
          onRefreshStats={fetchOverviewStats}
        />
      )}

      {subView === 'review' && (
        <ExtractionReview
          initialDocId={selectedDocId}
          onNavigateToBank={() => handleNavigate('bank')}
        />
      )}

      {subView === 'bank' && (
        <QuestionBank
          initialDocId={selectedDocId}
          onStartQuizWithFilter={handleStartQuizWithFilter}
          onOpenCodingPractice={(q) => {
            setActiveCodingQuestion(q);
            handleNavigate('coding');
          }}
        />
      )}

      {subView === 'coding' && (
        <CodingWorkspace
          initialQuestion={activeCodingQuestion}
          onOpenVisualizer={onOpenVisualizer}
        />
      )}

      {subView === 'quiz' && activeQuizId && (
        <QuizRunner
          quizId={activeQuizId}
          onExit={() => {
            setActiveQuizId(null);
            handleNavigate('overview');
          }}
          onOpenCodingPractice={(q) => setActiveCodingQuestion(q)}
        />
      )}

      {subView === 'quiz' && !activeQuizId && (
        <div className="p-12 text-center text-slate-400 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800 space-y-3">
          <p>No active quiz session selected.</p>
          <button
            onClick={handleStartPracticeQuiz}
            className="px-4 py-2 rounded-xl bg-accent-blue text-navy-950 font-bold"
          >
            Start New Practice Quiz
          </button>
        </div>
      )}

      {subView === 'exam' && (
        <MockExamConfig onStartExamSession={handleStartExamSession} />
      )}

      {subView === 'revision' && (
        <RevisionCenter
          onStartRevisionQuiz={(topics) => {
            handleStartQuizWithFilter({ topics });
          }}
          onOpenQuestionDetails={(q) => {
            if (q.question_type === 'programming') {
              setActiveCodingQuestion(q);
            } else {
              handleStartQuizWithFilter({ question_id: q.question_id });
            }
          }}
        />
      )}

      {subView === 'analytics' && <VaultAnalytics />}

      {/* Coding Practice Modal */}
      {activeCodingQuestion && (
        <CodingPracticeModal
          question={activeCodingQuestion}
          onClose={() => setActiveCodingQuestion(null)}
          onOpenVisualizer={onOpenVisualizer}
        />
      )}
    </div>
  );
};
