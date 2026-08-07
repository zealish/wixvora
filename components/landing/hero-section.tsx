"use client";

import { useState } from "react";
import { ArrowRight, Play, Check } from "lucide-react";
import { BuilderPreview } from "./builder-preview";
import { DemoModal } from "./demo-modal";
import { MotionWrapper } from "./motion-wrapper";

export function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <main className="relative mx-auto my-auto w-full max-w-[1400px] px-6 py-8 md:px-12 lg:py-16">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-20 top-0 -z-10 h-[600px] w-[600px] animate-pulse-soft rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-blue-50/80 blur-3xl" />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy */}
          <div className="z-10 flex flex-col items-start space-y-7 pr-0 lg:col-span-5 lg:pr-2">
            <MotionWrapper delay={0}>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                AI-POWERED WEBSITE BUILDER
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-[62px]">
                Build <span className="text-gradient">Smarter.</span>
                <br />
                Launch <span className="text-gradient">Faster.</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="max-w-lg text-lg font-normal leading-relaxed text-slate-600 sm:text-xl">
                Create professional websites effortlessly with the power of AI.
              </p>
            </MotionWrapper>

            <MotionWrapper variant="scale-fade" delay={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#build"
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
                >
                  <span>Start Building for Free</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-indigo-600 transition-all hover:bg-indigo-50/60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-500/30 bg-white text-indigo-600 shadow-sm transition-all group-hover:scale-110 group-hover:border-indigo-600">
                    <Play className="h-3 w-3 translate-x-[1px]" />
                  </span>
                  <span>Watch Demo</span>
                </button>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.4}>
              <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3.5 border-t border-slate-100 pt-6 text-sm font-medium text-slate-700">
                {[
                  "No Coding Needed",
                  "AI-Powered",
                  "Mobile Responsive",
                  "SEO Optimized",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </MotionWrapper>
          </div>

          {/* Right Column: Builder Preview */}
          <MotionWrapper variant="fade-left" delay={0.2} className="relative w-full pt-4 lg:col-span-7 lg:pt-0">
            {/* Decorative Sparkle */}
            <div className="pointer-events-none absolute -top-10 right-28 z-20 hidden animate-float sm:block">
              <div className="relative">
                <svg
                  width="120"
                  height="80"
                  viewBox="0 0 120 80"
                  fill="none"
                  className="text-indigo-400"
                >
                  <path
                    d="M10 70 Q 60 10, 110 30"
                    stroke="#818CF8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            </div>

            {/* Decorative Star */}
            <div className="pointer-events-none absolute -right-6 top-12 z-20 hidden animate-pulse-soft text-amber-400 sm:block">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            <BuilderPreview onDemoClick={() => setIsDemoOpen(true)} />
          </MotionWrapper>
        </div>
      </main>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </>
  );
}
