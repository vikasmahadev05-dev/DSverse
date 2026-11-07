import React, { useState, useEffect } from 'react';
import { detectiveApi } from '../services/api';
import { DiagnosticCase } from '../types';
import { ShieldAlert, CheckCircle2, XCircle, Code2, HelpCircle } from 'lucide-react';

export const DetectiveLab: React.FC = () => {
  const [cases, setCases] = useState<DiagnosticCase[]>([]);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; academic_explanation: string } | null>(null);

  useEffect(() => {
    detectiveApi.getCases().then(setCases).catch(console.error);
  }, []);

  const currentCase = cases[selectedCaseIdx] || null;

  const handleVerify = async () => {
    if (selectedOpt === null || !currentCase) return;
    try {
      const res = await detectiveApi.verify(currentCase.id, selectedOpt);
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCaseChange = (idx: number) => {
    setSelectedCaseIdx(idx);
    setSelectedOpt(null);
    setResult(null);
  };

  if (!currentCase) {
    return <div className="text-slate-500 font-mono text-xs">Loading Diagnostic Cases...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Case Header & Selector */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-accent-rose" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              DS Detective: Academic Code Inspection
            </h3>
            <p className="text-xs text-slate-400">
              Diagnose memory bugs, dangling pointers, and boundary defects in standard C implementations.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {cases.map((c, i) => (
            <button
              key={c.id}
              onClick={() => handleCaseChange(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                selectedCaseIdx === i
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              Case #{i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario & C Code (Col 7) */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white font-mono">{currentCase.title}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-rose/10 text-accent-rose border border-accent-rose/30">
                {currentCase.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentCase.scenario}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-accent-violet" />
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                Faulty C Source Code
              </span>
            </div>
            <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs overflow-x-auto custom-scrollbar border border-navy-800 text-slate-300 leading-relaxed">
              <pre>{currentCase.c_code}</pre>
            </div>
          </div>
        </div>

        {/* Diagnosis & Multiple Choice Form (Col 5) */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-mono uppercase font-bold text-accent-blue mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Identify the Architectural Defect
            </h4>

            <div className="space-y-2">
              {currentCase.options.map((opt, oIdx) => (
                <label
                  key={oIdx}
                  onClick={() => setSelectedOpt(oIdx)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                    selectedOpt === oIdx
                      ? 'border-accent-indigo bg-accent-indigo/15 text-white'
                      : 'border-navy-700 bg-navy-800/60 text-slate-300 hover:border-navy-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="case_option"
                    checked={selectedOpt === oIdx}
                    onChange={() => setSelectedOpt(oIdx)}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <span className="leading-relaxed font-sans">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={selectedOpt === null}
            className="w-full py-2.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:opacity-40 text-white font-semibold text-xs transition shadow-sm font-mono"
          >
            Submit Diagnostic Hypothesis
          </button>
        </div>
      </div>

      {/* Academic Feedback Card */}
      {result && (
        <div
          className={`p-5 rounded-2xl border shadow-card flex items-start gap-3 transition-all ${
            result.is_correct
              ? 'bg-accent-emerald/10 border-accent-emerald/40 text-slate-200'
              : 'bg-accent-rose/10 border-accent-rose/40 text-slate-200'
          }`}
        >
          {result.is_correct ? (
            <CheckCircle2 className="w-6 h-6 text-accent-emerald shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-accent-rose shrink-0 mt-0.5" />
          )}
          <div>
            <h4
              className={`text-xs font-bold font-mono uppercase mb-1 ${
                result.is_correct ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {result.is_correct ? 'Diagnostic Confirmed Correct' : 'Hypothesis Refuted'}
            </h4>
            <p className="text-xs font-mono leading-relaxed text-slate-300">
              {result.academic_explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

