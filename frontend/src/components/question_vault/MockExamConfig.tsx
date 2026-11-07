import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  HelpCircle, 
  Play, 
  Check
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface MockExamConfigProps {
  onStartExamSession: (quizId: string) => void;
}

export const MockExamConfig: React.FC<MockExamConfigProps> = ({ onStartExamSession }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [examName, setExamName] = useState<string>('Midterm Assessment Simulator');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const availableTopics = [
    { id: 'linked-lists', label: 'Linked Lists' },
    { id: 'stacks', label: 'Stacks (LIFO)' },
    { id: 'queues', label: 'Queues (FIFO)' },
    { id: 'trees', label: 'Binary Search Trees' },
    { id: 'graphs', label: 'Graphs & Networks' },
    { id: 'heaps', label: 'Binary Heaps' },
    { id: 'hash-tables', label: 'Hash Tables' },
    { id: 'sorting', label: 'Sorting Algorithms' },
    { id: 'recursion', label: 'Recursion' },
    { id: 'c-programming', label: 'C Systems' }
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await vaultApi.getDocuments();
        setDocuments(data || []);
      } catch (err: any) {
        console.error('Fetch docs error:', err);
      }
    };
    fetchDocs();
  }, []);

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleLaunchExam = async () => {
    setIsLaunching(true);
    try {
      const res = await vaultApi.generateQuiz({
        quiz_name: examName.trim() || 'Mock Examination',
        quiz_mode: 'examination',
        document_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        num_questions: questionCount,
        time_limit_minutes: durationMinutes,
        negative_marking: negativeMarking
      });

      if (res && res.quiz_id) {
        onStartExamSession(res.quiz_id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate examination session');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 lg:p-8 shadow-card space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/15 border border-accent-amber/30 text-xs font-mono font-bold text-accent-amber">
          <Clock className="w-3.5 h-3.5" /> High-Stakes Examination Simulation
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-white font-sans">
          Configure Custom Mock Examination
        </h1>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          Select target documents and syllabus domains to simulate a strict examination environment with countdown timers and question palettes.
        </p>
      </div>

      {/* Main Parameters Card */}
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 lg:p-8 shadow-card space-y-6 font-mono text-xs">
        {/* Exam Title */}
        <div>
          <label className="text-slate-300 font-bold block mb-1.5">Examination Title</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-accent-blue"
          />
        </div>

        {/* Duration & Question Count Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-navy-950 rounded-2xl border border-navy-800">
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent-blue" /> Number of Questions
              </span>
              <span className="text-accent-cyan font-bold">{questionCount} Items</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-accent-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-amber" /> Time Limit (Duration)
              </span>
              <span className="text-accent-amber font-bold">{durationMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-accent-amber cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10m</span>
              <span>30m</span>
              <span>60m</span>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer mt-2 select-none">
              <input
                type="checkbox"
                checked={negativeMarking}
                onChange={(e) => setNegativeMarking(e.target.checked)}
                className="rounded border-navy-700 bg-navy-950 text-accent-blue focus:ring-0"
              />
              <span className="text-slate-300 font-bold text-xs">Enforce Negative Marking (-0.25 penalty per incorrect answer)</span>
            </label>
          </div>
        </div>

        {/* Document Filter Selection */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <span className="text-slate-300 font-bold block">
              Source PDF Documents (Leave unselected to pull from entire repository):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {documents.map((d) => (
                <div
                  key={d.document_id}
                  onClick={() => handleToggleDoc(d.document_id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedDocIds.includes(d.document_id)
                      ? 'bg-accent-blue/15 border-accent-blue text-white font-bold'
                      : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[220px]">{d.filename}</span>
                  {selectedDocIds.includes(d.document_id) && <Check className="w-4 h-4 text-accent-blue" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics Selection Grid */}
        <div className="space-y-2">
          <span className="text-slate-300 font-bold block">
            Topics Coverage (Leave unselected for comprehensive exam):
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableTopics.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTopic(t.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedTopics.includes(t.id)
                    ? 'bg-accent-violet/20 border-accent-violet text-white font-bold'
                    : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                {selectedTopics.includes(t.id) && <Check className="w-4 h-4 text-accent-violet" />}
              </div>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
          <span className="text-slate-500">
            Locked mode: Answers and explanations hidden until final submission.
          </span>
          <button
            onClick={handleLaunchExam}
            disabled={isLaunching}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-amber hover:bg-accent-amber/90 text-navy-950 font-bold text-xs font-mono shadow-sm transition disabled:opacity-40"
          >
            <Play className="w-4 h-4" /> {isLaunching ? 'Preparing...' : 'Begin Examination'}
          </button>
        </div>
      </div>
    </div>
  );
};
