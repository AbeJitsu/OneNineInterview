// ============================================
// RESPONSE PARSER UNIT TESTS
// What: Tests JSON extraction from various AI response formats
// Why: Claude can return markdown-wrapped JSON, extra text, or invalid data —
//      these tests ensure the parser handles all cases correctly
// ============================================

import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '../lib/ai/response-parser';

describe('parseAIResponse', () => {
  it('parses valid JSON response', () => {
    const input = '{"category":"Work","priority":"High","reasoning":"Test","due_date":null}';
    const result = parseAIResponse(input);
    expect(result.category).toBe('Work');
    expect(result.priority).toBe('High');
    expect(result.reasoning).toBe('Test');
    expect(result.due_date).toBeNull();
  });

  it('extracts JSON from markdown-wrapped response', () => {
    const input = '```json\n{"category":"Personal","priority":"Low","reasoning":"Relaxed task","due_date":null}\n```';
    const result = parseAIResponse(input);
    expect(result.category).toBe('Personal');
    expect(result.priority).toBe('Low');
  });

  it('parses response with due date', () => {
    const input = '{"category":"Health","priority":"Medium","reasoning":"Medical","due_date":"2026-03-15"}';
    const result = parseAIResponse(input);
    expect(result.due_date).toBe('2026-03-15');
  });

  it('validates all category values', () => {
    const categories = ['Work', 'Personal', 'Health', 'Finance', 'Other'];
    for (const category of categories) {
      const input = `{"category":"${category}","priority":"Medium","reasoning":"Test","due_date":null}`;
      const result = parseAIResponse(input);
      expect(result.category).toBe(category);
    }
  });

  it('validates all priority values', () => {
    const priorities = ['High', 'Medium', 'Low'];
    for (const priority of priorities) {
      const input = `{"category":"Work","priority":"${priority}","reasoning":"Test","due_date":null}`;
      const result = parseAIResponse(input);
      expect(result.priority).toBe(priority);
    }
  });

  it('throws on invalid category', () => {
    const input = '{"category":"Invalid","priority":"High","reasoning":"Test","due_date":null}';
    expect(() => parseAIResponse(input)).toThrow();
  });

  it('throws on invalid priority', () => {
    const input = '{"category":"Work","priority":"Urgent","reasoning":"Test","due_date":null}';
    expect(() => parseAIResponse(input)).toThrow();
  });

  it('throws on empty reasoning', () => {
    const input = '{"category":"Work","priority":"High","reasoning":"","due_date":null}';
    expect(() => parseAIResponse(input)).toThrow();
  });

  it('throws on invalid date format', () => {
    const input = '{"category":"Work","priority":"High","reasoning":"Test","due_date":"March 15"}';
    expect(() => parseAIResponse(input)).toThrow();
  });

  it('throws when no JSON found', () => {
    expect(() => parseAIResponse('No JSON here')).toThrow('No JSON found');
  });

  it('throws on malformed JSON', () => {
    expect(() => parseAIResponse('{broken json')).toThrow();
  });
});
