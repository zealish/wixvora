"use client";

import { Search, Sparkles, Sliders, Smartphone, Bot } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";
import { TemplateMockups } from "./template-mockups";

export function TemplatesHero() {
  return (
    <section className="hero-bg relative overflow-hidden border-b border-slate-100 pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <MotionWrapper delay={0}>
              <div className="border-brand-100 bg-brand-50 text-brand-600 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase">
                TEMPLATES
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <h1 className="text-4xl leading-tight font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
                Beautiful Templates <br />
                for{" "}
                <span className="from-brand-600 bg-gradient-to-r via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Every Business
                </span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                Choose from 100+ professionally designed templates and customize
                it to match your brand seamlessly.
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="relative max-w-md pt-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    id="searchInput"
                    placeholder="Search templates..."
                    className="focus:border-brand-500 focus:ring-brand-500/10 w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-4 pl-11 text-sm font-medium shadow-sm transition-all focus:ring-4 focus:outline-none"
                  />
                </div>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.4}>
              <div className="flex flex-wrap gap-4 pt-4 text-xs font-semibold text-slate-600 sm:gap-6 sm:text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-brand-500 h-4 w-4" />
                  <span>100+ Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="text-brand-500 h-4 w-4" />
                  <span>Fully Customizable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="text-brand-500 h-4 w-4" />
                  <span>Mobile Responsive</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="text-brand-500 h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </MotionWrapper>
          </div>

          <MotionWrapper
            variant="fade-left"
            delay={0.2}
            className="relative min-h-[380px] lg:col-span-6"
          >
            <TemplateMockups />
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
