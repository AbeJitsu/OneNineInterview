// ============================================
// ANALYZE TASK API ROUTE
// What: POST endpoint that validates input, sends it to Claude, returns structured JSON
// Why: Server-side route keeps the API key secret and handles error responses
// How: Validates → creates ClaudeClient → calls analyzeTask → returns result
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { ClaudeClient } from '@/app/lib/ai/claude-client';
import { validateTaskRequest } from '@/app/lib/validation/task-validator';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateTaskRequest(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Create AI client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'AI service is not properly configured',
        },
        { status: 500 }
      );
    }

    const client = new ClaudeClient(apiKey);

    // Analyze task with AI
    const result = await client.analyzeTask(validation.data!.task);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);

    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: 'The AI service encountered an error. Please try again.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: 'Unable to analyze the task. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      endpoint: '/api/analyze-task',
      method: 'POST',
      description: 'Analyze a task and return category, priority, and due date',
      example: {
        request: { task: 'Fix bug in auth module - urgent' },
        response: {
          category: 'Work',
          priority: 'High',
          reasoning: 'Technical work task with explicit urgency indicator',
          due_date: null,
        },
      },
    },
    { status: 200 }
  );
}
