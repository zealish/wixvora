"use client";

import { motion } from "framer-motion";
import { usePricing } from "./pricing-provider";

export function BillingToggle() {
  const { billingCycle, setBillingCycle } = usePricing();

  return (
    <div className="mb-12 flex items-center justify-center gap-3">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-100 p-1 shadow-inner">
        <button
          onClick={() => setBillingCycle("monthly")}
          className="relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold"
        >
          {billingCycle === "monthly" && (
            <motion.div
              layoutId="billing-indicator"
              className="absolute inset-0 rounded-xl bg-white shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${billingCycle === "monthly" ? "text-slate-900" : "font-semibold text-slate-600 hover:text-slate-900"}`}
          >
            Monthly
          </span>
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className="relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold"
        >
          {billingCycle === "yearly" && (
            <motion.div
              layoutId="billing-indicator"
              className="absolute inset-0 rounded-xl bg-white shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${billingCycle === "yearly" ? "text-slate-900" : "font-semibold text-slate-600 hover:text-slate-900"}`}
          >
            Yearly
          </span>
          <span className="relative z-10 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-emerald-700">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}
