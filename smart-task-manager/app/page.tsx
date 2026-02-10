// ============================================
// HOME PAGE
// What: Single-page layout with header, hero, task analyzer, and footer
// Why: Entry point for the app — assembles the full-screen layout
// ============================================

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import TaskAnalyzer from '@/app/components/TaskAnalyzer';

export default function Home() {
  return (
    <main className="h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex flex-col overflow-hidden">
      {/* Header with Logo */}
      <header className="border-b border-primary-800/20 bg-primary-900 z-10 shadow-elegant shrink-0">
        <div className="container mx-auto px-6 py-2 flex items-center justify-between">
          {/* OneNine Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/logo_onenine.png"
              alt="OneNine"
              width={167}
              height={34}
              className="h-8 w-auto brightness-0 invert"
              priority
            />
          </motion.div>

          {/* Tagline - Light text for contrast with dark header */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm text-white font-medium hidden md:block"
          >
            AI-Powered Task Intelligence
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-3 pb-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-playfair text-2xl font-bold text-primary-900 mb-1 tracking-tight">
              Smart Task Manager
            </h1>
            <p className="text-xs text-neutral-600 font-light">
              Intelligent categorization and prioritization powered by
              <span className="text-primary-600 font-medium"> Claude AI</span>
            </p>
          </motion.div>
        </div>

        {/* Main Component */}
        <div className="flex-1 overflow-hidden px-6 pb-2">
          <div className="max-w-6xl mx-auto h-full">
            <TaskAnalyzer />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 shrink-0">
        <div className="container mx-auto px-6 py-3">
          <p className="text-center text-xs text-neutral-500">
            Custom built for OneNine from the mind of Abe Reyes
          </p>
        </div>
      </footer>
    </main>
  );
}
