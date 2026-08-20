"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Fixed artwork coordinate space for the corridor scene. The SVGs scale this
// space uniformly to cover the hero (xMidYMid slice), so these are not tied to
// any browser viewport size.
const ART_WIDTH = 1672;
const ART_HEIGHT = 941;
const CENTER_X = 836;
const RIGHT_EDGE = 1671;

type Side = "left" | "right";

type Boundary = {
  outerY: number;
  slope: number;
};

type Point = {
  x: number;
  y: number;
};

const LEFT_BOUNDARIES: Boundary[] = [
  { outerY: 100, slope: 0.379 },
  { outerY: 184.57, slope: 0.27863 },
  { outerY: 200.744, slope: 0.25727 },
  { outerY: 279.307, slope: 0.16471 },
  { outerY: 297.533, slope: 0.1417 },
  { outerY: 377.398, slope: 0.05532 },
  { outerY: 400.223, slope: 0.02816 },
  { outerY: 489.699, slope: -0.07533 },
  { outerY: 514.735, slope: -0.104 },
  { outerY: 604.111, slope: -0.20392 },
  { outerY: 636.968, slope: -0.24438 },
  { outerY: 742.483, slope: -0.35713 },
  { outerY: 788.064, slope: -0.41 },
  { outerY: 901.884, slope: -0.53318 },
  { outerY: 947.856, slope: -0.58377 },
];

const RIGHT_BOUNDARIES: Boundary[] = [
  { outerY: 100, slope: 0.39 },
  { outerY: 188.675, slope: 0.2884 },
  { outerY: 204.48, slope: 0.26645 },
  { outerY: 279.317, slope: 0.17899 },
  { outerY: 297.066, slope: 0.15529 },
  { outerY: 378.519, slope: 0.05852 },
  { outerY: 401.366, slope: 0.02813 },
  { outerY: 491.304, slope: -0.08162 },
  { outerY: 515.567, slope: -0.11026 },
  { outerY: 602.391, slope: -0.21193 },
  { outerY: 632.693, slope: -0.24814 },
  { outerY: 736.017, slope: -0.36037 },
  { outerY: 779.316, slope: -0.41496 },
  { outerY: 889.817, slope: -0.54635 },
  { outerY: 935.593, slope: -0.59927 },
];

const BOUNDARIES: Record<Side, Boundary[]> = {
  left: LEFT_BOUNDARIES,
  right: RIGHT_BOUNDARIES,
};

function boundaryPoint(side: Side, boundaryIndex: number, x: number): Point {
  const boundary = BOUNDARIES[side][boundaryIndex];
  const distanceFromEdge = side === "left" ? x : RIGHT_EDGE - x;

  return {
    x,
    y: boundary.outerY + boundary.slope * distanceFromEdge,
  };
}

function partialBoundaryPoint(side: Side, x: number): Point {
  const boundary = side === "left"
    ? { outerY: 1080, slope: -0.68 }
    : { outerY: 1060, slope: -0.66 };
  const distanceFromEdge = side === "left" ? x : RIGHT_EDGE - x;

  return { x, y: boundary.outerY + boundary.slope * distanceFromEdge };
}

function boundaryPath(side: Side, boundaryIndex: number): string {
  const edgeX = side === "left" ? 0 : RIGHT_EDGE;
  const outer = boundaryPoint(side, boundaryIndex, edgeX);
  const inner = boundaryPoint(side, boundaryIndex, CENTER_X);

  return `M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`;
}

// The supplied MCP logo pack gives the corridor a broad tool-ecosystem mix.
const LOGO_KINDS = [
  "apple",
  "microsoft",
  "google",
  "openai",
  "github",
  "notion",
  "vercel",
  "stripe",
  "amazonaws",
  "anthropic",
  "claude",
  "cursor",
  "linear",
  "figma",
  "slack",
  "discord",
  "airtable",
  "asana",
  "atlassian",
  "bitbucket",
  "gitlab",
  "docker",
  "kubernetes",
  "react",
  "nextdotjs",
  "javascript",
  "typescript",
  "python",
  "fastapi",
  "postgresql",
  "mongodb",
  "redis",
  "replit",
  "mysql",
  "cloudflare",
  "datadog",
  "grafana",
  "sentry",
  "snowflake",
  "databricks",
  "elasticsearch",
  "kafka",
  "gmail",
  "googlecalendar",
  "googlecloud",
  "googledrive",
  "youtube",
  "reddit",
  "wordpress",
  "zapier",
  "salesforce",
  "hubspot",
  "shopify",
  "trello",
  "box",
  "dropbox",
  "confluence",
  "jira",
  "raycast",
  "warp",
  "zedindustries",
  "githubcopilot",
  "playwright",
  "postman",
  "npm",
  "nodedotjs",
  "graphql",
  "rabbitmq",
  "twilio",
  "sendgrid",
  "neon",
  "brave",
  "git",
  "supabase",
] as const;

