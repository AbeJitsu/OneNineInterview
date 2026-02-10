// ============================================
// SYSTEM PROMPT BUILDER
// What: Constructs the system prompt that tells Claude how to categorize tasks
// Why: Prompt quality directly controls categorization accuracy
// How: Injects today's date for relative date math, includes few-shot examples
//      with computed dates, and defines strict JSON output format
// ============================================

// Format a Date as YYYY-MM-DD using the server's local timezone (EST).
// We intentionally use local time, not UTC, because at 9 PM EST
// toISOString() would already return tomorrow's date in UTC, causing
// "tomorrow" to resolve to the day after tomorrow for EST users.
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildSystemPrompt(): string {
  const today = toLocalDateString(new Date());

  return `You are a task categorization assistant. Your job is to analyze tasks and return structured JSON responses.

# Categories

Categorize tasks into one of these five categories:

- **Work**: Professional tasks, coding, bug fixes, meetings, documentation, presentations, team activities
- **Personal**: Social activities, errands, hobbies, personal calls, shopping, entertainment
- **Health**: Medical appointments, exercise, medication, wellness, nutrition, sleep
- **Finance**: Bills, budgeting, investments, taxes, expense reports, payments
- **Other**: Ambiguous, uncategorizable, or multi-category tasks

# Priority Levels

Determine priority based on urgency signals:

- **High**: Urgent tasks, explicit urgency markers ("urgent", "ASAP", "emergency", "critical"), near deadlines, time-sensitive
- **Medium**: Important but not urgent, has a deadline but not immediate, standard workload
- **Low**: Nice-to-have, no deadline pressure, routine tasks, long-term goals

# Due Date Extraction

Parse natural language dates and return ISO format (YYYY-MM-DD) or null if no date is mentioned.

- Today's reference date: ${today}
- Parse relative dates: "tomorrow" → +1 day, "next Friday" → next Friday, "by the 15th" → this month's 15th
- Parse specific dates: "April 15th", "March 22nd", "December 1st"
- Date preposition rules:
  - "before the 15th" → the 14th (day prior, exclusive deadline)
  - "by the 15th" → the 15th (inclusive deadline)
  - "on the 15th" → the 15th (exact date)
- Seasonal references (astronomical seasons, auto-rolls to next year if already past):
  - "end of spring" → June 20
  - "end of summer" → September 22
  - "end of fall" / "end of autumn" → December 21
  - "end of winter" → March 19
  - "start of spring" → March 20
  - "start of summer" → June 21
  - "start of fall" / "start of autumn" → September 23
  - "start of winter" → December 21
- Return null if no date is mentioned or the date is too vague

# Response Format

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "category": "Work" | "Personal" | "Health" | "Finance" | "Other",
  "priority": "High" | "Medium" | "Low",
  "reasoning": "Brief explanation in 1-2 sentences",
  "due_date": "YYYY-MM-DD" | null
}

# Examples

Task: "Fix bug in authentication module - urgent"
Response: {"category": "Work", "priority": "High", "reasoning": "Technical work task with explicit urgency indicator", "due_date": null}

Task: "Call mom this weekend"
Response: {"category": "Personal", "priority": "Medium", "reasoning": "Personal activity with weekend timeframe", "due_date": "${getNextSaturday(today)}"}

Task: "Schedule dentist appointment for next Friday"
Response: {"category": "Health", "priority": "Medium", "reasoning": "Medical appointment with specific date", "due_date": "${getNextFriday(today)}"}

Task: "Pay electricity bill before the 15th"
Response: {"category": "Finance", "priority": "High", "reasoning": "Bill payment with deadline approaching — 'before the 15th' means the 14th", "due_date": "${getThisMonthDate(today, 14)}"}

Task: "Prepare for hiking trip by end of summer"
Response: {"category": "Personal", "priority": "Medium", "reasoning": "Personal goal with seasonal deadline — end of summer is September 22nd (astronomical equinox)", "due_date": "${getSeasonalDate(today, 9, 22)}"}

Task: "URGENT!!!"
Response: {"category": "Other", "priority": "High", "reasoning": "Ambiguous task with urgency marker but no clear context", "due_date": null}`;
}

// Helper functions for date calculations
// All use local timezone via toLocalDateString to avoid UTC offset bugs
function getNextFriday(today: string): string {
  const date = new Date(today + 'T00:00:00');
  const day = date.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilFriday);
  return toLocalDateString(date);
}

function getNextSaturday(today: string): string {
  const date = new Date(today + 'T00:00:00');
  const day = date.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  return toLocalDateString(date);
}

function getThisMonthDate(today: string, dayOfMonth: number): string {
  const date = new Date(today + 'T00:00:00');
  date.setDate(dayOfMonth);
  return toLocalDateString(date);
}

/**
 * Get seasonal date with automatic year rollover
 * Uses astronomical seasons (equinoxes and solstices)
 * @param today - Current date in YYYY-MM-DD format
 * @param month - Target month (1-12)
 * @param day - Target day
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getSeasonalDate(today: string, month: number, day: number): string {
  const currentDate = new Date(today + 'T00:00:00');
  const year = currentDate.getFullYear();
  const seasonalDate = new Date(year, month - 1, day); // month-1 because Date uses 0-indexed months

  // If already past this year's date, use next year
  if (currentDate > seasonalDate) {
    seasonalDate.setFullYear(year + 1);
  }

  return toLocalDateString(seasonalDate);
}

// Few-shot examples for better categorization
export const FEW_SHOT_EXAMPLES = [
  {
    task: 'Fix bug in authentication module - urgent',
    response: {
      category: 'Work' as const,
      priority: 'High' as const,
      reasoning: 'Technical work task with explicit urgency indicator',
      due_date: null,
    },
  },
  {
    task: 'Review Sarah pull request by end of day',
    response: {
      category: 'Work' as const,
      priority: 'High' as const,
      reasoning: 'Work task with immediate deadline (end of day)',
      due_date: toLocalDateString(new Date()),
    },
  },
  {
    task: 'Call mom this weekend',
    response: {
      category: 'Personal' as const,
      priority: 'Medium' as const,
      reasoning: 'Personal activity with weekend timeframe',
      due_date: null,
    },
  },
  {
    task: 'Schedule dentist appointment for next Friday',
    response: {
      category: 'Health' as const,
      priority: 'Medium' as const,
      reasoning: 'Medical appointment with specific future date',
      due_date: null,
    },
  },
  {
    task: 'Pay electricity bill before the 15th',
    response: {
      category: 'Finance' as const,
      priority: 'High' as const,
      reasoning: 'Bill payment with specific deadline',
      due_date: null,
    },
  },
];
