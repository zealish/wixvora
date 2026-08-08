"use client";

import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { MotionWrapper } from "./motion-wrapper";

export function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1340px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Content */}
          <MotionWrapper
            variant="fade-right"
            className="space-y-6 lg:col-span-5"
          >
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-600 uppercase">
              READY TO GET STARTED?
            </div>

            {/* Heading */}
            <h2 className="text-4xl leading-[1.15] font-black tracking-tight text-slate-900 sm:text-5xl">
              Ready to build your dream website?
            </h2>

            {/* Paragraph */}
            <p className="max-w-md text-base leading-relaxed font-normal text-slate-500 sm:text-lg">
              Join thousands of users who build smarter and launch faster with
              Wixvora.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href="#get-started"
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs font-medium text-slate-500">
                No credit card required
              </p>
            </div>
          </MotionWrapper>

          {/* Right Visual: Analytics Panel & Mobile Mockup */}
          <MotionWrapper
            variant="fade-left"
            className="relative flex items-center justify-center pt-6 lg:col-span-7 lg:justify-end lg:pt-0"
          >
            {/* Ambient Blob */}
            <div className="pointer-events-none absolute top-10 -left-12 -z-10 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

            {/* Yellow Star Badge */}
            <div className="animate-pulse-soft pointer-events-none absolute -top-6 right-8 z-30 hidden text-amber-300 sm:block">
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Analytics Dashboard Card */}
            <div className="z-10 w-full max-w-2xl rounded-2xl border border-slate-100/90 bg-white/90 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] backdrop-blur sm:p-7">
              {/* Card Header */}
              <div className="mb-6 flex items-center justify-between pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Analytics Overview
                </h3>
                <div className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100">
                  <span>Last 30 days</span>
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">
                    Visitors
                  </span>
                  <div className="text-base font-bold tracking-tight text-slate-900 sm:text-2xl">
                    12,984
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                    <span>&#8593;</span> <span>8.5%</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">
                    Page Views
                  </span>
                  <div className="text-base font-bold tracking-tight text-slate-900 sm:text-2xl">
                    28,421
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                    <span>&#8593;</span> <span>12.6%</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">
                    Conversions
                  </span>
                  <div className="text-base font-bold tracking-tight text-slate-900 sm:text-2xl">
                    3,882
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                    <span>&#8593;</span> <span>16.3%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative pt-2">
                <div className="relative flex h-36 justify-between">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between py-1 pr-2 text-[10px] font-medium text-slate-500">
                    <span>20K</span>
                    <span>15K</span>
                    <span>10K</span>
                    <span>5K</span>
                    <span>0</span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="relative flex-1 border-b border-l border-slate-100 pl-2">
                    {/* Dashed Guide Lines */}
                    <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />

                    <svg
                      className="h-full w-full overflow-visible"
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
                        [0, 75],
                        [60, 40],
                        [120, 70],
                        [180, 50],
                        [240, 70],
                        [300, 20],
                        [360, 45],
                        [400, 15],
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
                <div className="mt-3 flex justify-between pl-8 text-[10px] font-medium text-slate-500">
                  <span>May 5</span>
                  <span>May 12</span>
                  <span>May 19</span>
                  <span>May 26</span>
                  <span>May 30</span>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="absolute top-10 -right-2 z-20 hidden w-48 rotate-1 transform rounded-[28px] border border-slate-700/50 bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/40 transition-transform duration-300 hover:rotate-0 sm:top-12 sm:-right-6 sm:block sm:w-56">
              <div className="flex h-72 flex-col overflow-hidden rounded-[22px] border border-slate-800 bg-slate-950 text-white">
                {/* Mobile Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 p-3">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
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
                  <Menu className="h-3 w-3 text-slate-400" />
                </div>

                {/* Mobile Content */}
                <div className="relative flex flex-1 flex-col justify-end overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 p-4">
                  {/* SVG Mountain Pattern */}
                  <svg
                    className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-40"
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
                    <h4 className="text-sm leading-snug font-extrabold">
                      Build your brand online
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-300">
                      Create a professional website that helps your business
                      grow and stand out.
                    </p>
                    <button
                      type="button"
                      className="mt-1 w-full rounded-lg bg-indigo-600 py-1.5 text-[10px] font-semibold text-white shadow-md transition hover:bg-indigo-500"
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