type LogoKind = typeof LOGO_KINDS[number];

type LogoSpec = {
  side: Side;
  row: number;
  slot: number;
  kind: LogoKind;
  depth: number;
};

// Logos use normalized positions along each wall instead of screen-space
// coordinates. The reference's rows are a useful visual target; the slots
// below are the clean, reusable system that recreates its rhythm without
// preserving AI-generated per-instance distortions.
const SECTION_DEPTHS = [0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88] as const;
const LOGO_SLOTS_PER_WALL = SECTION_DEPTHS.length * 8;
const SIDE_LOGO_OFFSETS: Record<Side, number> = { left: 0, right: LOGO_SLOTS_PER_WALL };

// Marquee flow: every logo drifts outward along its wall lane, from the
// vanishing point (depth 1) to just past the screen edge (a slightly
// negative depth so glyphs fully exit before wrapping back to the center).
const FLOW_DURATION_S = 60;
const FLOW_EXIT_DEPTH = -0.05;

// Deterministic hash so lanes get stable, hydration-safe stagger offsets.
function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildLogoSpecs(side: Side): LogoSpec[] {
  return Array.from({ length: LOGO_SLOTS_PER_WALL }, (_, index) => {
    const slot = index % SECTION_DEPTHS.length;

    return {
      side,
      row: Math.floor(index / SECTION_DEPTHS.length) + 1,
      slot,
      kind: LOGO_KINDS[(SIDE_LOGO_OFFSETS[side] + index) % LOGO_KINDS.length],
      depth: SECTION_DEPTHS[slot],
    };
  });
}

const ALL_LOGOS = (Object.keys(SIDE_LOGO_OFFSETS) as Side[]).flatMap(buildLogoSpecs);

// Every brand receives the same exact icon height. Perspective is carried by
// wall placement, row geometry, opacity, and occlusion rather than changing
// the dimensions of repeated marks.
const LOGO_ICON_SIZE = 32;
const LOGO_INK_SCALE = 0.82;
const LOGO_ICON_ASPECTS: Partial<Record<LogoKind, number>> = {
  amazonaws: 1.67,
  kafka: 2.19,
  openai: 1.03,
  playwright: 1.33,
  salesforce: 1.42,
};

// Several pack assets use a generous square viewBox around a shorter mark.
// These measured optical corrections make their visible ink comparable to
// the exact shared logo height without changing the wall geometry.
const LOGO_OPTICAL_SCALES: Partial<Record<LogoKind, number>> = {
  airtable: 1.19,
  anthropic: 1.41,
  box: 1.85,
  cloudflare: 2.17,
  discord: 1.3,
  docker: 1.39,
  dropbox: 1.18,
  githubcopilot: 1.19,
  gmail: 1.33,
  googlecloud: 1.24,
  mysql: 1.47,
  warp: 1.28,
  youtube: 1.41,
};

const ROW_LOGO_OPACITY = [0.62, 0.56, 0.68, 0.82, 0.66, 0.58, 0.56, 0.46];

// These marks draw their inner detail with contrasting fills (white text or
// features over a colored base), so a flat silhouette would erase it; they
// keep the tonal grayscale mapping instead.
const MULTI_TONE_LOGOS = new Set<LogoKind>([
  "playwright",
  "salesforce",
  "sendgrid",
]);

type LogoGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
};

function rowShear(side: Side, row: number): number {
  const top = BOUNDARIES[side][(row - 1) * 2];
  const bottom = row === 8
    ? (side === "left" ? { slope: -0.68 } : { slope: -0.66 })
    : BOUNDARIES[side][(row - 1) * 2 + 1];
  const screenDirection = side === "left" ? 1 : -1;

  return screenDirection * (top.slope + bottom.slope) / 2;
}

