import { OperationResponse, DiagnosticCase } from '../types';

const BASE_URL = 'http://127.0.0.1:8000/api';

async function post<T>(endpoint: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Operation failed');
  }
  return data;
}

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Fetch failed');
  }
  return data;
}

async function patch<T>(endpoint: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Operation failed');
  }
  return data;
}

async function del<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Operation failed');
  }
  return data;
}

export const linkedListApi = {
  getState: () => get<any>('linked-list/state'),
  insertBeginning: (value: number) => post<OperationResponse>('linked-list/insert-beginning', { value }),
  insertEnd: (value: number) => post<OperationResponse>('linked-list/insert-end', { value }),
  insertPosition: (value: number, position: number) => post<OperationResponse>('linked-list/insert-position', { value, position }),
  deleteBeginning: () => post<OperationResponse>('linked-list/delete-beginning'),
  deleteEnd: () => post<OperationResponse>('linked-list/delete-end'),
  deletePosition: (position: number) => post<OperationResponse>('linked-list/delete-position', { position }),
  deleteValue: (value: number) => post<OperationResponse>('linked-list/delete-value', { value }),
  search: (target: number) => post<OperationResponse>('linked-list/search', { target }),
  reverse: () => post<OperationResponse>('linked-list/reverse'),
  findMiddle: () => post<OperationResponse>('linked-list/find-middle'),
  detectCycle: () => post<OperationResponse>('linked-list/detect-cycle'),
  reset: () => post<OperationResponse>('linked-list/reset'),
  clear: () => post<OperationResponse>('linked-list/clear'),
  downloadCSourceUrl: `${BASE_URL}/linked-list/c-source`
};

export const doublyLinkedListApi = {
  getState: () => get<any>('doubly-linked-list/state'),
  insertBeginning: (value: number) => post<OperationResponse>('doubly-linked-list/insert-beginning', { value }),
  insertEnd: (value: number) => post<OperationResponse>('doubly-linked-list/insert-end', { value }),
  deleteBeginning: () => post<OperationResponse>('doubly-linked-list/delete-beginning'),
  deleteEnd: () => post<OperationResponse>('doubly-linked-list/delete-end'),
  reverse: () => post<OperationResponse>('doubly-linked-list/reverse'),
  reset: () => post<any>('doubly-linked-list/reset')
};

export const circularLinkedListApi = {
  getState: () => get<any>('circular-linked-list/state'),
  insertBeginning: (value: number) => post<OperationResponse>('circular-linked-list/insert-beginning', { value }),
  insertEnd: (value: number) => post<OperationResponse>('circular-linked-list/insert-end', { value }),
  deleteBeginning: () => post<OperationResponse>('circular-linked-list/delete-beginning'),
  detectCycle: () => post<OperationResponse>('circular-linked-list/detect-cycle'),
  reset: () => post<any>('circular-linked-list/reset')
};

export const skipListApi = {
  getState: () => get<any>('skip-list/state'),
  insert: (key: number, value: number) => post<OperationResponse>('skip-list/insert', { key, value }),
  search: (key: number) => post<OperationResponse>('skip-list/search', { key }),
  delete: (key: number) => post<OperationResponse>('skip-list/delete', { key }),
  reset: () => post<any>('skip-list/reset')
};

export const arrayApi = {
  getState: () => get<any>('array/state'),
  insert: (index: number, value: number) => post<OperationResponse>('array/insert', { index, value }),
  delete: (index: number) => post<OperationResponse>('array/delete', { index }),
  update: (index: number, value: number) => post<OperationResponse>('array/update', { index, value }),
  search: (target: number) => post<OperationResponse>('array/search', { target }),
  reverse: () => post<OperationResponse>('array/reverse'),
  reset: () => post<any>('array/reset')
};

export const stackApi = {
  getState: () => get<any>('stack/state'),
  push: (value: number) => post<OperationResponse>('stack/push', { value }),
  pop: () => post<OperationResponse>('stack/pop'),
  peek: () => post<OperationResponse>('stack/peek'),
  reset: () => post<any>('stack/reset'),
  clear: () => post<any>('stack/clear')
};

export const queueApi = {
  getState: () => get<any>('queue/state'),
  enqueue: (value: number) => post<OperationResponse>('queue/enqueue', { value }),
  dequeue: () => post<OperationResponse>('queue/dequeue'),
  peek: () => post<OperationResponse>('queue/peek'),
  reset: () => post<any>('queue/reset'),
  clear: () => post<any>('queue/clear')
};

export const treeApi = {
  getState: () => get<any>('tree/state'),
  insert: (value: number) => post<OperationResponse>('tree/insert', { value }),
  search: (key: number) => post<OperationResponse>('tree/search', { key }),
  traverse: (mode: string) => post<OperationResponse>('tree/traverse', { mode }),
  reset: () => post<any>('tree/reset')
};

export const heapApi = {
  getState: () => get<any>('heap/state'),
  insert: (value: number) => post<OperationResponse>('heap/insert', { value }),
  toggleMode: () => post<any>('heap/toggle-mode')
};

