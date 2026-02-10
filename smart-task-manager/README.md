# Smart Task Manager

AI-powered task categorization and prioritization using Anthropic Claude Haiku 4.5. Submit a natural-language task and get back structured JSON with category, priority, reasoning, and extracted due date.

## Overview

A single-page Next.js app with a side-by-side layout: input form on the left, animated results on the right. The API route validates input, sends it to Claude with a carefully engineered system prompt, parses the JSON response, and returns it to the UI.

## Quick Start

### Prerequisites

- Node.js 18+
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Install & Run

```bash
cd smart-task-manager
npm install
echo "ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Usage

### `POST /api/analyze-task`

**Request:**
```json
{ "task": "Fix bug in authentication module - urgent" }
```

**Response:**
```json
{
  "category": "Work",
  "priority": "High",
  "reasoning": "Technical work task with explicit urgency indicator",
  "due_date": null
}
```

**curl examples:**
```bash
# Work task
curl -X POST http://localhost:3000/api/analyze-task \
  -H "Content-Type: application/json" \
  -d '{"task": "Review pull request by end of day"}'

# Health task with date
curl -X POST http://localhost:3000/api/analyze-task \
  -H "Content-Type: application/json" \
  -d '{"task": "Schedule dentist appointment for next Friday"}'
```

**Validation:** Task must be 3–500 characters. Categories: Work, Personal, Health, Finance, Other. Priorities: High, Medium, Low. Due dates: ISO format (YYYY-MM-DD) or null.

## Architecture

```
Browser (TaskAnalyzer) → POST /api/analyze-task
                              │
                    ┌─────────▼──────────┐
                    │  Validation (Zod)   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  Claude Haiku 4.5      │
                    │  temp: 0.2 / 1024 tok  │
                    └─────────┬──────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  Response Parser (Zod) │
                    └─────────┬──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  TaskResponse JSON  │
                    └────────────────────┘
```

### File Structure

```
smart-task-manager/
├── app/
│   ├── api/analyze-task/route.ts      # API endpoint (POST + GET)
│   ├── components/
│   │   ├── TaskAnalyzer.tsx           # Main form + results layout
│   │   ├── TaskResult.tsx             # Animated result display
│   │   └── SampleTasksDropdown.tsx    # Pre-written task picker
│   ├── lib/
│   │   ├── types.ts                   # Shared TypeScript types
│   │   ├── ai/
│   │   │   ├── claude-client.ts       # Anthropic SDK wrapper
│   │   │   ├── prompt-builder.ts      # System prompt + date helpers
│   │   │   └── response-parser.ts     # JSON extraction + Zod validation
│   │   └── validation/
│   │       └── task-validator.ts      # Input validation (3–500 chars)
│   ├── page.tsx                       # Home page
│   ├── layout.tsx                     # Root layout (fonts, metadata)
│   └── globals.css                    # Design tokens + component styles
├── __tests__/                         # Unit tests (Vitest)
│   ├── task-validator.test.ts
│   ├── response-parser.test.ts
│   └── prompt-builder.test.ts
├── e2e/                               # E2E tests (Playwright)
│   └── task-analyzer.spec.ts
└── .env.local                         # API key (git-ignored)
```

## Design Decisions

### Model Choice
Claude Haiku 4.5 — fast, cheap, excellent at structured JSON output. Temperature 0.2 keeps categorization consistent. Max 1024 tokens is plenty for the small JSON response.

### Prompt Engineering
- System prompt defines 5 categories with explicit examples per category
- Few-shot examples with dynamically computed dates (today's date injected at runtime)
- Date preposition rules: "before the 15th" → 14th, "by the 15th" → 15th
- JSON-only output format — no markdown, no explanations

### Validation
Input validated with Zod on both client (3–500 char check) and server. AI response also validated with Zod to catch malformed JSON or hallucinated categories.

### UI
Side-by-side layout (form left, results right). Framer Motion for staggered result animations. All date logic uses the server's local timezone (EST) rather than UTC — both the prompt builder (which tells Claude today's date) and the UI date display (which appends `T00:00:00` to prevent day-shift). This matters because at 9 PM EST, UTC is already the next day, which would cause "tomorrow" to resolve to the wrong date.

## Testing

```bash
# Unit tests (27 tests)
npm run test:run

# E2E tests (16 tests) — requires dev server or SKIP_WEBSERVER
SKIP_WEBSERVER=true npx playwright test e2e/task-analyzer.spec.ts --project=e2e

# Watch mode
npm run test
```

**Unit tests** cover: input validation boundaries, response parser (valid JSON, markdown-wrapped, malformed, invalid categories), and prompt builder structure.

**E2E tests** cover: page load, input validation, AI analysis reliability across 8 diverse tasks (work bugs, health appointments, finance deadlines, ambiguous tasks), date display accuracy, and error handling with mocked API failures.

## Technology Stack

| Dependency | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | Framework (App Router) |
| React | 19.2.3 | UI |
| TypeScript | 5.x | Type safety |
| Anthropic SDK | 0.74.0 | Claude API client |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.34.0 | Animations |
| Zod | 4.3.6 | Schema validation |
| Vitest | 4.x | Unit testing |
| Playwright | 1.58.x | E2E testing |

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Store in `.env.local` (git-ignored by default).

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add `ANTHROPIC_API_KEY` as an environment variable (mark as secret)
4. Deploy

Or via CLI:
```bash
npx vercel
```

## Future Enhancements

- Task history (localStorage or database)
- Batch processing (analyze multiple tasks at once)
- Custom categories (user-defined)
- Calendar integration (sync due dates)
- Confidence scores per categorization
- OpenAI GPT fallback for redundancy
