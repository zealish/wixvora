import type { Metadata } from "next";
import {
  PricingProvider,
  PricingHero,
  BillingToggle,
  PricingCardsGrid,
  ComparisonTable,
  FaqSection,
  PricingCtaBanner,
} from "@/components/pricing";

export const metadata: Metadata = {
  title: "Pricing - Wixvora",
  description:
    "Simple, transparent pricing for everything you need to build your website.",
};

export default function PricingPage() {
  return (
    <PricingProvider>
      <PricingHero />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <BillingToggle />
        <PricingCardsGrid />
        <ComparisonTable />
        <FaqSection />
        <PricingCtaBanner />
      </main>
    </PricingProvider>
  );
}