// Lane positions are linear in depth (x scales with depth and every boundary
// is a straight line), so a logo's whole outward journey is a straight-line
// lerp between the depth-1 and exit-depth points of its lane.
function lanePoint(logo: LogoSpec, depth: number): Point {
  const distanceFromEdge = depth * (CENTER_X - 1);
  const x = logo.side === "left" ? distanceFromEdge : RIGHT_EDGE - distanceFromEdge;
  const top = boundaryPoint(logo.side, (logo.row - 1) * 2, x).y;
  const bottom = logo.row === 8
    ? partialBoundaryPoint(logo.side, x).y
    : boundaryPoint(logo.side, (logo.row - 1) * 2 + 1, x).y;

  return { x, y: (top + bottom) / 2 };
}

function logoGeometry(logo: LogoSpec): LogoGeometry {
  const { x, y } = lanePoint(logo, logo.depth);
  const height = LOGO_ICON_SIZE;

  return {
    x,
    y,
    width: height * (LOGO_ICON_ASPECTS[logo.kind] ?? 1),
    height,
    // Spatial fading along the lane is carried by the static wall masks and
    // center occlusion, so the glyph's own opacity stays constant while it
    // travels; only the row placement modulates it.
    opacity: Math.max(0.07, ROW_LOGO_OPACITY[logo.row - 1] * 0.88),
  };
}

