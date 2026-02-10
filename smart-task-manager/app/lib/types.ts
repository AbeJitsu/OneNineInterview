// ============================================
// SHARED TYPES
// What: TypeScript types for task requests, responses, and validation results
// Why: Single source of truth for the data shapes used across API, AI, and UI
// ============================================

export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Finance' | 'Other';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface TaskRequest {
  task: string;
}

export interface TaskResponse {
  category: TaskCategory;
  priority: TaskPriority;
  reasoning: string;
  due_date: string | null;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
