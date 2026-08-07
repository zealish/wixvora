import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.user.accountType === "CLIENT") {
      redirect("/client");
    } else {
      redirect("/staff");
    }
  }

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
