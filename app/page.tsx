"use client";

import { RevealOnScroll } from "@/components/RevealOnScroll";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { Hero } from "@/components/sections/Hero";
import { LineupSection } from "@/components/sections/LineupSection";
import { SiteFooter } from "@/components/sections/SiteFooter";

/* Marked as a client tree deliberately.

   Pushing the boundary down so the sections could render on the server was
   measurably worse here: it saved 13 KB of JS but Next then serialises all of
   the static markup, the 128-glyph corridor and the 4,116-cell skyline, into
   an RSC flight payload as well as the HTML. Gzipped that cost 39 KB, for a
   net 25 KB more over the wire and roughly 3x the HTML to first paint. This
   page has no client-side navigation to spend that payload on. */
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
