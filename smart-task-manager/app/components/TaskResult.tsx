// ============================================
// TASK RESULT DISPLAY
// What: Renders the AI analysis result with category badge, priority indicator,
//       reasoning, due date, and a copy-to-clipboard button
// Why: Provides clear visual feedback for each analysis field
// How: Maps category/priority to color styles, uses Framer Motion stagger animation
// ============================================

'use client';

import { motion } from 'framer-motion';
import { TaskResponse } from '@/app/lib/types';
import { useState } from 'react';

interface TaskResultProps {
  result: TaskResponse;
}

// Category styling with accent bars
const categoryStyles = {
  Work: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
    accent: 'bg-primary-600'
  },
  Personal: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    accent: 'bg-purple-600'
  },
  Health: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-600'
  },
  Finance: {
    bg: 'bg-accent-50',
    text: 'text-accent-700',
    border: 'border-accent-200',
    accent: 'bg-accent-600'
  },
  Other: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    accent: 'bg-neutral-600'
  },
};

// Priority styling with custom indicators
const priorityStyles = {
  High: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
    border: 'border-red-200',
    text: 'text-red-800',
    indicator: (
      <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
    ),
    label: 'High Priority',
  },
  Medium: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    indicator: (
      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
    ),
    label: 'Medium Priority',
  },
  Low: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    indicator: (
      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
    ),
    label: 'Low Priority',
  },
};

// Container animation variants with refined timing
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6
    },
  },
};

export default function TaskResult({ result }: TaskResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryStyle = categoryStyles[result.category];
  const priorityStyle = priorityStyles[result.priority];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="elegant-card p-8"
    >
      {/* Category Badge with Accent Bar */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full ${categoryStyle.accent}`} />
          <span className={`text-sm font-semibold px-4 py-2 rounded-lg border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
            {result.category}
          </span>
        </div>
      </motion.div>

      {/* Priority Indicator with Glowing Dot */}
      <motion.div
        variants={itemVariants}
        className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${priorityStyle.bg} ${priorityStyle.border}`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {priorityStyle.indicator}
        </motion.div>
        <span className={`font-semibold ${priorityStyle.text}`}>
          {priorityStyle.label}
        </span>
      </motion.div>

      {/* Reasoning with refined typography */}
      <motion.div variants={itemVariants} className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Analysis
        </h3>
        <p className="text-neutral-700 leading-relaxed font-light text-lg">
          {result.reasoning}
        </p>
      </motion.div>

      {/* Due Date with SVG Icon */}
      {result.due_date && (
        <motion.div variants={itemVariants} className="mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              Due Date
            </p>
            <p className="text-neutral-700 font-medium mt-1">
              {(() => {
                // Append T00:00:00 to treat YYYY-MM-DD as local time, not UTC
                const dateStr = result.due_date!;
                const date = dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
                  ? new Date(dateStr + 'T00:00:00')
                  : new Date(dateStr);
                return date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              })()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Copy Button with Refined Styling */}
      <motion.div variants={itemVariants} className="mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
              : 'bg-neutral-50 text-neutral-700 border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50'
          }`}
        >
          {copied ? '✓ Copied to Clipboard' : 'Copy JSON Response'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
