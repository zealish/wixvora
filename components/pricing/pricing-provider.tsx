"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type BillingCycle = "monthly" | "yearly";

interface PricingContextType {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

const PricingContext = createContext<PricingContextType | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <PricingContext.Provider value={{ billingCycle, setBillingCycle }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}
