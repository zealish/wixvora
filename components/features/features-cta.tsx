"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FeaturesCta() {
  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-r from-indigo-100/90 via-indigo-50 to-indigo-100/90 p-8 sm:flex-row sm:p-12"
        >
          {/* Left Text */}
          <div className="z-10 space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Ready to experience all features?
            </h3>
            <p className="text-sm font-normal text-slate-500">
              Join thousands of users who build amazing websites with Wixvora.
            </p>
          </div>

          {/* Right Button */}
          <div className="z-10 shrink-0">
            <motion.a
              href="#build"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
            >
              <span>Start Building for Free</span>
              <ArrowRight className="h-4 w-4" />
            </motion.a>
          </div>

          {/* Soft Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute top-1/2 -right-10 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
