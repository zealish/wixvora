"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FeaturesHero() {
  return (
    <section className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 pt-12 pb-24 lg:pt-20 lg:pb-32 my-auto text-center flex flex-col items-center justify-center">
      
      {/* Soft Background Ambient Glows */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -right-20 top-1/4 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-soft"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="absolute -left-20 top-1/3 w-[450px] h-[450px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Floating Decorative Vector Elements (Stars, Sparkles, Orbit Lines) */}
      {/* Left Yellow 4-point Star */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute left-8 sm:left-16 top-28 z-10 pointer-events-none text-amber-300 animate-float"
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
      </motion.div>

      {/* Left Dashed Curved Orbit Line */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute left-10 sm:left-24 top-40 z-0 pointer-events-none hidden md:block"
      >
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none">
          <path d="M10 10 C 80 110, 150 20, 210 90" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.7"/>
        </svg>
      </motion.div>

      {/* Left Blue Cross / Sparkle */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="absolute left-28 sm:left-40 bottom-12 z-10 pointer-events-none text-indigo-500"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Right Upper Blue Sparkle Cross */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="absolute right-16 sm:right-32 top-16 z-10 pointer-events-none text-indigo-500"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Right Upper Orbit Line & Cross */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute right-12 sm:right-28 top-20 z-0 pointer-events-none hidden md:block"
      >
        <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
          <path d="M10 80 Q 90 0, 170 50" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6"/>
        </svg>
        <div className="absolute right-2 bottom-6 text-indigo-400">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center">
        
        {/* Centered FEATURES Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center px-5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-100/80 text-indigo-600 text-xs font-extrabold tracking-widest uppercase shadow-sm"
        >
          FEATURES
        </motion.div>

        {/* Hero Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl sm:text-6xl md:text-[64px] font-black tracking-tight text-slate-900 leading-[1.12] max-w-3xl"
        >
          Powerful Features to<br className="hidden sm:inline" /> Build <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Smarter</span> Websites
        </motion.h1>

        {/* Hero Subtitle Paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-2xl px-2"
        >
          Wixvora combines AI technology with an intuitive builder to give you everything you need to create, optimize, and grow your online presence.
        </motion.p>

        {/* Hero Action CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-2"
        >
          <motion.a 
            href="#build" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 transition-shadow"
          >
            <span>Start Building for Free</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>

      </div>

    </section>
  );
}
