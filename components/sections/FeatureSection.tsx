import { DriftIcon, EndpointIcon, FailoverIcon, KeyIcon } from "@/components/icons";

// Deliberately the parts the tabbed section below does not cover, so the two
// read as overview then deep dive rather than saying the same thing twice.
export const FEATURES = [
  {
    title: "One endpoint",
    icon: <EndpointIcon />,
    body: "Claude Code, Cursor, Codex and OpenClaw all point at the same local router. One config entry each, instead of one per server.",
  },
  {
    title: "Automatic failover",
    icon: <FailoverIcon />,
    body: "When a tool hard-fails, Roster offers the next-ranked equivalent, so one bad server does not take the whole task down with it.",
  },
  {
    title: "Drift quarantine",
    icon: <DriftIcon />,
    body: "When a tool's definition changes underneath you, it is benched locally and held back until you choose to re-admit it.",
  },
  {
    title: "Keys stay put",
    icon: <KeyIcon />,
    body: "Credentials live in one owner-only file and are passed straight through to backends. Never logged, never written to the outcome record.",
  },
] as const;

export function FeatureSection() {
  return (
    <section className="section features-section" aria-labelledby="features-title">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="section-tag"><i />Product overview</span>
          <h2 id="features-title">One local router in front of every server you own.</h2>
          <p className="section-sub">
            Roster sits between your agent and your tools. Nothing is hosted, nothing
            is uploaded, and everything it changes it can put back.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ title, icon, body }, index) => (
            <div
              className="feature-card reveal"
              key={title}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="feature-icon">{icon}</span>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
