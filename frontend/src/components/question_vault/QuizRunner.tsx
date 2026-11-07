import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  Award, 
  Lightbulb, 
  Check, 
  Code2
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface QuizRunnerProps {
  quizId: string;
  onExit: () => void;
  onOpenCodingPractice?: (question: any) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quizId,
  onExit,
  onOpenCodingPractice
}) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [practiceFeedback, setPracticeFeedback] = useState<Record<string, any>>({});

  // Countdown Timer for Examination Mode
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const data = await vaultApi.getQuiz(quizId);
        setQuiz(data);
        if (data.questions && data.questions.length > 0) {
          setVisitedQuestions([data.questions[0].question_id]);
        }
        if (data.time_limit_minutes) {
          setSecondsRemaining(data.time_limit_minutes * 60);
        }
      } catch (err: any) {
        console.error('Failed to load quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!quiz || quiz.quiz_mode !== 'examination' || isFinished || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isFinished, secondsRemaining]);

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIdx] || null;

  const handleSelectOption = async (optionLabel: string) => {
    if (!currentQ || isFinished) return;
    const qId = currentQ.question_id;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionLabel }));

    // In Practice Mode: Provide instant feedback
    if (quiz.quiz_mode === 'practice') {
      try {
        const res = await vaultApi.submitAnswer(quizId, qId, optionLabel, 15);
        setPracticeFeedback((prev) => ({ ...prev, [qId]: res }));
      } catch (err: any) {
        console.error('Submit answer error:', err);
      }
    }
  };

  const handleToggleReview = (qId: string) => {
    setMarkedForReview((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleNavigateQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIdx(idx);
    setShowHint(false);
    const nextQId = questions[idx]?.question_id;
    if (nextQId && !visitedQuestions.includes(nextQId)) {
      setVisitedQuestions((prev) => [...prev, nextQId]);
    }
  };

  const handleFinishQuiz = async () => {
    try {
      // In exam mode, submit all uncommitted answers
      if (quiz.quiz_mode === 'examination') {
        for (const [qId, ans] of Object.entries(selectedAnswers)) {
          await vaultApi.submitAnswer(quizId, qId, ans, 20);
        }
      }
      const timeSpent = quiz.time_limit_minutes ? (quiz.time_limit_minutes * 60 - secondsRemaining) : 120;
      const results = await vaultApi.finishQuiz(quizId, timeSpent);
      setQuizResults(results);
      setIsFinished(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800">
        Initializing interactive examination session...
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800 space-y-3">
        <p>No questions available for this session.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-navy-800 text-white font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // ============================================================
  // POST-EXAM RESULTS SCREEN
  // ============================================================
  if (isFinished && quizResults) {
    const score = quizResults.score || 0;
    const totalMarks = quizResults.total_marks || questions.length;
    const accuracy = quizResults.accuracy_pct || (totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0);

    return (
      <div className="space-y-6">
        {/* Scorecard Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700 p-8 shadow-card text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent-emerald/15 border border-accent-emerald/30 flex items-center justify-center mx-auto text-accent-emerald shadow-glow-emerald">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-sans">
            Examination Complete
          </h2>
          <div className="flex justify-center items-baseline gap-2 font-mono">
            <span className="text-4xl font-extrabold text-accent-emerald">{score}</span>
            <span className="text-slate-400 text-xl font-bold">/ {totalMarks} Marks</span>
            <span className="text-sm font-semibold text-accent-cyan ml-2">({accuracy}%)</span>
          </div>

          <p className="text-xs font-mono text-slate-400">
            Session submitted. Review question solutions and academic explanations below.
          </p>

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-semibold text-xs shadow-glow-violet transition"
            >
              Finish &amp; Return to Vault
            </button>
          </div>
        </div>

        {/* Detailed Solutions Breakdown */}
        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-navy-800">
            Item-by-Item Verification &amp; Solutions
          </h3>

          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const userAns = selectedAnswers[q.question_id];
              const isCorrect = userAns && q.correct_answer && (userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase());

              return (
                <div
                  key={q.question_id}
                  className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                    isCorrect
                      ? 'bg-accent-emerald/5 border-accent-emerald/30'
                      : userAns
                      ? 'bg-accent-rose/5 border-accent-rose/30'
                      : 'bg-navy-950 border-navy-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Q{idx + 1}. {q.question_number} ({q.topic_id})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCorrect ? 'text-accent-emerald bg-accent-emerald/15' : 'text-accent-rose bg-accent-rose/15'
                    }`}>
                      {isCorrect ? 'CORRECT' : userAns ? 'INCORRECT' : 'UNANSWERED'}
                    </span>
                  </div>

                  <p className="text-slate-200 font-sans text-xs">{q.question_text}</p>

                  <div className="flex items-center gap-4 text-[11px] pt-1">
                    <span>Your Answer: <strong className={isCorrect ? 'text-accent-emerald' : 'text-accent-rose'}>{userAns || 'None'}</strong></span>
                    <span>Correct Answer: <strong className="text-accent-emerald">{q.correct_answer || 'Pending evaluation'}</strong></span>
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-[11px] text-slate-300">
                      <strong className="text-accent-cyan">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE QUIZ INTERFACE
  // ============================================================
  const feedback = practiceFeedback[currentQ?.question_id];
  const isAnswered = Boolean(selectedAnswers[currentQ?.question_id]);
  const isReviewed = markedForReview.includes(currentQ?.question_id);

  return (
    <div className="space-y-4">
      {/* Quiz Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition border border-navy-700"
            title="Exit Session"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">{quiz.quiz_name}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-navy-800 text-accent-cyan border border-navy-700">
                {quiz.quiz_mode} Mode
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Question {currentIdx + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Timer or Status */}
        <div className="flex items-center gap-3">
          {quiz.quiz_mode === 'examination' && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsRemaining < 300
                ? 'bg-accent-rose/15 border-accent-rose text-accent-rose animate-pulse'
                : 'bg-navy-950 border-navy-700 text-white'
            }`}>
              <Clock className="w-3.5 h-3.5" /> {formatTimer(secondsRemaining)}
            </div>
          )}

          <button
            onClick={() => handleToggleReview(currentQ.question_id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono transition border ${
              isReviewed
                ? 'bg-accent-amber/20 border-accent-amber text-accent-amber font-bold'
                : 'bg-navy-800 border-navy-700 text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> {isReviewed ? 'Marked' : 'Mark for Review'}
          </button>

          <button
            onClick={handleFinishQuiz}
            className="px-4 py-1.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/90 text-navy-950 font-bold text-xs font-mono shadow-sm transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Main Grid: Question Panel (Left) & Navigation Palette (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Question Display & Options */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card space-y-6">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-3 border-b border-navy-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded border border-accent-blue/30">
                {currentQ.question_number}
              </span>
              <span className="text-accent-cyan uppercase font-semibold">
                {currentQ.topic_id}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400">Page {currentQ.source_page}</span>
              {isAnswered && <span className="text-accent-emerald text-[11px] font-bold">&bull; Answered</span>}
            </div>

            <span className="text-accent-amber font-bold">
              {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
            </span>
          </div>

          {/* Question Body */}
          <div className="text-base font-sans text-white leading-relaxed select-text cursor-text whitespace-pre-wrap">
            {currentQ.question_text}
          </div>

          {onOpenCodingPractice && (currentQ.question_type === 'programming' || currentQ.question_type === 'debugging' || currentQ.question_type === 'coding' || currentQ.c_starter_code) && (
            <div className="pt-2">
              <button
                onClick={() => onOpenCodingPractice(currentQ)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue/15 border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/25 rounded-xl font-mono text-xs font-bold transition shadow-glow-blue"
              >
                <Code2 className="w-4 h-4" /> Open in C Systems Workspace (Type &amp; Compile)
              </button>
            </div>
          )}

          {/* Options Display */}
          {currentQ.options && currentQ.options.length > 0 && (
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt: any) => {
                const isSelected = selectedAnswers[currentQ.question_id] === opt.option_label;
                const isPractice = quiz.quiz_mode === 'practice';
                const isCorrectOption = opt.option_label === currentQ.correct_answer;

                let borderStyle = 'border-navy-700 bg-navy-950/70 text-slate-200 hover:border-accent-blue/50';
                if (isPractice && isSelected) {
                  borderStyle = isCorrectOption
                    ? 'border-accent-emerald bg-accent-emerald/15 text-accent-emerald font-bold'
                    : 'border-accent-rose bg-accent-rose/15 text-accent-rose font-bold';
                } else if (isSelected) {
                  borderStyle = 'border-accent-blue bg-accent-blue/15 text-white font-bold shadow-glow-blue';
                }

                return (
                  <div
                    key={opt.option_label}
                    onClick={() => handleSelectOption(opt.option_label)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${borderStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-navy-900 border border-navy-700 flex items-center justify-center font-mono font-bold text-xs text-accent-cyan">
                        {opt.option_label}
                      </span>
                      <span className="text-xs font-mono">{opt.option_text}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-accent-blue flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Written / Analytical Response Input for questions without MCQ options */}
          {(!currentQ.options || currentQ.options.length === 0) && (
            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-300">
                  Your Solution / Written Explanation:
                </span>
                <span className="text-[10px] text-slate-500">Auto-recorded with submission</span>
              </div>
              <textarea
                value={selectedAnswers[currentQ.question_id] || ''}
                onChange={(e) => handleSelectOption(e.target.value)}
                placeholder="Type your analytical solution, calculation, or reason here..."
                rows={5}
                className="w-full p-3.5 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-accent-blue"
              />
            </div>
          )}

          {/* Instant Practice Explanation in Practice Mode */}
          {quiz.quiz_mode === 'practice' && feedback && (
            <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
              feedback.is_correct ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald' : 'bg-accent-rose/10 border-accent-rose text-accent-rose'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {feedback.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{feedback.is_correct ? 'Correct Answer!' : 'Incorrect Answer.'}</span>
              </div>
              {currentQ.explanation && (
                <p className="text-slate-300 font-sans mt-1">
                  <strong>Academic Explanation:</strong> {currentQ.explanation}
                </p>
              )}
            </div>
          )}

          {/* Hint Reveal (Practice Mode) */}
          {quiz.quiz_mode === 'practice' && (
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Reveal Conceptual Hint'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs font-mono text-slate-300">
                  Focus on the pointer update sequence: identify if memory is allocated before assigning the next pointer reference.
                </div>
              )}
            </div>
          )}

          {/* Bottom Stepping Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-navy-800 text-xs font-mono">
            <button
              onClick={() => handleNavigateQuestion(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-30 text-slate-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
            </button>

            <button
              onClick={() => handleNavigateQuestion(currentIdx + 1)}
              disabled={currentIdx >= questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-blue text-navy-950 font-bold hover:bg-accent-blue/90 disabled:opacity-30 transition"
            >
              Next Question <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Question Palette Navigation Grid */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-navy-800">
            Question Palette
          </h3>

          <div className="grid grid-cols-5 gap-2 font-mono text-xs">
            {questions.map((q: any, idx: number) => {
              const isCurrent = idx === currentIdx;
              const hasAnswered = Boolean(selectedAnswers[q.question_id]);
              const isMarked = markedForReview.includes(q.question_id);

              let boxStyle = 'bg-navy-950 text-slate-400 border-navy-800';
              if (isCurrent) {
                boxStyle = 'border-accent-blue bg-accent-blue/20 text-white font-bold ring-2 ring-accent-blue/50';
              } else if (isMarked) {
                boxStyle = 'border-accent-amber bg-accent-amber/20 text-accent-amber font-bold';
              } else if (hasAnswered) {
                boxStyle = 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald font-bold';
              }

              return (
                <button
                  key={q.question_id}
                  onClick={() => handleNavigateQuestion(idx)}
                  className={`h-9 rounded-lg border flex items-center justify-center transition ${boxStyle}`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-navy-800 space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-accent-emerald/20 border border-accent-emerald" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-accent-amber/20 border border-accent-amber" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-navy-950 border border-navy-800" />
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