function LogoGlyph({ logo: sourceLogo }: { logo: LogoSpec }) {
  const geometry = logoGeometry(sourceLogo);
  const logo: LogoSpec & LogoGeometry = { ...sourceLogo, ...geometry };
  const shear = rowShear(logo.side, logo.row);
  const microsoftSquare = logo.height * 0.38;
  const microsoftGap = logo.height * 0.055;
  const microsoftIconWidth = microsoftSquare * 2 + microsoftGap;
  const microsoftIconX = (logo.width - microsoftIconWidth) / 2;
  const microsoftIconY = (logo.height - microsoftIconWidth) / 2;
  const vercelTriangleHeight = logo.height * 0.82;
  const vercelTriangleWidth = vercelTriangleHeight * 0.72;
  const vercelTriangleX = (logo.width - vercelTriangleWidth) / 2;
  const vercelTriangleY = (logo.height - vercelTriangleHeight) / 2;
  const appleInkWidth = logo.width * 1.12;
  const appleInkHeight = logo.height * 1.12;
  const openAiInkWidth = logo.width * LOGO_INK_SCALE;
  const openAiInkHeight = logo.height * LOGO_INK_SCALE;
  const slackInkHeight = logo.height * LOGO_INK_SCALE;
  const slackInkWidth = slackInkHeight * (155 / 130);
  const opticalScale = LOGO_OPTICAL_SCALES[logo.kind] ?? 1;
  const imageInkWidth = logo.width * LOGO_INK_SCALE * opticalScale;
  const imageInkHeight = logo.height * LOGO_INK_SCALE * opticalScale;
  const commonImageProps = {
    className: MULTI_TONE_LOGOS.has(logo.kind)
      ? "depth-logo-image depth-logo-image-multitone"
      : "depth-logo-image",
    height: imageInkHeight,
    width: imageInkWidth,
    x: -imageInkWidth / 2,
    y: -imageInkHeight / 2,
    preserveAspectRatio: "xMidYMid meet",
  };
  const laneStart = lanePoint(sourceLogo, 1);
  const laneEnd = lanePoint(sourceLogo, FLOW_EXIT_DEPTH);
  // Phases are spaced uniformly around the loop (rather than derived from the
  // static depth slots) so the marquee has no empty seam between the deepest
  // logo and the next wrap-around, and the gap between icons in a lane stays
  // exactly constant. Each lane is offset by a stable random amount so rows
  // never read as aligned columns.
  const laneIndex = (logo.side === "left" ? 0 : 8) + (logo.row - 1);
  const laneOffset = hash01(laneIndex + 1);
  const laneProgress =
    ((logo.slot + 0.5) / SECTION_DEPTHS.length + laneOffset) % 1;
  const basePoint = lanePoint(sourceLogo, 1 - laneProgress * (1 - FLOW_EXIT_DEPTH));
  // Values are rounded and stripped of trailing zeros so the SSR-rendered
  // style attribute matches the browser's CSSOM serialization exactly
  // during hydration.
  const px = (value: number) => `${parseFloat(value.toFixed(2))}px`;
  const laneStyle = {
    "--lane-x0": px(laneStart.x),
    "--lane-y0": px(laneStart.y),
    "--lane-x1": px(laneEnd.x),
    "--lane-y1": px(laneEnd.y),
    transform: `translate(${px(basePoint.x)}, ${px(basePoint.y)})`,
    animationDelay: `${parseFloat((-laneProgress * FLOW_DURATION_S).toFixed(2))}s`,
  } as React.CSSProperties;

  return (
    <g className="depth-mark-lane" style={laneStyle}>
    <g
      className="depth-mark"
      data-logo-depth={logo.depth}
      data-logo-kind={logo.kind}
      data-logo-size={logo.height}
      opacity={logo.opacity}
      transform={`matrix(1 ${shear} 0 1 0 0)`}
    >
      <g className="depth-mark-glyph">
        {logo.kind === "apple" ? (
        <svg aria-hidden="true" height={appleInkHeight} viewBox="0 0 24 24" width={appleInkWidth} x={-appleInkWidth / 2} y={-appleInkHeight / 2}>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.3.74 3.12.8 1.23-.25 2.41-.94 3.6-.84 1.44.12 2.53.69 3.22 1.71-2.97 1.78-2.27 5.69.46 6.78-.55 1.45-1.27 2.86-2.4 4.52zM12.03 7.25C11.88 5.1 13.63 3.34 15.61 3.17c.27 2.49-2.24 4.31-3.58 4.08z" />
        </svg>
      ) : logo.kind === "openai" ? (
        <svg aria-hidden="true" height={openAiInkHeight} viewBox="0 0 130 126" width={openAiInkWidth} x={-openAiInkWidth / 2} y={-openAiInkHeight / 2}>
          <path d="M116.085 51.561a31.37 31.37 0 0 0-2.695-25.774a31.77 31.77 0 0 0-34.184-15.224A31.4 31.4 0 0 0 55.536.001a31.74 31.74 0 0 0-30.278 21.99A31.4 31.4 0 0 0 4.282 37.213a31.77 31.77 0 0 0 3.906 37.218a31.4 31.4 0 0 0 2.695 25.748a31.77 31.77 0 0 0 34.21 15.256a31.4 31.4 0 0 0 23.644 10.562a31.74 31.74 0 0 0 30.278-21.99a31.4 31.4 0 0 0 20.97-15.223a31.73 31.73 0 0 0-3.9-37.224m-47.348 66.22a23.52 23.52 0 0 1-15.108-5.478c.186-.104.548-.285.756-.422l25.09-14.484a4.07 4.07 0 0 0 2.06-3.567V58.453l10.6 6.119a.37.37 0 0 1 .208.296v29.28c0 13.041-10.564 23.618-23.606 23.633M18.015 96.12a23.56 23.56 0 0 1-2.82-15.821c.185.115.514.312.744.443l25.096 14.49a4.08 4.08 0 0 0 4.12 0L75.77 77.528v12.238a.37.37 0 0 1-.148.328L50.26 104.732c-11.292 6.502-25.716 2.637-32.245-8.64zm-6.573-54.782a23.5 23.5 0 0 1 12.287-10.354v29.823a4.08 4.08 0 0 0 2.06 3.567l30.623 17.683l-10.639 6.141a.37.37 0 0 1-.356.033L20.059 73.589c-11.282-6.527-15.148-20.957-8.64-32.25zm87.102 20.27L67.92 43.924l10.59-6.125a.38.38 0 0 1 .355-.033l25.359 14.643a23.61 23.61 0 0 1-3.649 42.598V65.191a4.08 4.08 0 0 0-2.049-3.583zM109.1 45.721a30 30 0 0 0-.745-.444L83.26 30.788a4.08 4.08 0 0 0-4.12 0L48.517 48.466V36.233a.4.4 0 0 1 .154-.328l25.358-14.638a23.61 23.61 0 0 1 35.06 24.46zM42.738 67.546l-10.605-6.119a.4.4 0 0 1-.203-.295V31.85a23.605 23.605 0 0 1 38.714-18.155c-.186.105-.52.285-.756.422l-25.09 14.484a4.08 4.08 0 0 0-2.06 3.567zm5.758-12.418l13.64-7.878l13.635 7.878v15.744l-13.64 7.877l-13.64-7.877z" />
        </svg>
      ) : logo.kind === "slack" ? (
        <svg aria-hidden="true" height={slackInkHeight} viewBox="0 0 155 130" width={slackInkWidth} x={-slackInkWidth / 2} y={-slackInkHeight / 2}>
          <image className="depth-logo-image" href="/mcp-logos/slack.svg" height="130" preserveAspectRatio="none" width="512" x="0" y="0" />
        </svg>
      ) : logo.kind === "microsoft" ? (
        <g className="depth-microsoft-mark" transform={`translate(${-logo.width / 2} ${-logo.height / 2})`}>
          <g className="depth-microsoft-icon" transform={`translate(${microsoftIconX} ${microsoftIconY})`}>
            <rect height={microsoftSquare} width={microsoftSquare} />
            <rect height={microsoftSquare} width={microsoftSquare} x={microsoftSquare + microsoftGap} />
            <rect height={microsoftSquare} width={microsoftSquare} y={microsoftSquare + microsoftGap} />
            <rect height={microsoftSquare} width={microsoftSquare} x={microsoftSquare + microsoftGap} y={microsoftSquare + microsoftGap} />
          </g>
        </g>
      ) : logo.kind === "vercel" ? (
        <g className="depth-vercel-mark" transform={`translate(${-logo.width / 2} ${-logo.height / 2})`}>
          <path d={`M ${vercelTriangleX + vercelTriangleWidth / 2} ${vercelTriangleY} L ${vercelTriangleX + vercelTriangleWidth} ${vercelTriangleY + vercelTriangleHeight} L ${vercelTriangleX} ${vercelTriangleY + vercelTriangleHeight} Z`} />
        </g>
      ) : (
        <image href={`/mcp-logos/${logo.kind}.svg`} {...commonImageProps} />
      )}
      </g>
    </g>
    </g>
  );
}

