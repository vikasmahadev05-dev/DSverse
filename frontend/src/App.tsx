import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { ExecutionControls } from './components/ExecutionControls';
import { CodeInspector } from './components/CodeInspector';
import { ExecutionLog } from './components/ExecutionLog';
import { ComplexityPanel } from './components/ComplexityPanel';
import { AlgorithmLab } from './components/AlgorithmLab';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { DetectiveLab } from './components/DetectiveLab';
import { ArrayVisualizer } from './components/ArrayVisualizer';
import { StackVisualizer } from './components/StackVisualizer';
import { QueueVisualizer } from './components/QueueVisualizer';
import { TreeVisualizer } from './components/TreeVisualizer';
import { HeapVisualizer } from './components/HeapVisualizer';
import { GraphVisualizer } from './components/GraphVisualizer';
import { HashTableVisualizer } from './components/HashTableVisualizer';
import { DoublyLinkedListVisualizer } from './components/DoublyLinkedListVisualizer';
import { CircularLinkedListVisualizer } from './components/CircularLinkedListVisualizer';
import { SkipListVisualizer } from './components/SkipListVisualizer';
import { DashboardOverview } from './components/DashboardOverview';
import { CodeArenaWorkspace } from './components/code_arena/CodeArenaWorkspace';
import { QuestionVaultWorkspace } from './components/question_vault/QuestionVaultWorkspace';
import { MobileDisclaimerModal } from './components/MobileDisclaimerModal';
import { linkedListApi } from './services/api';
import { ListNodeData, ExecutionStep, LogEntry, ComplexityData, MetricsData } from './types';
import { AlertTriangle, GitCommit, ArrowLeftRight, Repeat, FastForward } from 'lucide-react';

