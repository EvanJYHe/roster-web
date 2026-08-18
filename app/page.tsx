"use client";

import Image from "next/image";

function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      <svg className="signal-art" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <radialGradient id="signal-horizon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eef6f3" stopOpacity="0.16" />
            <stop offset="48%" stopColor="#bcc9c5" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#8f9d99" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse className="field-horizon-glow" cx="800" cy="510" rx="720" ry="190" fill="url(#signal-horizon-glow)" />
      </svg>
    </div>
  );
}

function RosterMark() {
  return (
    <Image
      className="roster-mark"
      src="/roster-mark.png"
      alt=""
      width={395}
      height={512}
      priority
    />
  );
}

function DiagonalArrow() {
  return (
    <svg className="diagonal-arrow" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 14 14 4M6 4h8v8" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="landing-page" id="top">
      <SignalField />

      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Roster home">
          <RosterMark />
          <span className="brand-name">roster</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Docs</a>
          <a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">GitHub</a>
          <a className="nav-button" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            <span>Get Started</span>
            <DiagonalArrow />
          </a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="update-pill">
          <span className="update-label"><i />Latest update</span>
          <span className="update-message">Beta v0.1 Now Live <DiagonalArrow /></span>
        </div>

        <h1 id="hero-title">
          The self-learning
          <br />
          tool router for MCP.
        </h1>

        <p className="hero-description">
          Roster finds the right tools when needed,
          <br />
          {" "}learns from what works, and works with any MCP client.
        </p>

        <div className="hero-actions">
          <a className="hero-button hero-button-primary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            <span>Get Started</span>
            <DiagonalArrow />
          </a>
          <a className="hero-button hero-button-secondary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            <span>View Docs</span>
            <DiagonalArrow />
          </a>
        </div>
      </section>
    </main>
  );
}
