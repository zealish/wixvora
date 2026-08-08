"use client";

import {
  StaggerContainer,
  StaggerItem,
} from "@/components/landing/motion-wrapper";
import { PricingCard, type PricingPlan } from "./pricing-card";

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Wixvora.",
    prices: { monthly: 0, yearly: 0 },
    features: [
      "AI Website Builder",
      "500 MB Storage",
      "1 Subdomain",
      "Mobile Responsive",
      "Wixvora Branding",
      "Community Support",
    ],
    unavailable: ["Custom Domain", "Premium Templates"],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Great for personal projects and small websites.",
    featuresHeader: "Everything in Free, plus:",
    prices: { monthly: 9, yearly: 7 },
    features: [
      "10 GB Storage",
      "Custom Domain",
      "Remove Wixvora Branding",
      "Premium Templates",
      "Basic SEO Tools",
      "Email Support",
      "Advanced Analytics",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Ideal for growing businesses and professionals.",
    featuresHeader: "Everything in Starter, plus:",
    prices: { monthly: 19, yearly: 15 },
    features: [
      "50 GB Storage",
      "Advanced SEO Tools",
      "AI Content Generator",
      "Form & Popup Builder",
      "Advanced Analytics",
      "Priority Support",
      "Team Collaboration",
    ],
    buttonText: "Get Started",
    buttonVariant: "gradient",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For businesses that need more power.",
    featuresHeader: "Everything in Pro, plus:",
    prices: { monthly: 39, yearly: 31 },
    features: [
      "Unlimited Storage",
      "Team Collaboration",
      "White Label (Coming Soon)",
      "API Access",
      "Dedicated Support",
      "Priority Feature Access",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
];

export function PricingCardsGrid() {
  return (
    <StaggerContainer className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PRICING_PLANS.map((plan) => (
        <StaggerItem key={plan.id}>
          <PricingCard plan={plan} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
