// ============================================
// SAMPLE TASKS DROPDOWN
// What: Dropdown menu of pre-written tasks grouped by category
// Why: Lets users quickly try the analyzer without typing their own task
// ============================================

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SampleTask {
  category: string;
  task: string;
}

const SAMPLE_TASKS: SampleTask[] = [
  // Work
  { category: 'Work', task: 'Fix bug in authentication module - urgent' },
  { category: 'Work', task: 'Review Sarah pull request by end of day' },
  { category: 'Work', task: 'Prepare presentation for client meeting next Tuesday' },
  { category: 'Work', task: 'Update API documentation' },
  { category: 'Work', task: 'Schedule team standup for tomorrow morning' },

  // Personal
  { category: 'Personal', task: 'Call mom this weekend' },
  { category: 'Personal', task: 'Buy groceries for dinner party on Saturday' },
  { category: 'Personal', task: 'Return library books' },
  { category: 'Personal', task: 'Plan summer vacation' },

  // Health
  { category: 'Health', task: 'Schedule dentist appointment for next Friday' },
  { category: 'Health', task: 'Go for a run tomorrow morning' },
  { category: 'Health', task: 'Refill prescription before it runs out' },
  { category: 'Health', task: 'Book annual physical exam' },

  // Finance
  { category: 'Finance', task: 'Pay electricity bill before the 15th' },
  { category: 'Finance', task: 'Review quarterly investment portfolio' },
  { category: 'Finance', task: 'File expense report from last week trip' },
  { category: 'Finance', task: 'Research investment options for retirement savings' },

  // Edge cases
  { category: 'Other', task: 'Something important I need to do' },
  { category: 'Other', task: 'URGENT!!!' },
  { category: 'Other', task: 'Call about the thing' },
];

interface SampleTasksDropdownProps {
  onSelect: (task: string) => void;
}

const categoryColors = {
  Work: 'text-primary-600',
  Personal: 'text-purple-600',
  Health: 'text-emerald-600',
  Finance: 'text-accent-600',
  Other: 'text-neutral-600',
};

export default function SampleTasksDropdown({ onSelect }: SampleTasksDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedTasks = SAMPLE_TASKS.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task.task);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="mb-8 relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 text-left bg-white/50 border-2 border-neutral-200 rounded-xl hover:border-primary-300 transition-all duration-200 flex items-center justify-between backdrop-blur-sm"
      >
        <span className="text-neutral-700 font-medium">Try a sample task</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-neutral-400"
        >
          ▼
        </motion.span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 border-2 border-neutral-200 rounded-xl shadow-elegant-xl z-10 max-h-64 overflow-y-auto backdrop-blur-md"
        >
          {Object.entries(groupedTasks).map(([category, tasks]) => (
            <div key={category}>
              <div className={`px-5 py-3 font-semibold text-sm ${categoryColors[category as keyof typeof categoryColors]} bg-neutral-50 border-b border-neutral-200 sticky top-0`}>
                {category}
              </div>
              {tasks.map((task) => (
                <motion.button
                  key={task}
                  whileHover={{ backgroundColor: 'rgba(29, 69, 134, 0.04)' }}
                  onClick={() => {
                    onSelect(task);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-sm text-neutral-700 hover:bg-primary-50/30 border-b border-neutral-100 last:border-b-0 transition-colors duration-150"
                >
                  {task}
                </motion.button>
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