export const graphApi = {
  getState: () => get<any>('graph/state'),
  bfs: (start_vertex: number = 0) => post<OperationResponse>('graph/bfs', { start_vertex }),
  dfs: (start_vertex: number = 0) => post<OperationResponse>('graph/dfs', { start_vertex }),
  dijkstra: (start_vertex: number = 0) => post<OperationResponse>('graph/dijkstra', { start_vertex }),
  reset: () => post<any>('graph/reset')
};

export const hashTableApi = {
  getState: () => get<any>('hash-table/state'),
  insert: (key: number, value: number) => post<OperationResponse>('hash-table/insert', { key, value }),
  search: (key: number) => post<OperationResponse>('hash-table/search', { key }),
  setMode: (mode: string) => post<any>('hash-table/mode', { mode }),
  reset: () => post<any>('hash-table/reset')
};

export const algorithmApi = {
  sort: (algorithm: string, array: number[]) => post<any>('algorithms/sort', { algorithm, array }),
  search: (algorithm: string, array: number[], key: number) => post<any>('algorithms/search', { algorithm, array, key }),
  compare: (algo1: string, algo2: string, array: number[]) => post<any>('algorithms/compare', { algo1, algo2, array })
};

export const detectiveApi = {
  getCases: () => get<DiagnosticCase[]>('detective/cases'),
  verify: (case_id: string, selected_option: number) =>
    post<{ is_correct: boolean; academic_explanation: string }>('detective/verify', { case_id, selected_option })
};

export const arenaApi = {
  getProblems: () => get<any[]>('arena/problems'),
  getProblem: (problemId: string) => get<any>(`arena/problems/${problemId}`),
  runCode: (problemId: string, code: string, mode: string = 'function') =>
    post<any>('arena/run', { problem_id: problemId, code, mode }),
  submitCode: (problemId: string, code: string, username: string = 'Vikas') =>
    post<any>('arena/submit', { problem_id: problemId, code, username }),
  compileCode: (code: string) => post<any>('arena/compile', { code }),
  executeRaw: (code: string, stdin: string = '') => post<any>('arena/execute-raw', { code, stdin }),
  visualize: (problemId: string, code: string) => post<any>('arena/visualize', { problem_id: problemId, code }),
  getSubmissions: (username: string = 'Vikas', problemId?: string) =>
    get<any[]>(`arena/submissions?username=${username}${problemId ? `&problem_id=${problemId}` : ''}`),
  getSavedSolution: (problemId: string, username: string = 'Vikas') =>
    get<any>(`arena/saved-solution/${problemId}?username=${username}`),
  saveSolution: (problemId: string, code: string, username: string = 'Vikas') =>
    post<any>('arena/save-solution', { problem_id: problemId, code, username })
};

export const vaultApi = {
  getOverview: () => get<any>('vault/overview'),
  getAnalytics: () => get<any>('vault/analytics'),
  getRevision: () => get<any>('vault/revision'),
  getDocuments: () => get<any[]>('vault/documents'),
  getDocument: (docId: string) => get<any>(`vault/documents/${docId}`),
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/vault/documents/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'PDF upload failed');
    return data;
  },
  renameDocument: (docId: string, newFilename: string) =>
    patch<any>(`vault/documents/${docId}/rename`, { new_filename: newFilename }),
  deleteDocument: (docId: string) => del<any>(`vault/documents/${docId}`),
  reprocessDocument: (docId: string) => post<any>(`vault/documents/${docId}/reprocess`),
  getQuestions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return get<any[]>(`vault/questions${qs ? `?${qs}` : ''}`);
  },
  getQuestion: (qId: string) => get<any>(`vault/questions/${qId}`),
  createQuestion: (data: any) => post<any>('vault/questions', data),
  updateQuestion: (qId: string, data: any) => patch<any>(`vault/questions/${qId}`, data),
  deleteQuestion: (qId: string) => del<any>(`vault/questions/${qId}`),
  toggleBookmark: (qId: string) => post<any>(`vault/questions/${qId}/bookmark`),
  bulkApprove: (questionIds: string[], targetStatus: string = 'approved') =>
    post<any>('vault/questions/bulk-approve', { question_ids: questionIds, target_status: targetStatus }),
  generateQuiz: (data: any) => post<any>('vault/quiz/generate', data),
  getQuiz: (quizId: string) => get<any>(`vault/quiz/${quizId}`),
  submitAnswer: (quizId: string, questionId: string, submittedAnswer: string, timeTaken: number = 0) =>
    post<any>('vault/quiz/answer', {
      quiz_id: quizId,
      question_id: questionId,
      submitted_answer: submittedAnswer,
      time_taken_seconds: timeTaken
    }),
  finishQuiz: (quizId: string, timeSpent: number = 0) =>
    post<any>('vault/quiz/finish', { quiz_id: quizId, time_spent_seconds: timeSpent }),
  executeCode: (questionId: string, sourceCode: string, userName: string = 'Student', stdin: string = '') =>
    post<any>('vault/code/execute', { question_id: questionId, source_code: sourceCode, user_name: userName, stdin }),
  traceCode: (questionId: string, sourceCode: string) =>
    post<any>('vault/code/trace', { question_id: questionId, source_code: sourceCode })
};
