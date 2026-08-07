"use client";

import { usePricing } from "./pricing-provider";

export function BillingToggle() {
  const { billingCycle, setBillingCycle } = usePricing();

  return (
    <div className="mb-12 flex items-center justify-center gap-3">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-100 p-1 shadow-inner">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
            billingCycle === "monthly"
              ? "bg-white text-slate-900 shadow-sm"
              : "font-semibold text-slate-600 hover:text-slate-900"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
            billingCycle === "yearly"
              ? "bg-white text-slate-900 shadow-sm"
              : "font-semibold text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Yearly</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-emerald-700">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}
