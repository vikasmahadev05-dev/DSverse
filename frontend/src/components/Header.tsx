import React from 'react';
import { RotateCcw, Download, HelpCircle } from 'lucide-react';
import { linkedListApi } from '../services/api';

interface HeaderProps {
  onReset: () => void;
  activeNav: string;
  subTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, activeNav, subTab }) => {
  let title = 'Singly Linked List Visualizer';
  let subtitle = 'Explore pointer manipulation through interactive execution';
  let breadcrumb = 'DS Universe / Linked Lists / Singly Linked List';

  if (activeNav === 'overview') {
    title = 'DSVERSE Laboratory Overview';
    subtitle = 'Data Structures Universe, Complexity Reference Matrix & Diagnostic Suite';
    breadcrumb = 'Workspace / Overview Hub';
  } else if (activeNav === 'linked-list') {
    if (subTab === 'doubly') {
      title = 'Doubly Linked List Visualizer';
      subtitle = 'Bidirectional pointer traversal, prev and next pointer linkage and in-place reversal';
      breadcrumb = 'DS Universe / Linked Lists / Doubly Linked List';
    } else if (subTab === 'circular') {
      title = 'Circular Linked List Visualizer';
      subtitle = 'Closed ring pointer topology with Floyd\'s cycle detection (Tortoise and Hare)';
      breadcrumb = 'DS Universe / Linked Lists / Circular Linked List';
    } else if (subTab === 'skip') {
      title = 'Skip List Visualizer';
      subtitle = 'Probabilistic multi-level express lanes with expected O(log n) efficiency';
      breadcrumb = 'DS Universe / Linked Lists / Skip List';
    }
  } else if (activeNav === 'arrays') {
    title = 'Array Data Structure Visualizer';
    subtitle = 'Contiguous physical memory layout, shifting animations and random access';
    breadcrumb = 'Data Structures / Linear / Fixed & Dynamic Array';
  } else if (activeNav === 'stacks') {
    title = 'Stack (LIFO) Visualizer';
    subtitle = 'Last-In First-Out vertical pointer manipulation with overflow & underflow checks';
    breadcrumb = 'Data Structures / Linear / Stack';
  } else if (activeNav === 'queues') {
    title = 'Circular Queue (FIFO) Visualizer';
    subtitle = 'First-In First-Out buffer with modulo wrap-around pointer arithmetic';
    breadcrumb = 'Data Structures / Linear / Queue';
  } else if (activeNav === 'trees') {
    title = 'Binary Search Tree (BST) Visualizer';
    subtitle = 'Hierarchical binary search, tree traversals (Inorder, Preorder, Postorder, BFS)';
    breadcrumb = 'Data Structures / Non-Linear / Binary Search Tree';
  } else if (activeNav === 'heaps') {
    title = 'Binary Heap & Priority Queue Visualizer';
    subtitle = 'Dual complete binary tree and contiguous array index visualization';
    breadcrumb = 'Data Structures / Non-Linear / Binary Heap';
  } else if (activeNav === 'graphs') {
    title = 'Graph & Network Visualizer';
    subtitle = 'Adjacency Matrix, Adjacency List, BFS, DFS and Dijkstra shortest path';
    breadcrumb = 'Data Structures / Non-Linear / Graph';
  } else if (activeNav === 'hash-tables') {
    title = 'Hash Table & Direct Addressing Visualizer';
    subtitle = 'Hash function modulo mapping, separate chaining and open addressing linear probing';
    breadcrumb = 'Data Structures / Hash Tables / Collision Resolution';
  } else if (activeNav === 'algorithm-lab') {
    title = 'Algorithm Laboratory';
    subtitle = 'Step-by-step sorting and searching execution with live C statement tracking';
    breadcrumb = 'Algorithm Lab / Sorting & Searching';
  } else if (activeNav === 'comparison') {
    title = 'Algorithm Performance Comparison';
    subtitle = 'Side-by-side empirical benchmark of time, comparisons and memory writes';
    breadcrumb = 'Algorithm Lab / Performance Benchmark';
  } else if (activeNav === 'detective') {
    title = 'DS Detective: Code Analysis';
    subtitle = 'Academic diagnostics of pointer corruptions, use-after-free and boundary bugs';
    breadcrumb = 'DS Detective / Diagnostic Cases';
  } else if (activeNav === 'arena-practice') {
    title = 'Code Arena: Practice Workspace';
    subtitle = 'Interactive C programming, GCC automated judge evaluation & live pointer debugging';
    breadcrumb = 'Code Arena / Practice Problems';
  } else if (activeNav === 'arena-compiler') {
    title = 'Code Arena: C Online Compiler';
    subtitle = 'Native GCC C11 isolated sandbox with standard I/O and runtime diagnostics';
    breadcrumb = 'Code Arena / Online Compiler';
  } else if (activeNav === 'arena-debugger') {
    title = 'Code Arena: Visual Debugger';
    subtitle = 'Step-by-step visual execution trace of actual C memory and pointer manipulation';
    breadcrumb = 'Code Arena / Visual Debugger';
  } else if (activeNav === 'arena-submissions') {
    title = 'Code Arena: Submissions & Verdicts';
    subtitle = 'Review past test verdicts, execution timings and code submissions';
    breadcrumb = 'Code Arena / My Submissions';
  } else if (activeNav === 'arena-library') {
    title = 'Code Arena: Problem Library';
    subtitle = 'LeetCode-style Data Structures problem catalog with automated test cases';
    breadcrumb = 'Code Arena / Problem Library';
  } else if (activeNav === 'vault-overview') {
    title = 'Question Vault: Laboratory Overview';
    subtitle = 'PDF Intelligence, Smart Question Bank, Interactive Quizzes & C Practice';
    breadcrumb = 'Question Vault / Overview';
  } else if (activeNav === 'vault-documents') {
    title = 'Question Vault: Document Intelligence';
    subtitle = 'Upload and manage course PDFs, exam papers, and laboratory problem sheets';
    breadcrumb = 'Question Vault / My Documents';
  } else if (activeNav === 'vault-review') {
    title = 'Question Vault: Extraction Review';
    subtitle = 'Verify parsed questions, correct options, and approve into active Question Bank';
    breadcrumb = 'Question Vault / Extraction Review';
  } else if (activeNav === 'vault-bank') {
    title = 'Question Vault: Smart Question Bank';
    subtitle = 'Searchable repository of multiple choice, conceptual, and C programming questions';
    breadcrumb = 'Question Vault / Question Bank';
  } else if (activeNav === 'vault-coding') {
    title = 'Question Vault: C Systems Coding Workspace';
    subtitle = 'Interactive C11 programming laboratory with real GCC 16.2.0 compilation, stdin & execution';
    breadcrumb = 'Question Vault / Coding Practice';
  } else if (activeNav === 'vault-quiz') {
    title = 'Question Vault: Interactive Quiz';
    subtitle = 'Real-time conceptual practice drill with immediate academic explanations';
    breadcrumb = 'Question Vault / Practice Quiz';
  } else if (activeNav === 'vault-exam') {
    title = 'Question Vault: Mock Examination';
    subtitle = 'Timed examination simulator with countdown timer and full question palette';
    breadcrumb = 'Question Vault / Mock Examination';
  } else if (activeNav === 'vault-revision') {
    title = 'Question Vault: Revision Center';
    subtitle = 'Spaced repetition targeting diagnosed weak topics and bookmarked questions';
    breadcrumb = 'Question Vault / Revision Center';
  } else if (activeNav === 'vault-analytics') {
    title = 'Question Vault: Performance Intelligence';
    subtitle = 'Domain-level accuracy metrics, attempt history, and weak spot analysis';
    breadcrumb = 'Question Vault / Performance Analytics';
  }

  return (
    <header className="h-16 border-b border-navy-700 bg-navy-900/80 backdrop-blur px-8 flex items-center justify-between flex-shrink-0 z-10 select-none cursor-default">
      <div>
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
          <span>{breadcrumb}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-blue/10 text-accent-blue border border-accent-blue/30 tracking-wider">
            ANSI C MAPPED
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-400 hidden xl:block">
          {subtitle}
        </p>

        {activeNav === 'linked-list' && (
          <a
            href={linkedListApi.downloadCSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-accent-emerald border border-accent-emerald/30 transition shadow-sm"
            title="Download complete compilable ANSI C program"
          >
            <Download className="w-3.5 h-3.5" /> Download .c
          </a>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-600 transition"
          title="Reset to original state"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
        </button>

        <button
          className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white border border-navy-600 flex items-center justify-center transition"
          title="Module Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