function PerspectiveMarquee() {
  const sides: Side[] = ["left", "right"];

  return (
    <svg className="perspective-marquee" viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="left-wall-mask-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="830" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.78" />
          <stop offset="18%" stopColor="white" stopOpacity="0.8" />
          <stop offset="42%" stopColor="white" stopOpacity="0.66" />
          <stop offset="54%" stopColor="white" stopOpacity="0.46" />
          <stop offset="66%" stopColor="white" stopOpacity="0.24" />
          <stop offset="80%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="right-wall-mask-gradient" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE} x2={RIGHT_EDGE - 830} y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.78" />
          <stop offset="18%" stopColor="white" stopOpacity="0.8" />
          <stop offset="42%" stopColor="white" stopOpacity="0.66" />
          <stop offset="54%" stopColor="white" stopOpacity="0.46" />
          <stop offset="66%" stopColor="white" stopOpacity="0.24" />
          <stop offset="80%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="left-logo-mask-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="830" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.76" />
          <stop offset="18%" stopColor="white" stopOpacity="0.82" />
          <stop offset="42%" stopColor="white" stopOpacity="0.62" />
          <stop offset="54%" stopColor="white" stopOpacity="0.4" />
          <stop offset="66%" stopColor="white" stopOpacity="0.18" />
          <stop offset="80%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="right-logo-mask-gradient" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE} x2={RIGHT_EDGE - 830} y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.76" />
          <stop offset="18%" stopColor="white" stopOpacity="0.82" />
          <stop offset="42%" stopColor="white" stopOpacity="0.62" />
          <stop offset="54%" stopColor="white" stopOpacity="0.4" />
          <stop offset="66%" stopColor="white" stopOpacity="0.18" />
          <stop offset="80%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <mask id="left-wall-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={CENTER_X} height={ART_HEIGHT}>
          <rect fill="url(#left-wall-mask-gradient)" height={ART_HEIGHT} width={CENTER_X} x="0" y="0" />
        </mask>
        <mask id="right-wall-mask" maskUnits="userSpaceOnUse" x={CENTER_X} y="0" width={CENTER_X} height={ART_HEIGHT}>
          <rect fill="url(#right-wall-mask-gradient)" height={ART_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
        </mask>
        <mask id="left-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={CENTER_X} height={ART_HEIGHT}>
          <rect fill="url(#left-logo-mask-gradient)" height={ART_HEIGHT} width={CENTER_X} x="0" y="0" />
        </mask>
        <mask id="right-logo-mask" maskUnits="userSpaceOnUse" x={CENTER_X} y="0" width={CENTER_X} height={ART_HEIGHT}>
          <rect fill="url(#right-logo-mask-gradient)" height={ART_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
        </mask>
        <linearGradient id="center-occlusion-left" gradientUnits="userSpaceOnUse" x1="540" x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.44" />
        </linearGradient>
        <linearGradient id="center-occlusion-right" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE - 540} x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.44" />
        </linearGradient>
        <linearGradient id="top-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="40" y2="250">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="24%" stopColor="white" stopOpacity="0.38" />
          <stop offset="62%" stopColor="white" stopOpacity="0.94" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="top-fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={ART_WIDTH} height={ART_HEIGHT}>
          <rect fill="url(#top-fade)" height={ART_HEIGHT} width={ART_WIDTH} x="0" y="0" />
        </mask>
        <linearGradient id="bottom-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="700" y2={ART_HEIGHT}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="65%" stopColor="white" stopOpacity="0.96" />
          <stop offset="100%" stopColor="white" stopOpacity="0.74" />
        </linearGradient>
        <mask id="bottom-fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={ART_WIDTH} height={ART_HEIGHT}>
          <rect fill="url(#bottom-fade)" height={ART_HEIGHT} width={ART_WIDTH} x="0" y="0" />
        </mask>
      </defs>

      {sides.map((side) => {
        const wallGroup = (
          <g className={`depth-corridor depth-corridor-${side}`} key={side} mask={`url(#${side}-wall-mask)`}>
            <g className="depth-boundaries">
              {BOUNDARIES[side].map((_, boundaryIndex) => (
                <path
                  className="depth-lane-line"
                  d={boundaryPath(side, boundaryIndex)}
                  key={`${side}-boundary-${boundaryIndex}`}
                  opacity={boundaryIndex === 0 ? 0.42 : boundaryIndex % 2 === 0 ? 0.92 : 0.72}
                />
              ))}
            </g>
          </g>
        );

        return (
          <g key={`${side}-wall-and-logos`}>
            <g mask="url(#top-fade-mask)">
              <g mask="url(#bottom-fade-mask)">{wallGroup}</g>
            </g>
            <g mask={`url(#${side}-logo-mask)`}>
              <g mask="url(#top-fade-mask)">
                <g mask="url(#bottom-fade-mask)">
                  <g className="depth-lane-content">
                    {ALL_LOGOS.filter((logo) => logo.side === side).map((logo) => (
                      <LogoGlyph key={`${side}-${logo.row}-${logo.slot}`} logo={logo} />
                    ))}
                  </g>
                </g>
              </g>
            </g>
          </g>
        );
      })}

      <rect className="center-occlusion" fill="url(#center-occlusion-left)" height={ART_HEIGHT} width={CENTER_X} x="0" y="0" />
      <rect className="center-occlusion" fill="url(#center-occlusion-right)" height={ART_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
    </svg>
  );
}

function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      <svg className="signal-art" viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="signal-horizon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eef6f3" stopOpacity="0.13" />
            <stop offset="48%" stopColor="#bcc9c5" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#8f9d99" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="field-horizon-glow" cx={CENTER_X} cy="425" rx="530" ry="48" fill="url(#signal-horizon-glow)" />
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
      src="/icon.png"
      alt=""
      width={64}
      height={64}
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

function GitHubMark() {
  return (
    <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="hero-button-icon" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="6.5" y="6.5" width="8" height="8" rx="1.2" />
      <path d="M11.5 4.5v-.8a1.2 1.2 0 0 0-1.2-1.2H4.7a1.2 1.2 0 0 0-1.2 1.2v5.6a1.2 1.2 0 0 0 1.2 1.2h.8" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="hero-button-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 1.9l2.2 4.46 4.92.72-3.56 3.47.84 4.9L9 13.14l-4.4 2.31.84-4.9-3.56-3.47 4.92-.72z" />
    </svg>
  );
}

const LLM_PROMPT = `You are helping me set up Roster, an open-source, local-first tool router for AI agents (MCP). Read https://github.com/ManagementMO/roster for context. Roster fronts local stdio MCP servers behind one endpoint: "roster sync" replaces N client config entries with one, draft(need) returns the best five tools for the task, call(tool, args) proxies the invocation, and outcomes are learned locally. Help me install it, sync my MCP clients (Claude Code, Cursor, Codex, OpenClaw), and verify the setup. "roster eject" must restore my original configs exactly as found.`;

const REPO_URL = "https://github.com/ManagementMO/roster";

const DRAFT_RESULTS = [
  { icon: "github", tool: "github.open_pull_request", score: 96 },
  { icon: "git", tool: "git.push", score: 93 },
  { icon: "slack", tool: "slack.post_message", score: 91 },
  { icon: "sentry", tool: "sentry.resolve_issue", score: 88 },
  { icon: "datadog", tool: "datadog.check_deploy", score: 85 },
];

function MockIcon({ kind }: { kind: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" aria-hidden="true" className="mock-icon" src={`/mcp-logos/${kind}.svg`} />
  );
}

const LEARN_ROWS = [
  { tool: "slack.post_message", note: "ok · 320ms", width: 96, from: 0.86, score: "96", delta: "+3", kind: "up" },
  { tool: "github.open_pull_request", note: "ok · 610ms", width: 94, from: 0.9, score: "94", delta: "+2", kind: "up" },
  { tool: "git.push", note: "ok · 180ms", width: 92, from: 0.95, score: "92", delta: "+1", kind: "up" },
  { tool: "jira.create_ticket", note: "drift", width: 12, from: 5.2, score: "benched", delta: "\u25bc", kind: "down" },
] as const;

// The League ranks only within one certified category, so the standings
// compare like against like. mongodb's score updates mid-cycle, overtaking
// supabase, and the two rows trade places to match.
const LEAGUE_ROWS = [
  { rank: 1, icon: "postgresql", name: "postgres-mcp", score: "0.947", scoreNew: "", move: "steady", swap: "" },
  { rank: 2, icon: "supabase", name: "supabase-mcp", score: "0.921", scoreNew: "", move: "down", swap: "down" },
  { rank: 3, icon: "mongodb", name: "mongodb-mcp", score: "0.898", scoreNew: "0.924", move: "up", swap: "up" },
  { rank: 4, icon: "mysql", name: "mysql-mcp", score: "0.874", scoreNew: "", move: "steady", swap: "" },
  { rank: 5, icon: "redis", name: "redis-mcp", score: "0.712", scoreNew: "", move: "down", swap: "" },
] as const;

const LEAGUE_MOVE_GLYPHS = { up: "\u25b2", down: "\u25bc", steady: "\u2013" } as const;

function RotationIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M14.5 9a5.5 5.5 0 1 1-2.1-4.32" />
      <path d="M14.8 2.5v2.8H12" />
    </svg>
  );
}

function CoachIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="4" y="3.8" width="10" height="11.7" rx="1.4" />
      <path d="M6.8 3.8V3a1.2 1.2 0 0 1 1.2-1.2h2A1.2 1.2 0 0 1 11.2 3v.8" />
      <path d="M6.8 8.6h4.4M6.8 11.6h2.8" />
    </svg>
  );
}

function LeagueIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M5.8 2.8h6.4v3.6a3.2 3.2 0 0 1-6.4 0z" />
      <path d="M5.8 4H3.5a2.5 2.5 0 0 0 2.6 2.6M12.2 4h2.3a2.5 2.5 0 0 1-2.6 2.6" />
      <path d="M9 9.6v2.6M6.4 15h5.2" />
    </svg>
  );
}

function ShowcaseSection() {
  return (
    <section className="section" id="showcase" aria-labelledby="showcase-title">
      <div className="section-inner">
        <h2 className="reveal" id="showcase-title">
          Tool routers already exist.
          <br />
          Roster is much more.
        </h2>

        <div className="showcase-grid">
          <div className="showcase-card reveal">
            <div className="card-head">
              <span className="card-badge"><RotationIcon /></span>
              <span className="showcase-kicker">The Rotation</span>
            </div>
            <h3>The best five, every task</h3>
            <div className="showcase-visual" aria-hidden="true">
              <div className="mock-query">
                <span className="mock-query-fn">draft</span>(&ldquo;ship a hotfix and tell the team&rdquo;<span className="mock-caret" />)
              </div>
              <div className="score-rows">
                {DRAFT_RESULTS.map(({ icon, tool, score }, index) => (
                  <div className={`score-row draft-row draft-row-${index + 1}`} key={tool}>
                    <span className="mock-tile"><MockIcon kind={icon} /></span>
                    <span className="score-name">{tool}</span>
                    <span className="score-bar"><i style={{ width: `${score}%` }} /></span>
                    <span className="score-value">{score}</span>
                  </div>
                ))}
              </div>
              <div className="showcase-foot">best 5 of 200 &middot; one endpoint</div>
            </div>
          </div>

          <div className="showcase-card reveal" style={{ transitionDelay: "130ms" }}>
            <div className="card-head">
              <span className="card-badge"><CoachIcon /></span>
              <span className="showcase-kicker">The Coach</span>
            </div>
            <h3>Learns what works</h3>
            <div className="showcase-visual" aria-hidden="true">
              <div className="learn-table">
                <div className="learn-head">
                  <span>tool</span>
                  <span>outcome</span>
                  <span className="learn-head-score">score</span>
                </div>
                {LEARN_ROWS.map(({ tool, note, width, from, score, delta, kind }, index) => (
                  <div
                    className={`learn-row learn-row-${kind} learn-row-${index + 1}`}
                    key={tool}
                    style={{ "--from": from } as React.CSSProperties}
                  >
                    <span className="learn-name">{tool}</span>
                    <span className="learn-note">{note}</span>
                    <span className="score-bar learn-bar"><i style={{ width: `${width}%` }} /></span>
                    <span className="learn-score">
                      {score}
                      <span className={`learn-delta learn-delta-${kind}`}>{delta}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="showcase-foot">local outcomes only &middot; prompts never stored</div>
            </div>
          </div>

          <div className="showcase-card reveal" style={{ transitionDelay: "260ms" }}>
            <div className="card-head">
              <span className="card-badge"><LeagueIcon /></span>
              <span className="showcase-kicker">The League</span>
            </div>
            <h3>Every category, ranked</h3>
            <div className="showcase-visual" aria-hidden="true">
              <div className="league-head">
                <span>database mcps</span>
                <span>6 certified</span>
              </div>
              <div className="league-rows">
                {LEAGUE_ROWS.map(({ rank, icon, name, score, scoreNew, move, swap }) => (
                  <div className="league-row" key={name}>
                    <span className="league-rank">{rank}</span>
                    <div className={`league-entry${swap ? ` league-swap-${swap}` : ""}`}>
                      <span className="mock-tile"><MockIcon kind={icon} /></span>
                      <span className="league-name">{name}</span>
                      <span className={`league-move league-move-${move}`}>{LEAGUE_MOVE_GLYPHS[move]}</span>
                      {scoreNew ? (
                        <span className="league-score league-score-flip">
                          <span className="league-score-old">{score}</span>
                          <span className="league-score-new">{scoreNew}</span>
                        </span>
                      ) : (
                        <span className="league-score">{score}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="showcase-foot">signed scores &middot; open harness</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="brand footer-brand-lockup" href="#top" aria-label="Roster home">
            <RosterMark />
            <span className="brand-name">roster</span>
          </a>
          <p>
            The self-learning tool router for MCP. Local-first: prompts,
            arguments, and results never leave your machine.
          </p>
        </div>

        <nav className="footer-columns" aria-label="Footer">
          <div className="footer-column">
            <h4>Product</h4>
            <a href="#showcase">What roster does</a>
            <a href={`${REPO_URL}/blob/main/docs/methodology.md`} target="_blank" rel="noreferrer">The League</a>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${REPO_URL}/tree/main/docs`} target="_blank" rel="noreferrer">Docs</a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span className="footer-watermark" aria-hidden="true">roster</span>
        <span className="footer-copy">&copy; 2026 roster</span>
      </div>
    </footer>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard
      ?.writeText(LLM_PROMPT)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("reveal-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing-page" id="top">
      <div className="hero-stage">
        <SignalField />

        <header className="site-nav">
          <a className="brand" href="#top" aria-label="Roster home">
            <RosterMark />
            <span className="brand-name">roster</span>
          </a>

          <nav className="nav-links" aria-label="Primary navigation">
            <a className="nav-github" href={REPO_URL} target="_blank" rel="noreferrer">
              <GitHubMark />
              <span>GitHub</span>
            </a>
          </nav>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="update-pill">
            <span className="update-label"><i />Latest update</span>
            <span className="update-message">Beta v0.1 Now Live <DiagonalArrow /></span>
          </div>

          <h1 id="hero-title">
            <span>The self-learning</span>
            <br />
            <span>tool router for MCP.</span>
          </h1>

          <p className="hero-description">
            <span>Roster finds the right tools when needed,</span>
            <br />
            <span>learns from what works, and works with any MCP client.</span>
          </p>

          <div className="hero-actions">
            <button className="hero-button hero-button-primary" onClick={copyPrompt} type="button">
              <CopyIcon />
              <span>{copied ? "Copied to clipboard" : "Prompt for LLMs"}</span>
            </button>
            <a className="hero-button hero-button-secondary" href={REPO_URL} target="_blank" rel="noreferrer">
              <StarIcon />
              <span>Star on GitHub</span>
            </a>
          </div>
        </section>
      </div>

      <ShowcaseSection />
      <SiteFooter />
    </main>
  );
}
