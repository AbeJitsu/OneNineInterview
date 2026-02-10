// ============================================
// TASK VALIDATOR UNIT TESTS
// What: Boundary and edge-case tests for the input validator
// Why: Ensures invalid/oversized/empty inputs are rejected before hitting the AI
// ============================================

import { describe, it, expect } from 'vitest';
import { validateTaskRequest } from '../lib/validation/task-validator';

describe('validateTaskRequest', () => {
  it('accepts valid task input', () => {
    const result = validateTaskRequest({ task: 'Fix the login bug' });
    expect(result.success).toBe(true);
    expect(result.data?.task).toBe('Fix the login bug');
  });

  it('rejects empty string', () => {
    const result = validateTaskRequest({ task: '' });
    expect(result.success).toBe(false);
  });

  it('rejects input shorter than 3 characters', () => {
    const result = validateTaskRequest({ task: 'ab' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('3 characters');
  });

  it('rejects input longer than 500 characters', () => {
    const result = validateTaskRequest({ task: 'a'.repeat(501) });
    expect(result.success).toBe(false);
    expect(result.error).toContain('500');
  });

  it('accepts exactly 3 characters', () => {
    const result = validateTaskRequest({ task: 'abc' });
    expect(result.success).toBe(true);
  });

  it('accepts exactly 500 characters', () => {
    const result = validateTaskRequest({ task: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });

  it('trims whitespace before validation', () => {
    const result = validateTaskRequest({ task: '  ab  ' });
    expect(result.success).toBe(false);
  });

  it('rejects missing task field', () => {
    const result = validateTaskRequest({});
    expect(result.success).toBe(false);
  });

  it('rejects non-string task', () => {
    const result = validateTaskRequest({ task: 123 });
    expect(result.success).toBe(false);
  });

  it('rejects null input', () => {
    const result = validateTaskRequest(null);
    expect(result.success).toBe(false);
  });
});
