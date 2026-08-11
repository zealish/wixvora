import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";

export default async function HomePage() {
  // No redirect - allow everyone (logged-in or not) to view landing page

  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <TemplateShowcase />
      <StatsSection />
      <CtaSection />
    </>
  );
}
