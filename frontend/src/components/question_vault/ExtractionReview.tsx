import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Check, 
  Sparkles
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface ExtractionReviewProps {
  initialDocId?: string;
  onNavigateToBank: () => void;
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({
  initialDocId,
  onNavigateToBank
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const fetchDraftQuestions = async () => {
    setIsLoading(true);
    try {
      const docs = await vaultApi.getDocuments();
      setDocuments(docs || []);

      const qList = await vaultApi.getQuestions({
        document_id: selectedDocId || undefined,
        verification_status: 'pending_review'
      });
      setQuestions(qList || []);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to load draft questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftQuestions();
  }, [selectedDocId]);

  const handleApproveSingle = async (qId: string) => {
    try {
      await vaultApi.updateQuestion(qId, { verification_status: 'approved' });
      setQuestions((prev) => prev.filter((q) => q.question_id !== qId));
    } catch (err: any) {
      alert(err.message || 'Approve failed');
    }
  };

  const handleRejectSingle = async (qId: string) => {
    try {
      await vaultApi.updateQuestion(qId, { verification_status: 'rejected' });
      setQuestions((prev) => prev.filter((q) => q.question_id !== qId));
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await vaultApi.bulkApprove(selectedIds, 'approved');
      setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.question_id)));
      setSelectedIds([]);
    } catch (err: any) {
      alert(err.message || 'Bulk approve failed');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(questions.map((q) => q.question_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (qId: string) => {
    setSelectedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const startEdit = (q: any) => {
    setEditingQId(q.question_id);
    setEditForm({
      question_text: q.question_text,
      question_type: q.question_type,
      topic_id: q.topic_id,
      difficulty: q.difficulty,
      marks: q.marks,
      correct_answer: q.correct_answer || '',
      explanation: q.explanation || '',
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : []
    });
  };

  const saveEdit = async (qId: string) => {
    try {
      await vaultApi.updateQuestion(qId, editForm);
      setEditingQId(null);
      fetchDraftQuestions();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        <div>
          <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-amber" /> Extraction Quality Review
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Inspect AI &amp; deterministic parser extractions, adjust options/marks, and approve into Question Bank.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Document Filter Dropdown */}
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
          >
            <option value="">All Uploaded Documents</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>
                {d.filename}
              </option>
            ))}
          </select>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/90 text-navy-950 font-bold text-xs font-mono transition shadow-sm"
            >
              <Check className="w-4 h-4" /> Approve Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={onNavigateToBank}
            className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
          >
            Go to Active Bank &rarr;
          </button>
        </div>
      </div>

      {/* Draft Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-navy-900 rounded-2xl border border-navy-800">
            Scanning document extractions...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-navy-900 rounded-2xl border border-navy-800">
            <CheckCircle2 className="w-10 h-10 text-accent-emerald mx-auto" />
            <h3 className="text-sm font-bold text-white font-mono">
              All extracted questions have been reviewed and approved!
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Upload another PDF document or practice active questions in the Question Bank.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Select Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-navy-950/80 rounded-xl border border-navy-800 text-xs font-mono text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === questions.length && questions.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-navy-700 accent-accent-blue"
                />
                <span>Select All ({questions.length} Pending Review)</span>
              </label>
              <span>Provenance: Source Page &amp; Extraction Confidence</span>
            </div>

            {/* Individual Question Cards */}
            {questions.map((q) => {
              const isEditing = editingQId === q.question_id;

              return (
                <div
                  key={q.question_id}
                  className="p-5 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-card space-y-4 transition hover:border-navy-600"
                >
                  {/* Card Header: Checkbox, Question Number, Metadata Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(q.question_id)}
                        onChange={() => handleToggleSelect(q.question_id)}
                        className="rounded border-navy-700 accent-accent-blue"
                      />
                      <span className="text-xs font-mono font-bold text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30">
                        {q.question_number}
                      </span>
                      <span className="text-xs font-mono text-accent-cyan uppercase font-semibold">
                        {q.topic_id}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-xs font-mono text-slate-400">
                        Page {q.source_page}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {Math.round(q.extraction_confidence * 100)}% Confidence
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700 capitalize">
                        {q.question_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-800 text-accent-amber border border-navy-700">
                        {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Body: Editing Mode vs Display Mode */}
                  {isEditing ? (
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Question Text</label>
                        <textarea
                          rows={3}
                          value={editForm.question_text}
                          onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                          className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-accent-blue"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Topic</label>
                          <select
                            value={editForm.topic_id}
                            onChange={(e) => setEditForm({ ...editForm, topic_id: e.target.value })}
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
                            <option value="arrays">Arrays</option>
                            <option value="c-programming">C Programming</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Type</label>
                          <select
                            value={editForm.question_type}
                            onChange={(e) => setEditForm({ ...editForm, question_type: e.target.value })}
                            className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                          >
                            <option value="mcq">MCQ</option>
                            <option value="programming">Programming</option>
                            <option value="code_output">Code Output</option>
                            <option value="true_false">True / False</option>
                            <option value="short_answer">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Difficulty</label>
                          <select
                            value={editForm.difficulty}
                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                            className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Marks</label>
                          <input
                            type="number"
                            value={editForm.marks}
                            onChange={(e) => setEditForm({ ...editForm, marks: parseInt(e.target.value) || 1 })}
                            className="w-full p-2 bg-navy-950 border border-navy-700 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      {/* Options Editing */}
                      {editForm.options && editForm.options.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-slate-400 font-semibold block">MCQ Options:</span>
                          {editForm.options.map((opt: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-6 text-center font-bold text-accent-cyan">{opt.option_label}</span>
                              <input
                                type="text"
                                value={opt.option_text}
                                onChange={(e) => {
                                  const newOpts = [...editForm.options];
                                  newOpts[idx].option_text = e.target.value;
                                  setEditForm({ ...editForm, options: newOpts });
                                }}
                                className="flex-1 p-1.5 bg-navy-950 border border-navy-700 rounded text-white"
                              />
                              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${q.question_id}`}
                                  checked={opt.option_label === editForm.correct_answer}
                                  onChange={() => setEditForm({ ...editForm, correct_answer: opt.option_label })}
                                  className="accent-accent-emerald"
                                />
                                Correct
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingQId(null)}
                          className="px-3 py-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(q.question_id)}
                          className="px-3 py-1.5 rounded-lg bg-accent-blue text-navy-950 font-bold"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-sans text-white leading-relaxed whitespace-pre-wrap select-text cursor-text">
                        {q.question_text}
                      </p>

                      {/* Options Preview */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs font-mono">
                          {q.options.map((opt: any) => (
                            <div
                              key={opt.option_id || opt.option_label}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                opt.option_label === q.correct_answer
                                  ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald font-semibold'
                                  : 'bg-navy-950 border-navy-800 text-slate-300'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md bg-navy-900 border border-navy-700 flex items-center justify-center font-bold text-accent-cyan text-[10px]">
                                {opt.option_label}
                              </span>
                              <span>{opt.option_text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-navy-800 text-xs font-mono">
                    <span className="text-slate-500">Document: {q.document_name || 'Uploaded PDF'}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition border border-navy-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleRejectSingle(q.question_id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-accent-rose/20 text-slate-400 hover:text-accent-rose transition border border-navy-700"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApproveSingle(q.question_id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-emerald hover:bg-accent-emerald/90 text-navy-950 font-bold transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Publish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
