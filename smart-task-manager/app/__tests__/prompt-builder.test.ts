// ============================================
// PROMPT BUILDER UNIT TESTS
// What: Validates that the system prompt includes all required elements
// Why: A missing category, priority level, or date reference breaks analysis
// ============================================

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, getSeasonalDate } from '../lib/ai/prompt-builder';

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

  it('includes seasonal date parsing rules', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('end of summer');
    expect(prompt).toContain('September 22');
    expect(prompt).toContain('astronomical seasons');
  });

  it('includes seasonal reference example in few-shot', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('by end of summer');
  });
});

describe('Seasonal date helper - getSeasonalDate', () => {
  it('should return September 22 of current year when before that date', () => {
    // May 15, 2026 is before September 22
    const endOfSummer = getSeasonalDate('2026-05-15', 9, 22);
    expect(endOfSummer).toBe('2026-09-22');
  });

  it('should return September 22 of next year when after that date', () => {
    // October 15, 2026 is after September 22
    const endOfSummer = getSeasonalDate('2026-10-15', 9, 22);
    expect(endOfSummer).toBe('2027-09-22');
  });

  it('should handle end of spring (June 20)', () => {
    const endOfSpring = getSeasonalDate('2026-03-01', 6, 20);
    expect(endOfSpring).toBe('2026-06-20');
  });

  it('should handle end of spring rollover to next year', () => {
    // After June 20
    const endOfSpring = getSeasonalDate('2026-07-01', 6, 20);
    expect(endOfSpring).toBe('2027-06-20');
  });

  it('should handle end of fall (December 21)', () => {
    const endOfFall = getSeasonalDate('2026-05-01', 12, 21);
    expect(endOfFall).toBe('2026-12-21');
  });

  it('should handle end of fall rollover to next year', () => {
    // After December 21
    const endOfFall = getSeasonalDate('2027-01-01', 12, 21);
    expect(endOfFall).toBe('2027-12-21');
  });

  it('should handle end of winter (March 19)', () => {
    const endOfWinter = getSeasonalDate('2026-01-01', 3, 19);
    expect(endOfWinter).toBe('2026-03-19');
  });

  it('should handle end of winter rollover to next year', () => {
    // After March 19
    const endOfWinter = getSeasonalDate('2026-04-01', 3, 19);
    expect(endOfWinter).toBe('2027-03-19');
  });

  it('should handle leap years correctly', () => {
    // 2024 is a leap year
    const result = getSeasonalDate('2024-02-15', 9, 22);
    expect(result).toBe('2024-09-22');
  });

  it('should return same date when exactly on the seasonal date', () => {
    const result = getSeasonalDate('2026-09-22', 9, 22);
    expect(result).toBe('2026-09-22');
  });
});
