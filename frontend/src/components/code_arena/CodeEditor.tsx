import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { RotateCcw, Maximize2, Minimize2, Sparkles, FileCode } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  highlightLine?: number | null;
  onReset: () => void;
  language?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  highlightLine,
  onReset,
  language = 'c',
  readOnly = false
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [fontSize, setFontSize] = React.useState<number>(14);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom laboratory dark theme
    monaco.editor.defineTheme('dsverse-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'string', foreground: '34d399' }
      ],
      colors: {
        'editor.background': '#070b14',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editor.lineHighlightBackground': '#0f172a50',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#38bdf830'
      }
    });

    monaco.editor.setTheme('dsverse-dark');
  };

  // Synchronize line highlighting when stepping in visual debugger or clicking compiler error
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (highlightLine && highlightLine > 0) {
      editor.revealLineInCenter(highlightLine);
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(highlightLine, 1, highlightLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-accent-violet/25 border-l-4 border-accent-blue',
            glyphMarginClassName: 'bg-accent-blue'
          }
        }
      ]);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [highlightLine]);

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-navy-950 border border-navy-700 rounded-2xl overflow-hidden shadow-card transition-all ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-navy-900 border-b border-navy-700/80">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-accent-blue" />
          <span className="text-xs font-mono font-semibold text-slate-200">solution.c</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-accent-cyan border border-navy-700">
            ANSI C11 (GCC)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-navy-800 px-2 py-1 rounded border border-navy-700">
            <span>Size:</span>
            {[12, 14, 16].map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`px-1 rounded ${fontSize === sz ? 'text-accent-blue font-bold bg-navy-700' : 'hover:text-slate-200'}`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Format Code */}
          <button
            onClick={handleFormatCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 rounded border border-navy-700 transition"
            title="Auto Format C Code"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> Format
          </button>

          {/* Reset Code */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-rose-400 bg-navy-800 hover:bg-navy-700 rounded border border-navy-700 transition"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-400 hover:text-white bg-navy-800 hover:bg-navy-700 rounded border border-navy-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full min-h-[300px]">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(newVal) => onChange(newVal || '')}
          onMount={handleEditorDidMount}
          theme="dsverse-dark"
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            tabSize: 4,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};
