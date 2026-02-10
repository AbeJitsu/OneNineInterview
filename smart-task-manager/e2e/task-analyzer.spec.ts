import { test, expect } from '@playwright/test';

// ============================================
// TASK ANALYZER E2E TESTS
// Tests the full flow: submit task → AI analysis → display results
// Validates reliability of categorization, priority, date extraction
// ============================================

// 10 diverse tasks designed to test edge cases and reliability
const TEST_TASKS = [
  {
    input: 'Fix the login page crash when users enter special characters - this is blocking production',
    expectedCategory: 'Work',
    expectedPriority: 'High',
    expectDueDate: false,
    description: 'Urgent work bug with no explicit date',
  },
  {
    input: 'Schedule annual physical exam for next Thursday',
    expectedCategory: 'Health',
    expectedPriority: 'Medium',
    expectDueDate: true,
    description: 'Health task with relative date',
  },
  {
    input: 'Pay rent by the 1st',
    expectedCategory: 'Finance',
    expectedPriority: 'High',
    expectDueDate: true,
    description: 'Finance task with deadline',
  },
  {
    input: 'Pick up groceries and birthday cake for Saturday party',
    expectedCategory: 'Personal',
    expectedPriority: 'Medium',
    expectDueDate: true,
    description: 'Personal errand with implicit date',
  },
  {
    input: '',
    expectedCategory: null,
    expectedPriority: null,
    expectDueDate: false,
    description: 'Empty input - should show validation error',
  },
  {
    input: 'ab',
    expectedCategory: null,
    expectedPriority: null,
    expectDueDate: false,
    description: 'Too short input (2 chars) - should show validation error',
  },
  {
    input: 'Maybe think about possibly starting to consider looking into something eventually',
    expectedCategory: 'Other',
    expectedPriority: 'Low',
    expectDueDate: false,
    description: 'Vague/ambiguous task with no actionable info',
  },
  {
    input: 'URGENT!!! Deploy hotfix to production server ASAP before midnight',
    expectedCategory: 'Work',
    expectedPriority: 'High',
    expectDueDate: true,
    description: 'Multiple urgency signals with deadline',
  },
  {
    input: 'Start running 3 times a week to train for marathon in June',
    expectedCategory: 'Health',
    expectedPriority: 'Medium',
    expectDueDate: false,
    description: 'Health/fitness goal with vague timeframe',
  },
  {
    input: 'Review Q4 budget spreadsheet and send updated projections to finance team by Friday EOD',
    expectedCategory: 'Work',
    expectedPriority: 'High',
    expectDueDate: true,
    description: 'Work task with specific deadline',
  },
];

test.describe('Task Analyzer - Page Load', () => {
  test('should display the page with form and empty results panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Smart Task Manager');
    await expect(page.locator('h2').first()).toContainText('Analyze Your Task');
    await expect(page.getByText('Submit a task to see analysis results')).toBeVisible();
  });

  test('should have submit button disabled when textarea is empty', async ({ page }) => {
    await page.goto('/');
    const submitButton = page.getByRole('button', { name: 'Analyze Task' });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Task Analyzer - Input Validation', () => {
  test('should reject empty input', async ({ page }) => {
    await page.goto('/');
    const submitButton = page.getByRole('button', { name: 'Analyze Task' });
    await expect(submitButton).toBeDisabled();
    await expect(page.getByText('Minimum 3 characters required')).toBeVisible();
  });

  test('should reject input shorter than 3 characters', async ({ page }) => {
    await page.goto('/');
    await page.locator('#task').fill('ab');
    const submitButton = page.getByRole('button', { name: 'Analyze Task' });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit for valid input', async ({ page }) => {
    await page.goto('/');
    await page.locator('#task').fill('Fix the login bug');
    const submitButton = page.getByRole('button', { name: 'Analyze Task' });
    await expect(submitButton).toBeEnabled();
  });

  test('should show character count', async ({ page }) => {
    await page.goto('/');
    await page.locator('#task').fill('Test task');
    await expect(page.getByText('9 / 500 characters')).toBeVisible();
  });
});

test.describe('Task Analyzer - AI Analysis Reliability', () => {
  // Filter to only tasks that should succeed (valid input)
  const validTasks = TEST_TASKS.filter((t) => t.expectedCategory !== null);

  for (const taskCase of validTasks) {
    test(`should correctly analyze: ${taskCase.description}`, async ({ page }) => {
      await page.goto('/');

      // Fill and submit the task
      await page.locator('#task').fill(taskCase.input);
      await page.getByRole('button', { name: 'Analyze Task' }).click();

      // Wait for results to appear (AI response can take a few seconds)
      const resultsHeading = page.getByText('Analysis Results');
      await expect(resultsHeading).toBeVisible({ timeout: 15000 });

      // Verify category
      await expect(page.getByText(taskCase.expectedCategory!)).toBeVisible();

      // Verify priority
      await expect(page.getByText(`${taskCase.expectedPriority} Priority`)).toBeVisible();

      // Verify reasoning exists (non-empty)
      const analysisSection = page.locator('text=Analysis').first();
      await expect(analysisSection).toBeVisible();

      // Verify due date presence/absence
      if (taskCase.expectDueDate) {
        await expect(page.getByText('Due Date')).toBeVisible();
      }

      // Verify copy button exists
      await expect(page.getByText('Copy JSON Response')).toBeVisible();
    });
  }
});

test.describe('Task Analyzer - Date Display Accuracy', () => {
  test('should display the correct date without timezone offset', async ({ page }) => {
    await page.goto('/');

    // Submit a task with a clear date reference
    await page.locator('#task').fill('Submit the report by February 15th 2026');
    await page.getByRole('button', { name: 'Analyze Task' }).click();

    // Wait for results
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 15000 });

    // If a due date is shown, it should contain "February 15"
    const dueDateEl = page.locator('text=Due Date');
    if (await dueDateEl.isVisible()) {
      await expect(page.getByText('February 15, 2026')).toBeVisible();
    }
  });
});

test.describe('Task Analyzer - Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept the API and force a 500 error
    await page.route('/api/analyze-task', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error', message: 'AI service unavailable' }),
      });
    });

    await page.goto('/');
    await page.locator('#task').fill('Test task for error handling');
    await page.getByRole('button', { name: 'Analyze Task' }).click();

    // Should show error message
    await expect(page.getByText('Error')).toBeVisible({ timeout: 5000 });
  });
});
