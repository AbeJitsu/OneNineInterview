// ============================================
// PROMPT BUILDER UNIT TESTS
// What: Validates that the system prompt includes all required elements
// Why: A missing category, priority level, or date reference breaks analysis
// ============================================

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../lib/ai/prompt-builder';

describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
  });

  it('includes today reference date', () => {
    const prompt = buildSystemPrompt();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(prompt).toContain(today);
  });

  it('includes all five categories', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Work');
    expect(prompt).toContain('Personal');
    expect(prompt).toContain('Health');
    expect(prompt).toContain('Finance');
    expect(prompt).toContain('Other');
  });

  it('includes all three priority levels', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('High');
    expect(prompt).toContain('Medium');
    expect(prompt).toContain('Low');
  });

  it('specifies JSON response format', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('YYYY-MM-DD');
    expect(prompt).toContain('JSON');
  });

  it('includes few-shot examples', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Fix bug in authentication module');
    expect(prompt).toContain('Call mom this weekend');
  });
});
