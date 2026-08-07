import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";

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
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <TemplateShowcase />
      <StatsSection />
    </>
  );
}
