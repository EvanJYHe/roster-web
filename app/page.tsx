"use client";

import { useState } from "react";

const tools = [
  { name: "Filesystem", score: "0.92", active: true },
  { name: "Git", score: "0.71", active: false },
  { name: "Web Search", score: "0.46", active: false },
  { name: "Slack", score: "0.32", active: false },
];

function RosterMark() {
  return (
    <span className="roster-mark" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span className={`arrow ${diagonal ? "arrow-diagonal" : ""}`} aria-hidden="true">
      ↗
    </span>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);

  async function copyInstallCommand() {
    await navigator.clipboard?.writeText("npx @roster/cli init");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="site-shell">
      <div className="tunnel-art" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Roster home">
          <RosterMark />
          <span>Roster</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            Docs
          </a>
          <a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="nav-cta" href="#get-started">
            Get Started <Arrow diagonal />
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-tag">Latest update</span>
            <span className="eyebrow-message">
              Beta v0.1 Now Live
              <span className="eyebrow-arrow" aria-hidden="true">↗</span>
            </span>
          </div>

          <h1>
            The self-healing
            <br />
            tool router for MCP.
          </h1>

          <p className="hero-subtitle">
            Roster finds the right tools when needed, learns from what works,
            <br className="desktop-break" />
            and works with any MCP client.
          </p>

          <div className="hero-actions" id="get-started">
            <a className="button button-primary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
              Get Started <Arrow diagonal />
            </a>
            <a className="button button-secondary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
              View Docs <span className="docs-icon">▱</span>
            </a>
          </div>

          <button className="install-command" type="button" onClick={copyInstallCommand} aria-label="Copy the Roster install command">
            <span className="command-text">$ npx @roster/cli init</span>
            <span className="copy-icon" aria-hidden="true">
              {copied ? "✓" : "▣"}
            </span>
            <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
          </button>
          <p className="command-note">CLI preview · local by default</p>
        </div>

        <section className="routing-demo" aria-label="How Roster routes tools">
          <div className="demo-column">
            <div className="demo-label"><span>1</span> MCP CLIENT REQUEST</div>
            <div className="request-card">
              <p>Summarize the latest errors<br />and open the related files.</p>
              <div className="request-meta">
                <span>client</span>
                <span>any MCP client</span>
              </div>
            </div>
          </div>

          <div className="flow-arrow" aria-hidden="true">→</div>

          <div className="demo-column engine-column">
            <div className="demo-label"><span>2</span> ROSTER MATCH ENGINE</div>
            <div className="engine-card">
              <div className="engine-row">
                <span className="engine-key">Intent</span>
                <span>analyze_error · open_file</span>
              </div>
              <div className="engine-row">
                <span className="engine-key">Context</span>
                <span>project: api-gateway</span>
              </div>
              <div className="engine-row">
                <span className="engine-key">Search</span>
                <span>BM25 + vector</span>
              </div>
              <div className="score-stack">
                <span className="engine-key">Tool scoring</span>
                <div className="score-line"><i style={{ width: "92%" }} /><b>0.92</b></div>
                <div className="score-line"><i style={{ width: "71%" }} /><b>0.71</b></div>
                <div className="score-line"><i style={{ width: "46%" }} /><b>0.46</b></div>
                <div className="score-line"><i style={{ width: "32%" }} /><b>0.32</b></div>
              </div>
            </div>
          </div>

          <div className="flow-arrow" aria-hidden="true">→</div>

          <div className="demo-column matched-column">
            <div className="demo-label"><span>3</span> MATCHED TOOLS</div>
            <div className="matched-card">
              {tools.map((tool) => (
                <div className={`tool-row ${tool.active ? "tool-row-active" : ""}`} key={tool.name}>
                  <span className={`tool-dot ${tool.active ? "tool-dot-active" : ""}`} />
                  <span>{tool.name}</span>
                  <span className="tool-score">{tool.score}</span>
                </div>
              ))}
            </div>
            <p className="best-match">Best match selected</p>
          </div>
        </section>

        <div className="demo-caption">
          <span>ROSTER / MATCH / 0001</span>
          <span><i className="status-dot" /> Learning locally from tool outcomes</span>
        </div>
      </section>

      <section className="feature-strip" aria-label="Roster capabilities">
        <div className="feature-cell">
          <span className="feature-number">01</span>
          <div>
            <h2>Search when needed</h2>
            <p>Keep your agent focused while Roster searches the full MCP surface.</p>
          </div>
        </div>
        <div className="feature-cell">
          <span className="feature-number">02</span>
          <div>
            <h2>Learn what works</h2>
            <p>Local outcome signals make future tool selection more reliable.</p>
          </div>
        </div>
        <div className="feature-cell">
          <span className="feature-number">03</span>
          <div>
            <h2>Works everywhere</h2>
            <p>One local router for Claude, Cursor, Codex, OpenClaw, and more.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top">
          <RosterMark />
          <span>Roster</span>
        </a>
        <span>Self-healing, self-learning tool routing for MCP.</span>
        <a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Open source ↗</a>
      </footer>
    </main>
  );
}
