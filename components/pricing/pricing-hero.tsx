"use client";

import { Check } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";
import HeroVisualCards from "./hero-visual-cards";

export function PricingHero() {
  return (
    <section className="hero-bg relative overflow-hidden border-b border-slate-100 pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <div className="space-y-6 lg:col-span-7">
            <MotionWrapper delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
                PRICING
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Simple, Transparent Pricing <br />
                for{" "}
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Everything You Need
                </span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                Choose the perfect plan to build, manage, and grow your website
                with AI.
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </MotionWrapper>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-5">
            <HeroVisualCards />
          </div>
        </div>
      </div>
    </section>
  );
}
