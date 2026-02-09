from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart Task Manager API")


class TaskRequest(BaseModel):
    task: str


class TaskResponse(BaseModel):
    category: str
    priority: str
    reasoning: str
    due_date: str


@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "ok",
        "message": "Smart Task Manager API is running",
        "endpoints": {
            "POST /api/analyze-task": "Analyze and categorize a task"
        }
    }


@app.post("/api/analyze-task", response_model=TaskResponse)
async def analyze_task(request: TaskRequest):
    """
    Analyze a task and return categorization, priority, reasoning, and due date.

    TODO: Implement your AI logic here

    Expected categories: Work, Personal, Health, Finance, Other
    Expected priorities: High, Medium, Low
    """
    # TODO: Add your AI provider logic here
    # Example:
    # - Call OpenAI or Anthropic API
    # - Parse the response
    # - Return structured data

    # Placeholder response - replace with your implementation
    return TaskResponse(
        category="Work",
        priority="High",
        reasoning="This is a placeholder response. Implement AI logic to analyze the task.",
        due_date="Not specified"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
