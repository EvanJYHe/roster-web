"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type DepthMark = {
  assetWidth?: number;
  label?: string;
  slug: string;
  variant: "apple" | "asset" | "combo" | "icon" | "microsoft" | "openai" | "word";
};

const DEPTH_MARKS: DepthMark[] = [
  { slug: "google", label: "Google", variant: "word" },
  { slug: "apple", variant: "apple" },
  { slug: "openai", variant: "openai" },
  { slug: "microsoft", label: "Microsoft", variant: "microsoft" },
  { slug: "github", label: "GitHub", variant: "combo" },
  { slug: "notion", label: "Notion", variant: "combo" },
  { slug: "amazonaws", assetWidth: 52, variant: "asset" },
  { slug: "stripe", label: "stripe", variant: "word" },
  { slug: "vercel", label: "Vercel", variant: "combo" },
  { slug: "slack", assetWidth: 56, variant: "asset" },
];

const GRID_WIDTH = 1600;
const GRID_HEIGHT = 900;
const VANISHING_Y = 548;
const LANE_COUNT = 18;
const LANE_START_Y = 46;
const LANE_STEP_Y = 62;
const LANE_GAP = 8;
const LANE_BOUNDARY_Y = Array.from(
  { length: LANE_COUNT + 1 },
  (_, index) => LANE_START_Y + index * LANE_STEP_Y,
);
const MARKS_PER_LANE = 8;
const LOGO_DEPTHS = [0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88];

function DepthMarkGlyph({
  opacity,
  position,
  rotation,
  scale,
  mark,
}: {
  opacity: number;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  mark: DepthMark;
}) {
  return (
    <g
      className="depth-mark"
      opacity={opacity}
      transform={`translate(${position.x.toFixed(3)} ${position.y.toFixed(3)}) rotate(${rotation.toFixed(3)}) scale(${scale.toFixed(3)})`}
    >
      <g>
        {mark.variant === "microsoft" ? (
          <g className="depth-combo-mark">
            <g className="depth-microsoft-icon" transform="translate(-48 -11)">
              <rect height="9" width="9" />
              <rect height="9" width="9" x="11" />
              <rect height="9" width="9" y="11" />
              <rect height="9" width="9" x="11" y="11" />
            </g>
            <text className="depth-combo-label" dominantBaseline="middle" x="-18">
              {mark.label}
            </text>
          </g>
        ) : mark.variant === "apple" ? (
          <svg aria-hidden="true" className="depth-inline-icon" height="28" viewBox="0 0 24 24" width="28" x="-14" y="-14">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.3.74 3.12.8 1.23-.25 2.41-.94 3.6-.84 1.44.12 2.53.69 3.22 1.71-2.97 1.78-2.27 5.69.46 6.78-.55 1.45-1.27 2.86-2.4 4.52zM12.03 7.25C11.88 5.1 13.63 3.34 15.61 3.17c.27 2.49-2.24 4.31-3.58 4.08z" />
          </svg>
        ) : mark.variant === "openai" ? (
          <svg aria-hidden="true" height="32" overflow="hidden" viewBox="0 0 32 32" width="32" x="-16" y="-16">
            <image
              className="depth-logo-image"
              height="32"
              href="/mcp-logos/openai.svg"
              preserveAspectRatio="xMinYMid meet"
              width="130"
            />
          </svg>
        ) : mark.variant === "asset" ? (
          <image
            className="depth-logo-image"
            href={`/mcp-logos/${mark.slug}.svg`}
            height="32"
            width={mark.assetWidth ?? 56}
            x={-(mark.assetWidth ?? 56) / 2}
            y="-16"
          />
        ) : mark.variant === "icon" ? (
          <image
            className="depth-logo-image"
            href={`/mcp-logos/${mark.slug}.svg`}
            height="32"
            width="32"
            x="-16"
            y="-16"
          />
        ) : mark.variant === "word" ? (
          <text className="depth-wordmark" dominantBaseline="middle" textAnchor="middle">
            {mark.label}
          </text>
        ) : (
          <g className="depth-combo-mark">
            <image
              className="depth-logo-image"
              href={`/mcp-logos/${mark.slug}.svg`}
              height="24"
              width="24"
              x="-43"
              y="-12"
            />
            <text className="depth-combo-label" dominantBaseline="middle" x="-12">
              {mark.label}
            </text>
          </g>
        )}
      </g>
    </g>
  );
}

