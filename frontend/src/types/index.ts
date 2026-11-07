export interface ListNodeData {
  id: string;
  value: number;
  next_id: string | null;
  is_active?: boolean;
  is_new?: boolean;
  is_deleted?: boolean;
  is_head?: boolean;
  is_slow?: boolean;
  is_fast?: boolean;
  is_target?: boolean;
}

export interface ExecutionStep {
  step_number: number;
  description: string;
  nodes: ListNodeData[];
  head_id: string | null;
  active_node_id?: string | null;
  c_line_number: number;
  c_line_explanation: string;
  log_type: 'info' | 'pointer' | 'traverse' | 'success' | 'warning' | 'error';
  pointers_traversed: number;
  comparisons?: number;
  pointer_assignments?: number;
}

export interface ComplexityData {
  time_best: string;
  time_avg: string;
  time_worst: string;
  space_auxiliary: string;
}

export interface MetricsData {
  comparisons: number;
  traversals: number;
  pointer_assignments: number;
  total_nodes: number;
}

export interface OperationResponse {
  operation?: string;
  steps: ExecutionStep[];
  c_code?: string;
  c_struct?: string;
  complexity?: ComplexityData;
  metrics?: MetricsData;
  error?: boolean;
  message?: string;
  detail?: string;
}

export interface LogEntry {
  step: string;
  text: string;
  type: 'info' | 'pointer' | 'traverse' | 'success' | 'warning' | 'error';
}

export interface DiagnosticCase {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  scenario: string;
  c_code: string;
  options: string[];
  academic_explanation: string;
}
