"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

export function AiBanner() {
  return (
    <MotionWrapper>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-6 shadow-sm sm:p-8 md:flex-row"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                Can't find the perfect template?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Let AI help you create a custom template that fits your needs
                perfectly.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-indigo-200 active:scale-95 md:w-auto"
          >
            <span>Create with AI</span>
            <Wand2 className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </section>
    </MotionWrapper>
  );
}
