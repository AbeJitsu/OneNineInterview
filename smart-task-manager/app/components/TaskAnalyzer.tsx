// ============================================
// TASK ANALYZER
// What: Main interactive component — input form on the left, results on the right
// Why: Orchestrates the full user flow: type task → submit → show AI results
// How: Manages form state, calls /api/analyze-task, renders TaskResult
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskResult from './TaskResult';
import SampleTasksDropdown from './SampleTasksDropdown';
import { TaskResponse } from '@/app/lib/types';

interface AnalysisState {
  loading: boolean;
  result: TaskResponse | null;
  error: string | null;
}

export default function TaskAnalyzer() {
  const [task, setTask] = useState('');
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
  });

  const charCount = task.length;
  const isValidLength = charCount >= 3 && charCount <= 500;

  // Handle sample task selection
  const handleSampleSelect = useCallback((selectedTask: string) => {
    setTask(selectedTask);
  }, []);

  // Submit task for analysis
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isValidLength) {
        setState({
          loading: false,
          result: null,
          error: 'Task must be between 3 and 500 characters',
        });
        return;
      }

      setState({ loading: true, result: null, error: null });

      try {
        const response = await fetch('/api/analyze-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to analyze task');
        }

        const result: TaskResponse = await response.json();
        setState({ loading: false, result, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({
          loading: false,
          result: null,
          error: errorMessage,
        });
      }
    },
    [task, isValidLength]
  );

  // Handle keyboard shortcut (Cmd/Ctrl + Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValidLength) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    },
    [isValidLength, handleSubmit]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full"
    >
      {/* Left: Form Card */}
      <motion.div
        whileHover={{
          boxShadow: '0 20px 25px -5px rgba(29, 69, 134, 0.1), 0 10px 10px -5px rgba(29, 69, 134, 0.04)'
        }}
        transition={{ duration: 0.3 }}
        className="elegant-card p-6 flex flex-col"
      >
        <h2 className="font-playfair text-2xl font-semibold mb-4 text-primary-900">
          Analyze Your Task
        </h2>

        <SampleTasksDropdown onSelect={handleSampleSelect} />

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          {/* Textarea */}
          <motion.div className="space-y-2 flex-1 flex flex-col">
            <label htmlFor="task" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Task Description
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your task here..."
              maxLength={500}
              className="elegant-input w-full flex-1 min-h-20 resize-none text-sm"
            />

            {/* Character counter */}
            <div className="flex justify-between items-center text-sm">
              <span className={charCount < 3 ? 'text-red-600 font-medium' : 'text-neutral-600'}>
                {charCount} / 500 characters
              </span>
              {charCount < 3 && (
                <span className="text-red-600 text-xs font-medium">
                  Minimum 3 characters required
                </span>
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(29, 69, 134, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            disabled={!isValidLength || state.loading}
            type="submit"
            className={`elegant-button w-full py-3 px-4 text-sm ${
              state.loading || !isValidLength
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            {state.loading ? (
              <motion.div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.98, 1, 0.98]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <div className="w-2 h-2 rounded-full bg-white" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-white" style={{ animationDelay: '0.4s' }} />
                </motion.div>
                <span>Analyzing...</span>
              </motion.div>
            ) : (
              'Analyze Task'
            )}
          </motion.button>

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-neutral-500 text-center font-medium">
            Tip: Press Cmd/Ctrl + Enter to submit quickly
          </p>
        </form>
      </motion.div>

      {/* Right: Results Panel */}
      <div className="flex flex-col overflow-hidden">
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="rounded-xl border-2 border-red-200 bg-red-50 p-5 text-red-800 shadow-elegant"
            >
              <p className="font-semibold">Error</p>
              <p className="text-sm">{state.error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state.result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] }}
              className="flex flex-col h-full overflow-hidden"
            >
              <h2 className="font-playfair text-xl font-semibold mb-3 text-primary-900">Analysis Results</h2>
              <div className="overflow-y-auto flex-1">
                <TaskResult result={state.result} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="elegant-card p-6 flex-1 flex items-center justify-center text-neutral-400 text-sm"
            >
              Submit a task to see analysis results
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
