"use client";

import { motion } from "framer-motion";
import { Lock, Layout, CheckCircle2 } from "lucide-react";

export default function HeroVisualCards() {
  return (
    <div className="relative flex min-h-[320px] items-center justify-center">
      {/* Golden Sparkle */}
      <div className="absolute -top-6 right-6 animate-pulse text-amber-400">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Browser Card */}
        <motion.div
          initial={{ opacity: 0, rotate: -2, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="-rotate-2 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl"
        >
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            <span>yourdomain.com</span>
          </div>
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
            <Layout className="h-8 w-8" />
          </div>
        </motion.div>

        {/* Success Pill */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-12 left-2 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Your Site is Live!
            </p>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-emerald-500/20">
              <div className="h-full w-3/4 rounded-full bg-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="absolute right-2 -bottom-6 w-56 rotate-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 text-white shadow-xl shadow-indigo-300"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider">
              AI-Powered
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug font-bold">
            Smarter Websites,
            <br />
            Better Results.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
