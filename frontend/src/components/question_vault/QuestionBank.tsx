import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Play, 
  Code2,
  ExternalLink
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface QuestionBankProps {
  initialDocId?: string;
  onStartQuizWithFilter: (filters: any) => void;
  onOpenCodingPractice: (question: any) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  initialDocId,
  onStartQuizWithFilter,
  onOpenCodingPractice
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);

  // Manual Question Create Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<any>({
    question_text: '',
    question_type: 'mcq',
    topic_id: 'linked-lists',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { option_label: 'A', option_text: '', is_correct: true },
      { option_label: 'B', option_text: '', is_correct: false },
      { option_label: 'C', option_text: '', is_correct: false },
      { option_label: 'D', option_text: '', is_correct: false }
    ],
    correct_answer: 'A',
    explanation: ''
  });

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const docs = await vaultApi.getDocuments();
      setDocuments(docs || []);

      const data = await vaultApi.getQuestions({
        document_id: selectedDocId || undefined,
        topic_id: selectedTopic || undefined,
        difficulty: selectedDifficulty || undefined,
        question_type: selectedType || undefined,
        verification_status: 'approved',
        search_query: searchQuery || undefined,
        bookmarked_only: bookmarkedOnly
      });
      setQuestions(data || []);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedDocId, selectedTopic, selectedDifficulty, selectedType, bookmarkedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleToggleBookmark = async (qId: string) => {
    try {
      const res = await vaultApi.toggleBookmark(qId);
      setQuestions((prev) =>
        prev.map((q) => (q.question_id === qId ? { ...q, is_bookmarked: res.is_bookmarked } : q))
      );
    } catch (err: any) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vaultApi.createQuestion(newQuestion);
      setIsAddModalOpen(false);
      setNewQuestion({
        question_text: '',
        question_type: 'mcq',
        topic_id: 'linked-lists',
        difficulty: 'Medium',
        marks: 1,
        options: [
          { option_label: 'A', option_text: '', is_correct: true },
          { option_label: 'B', option_text: '', is_correct: false },
          { option_label: 'C', option_text: '', is_correct: false },
          { option_label: 'D', option_text: '', is_correct: false }
        ],
        correct_answer: 'A',
        explanation: ''
      });
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Failed to create question');
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30';
      case 'medium':
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber/30';
      case 'hard':
        return 'bg-accent-rose/10 text-accent-rose border-accent-rose/30';
      default:
        return 'bg-navy-800 text-slate-300 border-navy-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, code syntax, or question ID..."
              className="w-full pl-9 pr-4 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-accent-blue"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartQuizWithFilter({ topic: selectedTopic, difficulty: selectedDifficulty })}
              disabled={questions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:opacity-40 text-white font-semibold text-xs shadow-glow-violet transition"
            >
              <Play className="w-3.5 h-3.5" /> Quiz from Filter ({questions.length})
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold border border-navy-600 transition"
            >
              <Plus className="w-4 h-4 text-accent-blue" /> Add Manual Question
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-navy-800 text-xs font-mono">
          {/* Document Filter */}
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="p-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="">All Documents</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>
                {d.filename}
              </option>
            ))}
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="p-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="">All Topics</option>
            <option value="linked-lists">Linked Lists</option>
            <option value="stacks">Stacks</option>
            <option value="queues">Queues</option>
            <option value="trees">Trees (BST)</option>
            <option value="graphs">Graphs</option>
            <option value="heaps">Binary Heaps</option>
            <option value="hash-tables">Hash Tables</option>
            <option value="sorting">Sorting Algorithms</option>
            <option value="searching">Searching</option>
            <option value="recursion">Recursion</option>
            <option value="arrays">Arrays</option>
            <option value="c-programming">C Systems</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Question Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="">All Question Types</option>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="programming">C Programming Code</option>
            <option value="code_output">Code Output Prediction</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short / Descriptive</option>
          </select>

          {/* Bookmarked Filter Button */}
          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition ${
              bookmarkedOnly
                ? 'bg-accent-amber/20 border-accent-amber text-accent-amber font-bold'
                : 'bg-navy-950 border-navy-700 text-slate-400 hover:text-white'
            }`}
          >
            {bookmarkedOnly ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            Bookmarked Only
          </button>
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800">
            Querying active question bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800">
            No approved questions match the selected filter parameters.
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.question_id}
              className="p-5 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-card space-y-3 transition hover:border-navy-600"
            >
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-navy-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30">
                    {q.question_number}
                  </span>
                  <span className="text-xs font-mono text-accent-cyan uppercase font-semibold">
                    {q.topic_id}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs font-mono text-accent-amber">
                    {q.marks} Mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    {q.document_id ? (
                      <a
                        href={`/api/vault/documents/${q.document_id}/file#page=${q.source_page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                        title="View page in source PDF"
                      >
                        <span>Page {q.source_page}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span>Page {q.source_page}</span>
                    )}
                    <span>&bull; {q.document_name || 'Standard Exam'}</span>
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(q.question_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-accent-amber transition"
                    title={q.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                  >
                    {q.is_bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-accent-amber" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-sans text-white leading-relaxed select-text cursor-text">
                {q.question_text}
              </p>

              {/* Options (if MCQ) */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs font-mono">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.option_label}
                      className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center gap-2 text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-md bg-navy-900 border border-navy-700 flex items-center justify-center font-bold text-accent-cyan text-[10px]">
                        {opt.option_label}
                      </span>
                      <span>{opt.option_text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons: If Programming, open C IDE */}
              <div className="flex items-center justify-between pt-2 border-t border-navy-800 text-xs font-mono">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Type: {q.question_type.replace('_', ' ')}
                </span>

                <div className="flex items-center gap-2">
                  {(q.question_type === 'programming' || q.question_type === 'debugging' || q.c_starter_code) ? (
                    <button
                      onClick={() => onOpenCodingPractice(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue border border-accent-blue/40 font-bold transition shadow-glow-blue"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Practice in C Workspace
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartQuizWithFilter({ question_id: q.question_id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-accent-emerald" /> Practice Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-xl w-full shadow-card space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-bold text-white font-sans">Add Question Manually</h3>
            <form onSubmit={handleCreateQuestionSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  placeholder="Enter problem or question statement..."
                  className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Topic</label>
                  <select
                    value={newQuestion.topic_id}
                    onChange={(e) => setNewQuestion({ ...newQuestion, topic_id: e.target.value })}
                    className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                  >
                    <option value="linked-lists">Linked Lists</option>
                    <option value="stacks">Stacks</option>
                    <option value="queues">Queues</option>
                    <option value="trees">Trees</option>
                    <option value="graphs">Graphs</option>
                    <option value="heaps">Heaps</option>
                    <option value="hash-tables">Hash Tables</option>
                    <option value="sorting">Sorting</option>
                    <option value="searching">Searching</option>
                    <option value="c-programming">C Systems</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Type</label>
                  <select
                    value={newQuestion.question_type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                    className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="programming">Programming</option>
                    <option value="code_output">Code Output</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options if MCQ */}
              {newQuestion.question_type === 'mcq' && (
                <div className="space-y-2 pt-2">
                  <span className="text-slate-400 font-semibold block">Options:</span>
                  {newQuestion.options.map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-accent-cyan">{opt.option_label}</span>
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => {
                          const updated = [...newQuestion.options];
                          updated[idx].option_text = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updated });
                        }}
                        placeholder={`Option ${opt.option_label}`}
                        className="flex-1 p-2 bg-navy-950 border border-navy-700 rounded text-white"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-slate-400">
                        <input
                          type="radio"
                          name="new-correct"
                          checked={opt.option_label === newQuestion.correct_answer}
                          onChange={() => setNewQuestion({ ...newQuestion, correct_answer: opt.option_label })}
                          className="accent-accent-emerald"
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Academic explanation of correct answer..."
                  className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-blue text-navy-950 font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