function PerspectiveMarquee() {
  const sides = ["left", "right"] as const;
  const [sceneWidth, setSceneWidth] = useState(GRID_WIDTH);
  const vanishingPoint = { x: sceneWidth / 2, y: VANISHING_Y };

  useEffect(() => {
    const syncSceneWidth = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      const responsiveWidth = GRID_HEIGHT * (window.innerWidth / viewportHeight);

      setSceneWidth(Number(Math.max(GRID_WIDTH, responsiveWidth).toFixed(3)));
    };

    syncSceneWidth();
    window.addEventListener("resize", syncSceneWidth);

    return () => window.removeEventListener("resize", syncSceneWidth);
  }, []);

  const projectPoint = (edgeX: number, edgeY: number, depth: number) => ({
    x: edgeX + (vanishingPoint.x - edgeX) * depth,
    y: edgeY + (vanishingPoint.y - edgeY) * depth,
  });

  return (
    <svg
      className="perspective-marquee"
      viewBox={`0 0 ${sceneWidth} ${GRID_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {sides.map((side) => {
          const edgeX = side === "left" ? 0 : sceneWidth;

          return (
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={`${side}-wall-fill`}
              key={`${side}-wall-fill`}
              x1={edgeX}
              x2={vanishingPoint.x}
              y1={vanishingPoint.y}
              y2={vanishingPoint.y}
            >
              <stop offset="0%" stopColor="#dce5e2" stopOpacity="0.065" />
              <stop offset="56%" stopColor="#b7c2bf" stopOpacity="0.018" />
              <stop offset="100%" stopColor="#8d9b97" stopOpacity="0" />
            </linearGradient>
          );
        })}

        {sides.flatMap((side) => LANE_BOUNDARY_Y.slice(0, -1).map((rowTop, rowIndex) => {
          const rowBottom = LANE_BOUNDARY_Y[rowIndex + 1];
          const edgeX = side === "left" ? 0 : sceneWidth;
          const panelTop = rowTop + LANE_GAP / 2;
          const panelBottom = rowBottom - LANE_GAP / 2;

          return (
            <clipPath
              clipPathUnits="userSpaceOnUse"
              id={`${side}-lane-clip-${rowIndex}`}
              key={`${side}-lane-clip-${rowIndex}`}
            >
              <path
                d={`M ${edgeX} ${panelTop} L ${edgeX} ${panelBottom} L ${vanishingPoint.x} ${vanishingPoint.y} Z`}
              />
            </clipPath>
          );
        }))}
      </defs>

      {sides.map((side) => {
        const edgeX = side === "left" ? 0 : sceneWidth;
        const sideOffset = side === "left" ? 0 : 4;

        return (
          <g className={`depth-corridor depth-corridor-${side}`} key={side}>
            {LANE_BOUNDARY_Y.slice(0, -1).map((rowTop, rowIndex) => {
              const rowBottom = LANE_BOUNDARY_Y[rowIndex + 1];
              const panelTop = rowTop + LANE_GAP / 2;
              const panelBottom = rowBottom - LANE_GAP / 2;
              const edgeCenterY = (panelTop + panelBottom) / 2;
              const wallAngle = Math.atan2(
                vanishingPoint.y - edgeCenterY,
                Math.abs(vanishingPoint.x - edgeX),
              ) * (180 / Math.PI);
              const rotation = side === "left" ? wallAngle : -wallAngle;
              const logoStart = (rowIndex * 3 + sideOffset) % DEPTH_MARKS.length;

              return (
                <g className="depth-lane" key={`${side}-lane-${rowIndex}`}>
                  <path
                    className="depth-band-fill"
                    d={`M ${edgeX} ${panelTop} L ${edgeX} ${panelBottom} L ${vanishingPoint.x} ${vanishingPoint.y} Z`}
                    fill={`url(#${side}-wall-fill)`}
                    opacity={rowIndex % 2 === 0 ? 0.78 : 0.48}
                  />

                  <g
                    className="depth-lane-content"
                    clipPath={`url(#${side}-lane-clip-${rowIndex})`}
                  >
                    {Array.from({ length: MARKS_PER_LANE }, (_, markIndex) => {
                      const depth = LOGO_DEPTHS[markIndex];
                      const mark = DEPTH_MARKS[(logoStart + markIndex) % DEPTH_MARKS.length];
                      const glyphHeight = mark.variant === "apple" || mark.variant === "icon" || mark.variant === "asset" || mark.variant === "openai" ? 32 : 27;
                      const laneHeightAtDepth = (panelBottom - panelTop) * (1 - depth);
                      const scale = Math.min(0.86, Math.max(0.16, (laneHeightAtDepth * 0.55) / glyphHeight));
                      const position = projectPoint(edgeX, edgeCenterY, depth);

                      return (
                        <DepthMarkGlyph
                          mark={mark}
                          opacity={0.62 - depth * 0.24}
                          position={position}
                          rotation={rotation}
                          scale={scale}
                          key={`${side}-${rowIndex}-${markIndex}`}
                        />
                      );
                    })}
                  </g>
                </g>
              );
            })}

            {LANE_BOUNDARY_Y.map((boundaryY, boundaryIndex) => (
              <path
                className="depth-lane-line"
                d={`M ${edgeX} ${boundaryY} L ${vanishingPoint.x} ${vanishingPoint.y}`}
                key={`${side}-boundary-${boundaryIndex}`}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

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

        <ellipse className="field-horizon-glow" cx={GRID_WIDTH / 2} cy={VANISHING_Y} rx="760" ry="170" fill="url(#signal-horizon-glow)" />
      </svg>

      <PerspectiveMarquee />

      <div className="signal-center-veil" />
      <div className="signal-vignette" />
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
