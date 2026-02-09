# AI Development Interview Exercise

Welcome to the OneNine AI Developer Interview Exercise! This repository contains a practical coding challenge designed to assess your skills in AI development, code quality, and problem-solving.

## Overview

**Time Expectation:** 1 hour
**Exercise Type:** AI-powered REST API
**Language Choice:** Python or JavaScript (your choice!)

You'll build a **Smart Task Manager API** - a simple but functional API endpoint that uses AI to help categorize and organize tasks.

## What You'll Build

Create a REST API endpoint that:

1. **Accepts tasks** in natural language via POST request (e.g., "Schedule dentist appointment for next Friday")
2. **AI analyzes each task** and automatically:
   - Categorizes it (Work, Personal, Health, Finance, Other)
   - Assigns a priority level (High, Medium, Low)
   - Provides reasoning for the categorization
   - Extracts due dates or deadlines if mentioned
3. **Returns structured JSON** with the analysis results

### Example

**Request:**

```bash
POST /api/analyze-task
Content-Type: application/json

{
  "task": "Fix bug in authentication module - urgent"
}
```

**Response:**

```json
{
  "category": "Work",
  "priority": "High",
  "reasoning": "Technical task with urgency indicator",
  "due_date": "ASAP"
}
```

## Technical Requirements

### Core Functionality

- REST API endpoint (`POST /api/analyze-task`) that accepts task text
- AI integration to analyze and categorize tasks
- Structured JSON response with category, priority, reasoning, and due date
- Proper error handling and validation

### Technology Stack

- **Backend:**
  - Python: FastAPI
  - JavaScript: Express or any Node.js framework
- **AI Provider:** OpenAI, Anthropic Claude, or any other LLM API (your choice)
- **Environment:** API keys stored in environment variables (`.env` file)

### Bonus Features (Optional)

- UI/UX for submitting tasks and viewing results
- Unit tests

## What We're Looking For

This exercise helps us evaluate:

1. **Code Quality** - Clean, organized, maintainable code
2. **Prompt Engineering** - Effective AI prompts that produce consistent, structured outputs
3. **Error Handling** - Graceful handling of API failures, invalid inputs, edge cases
4. **Planning & Documentation** - Clear explanation of your approach and decisions
5. **Problem Solving** - How you tackle challenges and make trade-offs

## Getting Started

### 1. Choose Your Version

This repository has starter code for both:

- **[python-version/](python-version/)** - FastAPI backend
- **[javascript-version/](javascript-version/)** - Express backend

Pick whichever you're most comfortable with!

### 3. Get Your AI API Key

You'll need an API key from one of these providers:

- [OpenAI](https://platform.openai.com/api-keys) (GPT-3.5/GPT-4)
- [Anthropic](https://console.anthropic.com/) (Claude)
- Or any other LLM provider you prefer

### 4. Start Building!

Use the provided starter code as a foundation, or start from scratch if you prefer. The starter code includes:

- Basic API server setup
- Environment variable configuration
- Placeholder endpoint structure
- Pydantic models (Python) for request/response validation

### 5. Test Your API

We've provided sample tasks in [examples/sample-tasks.txt](examples/sample-tasks.txt) that you can use for testing.

## Deliverables

Please provide:

1. **Working Code** in either the `python-version/` or `javascript-version/` directory
2. **README.md** in your chosen directory that includes:
   - Setup instructions (how to install and run)
   - Environment variables needed
   - Any dependencies or prerequisites
   - Brief explanation of your approach and design decisions
3. **Planning Notes**
   - Describe how you approached the problem
   - Key design decisions and trade-offs
   - What you'd improve with more time

## Interview Discussion

During the interview, we'll:

- Walk through your code together
- Discuss your prompt engineering choices
- Talk about trade-offs and alternative approaches
- Explore how you'd scale or enhance the solution
- Answer any questions you have about the role or our tech stack

## Questions?

If anything is unclear or you run into issues, please document them in your submission. We're interested in your problem-solving process, including how you handle ambiguity and blockers.

## Evaluation Criteria

You'll be evaluated on:

- **Code organization and quality** - Structure, readability, best practices
- **Prompt engineering effectiveness** - AI prompt design and output handling
- **Error handling and edge cases** - Robustness and user experience
- **Documentation clarity** - Clear instructions and explanations
- **Planning and decision-making** - Thoughtful approach to the problem

---

Good luck! We're excited to see what you build. Remember, this is as much about understanding your thought process as it is about the final product.
