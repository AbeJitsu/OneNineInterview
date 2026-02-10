# Testing Guide

This document explains every test in the project: what it checks, why it matters, and how it works.

## How to Run

```bash
# Unit tests (27 tests, runs in ~1 second)
npm run test:run

# E2E tests (16 tests, runs against a real browser + live AI)
SKIP_WEBSERVER=true npx playwright test e2e/task-analyzer.spec.ts --project=e2e

# Unit tests in watch mode (re-runs on file changes)
npm run test
```

## Test Overview

| Suite | File | Tests | Tool | What it covers |
|-------|------|-------|------|----------------|
| Input Validation | `__tests__/task-validator.test.ts` | 10 | Vitest | Rejects bad input before it reaches the AI |
| Response Parsing | `__tests__/response-parser.test.ts` | 11 | Vitest | Handles every format Claude might return |
| Prompt Structure | `__tests__/prompt-builder.test.ts` | 6 | Vitest | Catches broken prompts before they ship |
| Full User Flow | `e2e/task-analyzer.spec.ts` | 16 | Playwright | Real browser, real AI, real results |

---

## Unit Tests

### 1. Input Validation (`task-validator.test.ts`)

**What this tests:** The `validateTaskRequest` function, which is the first thing that runs when a user submits a task. It checks that the input is a string between 3 and 500 characters.

**Why we test it:** Bad input should never reach the AI API. Without validation, empty strings, numbers, or massive inputs would waste API calls and potentially cause errors.

| # | Test | Input | Expected | Why it matters |
|---|------|-------|----------|----------------|
| 1 | Accepts valid task input | `"Fix the login bug"` | Pass, returns the task | Happy path - normal usage works |
| 2 | Rejects empty string | `""` | Fail | Empty tasks are meaningless |
| 3 | Rejects input shorter than 3 chars | `"ab"` | Fail, error mentions "3 characters" | Too short to be a real task |
| 4 | Rejects input longer than 500 chars | `"a" x 501` | Fail, error mentions "500" | Prevents abuse and keeps API costs down |
| 5 | Accepts exactly 3 characters | `"abc"` | Pass | Boundary: minimum valid length |
| 6 | Accepts exactly 500 characters | `"a" x 500` | Pass | Boundary: maximum valid length |
| 7 | Trims whitespace before validation | `"  ab  "` | Fail (trims to "ab", only 2 chars) | Spaces shouldn't trick the validator |
| 8 | Rejects missing task field | `{}` | Fail | Request body might be missing the field entirely |
| 9 | Rejects non-string task | `{ task: 123 }` | Fail | Someone might send a number instead of text |
| 10 | Rejects null input | `null` | Fail | Handles completely broken requests |

**How it works:** Each test calls `validateTaskRequest()` directly with a crafted input, then checks `result.success` and `result.error`. No mocking needed — this is pure function testing.

---

### 2. Response Parsing (`response-parser.test.ts`)

**What this tests:** The `parseAIResponse` function, which takes raw text from Claude and extracts a validated JSON object with category, priority, reasoning, and due_date.

**Why we test it:** Claude doesn't always return clean JSON. Sometimes it wraps it in markdown code blocks, adds explanatory text, or returns unexpected values. The parser needs to handle all of this reliably.

| # | Test | Input | Expected | Why it matters |
|---|------|-------|----------|----------------|
| 1 | Parses valid JSON | Clean JSON string | Correct fields extracted | Happy path |
| 2 | Extracts JSON from markdown | `` ```json {...} ``` `` | Correct fields extracted | Claude sometimes wraps JSON in code blocks |
| 3 | Parses response with due date | JSON with `"2026-03-15"` | `due_date` = `"2026-03-15"` | Date strings are preserved correctly |
| 4 | Validates all 5 category values | Each of Work/Personal/Health/Finance/Other | All accepted | Every valid category works |
| 5 | Validates all 3 priority values | Each of High/Medium/Low | All accepted | Every valid priority works |
| 6 | Throws on invalid category | `"Invalid"` as category | Throws error | Claude hallucinated a category we don't support |
| 7 | Throws on invalid priority | `"Urgent"` as priority | Throws error | "Urgent" isn't a valid priority level |
| 8 | Throws on empty reasoning | `""` as reasoning | Throws error | Empty reasoning provides no value to the user |
| 9 | Throws on invalid date format | `"March 15"` as due_date | Throws error | Must be YYYY-MM-DD format, not natural language |
| 10 | Throws when no JSON found | `"No JSON here"` | Throws "No JSON found" | Claude returned plain text with no JSON at all |
| 11 | Throws on malformed JSON | `"{broken json"` | Throws error | Corrupted or incomplete response |

**How it works:** Each test passes a raw string to `parseAIResponse()` and checks either the returned object or that it throws. Uses Zod schema validation under the hood.

---

### 3. Prompt Structure (`prompt-builder.test.ts`)

**What this tests:** The `buildSystemPrompt` function, which generates the system prompt sent to Claude. These tests verify the prompt contains all the pieces Claude needs to categorize tasks correctly.

**Why we test it:** If someone edits the prompt and accidentally removes a category, priority level, or the date reference, the AI will silently return wrong results. These tests catch that before it ships.

