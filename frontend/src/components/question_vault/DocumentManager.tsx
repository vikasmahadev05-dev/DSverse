import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Edit3,
  Sparkles,
  FileSearch,
  Check,
  ExternalLink
} from 'lucide-react';
import { vaultApi } from '../../services/api';

interface DocumentManagerProps {
  onNavigateToReview: (docId?: string) => void;
  onNavigateToBank: (docId?: string) => void;
  onRefreshStats?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  onNavigateToReview,
  onNavigateToBank,
  onRefreshStats
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await vaultApi.getDocuments();
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid format: Please upload a standard PDF (.pdf) file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large: Maximum supported PDF file size is 50MB.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(25);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await vaultApi.uploadPdf(file);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchDocuments();
        if (res.document_id) {
          onNavigateToReview(res.document_id);
        }
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'PDF upload failed.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (window.confirm(`Are you sure you want to delete '${filename}' and all its extracted questions from the vault?`)) {
      try {
        await vaultApi.deleteDocument(docId);
        setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
        if (onRefreshStats) {
          onRefreshStats();
        }
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      await vaultApi.reprocessDocument(docId);
      alert('Document re-processing queued in background.');
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Reprocess failed');
    }
  };

  const handleSaveRename = async (docId: string) => {
    if (!renameText.trim()) return;
    try {
      await vaultApi.renameDocument(docId, renameText.trim());
      setRenameDocId(null);
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Rename failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-700 shadow-card">
        <div>
          <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-blue" /> Document Intelligence Manager
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Upload text and scanned question papers for automatic parsing, bounding &amp; topic classification.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white text-xs font-semibold shadow-glow-violet transition"
        >
          <Upload className="w-4 h-4" /> Browse Local PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-3xl p-8 lg:p-12 text-center transition-all ${dragActive
            ? 'border-accent-blue bg-accent-blue/10 scale-[1.01]'
            : 'border-navy-700 bg-navy-900/60 hover:border-slate-500'
          }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center mx-auto text-accent-blue shadow-inner">
            <Upload className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-white">
            Drag and drop course question papers or notes here
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Supports multi-page question banks, semester exam papers, and laboratory problem sheets (up to 50MB).
          </p>

          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden border border-navy-700">
                <div
                  className="h-full bg-gradient-to-r from-accent-indigo to-accent-blue transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-accent-cyan font-bold">
                Uploading and extracting questions... {uploadProgress}%
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-xs font-mono text-accent-rose">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Documents Repository Table */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700">
          <span className="text-xs font-mono uppercase font-semibold text-slate-300">
            Repository Archives ({documents.length} Files)
          </span>
          <button
            onClick={fetchDocuments}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition"
            title="Refresh repository list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            Loading document repository...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No PDF documents currently uploaded. Drag and drop a file above to begin.
          </div>
        ) : (
          <div className="divide-y divide-navy-800">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-navy-950/40 p-3 rounded-xl"
              >
                {/* Left: Document Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-navy-800 border border-navy-700 text-accent-blue flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {renameDocId === doc.document_id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={renameText}
                          onChange={(e) => setRenameText(e.target.value)}
                          className="px-2.5 py-1 bg-navy-950 border border-accent-blue rounded text-xs text-white font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(doc.document_id)}
                          className="p-1 text-accent-emerald hover:bg-navy-800 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-sm font-semibold text-white truncate max-w-sm lg:max-w-md">
                        {doc.filename}
                      </h4>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span>{doc.page_count} Pages</span>
                      <span>&bull;</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                      <span>&bull;</span>
                      <span>{doc.extracted_count} Extracted</span>
                      <span>&bull;</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${doc.processing_status === 'approved'
                            ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                            : doc.processing_status === 'review_required'
                              ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                              : doc.processing_status === 'failed'
                                ? 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30'
                                : 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                          }`}
                      >
                        {doc.processing_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {doc.processing_status === 'review_required' && (
                    <button
                      onClick={() => onNavigateToReview(doc.document_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-amber text-navy-950 font-bold text-xs font-mono shadow-sm transition hover:bg-accent-amber/90"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Review Questions ({doc.extracted_count})
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateToBank(doc.document_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-mono border border-navy-700 transition"
                    title="Inspect approved questions in Question Bank"
                  >
                    <FileSearch className="w-3.5 h-3.5" /> Question Bank
                  </button>

                  <a
                    href={`/api/vault/documents/${doc.document_id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-cyan-300 transition border border-navy-700 flex items-center gap-1 text-xs font-mono"
                    title="Open original PDF in browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleReprocess(doc.document_id)}
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition border border-navy-700"
                    title="Reprocess PDF extraction"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setRenameDocId(doc.document_id);
                      setRenameText(doc.filename);
                    }}
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition border border-navy-700"
                    title="Rename PDF"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(doc.document_id, doc.filename)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-medium transition"
                    title="Delete PDF document and its questions"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
