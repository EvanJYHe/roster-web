import { RevealOnScroll } from "@/components/RevealOnScroll";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { Hero } from "@/components/sections/Hero";
import { LineupSection } from "@/components/sections/LineupSection";
import { SiteFooter } from "@/components/sections/SiteFooter";

export default function Home() {
  return (
    <main className="landing-page" id="top">
      <RevealOnScroll />
      <Hero />
      <FeatureSection />
      <LineupSection />
      <SiteFooter />
    </main>
  );
}
