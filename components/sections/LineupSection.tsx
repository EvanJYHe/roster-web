"use client";

import { useEffect, useState } from "react";

import { EjectIcon, LearnIcon, RankIcon, RouteIcon } from "@/components/icons";
import {
  LearningVisual,
  PortabilityVisual,
  RankingsVisual,
  SearchVisual,
} from "@/components/terminal/visuals";

export const LINEUP = [
  {
    id: "learning",
    label: "Self-learning",
    role: "ranks on evidence",
    icon: <LearnIcon />,
    window: "~/proj \u2014 roster outcomes",
    title: "It learns which tools actually work",
    body:
      "Most routers rank tools by how well the description matches. Roster grades what happens after the call, on outcome, latency and drift, so what keeps working keeps getting picked.",
    bullets: [
      "Ranked on evidence, not on wording",
      "Learned locally, from your own history",
    ],
    visual: <LearningVisual />,
  },
  {
    id: "search",
    label: "Tool search",
    role: "only what fits the task",
    icon: <RouteIcon />,
    window: "~/proj \u2014 roster draft",
    title: "Irrelevant tools never reach the model",
    body:
      "Every tool gets indexed. Each task searches that index and only the matches pass through. Nothing is disconnected; the rest simply never reaches the context window.",
    bullets: [
      "Every tool indexed, then searched per request",
      "Keyword search built in, semantic search optional",
    ],
    visual: <SearchVisual />,
  },
  {
    id: "rankings",
    label: "Rankings",
    role: "signed and reproducible",
    icon: <RankIcon />,
    window: "~/proj \u2014 roster standings",
    title: "Rankings anyone can re-run",
    body:
      "Registries list servers. Roster scores them. Certified servers run one identical task suite in an open harness, and every published number is signed and version-bound.",
    bullets: [
      "Compared only against an identical suite",
      "Signed scores you can verify yourself",
    ],
    visual: <RankingsVisual />,
  },
  {
    id: "portability",
    label: "No lock-in",
    role: "one command out",
    icon: <EjectIcon />,
    window: "~/proj \u2014 roster sync",
    title: "One command in, one command out",
    body:
      "roster sync points every MCP client at one endpoint, backing up each file first. roster eject restores them byte for byte. No account, and nothing leaves your machine.",
    bullets: [
      "Config files restored byte for byte",
      "No account, no key, no hosted service",
    ],
    visual: <PortabilityVisual />,
  },
] as const;

// Figures are from the sources cited in the project README, linked so the
// claim is checkable rather than asserted.

const LINEUP_CYCLE_MS = 9000;

export function LineupSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  // Auto-advance introduces all four pillars on its own, but hands control
  // over permanently the moment someone picks a card themselves.
  const [autoplay, setAutoplay] = useState(true);
  const active = LINEUP[activeIndex];

  useEffect(() => {
    if (!autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(
      () => setActiveIndex((index) => (index + 1) % LINEUP.length),
      LINEUP_CYCLE_MS,
    );
    return () => clearTimeout(timer);
  }, [autoplay, activeIndex]);

  return (
    <section className="section lineup-section" id="showcase" aria-labelledby="lineup-title">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="section-tag"><i />Why roster</span>
          <h2 id="lineup-title">Every other router reads the label. Roster reads the receipts.</h2>
          <p className="section-sub">
            One local endpoint in front of every MCP server you own.
          </p>
        </div>

        <div className="lineup-grid reveal">
          <div className="lineup-tabs" role="tablist" aria-label="What roster does">
            <span
              aria-hidden="true"
              className="lineup-marker"
              style={{ "--i": activeIndex, "--n": LINEUP.length } as React.CSSProperties}
            />
            {LINEUP.map((entry, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  aria-selected={isActive}
                  className={`lineup-tab${isActive ? " lineup-tab-active" : ""}`}
                  key={entry.id}
                  onClick={() => {
                    setActiveIndex(index);
                    setAutoplay(false);
                  }}
                  role="tab"
                  type="button"
                >
                  <span className="lineup-tab-icon">{entry.icon}</span>
                  <span className="lineup-tab-text">
                    <span className="lineup-tab-label">{entry.label}</span>
                    <span className="lineup-tab-role">{entry.role}</span>
                  </span>
                  {isActive && autoplay ? (
                    <span className="lineup-progress" key={activeIndex} />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="lineup-panel" role="tabpanel">
            <div className="lineup-stage">
              <div className="lineup-window">
                <div className="term-titlebar">
                  <span className="term-lights"><i /><i /><i /></span>
                  <span className="term-title" key={active.id}>{active.window}</span>
                </div>
                {active.visual}
              </div>
            </div>

            <div className="lineup-copy" key={active.id}>
              <h3>{active.title}</h3>
              <p>{active.body}</p>
              <ul className="lineup-bullets">
                {active.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
