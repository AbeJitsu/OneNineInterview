// ============================================
// CLAUDE AI CLIENT
// What: Sends a task to Claude and returns structured categorization
// Why: Central function that powers the entire analysis feature
// How: Builds a system prompt with examples, sends to Claude at low
//      temperature for consistency, then parses the JSON response
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { TaskResponse } from '../types';
import { buildSystemPrompt } from './prompt-builder';
import { parseAIResponse } from './response-parser';

export class ClaudeClient {
  private client: Anthropic;
  private model = 'claude-haiku-4-5-20251001';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.client = new Anthropic({ apiKey });
  }

  async analyzeTask(task: string): Promise<TaskResponse> {
    const systemPrompt = buildSystemPrompt();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.2, // Low temperature for consistency
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: task,
        },
      ],
    }, { timeout: 30000 });

    // Extract text from response
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    if (!responseText) {
      throw new Error('No text response from AI');
    }

    // Parse and validate the response
    return parseAIResponse(responseText);
  }
}
