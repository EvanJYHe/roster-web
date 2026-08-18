"use client";

function SignalField() {
  const routePaths = [
    "M -70 574 C 70 548 150 615 285 584 S 510 540 655 580 S 520 665 335 650 S 90 710 -55 690",
    "M -55 642 C 105 612 185 698 320 675 S 515 615 620 660 S 480 745 290 728 S 80 790 -40 760",
    "M -40 720 C 125 685 220 760 365 720 S 555 675 680 705 S 520 815 300 785 S 80 850 -40 820",
    "M 0 532 C 130 510 245 568 380 550 S 575 510 730 548",
    "M -30 796 C 115 770 225 836 400 795 S 605 748 760 780",
    "M 40 602 C 160 580 230 630 360 610 S 535 574 690 606",
  ];

  const routeNodes = [
    [100, 558, 2.5],
    [285, 584, 2.2],
    [335, 650, 2.8],
    [510, 540, 2.2],
    [620, 660, 2.5],
    [300, 728, 2.1],
    [680, 705, 2.7],
    [400, 795, 2.1],
  ];

  const towers = [
    [100, 548, 385],
    [190, 542, 430],
    [330, 532, 328],
    [470, 522, 392],
    [575, 520, 360],
    [700, 518, 410],
  ];

  return (
    <div className="signal-field" aria-hidden="true">
      <svg className="signal-art" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <radialGradient id="signal-horizon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eef6f3" stopOpacity="0.16" />
            <stop offset="48%" stopColor="#bcc9c5" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#8f9d99" stopOpacity="0" />
          </radialGradient>
          <filter id="signal-node-glow" x="-300%" y="-300%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="signal-vertical-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="28%" stopColor="white" stopOpacity="0.03" />
            <stop offset="42%" stopColor="white" stopOpacity="0.62" />
            <stop offset="54%" stopColor="white" stopOpacity="1" />
            <stop offset="67%" stopColor="white" stopOpacity="0.84" />
            <stop offset="79%" stopColor="white" stopOpacity="0.38" />
            <stop offset="91%" stopColor="white" stopOpacity="0.04" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="signal-vertical-mask">
            <rect width="1600" height="900" fill="url(#signal-vertical-fade)" />
          </mask>
        </defs>

        <ellipse className="field-horizon-glow" cx="800" cy="510" rx="720" ry="190" fill="url(#signal-horizon-glow)" />

        <g className="field-towers" mask="url(#signal-vertical-mask)">
          <g>
            {towers.map(([x, base, top]) => (
              <path key={`tower-${x}`} d={`M ${x} ${base} V ${top}`} />
            ))}
            <path d="M 18 552 V 420 M 254 538 V 365 M 410 526 V 402" />
          </g>
          <g transform="translate(1600 0) scale(-1 1)">
            {towers.map(([x, base, top]) => (
              <path key={`tower-mirror-${x}`} d={`M ${x} ${base} V ${top}`} />
            ))}
            <path d="M 18 552 V 420 M 254 538 V 365 M 410 526 V 402" />
          </g>
        </g>

        <g className="field-routes" mask="url(#signal-vertical-mask)">
          <g>
            {routePaths.map((d, index) => <path key={`route-${index}`} d={d} />)}
          </g>
          <g transform="translate(1600 0) scale(-1 1)">
            {routePaths.map((d, index) => <path key={`route-mirror-${index}`} d={d} />)}
          </g>
        </g>

        <g className="field-points" filter="url(#signal-node-glow)">
          <g>
            {routeNodes.map(([cx, cy, r], index) => (
              <circle key={`node-${index}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
          <g transform="translate(1600 0) scale(-1 1)">
            {routeNodes.map(([cx, cy, r], index) => (
              <circle key={`node-mirror-${index}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

function RosterMark() {
  return (
    <span className="roster-mark" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
    </span>
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
      <div className="ambient-light ambient-light-left" aria-hidden="true" />
      <div className="ambient-light ambient-light-right" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Roster home">
          <RosterMark />
          <span>Roster</span>
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
