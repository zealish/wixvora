"use client";

import { motion } from "framer-motion";

export function TemplateMockups() {
  return (
    <div className="relative flex min-h-[380px] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
        animate={{ opacity: 1, rotate: -15, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute -top-4 right-8 animate-pulse text-amber-400"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </motion.div>

      <div className="relative w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ rotate: 0 }}
          className="absolute -top-8 left-12 w-80 transform rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl transition-transform duration-300"
        >
          <div className="flex items-center gap-1.5 border-b border-slate-800 px-2 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </div>
          <div className="space-y-2 p-4">
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
              Digital Agency
            </span>
            <h4 className="text-xs font-bold text-white">
              Digital solutions that drive results
            </h4>
            <div className="flex h-16 items-center justify-center rounded bg-gradient-to-r from-purple-900 to-indigo-900">
              <div className="h-8 w-8 rotate-45 rounded border border-indigo-400/30 bg-indigo-500/20"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className="relative z-10 w-84 transform rounded-xl border border-slate-100 bg-white p-2.5 shadow-2xl transition-transform duration-300"
        >
          <div className="flex items-center gap-1.5 border-b border-slate-100 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
          </div>
          <div className="flex items-center gap-3 p-3">
            <div className="flex-1 space-y-1.5">
              <h4 className="text-sm leading-tight font-bold text-slate-900">
                Sustainable living for a better tomorrow
              </h4>
              <p className="text-[10px] text-slate-500">
                Eco friendly solutions tailored for eco brands.
              </p>
              <span className="inline-block rounded bg-emerald-800 px-2 py-1 text-[9px] font-bold text-white">
                Learn More
              </span>
            </div>
            <div className="h-24 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80"
                alt="Plant"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ rotate: 0 }}
          className="absolute right-0 -bottom-10 z-20 w-72 transform rounded-xl border border-slate-100 bg-white p-2.5 shadow-2xl transition-transform duration-300"
        >
          <div className="flex items-center gap-1.5 border-b border-slate-100 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-slate-200"></span>
            <span className="h-2 w-2 rounded-full bg-slate-200"></span>
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Spark Your
                <br />
                Creativity
              </h4>
              <div className="mt-2 inline-block rounded bg-slate-900 px-2 py-0.5 text-[9px] text-white">
                Explore Features
              </div>
            </div>
            <div className="h-20 w-20 rounded-lg bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-500"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
