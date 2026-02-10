// ============================================
// AI RESPONSE PARSER
// What: Extracts and validates JSON from Claude's text response
// Why: Claude may wrap JSON in markdown or include extra text — this
//      reliably extracts the JSON object and validates it with Zod
// ============================================

import { z } from 'zod';
import { TaskResponse, TaskCategory, TaskPriority } from '../types';

const taskResponseSchema = z.object({
  category: z.enum(['Work', 'Personal', 'Health', 'Finance', 'Other']),
  priority: z.enum(['High', 'Medium', 'Low']),
  reasoning: z.string().min(1, 'Reasoning cannot be empty'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').nullable(),
});

export function parseAIResponse(responseText: string): TaskResponse {
  // Extract JSON from response (handle case where AI might add markdown)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }

  const jsonText = jsonMatch[0];

  // Parse and validate the JSON
  const parsed = JSON.parse(jsonText);
  const validated = taskResponseSchema.parse(parsed);

  return {
    category: validated.category as TaskCategory,
    priority: validated.priority as TaskPriority,
    reasoning: validated.reasoning,
    due_date: validated.due_date,
  };
}
