"use client";

import {
  ArrowRight,
  ChevronDown,
  Menu,
} from "lucide-react";
import { MotionWrapper } from "./motion-wrapper";

export function CtaSection() {
  return (
    <section className="w-full py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-[1340px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <MotionWrapper variant="fade-right" className="lg:col-span-5 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider uppercase">
              READY TO GET STARTED?
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Ready to build your dream website?
            </h2>

            {/* Paragraph */}
            <p className="text-slate-500 text-base sm:text-lg font-normal leading-relaxed max-w-md">
              Join thousands of users who build smarter and launch faster
              with Wixvora.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href="#get-started"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-slate-500 font-medium mt-3">
                No credit card required
              </p>
            </div>
          </MotionWrapper>

          {/* Right Visual: Analytics Panel & Mobile Mockup */}
          <MotionWrapper variant="fade-left" className="lg:col-span-7 relative flex items-center justify-center lg:justify-end pt-6 lg:pt-0">
            {/* Ambient Blob */}
            <div className="absolute -left-12 top-10 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Yellow Star Badge */}
            <div className="absolute -top-6 right-8 z-30 pointer-events-none text-amber-300 animate-pulse-soft hidden sm:block">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Analytics Dashboard Card */}
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur border border-slate-100/90 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] p-6 sm:p-7 z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Analytics Overview
                </h3>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <span>Last 30 days</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">
                    Visitors
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    12,984
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>8.5%</span>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">
                    Page Views
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    28,421
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>12.6%</span>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">
                    Conversions
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    3,882
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>16.3%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative pt-2">
                <div className="flex justify-between h-36 relative">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between text-[10px] font-medium text-slate-500 pr-2 py-1">
                    <span>20K</span>
                    <span>15K</span>
                    <span>10K</span>
                    <span>5K</span>
                    <span>0</span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="flex-1 relative pl-2 border-l border-b border-slate-100">
                    {/* Dashed Guide Lines */}
                    <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />

                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 400 120"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chart_gradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6366f1"
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            stopColor="#6366f1"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        d="M 0 75 Q 30 60, 60 40 T 120 70 T 180 50 T 240 70 T 300 20 T 360 45 T 400 15 L 400 120 L 0 120 Z"
                        fill="url(#chart_gradient)"
                      />
                      <path
                        d="M 0 75 Q 30 60, 60 40 T 120 70 T 180 50 T 240 70 T 300 20 T 360 45 T 400 15"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      {[
                        [0, 75], [60, 40], [120, 70], [180, 50],
                        [240, 70], [300, 20], [360, 45], [400, 15],
                      ].map(([cx, cy]) => (
                        <circle
                          key={`${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r="3.5"
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between pl-8 text-[10px] font-medium text-slate-500 mt-3">
                  <span>May 5</span>
                  <span>May 12</span>
                  <span>May 19</span>
                  <span>May 26</span>
                  <span>May 30</span>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="absolute -right-2 sm:-right-6 top-10 sm:top-12 w-48 sm:w-56 bg-slate-900 rounded-[28px] p-2.5 shadow-2xl shadow-slate-900/40 border border-slate-700/50 z-20 hidden sm:block transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-slate-950 rounded-[22px] overflow-hidden text-white flex flex-col h-72 border border-slate-800">
                {/* Mobile Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M4 8L10 24L16 12L22 24L28 8"
                        stroke="url(#mob_logo)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="mob_logo"
                          x1="4"
                          y1="8"
                          x2="28"
                          y2="24"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#3B82F6" />
                          <stop offset="1" stopColor="#4F46E5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-[10px] font-extrabold tracking-tight">
                      WIXVORA
                    </span>
                  </div>
                  <Menu className="w-3 h-3 text-slate-400" />
                </div>

                {/* Mobile Content */}
                <div className="p-4 flex-1 flex flex-col justify-end bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 relative overflow-hidden">
                  {/* SVG Mountain Pattern */}
                  <svg
                    className="absolute inset-x-0 top-0 h-28 opacity-40 pointer-events-none"
                    viewBox="0 0 400 112"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="mountain-gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,112 L0,80 L50,40 L100,60 L150,20 L200,50 L250,30 L300,55 L350,35 L400,60 L400,112 Z"
                      fill="url(#mountain-gradient)"
                    />
                    <path
                      d="M0,112 L0,90 L80,60 L160,80 L240,50 L320,70 L400,55 L400,112 Z"
                      fill="url(#mountain-gradient)"
                      opacity="0.7"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <h4 className="text-sm font-extrabold leading-snug">
                      Build your brand online
                    </h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Create a professional website that helps your business
                      grow and stand out.
                    </p>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] shadow-md transition mt-1"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