export const App: React.FC = () => {
  // Parse initial route from URL hash or localStorage so page refresh preserves active view
  const getInitialNav = (): string => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash) {
        return hash.split('/')[0];
      }
      const stored = localStorage.getItem('dsverse_active_nav');
      if (stored) return stored;
    } catch {
      // ignore
    }
    return 'overview';
  };

  const getInitialSubTab = (): 'singly' | 'doubly' | 'circular' | 'skip' => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash && hash.startsWith('linked-list/')) {
        const sub = hash.split('/')[1];
        if (['singly', 'doubly', 'circular', 'skip'].includes(sub)) {
          return sub as any;
        }
      }
      const stored = localStorage.getItem('dsverse_ll_subtab');
      if (stored && ['singly', 'doubly', 'circular', 'skip'].includes(stored)) {
        return stored as any;
      }
    } catch {
      // ignore
    }
    return 'singly';
  };

  const [activeNav, setActiveNav] = useState<string>(getInitialNav);
  const [linkedListSubTab, setLinkedListSubTab] = useState<'singly' | 'doubly' | 'circular' | 'skip'>(getInitialSubTab);

  // Linked List Visualizer State
  const [listNodes, setListNodes] = useState<ListNodeData[]>([]);
  const [headId, setHeadId] = useState<string | null>(null);

  // Step-Based Execution Engine State
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('System Ready');
  const [cCode, setCCode] = useState<string>(
    'NODE insert_beginning(NODE start, int info)\n{\n    NODE temp;\n    temp = (NODE)malloc(sizeof(struct Node));\n    if (temp == NULL) return start;\n    temp->data = info;\n    temp->next = start;\n    start = temp;\n    return start;\n}'
  );
  const [cStruct, setCStruct] = useState<string>('struct Node { int data; struct Node* next; };');
  const [activeCLine, setActiveCLine] = useState<number>(1);
  const [currentExplanation, setCurrentExplanation] = useState<string>('Initialization step.');

  const [complexity, setComplexity] = useState<ComplexityData>({
    time_best: 'O(1)',
    time_avg: 'O(1)',
    time_worst: 'O(1)',
    space_auxiliary: 'O(1)',
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    comparisons: 0,
    traversals: 0,
    pointer_assignments: 0,
    total_nodes: 4,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    { step: '00', text: 'DSVERSE Computer Science Laboratory Initialized.', type: 'info' },
  ]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle navigation changes with URL hash and storage synchronization
  const handleNavChange = (newNav: string) => {
    setActiveNav(newNav);
    setErrorMessage('');
    setIsPlaying(false);
    try {
      if (newNav === 'linked-list') {
        window.location.hash = `linked-list/${linkedListSubTab}`;
      } else {
        window.location.hash = newNav;
      }
      localStorage.setItem('dsverse_active_nav', newNav);
    } catch {
      // ignore
    }
  };

  const handleSubTabChange = (sub: 'singly' | 'doubly' | 'circular' | 'skip') => {
    setLinkedListSubTab(sub);
    try {
      window.location.hash = `linked-list/${sub}`;
      localStorage.setItem('dsverse_ll_subtab', sub);
    } catch {
      // ignore
    }
  };

  // Browser Back/Forward navigation listener
  useEffect(() => {
    const onHashChange = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '').trim();
        if (!hash) return;
        const parts = hash.split('/');
        const main = parts[0];
        const sub = parts[1];

        if (main && main !== activeNav) {
          setActiveNav(main);
          setErrorMessage('');
          setIsPlaying(false);
          localStorage.setItem('dsverse_active_nav', main);
        }
        if (main === 'linked-list' && sub && ['singly', 'doubly', 'circular', 'skip'].includes(sub)) {
          setLinkedListSubTab(sub as any);
          localStorage.setItem('dsverse_ll_subtab', sub);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeNav]);

  // Global reset handler targeting the currently active module
  const handleGlobalReset = () => {
    setErrorMessage('');
    setIsPlaying(false);

    if (activeNav === 'linked-list') {
      handleOperation(() => linkedListApi.reset(), 'Reset');
      setLogs([{ step: '00', text: 'Linked List laboratory state reset.', type: 'info' }]);
    } else if (activeNav === 'arrays') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-arrays'));
    } else if (activeNav === 'stacks') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-stacks'));
    } else if (activeNav === 'queues') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-queues'));
    } else if (activeNav === 'trees') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-trees'));
    } else if (activeNav === 'heaps') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-heaps'));
    } else if (activeNav === 'graphs') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-graphs'));
    } else if (activeNav === 'hash-tables') {
      window.dispatchEvent(new CustomEvent('dsverse-reset-hash-tables'));
    } else if (activeNav.startsWith('arena')) {
      window.dispatchEvent(new CustomEvent('dsverse-reset-arena'));
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const data = await linkedListApi.getState();
      setListNodes(data.nodes || []);
      setHeadId(data.head_id);
      if (data.c_struct) setCStruct(data.c_struct);
      setMetrics((prev) => ({ ...prev, total_nodes: data.total_nodes }));
    } catch (e) {
      console.warn('API Offline, utilizing client-fallback engine', e);
    }
  };

  const handleOperation = async (action: () => Promise<any>, opName: string) => {
    setErrorMessage('');
    setIsPlaying(false);
    try {
      const data = await action();
      if (data.steps && data.steps.length > 0) {
        setSteps(data.steps);
        setCurrentStepIndex(0);
        setCurrentOperation(data.operation || opName);
        if (data.c_code) setCCode(data.c_code);
        if (data.c_struct) setCStruct(data.c_struct);
        if (data.complexity) setComplexity(data.complexity);
        if (data.metrics) setMetrics(data.metrics);

        applyStep(data.steps[0]);

        const newLogs: LogEntry[] = data.steps.map((s: ExecutionStep) => ({
          step: s.step_number.toString().padStart(2, '0'),
          text: s.description,
          type: s.log_type,
        }));
        setLogs(newLogs);

        // Automatically animate execution step by step
        if (data.steps.length > 1) {
          setIsPlaying(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed.');
    }
  };

  const applyStep = (step: ExecutionStep) => {
    if (!step) return;
    setListNodes(step.nodes || []);
    setHeadId(step.head_id);
    setActiveCLine(step.c_line_number || 1);
    setCurrentExplanation(step.c_line_explanation || step.description);
    if (step.comparisons !== undefined || step.pointers_traversed !== undefined) {
      setMetrics((prev) => ({
        ...prev,
        comparisons: step.comparisons ?? prev.comparisons,
        traversals: step.pointers_traversed ?? prev.traversals,
        pointer_assignments: step.pointer_assignments ?? prev.pointer_assignments,
        total_nodes: step.nodes ? step.nodes.length : prev.total_nodes,
      }));
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      applyStep(steps[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      applyStep(steps[prevIdx]);
    }
  };

  const handlePlayToggle = () => {
    if (!isPlaying && steps.length > 0 && currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      applyStep(steps[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (steps.length > 0) {
      setCurrentStepIndex(0);
      applyStep(steps[0]);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0) {
      const interval = 1200 / speed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            applyStep(steps[next]);
            return next;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps]);

  return (
    <div className="w-full h-screen flex bg-navy-950 text-slate-200 overflow-hidden font-sans select-none cursor-default">
      {/* Mobile Screen Disclaimer Modal */}
      <MobileDisclaimerModal />

      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          onReset={handleGlobalReset}
          activeNav={activeNav}
          subTab={linkedListSubTab}
        />

        {errorMessage && (
          <div className="px-8 py-2 bg-accent-rose/15 border-b border-accent-rose/30 text-accent-rose text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {errorMessage}
            </span>
            <button onClick={() => setErrorMessage('')} className="hover:text-white">✕</button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* VIEW 0: OVERVIEW HUB */}
          {activeNav === 'overview' && <DashboardOverview onNavigate={handleNavChange} />}

          {/* VIEW 1: LINKED LIST VISUALIZER */}
          {activeNav === 'linked-list' && (
            <div className="space-y-4">
              {/* Variant Navigation Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-navy-900 border border-navy-700/80 rounded-xl font-mono text-xs">
                <button
                  onClick={() => handleSubTabChange('singly')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                    linkedListSubTab === 'singly'
                      ? 'bg-accent-blue text-navy-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" /> Singly Linked List
                </button>
                <button
                  onClick={() => handleSubTabChange('doubly')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                    linkedListSubTab === 'doubly'
                      ? 'bg-accent-violet text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Doubly Linked List
                </button>
                <button
                  onClick={() => handleSubTabChange('circular')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                    linkedListSubTab === 'circular'
                      ? 'bg-accent-emerald text-navy-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" /> Circular Linked List
                </button>
                <button
                  onClick={() => handleSubTabChange('skip')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                    linkedListSubTab === 'skip'
                      ? 'bg-accent-cyan text-navy-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <FastForward className="w-3.5 h-3.5" /> Skip List (O(log n))
                </button>
              </div>

              {/* Sub-tab 1: Singly */}
              {linkedListSubTab === 'singly' && (
                <>
                  <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-card flex flex-col">
                    <Canvas
                      nodes={listNodes}
                      headId={headId}
                      onReset={() => handleOperation(() => linkedListApi.reset(), 'Reset')}
                    />

                    <ExecutionControls
                      steps={steps}
                      currentStepIndex={currentStepIndex}
                      currentOperation={currentOperation}
                      isPlaying={isPlaying}
                      speed={speed}
                      onPlayToggle={handlePlayToggle}
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onRestart={handleRestart}
                      onSpeedChange={(s) => setSpeed(s)}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5">
                      <ControlPanel
                        onInsertBeginning={(val) => handleOperation(() => linkedListApi.insertBeginning(val), 'Insert Beginning')}
                        onInsertEnd={(val) => handleOperation(() => linkedListApi.insertEnd(val), 'Insert End')}
                        onInsertPosition={(val, pos) => handleOperation(() => linkedListApi.insertPosition(val, pos), `Insert Pos ${pos}`)}
                        onDeleteBeginning={() => handleOperation(() => linkedListApi.deleteBeginning(), 'Delete Beginning')}
                        onDeleteEnd={() => handleOperation(() => linkedListApi.deleteEnd(), 'Delete End')}
                        onDeletePosition={(pos) => handleOperation(() => linkedListApi.deletePosition(pos), `Delete Pos ${pos}`)}
                        onDeleteValue={(val) => handleOperation(() => linkedListApi.deleteValue(val), `Delete Val ${val}`)}
                        onSearch={(target) => handleOperation(() => linkedListApi.search(target), `Search ${target}`)}
                        onReverse={() => handleOperation(() => linkedListApi.reverse(), 'Reverse')}
                        onFindMiddle={() => handleOperation(() => linkedListApi.findMiddle(), 'Find Middle')}
                        onDetectCycle={() => handleOperation(() => linkedListApi.detectCycle(), 'Detect Cycle')}
                        onClear={() => handleOperation(() => linkedListApi.clear(), 'Clear')}
                        nodeCount={listNodes.length}
                      />
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                      <CodeInspector
                        cCode={cCode}
                        activeLine={activeCLine}
                        cStruct={cStruct}
                        explanation={currentExplanation}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ExecutionLog logs={logs} onClear={() => setLogs([])} />
                        <ComplexityPanel
                          complexity={complexity}
                          metrics={metrics}
                          currentOperation={currentOperation}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Sub-tab 2: Doubly Linked List */}
              {linkedListSubTab === 'doubly' && <DoublyLinkedListVisualizer />}

              {/* Sub-tab 3: Circular Linked List */}
              {linkedListSubTab === 'circular' && <CircularLinkedListVisualizer />}

              {/* Sub-tab 4: Skip List */}
              {linkedListSubTab === 'skip' && <SkipListVisualizer />}
            </div>
          )}

          {/* VIEW: ARRAYS */}
          {activeNav === 'arrays' && <ArrayVisualizer />}

          {/* VIEW: STACKS */}
          {activeNav === 'stacks' && <StackVisualizer />}

          {/* VIEW: QUEUES */}
          {activeNav === 'queues' && <QueueVisualizer />}

          {/* VIEW: TREES (BST) */}
          {activeNav === 'trees' && <TreeVisualizer />}

          {/* VIEW: HEAPS */}
          {activeNav === 'heaps' && <HeapVisualizer />}

          {/* VIEW: GRAPHS */}
          {activeNav === 'graphs' && <GraphVisualizer />}

          {/* VIEW: HASH TABLES */}
          {activeNav === 'hash-tables' && <HashTableVisualizer />}

          {/* VIEW: ALGORITHM LAB */}
          {activeNav === 'algorithm-lab' && <AlgorithmLab />}

          {/* VIEW: ALGORITHM COMPARISON */}
          {activeNav === 'comparison' && <AlgorithmComparison />}

          {/* VIEW: DS DETECTIVE */}
          {activeNav === 'detective' && <DetectiveLab />}

          {/* VIEW: CODE ARENA (LEETCODE + ONLINE COMPILER + VISUAL DEBUGGER) */}
          {activeNav === 'arena-practice' && (
            <CodeArenaWorkspace
              initialSubView="practice"
              onSubViewChange={(view) => handleNavChange(`arena-${view}`)}
            />
          )}

          {activeNav === 'arena-compiler' && (
            <CodeArenaWorkspace
              initialSubView="compiler"
              onSubViewChange={(view) => handleNavChange(`arena-${view}`)}
            />
          )}

          {activeNav === 'arena-debugger' && (
            <CodeArenaWorkspace
              initialSubView="debugger"
              onSubViewChange={(view) => handleNavChange(`arena-${view}`)}
            />
          )}

          {activeNav === 'arena-submissions' && (
            <CodeArenaWorkspace
              initialSubView="submissions"
              onSubViewChange={(view) => handleNavChange(`arena-${view}`)}
            />
          )}

          {activeNav === 'arena-library' && (
            <CodeArenaWorkspace
              initialSubView="library"
              onSubViewChange={(view) => handleNavChange(`arena-${view}`)}
            />
          )}

          {/* VIEW: QUESTION VAULT */}
          {activeNav.startsWith('vault') && (
            <QuestionVaultWorkspace
              initialSubView={activeNav.replace('vault-', '') || 'overview'}
              onSubViewChange={(view) => handleNavChange(`vault-${view}`)}
              onOpenVisualizer={(route) => {
                if (route.startsWith('linked-list/')) {
                  const sub = route.split('/')[1] as any;
                  setLinkedListSubTab(sub);
                  handleNavChange('linked-list');
                } else {
                  handleNavChange(route);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
