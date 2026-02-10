// ============================================
// TASK INPUT VALIDATOR
// What: Validates incoming task strings (3–500 chars, trimmed)
// Why: Prevents empty/oversized inputs from reaching the AI API
// How: Uses Zod schema with trim + min/max constraints
// ============================================

import { z } from 'zod';
import { TaskRequest, ValidationResult } from '../types';

const taskRequestSchema = z.object({
  task: z
    .string()
    .trim()
    .min(3, 'Task must be at least 3 characters')
    .max(500, 'Task cannot exceed 500 characters'),
});

export function validateTaskRequest(input: unknown): ValidationResult<TaskRequest> {
  const result = taskRequestSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errorMessage = result.error.issues?.[0]?.message || 'Invalid input';

  return {
    success: false,
    error: errorMessage,
  };
}
