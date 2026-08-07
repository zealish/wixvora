"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FeaturesCta() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full bg-gradient-to-r from-indigo-100/90 via-indigo-50 to-indigo-100/90 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden border border-indigo-100/80"
        >
          
          {/* Left Text */}
          <div className="space-y-2 text-center sm:text-left z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ready to experience all features?
            </h3>
            <p className="text-slate-500 text-sm font-normal">
              Join thousands of users who build amazing websites with Wixvora.
            </p>
          </div>

          {/* Right Button */}
          <div className="z-10 shrink-0">
            <motion.a 
              href="#build" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-colors"
            >
              <span>Start Building for Free</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>

          {/* Soft Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute -right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
}