| # | Test | What it checks | Why it matters |
|---|------|----------------|----------------|
| 1 | Returns a non-empty string | Prompt exists and is a string | Basic sanity check — prompt generation didn't crash |
| 2 | Includes today's reference date | Today's date (e.g. `2026-02-09`) is in the prompt | Claude needs today's date to calculate "tomorrow", "next Friday", etc. |
| 3 | Includes all 5 categories | Work, Personal, Health, Finance, Other all present | A missing category means tasks can't be classified into it |
| 4 | Includes all 3 priority levels | High, Medium, Low all present | A missing priority level breaks the output schema |
| 5 | Specifies JSON response format | Contains "YYYY-MM-DD" and "JSON" | Without format instructions, Claude returns freeform text |
| 6 | Includes few-shot examples | Contains "Fix bug in authentication module" and "Call mom this weekend" | Few-shot examples dramatically improve classification accuracy |

**How it works:** Calls `buildSystemPrompt()` and uses string `.toContain()` checks. Simple but catches the most dangerous prompt regressions.

---

## E2E Tests

### 4. Full User Flow (`task-analyzer.spec.ts`)

**What this tests:** The entire application running in a real Chromium browser — typing into the form, clicking submit, waiting for Claude's response, and verifying the results render correctly.

**Why we test it:** Unit tests verify individual functions work. E2E tests verify the whole system works together: React renders the form, the API route processes the request, Claude returns a response, and the UI displays it. These are the tests that prove the app actually works for a real user.

#### Page Load (2 tests)

| # | Test | What it does | Why it matters |
|---|------|-------------|----------------|
| 1 | Displays page with form and empty results | Loads `/`, checks for heading + empty state message | App renders without crashing |
| 2 | Submit button disabled when empty | Loads `/`, checks button is disabled | Users can't submit empty forms |

#### Input Validation (4 tests)

| # | Test | What it does | Why it matters |
|---|------|-------------|----------------|
| 3 | Rejects empty input | Checks button disabled + "Minimum 3 characters" message | Validation feedback visible to user |
| 4 | Rejects < 3 characters | Types "ab", checks button stays disabled | Client-side guard matches server validation |
| 5 | Enables submit for valid input | Types "Fix the login bug", checks button enabled | Valid input lets users proceed |
| 6 | Shows character count | Types "Test task", checks "9 / 500 characters" visible | User knows how much they've typed |

#### AI Analysis Reliability (8 tests)

These are the most important tests. Each one submits a real task to Claude and verifies the AI returns the correct category and priority. They prove the prompt engineering works.

| # | Task submitted | Expected category | Expected priority | Has due date? | What it proves |
|---|---------------|-------------------|-------------------|---------------|----------------|
| 7 | "Fix the login page crash when users enter special characters - this is blocking production" | Work | High | No | Recognizes urgent technical work without an explicit date |
| 8 | "Schedule annual physical exam for next Thursday" | Health | Medium | Yes | Correctly categorizes medical tasks and extracts relative dates |
| 9 | "Pay rent by the 1st" | Finance | High | Yes | Finance + deadline = high priority with date |
| 10 | "Pick up groceries and birthday cake for Saturday party" | Personal | Medium | Yes | Personal errand with an implied date ("Saturday") |
| 11 | "Maybe think about possibly starting to consider looking into something eventually" | Other | Low | No | Vague/ambiguous tasks get classified as Other/Low |
| 12 | "URGENT!!! Deploy hotfix to production server ASAP before midnight" | Work | High | Yes | Multiple urgency signals (caps, "!!!", "ASAP", "URGENT") |
| 13 | "Start running 3 times a week to train for marathon in June" | Health | Medium | No | Fitness goal with a vague timeframe (no specific date) |
| 14 | "Review Q4 budget spreadsheet and send updated projections to finance team by Friday EOD" | Work | High | Yes | Work task (not Finance) because it's about doing work for a finance team |

**How each test works:**
1. Navigate to `/`
2. Fill the textarea with the task
3. Click "Analyze Task"
4. Wait up to 15 seconds for "Analysis Results" heading to appear (real AI call)
5. Assert the category badge shows the expected category
6. Assert the priority indicator shows the expected priority
7. If a due date is expected, assert the "Due Date" section is visible
8. Assert the "Copy JSON Response" button exists

#### Date Display Accuracy (1 test)

| # | Test | What it does | Why it matters |
|---|------|-------------|----------------|
| 15 | Displays correct date without timezone offset | Submits "Submit the report by February 15th 2026", checks for "February 15, 2026" | The app uses EST (server local time) for all date calculations. Without this, `toISOString()` returns UTC — so at 9 PM EST, Claude would think today is already tomorrow, causing every relative date ("tomorrow", "next Friday") to be off by a day. This test catches that. |

#### Error Handling (1 test)

| # | Test | What it does | Why it matters |
|---|------|-------------|----------------|
| 16 | Handles API errors gracefully | Intercepts `/api/analyze-task` with a mocked 500 response, submits a task, checks error message appears | When Claude is down or the API key is wrong, users should see a clear error instead of a blank screen |

**How the mock works:** Playwright's `page.route()` intercepts the network request and returns a fake 500 error before it ever reaches the server. This tests the UI's error handling without depending on a real failure.

---

## Testing Philosophy

**Why these specific tests?** The test suite is designed around the three things that can break:

1. **Input** (validator tests) — Can bad data get through?
2. **AI Output** (parser tests) — Can we handle whatever Claude returns?
3. **End-to-End** (Playwright tests) — Does the whole thing actually work for a user?

**Why test AI responses?** AI is non-deterministic. The E2E reliability tests run real tasks through Claude to verify the prompt engineering produces consistent results. If Claude starts miscategorizing "Pay rent" as "Personal" instead of "Finance", these tests catch it.

**Why boundary testing?** Tests 5 and 6 in the validator (exactly 3 chars, exactly 500 chars) catch off-by-one errors. It's common to accidentally use `<` instead of `<=` — boundary tests find that immediately.
