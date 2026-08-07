"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

export function PricingCtaBanner() {
  return (
    <MotionWrapper className="mt-16">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-6 shadow-sm sm:p-10 md:flex-row">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Ready to build your dream website?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Join thousands of creators and businesses who build faster with
              Wixvora.
            </p>
          </div>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-indigo-200 active:scale-95 md:w-auto">
          <span>Get Started Free</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </MotionWrapper>
  );
}
