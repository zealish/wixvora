"use client";

import { Check, X } from "lucide-react";
import { usePricing } from "./pricing-provider";

export interface PricingPlan {
  id: "free" | "starter" | "pro" | "premium";
  name: string;
  description: string;
  featuresHeader?: string;
  prices: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  unavailable?: string[];
  buttonText: string;
  buttonVariant: "outline" | "gradient";
  popular: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const { billingCycle } = usePricing();
  const price = plan.prices[billingCycle];

  return (
    <article
      className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 ${
        plan.popular
          ? "border-brand-600 popular-card-shadow lg:-translate-y-2"
          : "card-shadow border-slate-200"
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="bg-brand-600 absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase shadow-md">
          MOST POPULAR
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-1 min-h-[32px] text-xs text-slate-500">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 py-2">
          <span className="text-4xl font-extrabold text-slate-900">
            ${price}
          </span>
          <span className="text-sm font-semibold text-slate-400">/month</span>
        </div>

        {/* Button */}
        <button
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
            plan.buttonVariant === "gradient"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 active:scale-95"
              : "text-brand-600 hover:bg-brand-50 border-2 border-indigo-100 hover:border-indigo-600"
          }`}
        >
          {plan.buttonText}
        </button>

        {/* Features */}
        <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
          {plan.featuresHeader && (
            <p
              className={`text-[11px] font-extrabold tracking-wider uppercase ${
                plan.popular ? "text-brand-600" : "text-slate-900"
              }`}
            >
              {plan.featuresHeader}
            </p>
          )}
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <Check className="h-4 w-4 flex-shrink-0 text-indigo-600" />
              <span>{feature}</span>
            </div>
          ))}
          {plan.unavailable?.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2.5 text-slate-400"
            >
              <X className="h-4 w-4 flex-shrink-0 text-slate-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
