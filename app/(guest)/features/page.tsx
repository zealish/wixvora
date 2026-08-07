import { FeaturesHero } from "@/components/features/features-hero";
import { FeaturesShowcase } from "@/components/features/features-showcase";
import { FeaturesGrid } from "@/components/features/features-grid";
import { FeaturesCta } from "@/components/features/features-cta";

export default function FeaturesPage() {
  return (
    <>
      <FeaturesHero />
      <FeaturesShowcase />
      <FeaturesGrid />
      <FeaturesCta />
    </>
  );
}
