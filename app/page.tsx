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

// A corridor whose lanes converge but whose glyphs never change size has no
// depth cue at all: near the vanishing point every lane overlaps at full size,
// which is what reads as "squished", and with nothing shrinking the eye cannot
// tell that constant screen speed is correct. Size is therefore tied to depth,
// interpolated over the same keyframe as the position so the two stay in step.
// 1 is the size at the screen edge; the far end is FLOW_NEAR_SCALE of that.
const FLOW_NEAR_SCALE = 0.3;

function depthScale(depth: number): number {
  return FLOW_NEAR_SCALE + (1 - FLOW_NEAR_SCALE) * (1 - depth);
}

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
const LOGO_ICON_SIZE = 42;
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
  const num = (value: number) => `${parseFloat(value.toFixed(4))}`;
  const baseDepth = 1 - laneProgress * (1 - FLOW_EXIT_DEPTH);
  const laneStyle = {
    "--lane-x0": px(laneStart.x),
    "--lane-y0": px(laneStart.y),
    "--lane-x1": px(laneEnd.x),
    "--lane-y1": px(laneEnd.y),
    "--lane-s0": num(depthScale(1)),
    "--lane-s1": num(depthScale(FLOW_EXIT_DEPTH)),
    transform: `translate(${px(basePoint.x)}, ${px(basePoint.y)}) scale(${num(depthScale(baseDepth))})`,
    animationDelay: `${parseFloat((-laneProgress * FLOW_DURATION_S).toFixed(2))}s`,
  } as React.CSSProperties;

  return (
    <g className="depth-mark-lane" style={laneStyle}>
    <g className="depth-mark-fan">
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

const LLM_PROMPT = `You are helping me set up Roster, an open-source, local-first tool router for AI agents (MCP). Roster fronts local stdio MCP servers behind one endpoint: "roster sync" replaces N client config entries with one, draft(need) returns the best tools for the task, call(tool, args) proxies the invocation, and outcomes are learned locally. Help me install it, sync my MCP clients (Claude Code, Cursor, Codex, OpenClaw), and verify the setup. "roster eject" must restore my original configs exactly as found.`;

// Placeholder wiring for the demo deploy: GitHub points at my profile and the
// other nav/footer destinations are inert until the real URLs exist. Research
// citations on the stat cards are real and link out.
const GITHUB_URL = "https://github.com/EvanJYHe";
const PLACEHOLDER = "#";

// --- terminal mocks -------------------------------------------------------
// Each mock is a short shell session chosen so the command itself explains
// what that pillar does, with a closing summary line stating the outcome.

function RouteIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M14.5 9a5.5 5.5 0 1 1-2.1-4.32" />
      <path d="M14.8 2.5v2.8H12" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 14.2 6.4 9.4l3 2.6 5.2-6.6" />
      <path d="M11.6 5.4h3v3" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.8 15.2h12.4" />
      <path d="M4.6 15.2V9.8M9 15.2V3.4M13.4 15.2v-4" />
    </svg>
  );
}

function EjectIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 11.4V2.6M6.1 5.5 9 2.6l2.9 2.9" />
      <path d="M3.2 10.6v3.6a1.2 1.2 0 0 0 1.2 1.2h9.2a1.2 1.2 0 0 0 1.2-1.2v-3.6" />
    </svg>
  );
}

const BAR_CELLS = 12;

// A shaded track with a solid fill clipped over it, so the meter stays on the
// monospace character grid instead of being a drawn element.
function TermBar({ pct, from }: { pct: number; from?: number }) {
  const style = { "--w1": `${pct}%`, "--w0": `${from ?? 0}%` } as React.CSSProperties;
  return (
    <span className="term-meter">
      <span className="term-meter-track">{"\u2591".repeat(BAR_CELLS)}</span>
      <span className="term-meter-fill" style={style}>{"\u2588".repeat(BAR_CELLS)}</span>
    </span>
  );
}

function TermPrompt({ command, arg }: { command: string; arg?: string }) {
  return (
    <div className="term-line term-line-cmd">
      <span className="term-caret">&#10095;</span>
      <span>
        {command}
        {arg ? <span className="term-arg"> {arg}</span> : null}
      </span>
    </div>
  );
}

function TermCursorLine() {
  return (
    <div className="term-line term-line-cmd">
      <span className="term-caret">&#10095;</span>
      <span className="term-cursor" />
    </div>
  );
}

const LEARN_ROWS = [
  { tool: "github.open_pull_request", ok: "98%", was: "0.71", now: "0.96", pct: 96, from: 71, kind: "up" },
  { tool: "slack.post_message", ok: "97%", was: "0.80", now: "0.94", pct: 94, from: 80, kind: "up" },
  { tool: "git.push", ok: "99%", was: "0.90", now: "0.92", pct: 92, from: 90, kind: "up" },
  { tool: "jira.create_ticket", ok: "41%", was: "0.83", now: "bench", pct: 24, from: 83, kind: "down" },
] as const;

function LearningVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster outcomes" arg="--since 7d" />
      <div className="term-out">
        <div className="term-row term-row-learn term-row-head">
          <span>tool</span>
          <span>ok</span>
          <span>rating</span>
          <span className="term-right">was &#8594; now</span>
        </div>
        {LEARN_ROWS.map(({ tool, ok, was, now, pct, from, kind }, index) => (
          <div
            className={`term-row term-row-learn learn-row learn-row-${kind} learn-row-${index + 1}`}
            key={tool}
          >
            <span className="term-name">{tool}</span>
            <span className={`term-status term-status-${kind}`}>{ok}</span>
            <TermBar pct={pct} from={from} />
            <span className="term-right">
              <span className="term-dim">{was}</span>
              <span className={`learn-delta learn-delta-${kind}`}> &#8594; {now}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="term-note">ranking rebuilt: 3 promoted, 1 benched</div>
      <TermCursorLine />
    </div>
  );
}

const MATCHED_TOOLS = [
  { score: "0.96", tool: "github.open_pull_request" },
  { score: "0.93", tool: "git.push" },
  { score: "0.91", tool: "slack.post_message" },
  { score: "0.88", tool: "sentry.resolve_issue" },
  { score: "0.85", tool: "datadog.check_deploy" },
] as const;

function SearchVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster draft" arg={"\u201chotfix and tell the team\u201d"} />
      <div className="term-out">
        <div className="term-note term-note-lead">searched 214 indexed tools, 5 matched</div>
        <div className="term-row term-row-search term-row-head">
          <span>match</span>
          <span>tool passed to the model</span>
        </div>
        {MATCHED_TOOLS.map(({ score, tool }, index) => (
          <div className={`term-row term-row-search draft-row draft-row-${index + 1}`} key={tool}>
            <span className="term-dim">{score}</span>
            <span className="term-name">{tool}</span>
          </div>
        ))}
      </div>
      <div className="term-note">209 others stay connected, out of context</div>
      <TermCursorLine />
    </div>
  );
}

const LEAGUE_ROWS = [
  { rank: 1, name: "postgres-mcp", score: "0.947", scoreNew: "", swap: "" },
  { rank: 2, name: "supabase-mcp", score: "0.921", scoreNew: "", swap: "down" },
  { rank: 3, name: "mongodb-mcp", score: "0.898", scoreNew: "0.924", swap: "up" },
  { rank: 4, name: "mysql-mcp", score: "0.874", scoreNew: "", swap: "" },
  { rank: 5, name: "redis-mcp", score: "0.712", scoreNew: "", swap: "" },
] as const;

function RankingsVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster standings" arg="database" />
      <div className="term-out">
        <div className="term-row term-row-league term-row-head">
          <span>#</span>
          <span className="term-league-entry">
            <span>server</span>
            <span className="term-right">score</span>
            <span>signed</span>
          </span>
        </div>
        {LEAGUE_ROWS.map(({ rank, name, score, scoreNew, swap }) => (
          <div className="term-row term-row-league" key={name}>
            <span className="term-dim">{rank}</span>
            <span className={`term-league-entry${swap ? ` league-swap-${swap}` : ""}`}>
              <span className="term-name">{name}</span>
              {scoreNew ? (
                <span className="term-right league-score-flip">
                  <span className="league-score-old">{score}</span>
                  <span className="league-score-new">{scoreNew}</span>
                </span>
              ) : (
                <span className="term-right">{score}</span>
              )}
              <span className="term-check">&#10003;</span>
            </span>
          </div>
        ))}
      </div>
      <div className="term-note">6 certified, same suite, reproducible</div>
      <TermCursorLine />
    </div>
  );
}

const SYNC_RESULTS = [
  { client: "claude code", detail: "14 servers \u2192 1 endpoint" },
  { client: "cursor", detail: " 9 servers \u2192 1 endpoint" },
  { client: "codex", detail: " 6 servers \u2192 1 endpoint" },
] as const;

function PortabilityVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster sync" />
      <div className="term-out">
        {SYNC_RESULTS.map(({ client, detail }) => (
          <div className="term-line term-line-out" key={client}>
            <span className="term-check">&#10003;</span>
            <span className="term-name">{client}</span>
            <span className="term-dim">{detail}</span>
          </div>
        ))}
        <div className="term-note term-note-tight">originals backed up before any write</div>
      </div>

      <TermPrompt command="roster eject" />
      <div className="term-out">
        <div className="term-line term-line-out">
          <span className="term-check">&#10003;</span>
          <span className="term-dim">3 configs restored byte for byte</span>
        </div>
      </div>

      <TermCursorLine />
    </div>
  );
}

const LINEUP = [
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
function EndpointIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 4.2h4.2M2.6 9h4.2M2.6 13.8h4.2" />
      <path d="M6.8 4.2c3 0 2.6 4.8 5 4.8M6.8 13.8c3 0 2.6-4.8 5-4.8" />
      <circle cx="13.4" cy="9" r="2" />
    </svg>
  );
}

function FailoverIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 6.2h4.6c2.4 0 2.4 5.6 4.8 5.6h3.4" />
      <path d="M13 9.2l2.4 2.6-2.4 2.6" />
      <path d="M11.4 4.4h4M13.4 2.6v3.6" />
    </svg>
  );
}

function DriftIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 2.2 15 4.6v4.2c0 3.4-2.6 5.6-6 7-3.4-1.4-6-3.6-6-7V4.6z" />
      <path d="M9 6.6v3M9 12h.01" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="6" cy="9" r="3.2" />
      <path d="M9.2 9h6.2M13.4 9v2.6M15.4 9v2" />
    </svg>
  );
}

// Deliberately the parts the tabbed section below does not cover, so the two
// read as overview then deep dive rather than saying the same thing twice.
const FEATURES = [
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

function FeatureSection() {
  return (
    <section className="section stakes-section" aria-labelledby="features-title">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="section-tag"><i />Product overview</span>
          <h2 id="features-title">One local router in front of every server you own.</h2>
          <p className="section-sub">
            Roster sits between your agent and your tools. Nothing is hosted, nothing
            is uploaded, and everything it changes it can put back.
          </p>
        </div>

        <div className="stakes-grid">
          {FEATURES.map(({ title, icon, body }, index) => (
            <div
              className="stake reveal"
              key={title}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="stake-icon">{icon}</span>
              <h3 className="stake-title">{title}</h3>
              <p className="stake-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const LINEUP_CYCLE_MS = 9000;

function LineupSection() {
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

// Atlanta's skyline in fog (CC0 photograph). The sky is masked to empty space
// per column; inside the mask the building's own luminance picks the glyph.
// SHADE carries a separate brightness level per cell, because a plate drawn at
// one flat colour reads as texture no matter how many glyphs the ramp has.
// Regenerate with scripts/build-skyline.py
const SKYLINE_CHARS = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "                                                                                                                                                                                                                                   `ox:",
  "                                                                                                                                                                                                                                   ~##*",
  "                                                                                                  `ooox~                                                                                                                          ;%%%%+",
  "                                                                                                  :#%%%x;                                                                                                                        ,#%%#%#*~",
  "                                                                                                  =%%%%%#`                                                                                                                      -######%#8,",
  "                                                                                                `*%%%%%%#;                                                                                                                     .%%%####%%#*;",
  "                                                                                                +8%%%%%%#*                                                                                                                    `x%x%#####%###~:.",
  "                                                   .,```                                       ~%%%%%%%#%#*                                                                                                                  .+#%%%#####%#%x%#:",
  "                                              -==oox%%%%+                                      o#%%##%##%%#~                                                                                                                `x%%##%%%###%%%x%#;",
  "                                             :%%%%%%xxx%#=                                     o%%%%%%%%%%%#:                                                                                                               `xx###%#%%%%x##x%#-",
  "                                             +%x%%%%%%%%#*                                    .x%%%%#%%%%%%%:            ..                                                                                                 `xx###%##%##x##x%#~",
  "                                             *%%%x%%%%%%#*                                    .x%%%%%%%%%%%%:      `++***x; `                                                                                               `xx###%##%%%x%#x%#=",
  "                                             o%%%xx%%%%%#o                                    `%%%%%%%%%%%%%:      :#%%%##-`=                                                                                               ,x%###%#%%##x%#x%#+",
  "                                            .x%%xx%%%%%%#*                                    `%%%%%%%%%%%%%;      ;8###88~,+                                                                                               ,x%#%#%#%%##x%#x%#+",
  "                                            .x%%xx%%%%%%#o                                    `%%%%%%%%%%%%%;      -8###8#=;+                                                                    `-~    :  :                ,x%#%#%%#x%#%%#x%#*",
  "                                            `%x%xx%%%%%%#o                                    ,%%%%%%%%%%%%%;      -8###8#=~*                                                                   .x8+    -  ;                :xx%##%%#x%%x%#x%%*",
  "                                            ,%x%xx%%%%%%%o                                    `%%%%%%%%%%%%%;      ~8###8#=~o                                                                   +##*    =  ~                ;%x%%#%%#x##x%#x%%*",
  "                                            ;%x%%%%%%%%%%x.                                   ,%%%%%%%%%%%%%-      ~8%%#8#+=*                                                                   *##o   .+ .=                ;%%%%#x%#x%#%%#x%%o",
  "                                            *%x%x%%%%%%%%x.                                   :%%%%%%%%%%%%%~      =8%%%8#++*                                                                   *##o   .o .+                ;%%%%#%%#x%#x%#xx%*",
  "                                            oxxxxx%%%%%%%x.                                   :%%%%%###%%%%%~      =8%##8#*oo                                                                   o##x   `x .o                -%%%%#%%#x%#%%#xx%o",
  "                                           .xxxxxx%%%%%%%%`                                   :%%%%%%%%%%%%%~      =8%#%8%x#o                                                                   x##x   ,%.`x                -%%%%#x%#x%%%%#xx%o",
  "                                           ,%x%xxx%%%%%%%%`                                   ;%%%%%%%%%%%%%=      =8%%#8%x8*                                                                   %##x.  ,#.`%.               =%x%%%x%#x%#%%#xx%o                                                                               `,",
  "                                        .`.-%x%xx%%%%%%%%%`                                   ;%%%%%%%%%%%x%=      +8%%#8%x#*                                                                  .%#%x` :o8+;#.     :.        =#o%%#%%%x%#%%%xx%x.                                                                             `~~",
  "                                   ;~=*oooox%%%xxx%%%%%%%#,                                   ;%%%%%%%%%%%x%=      +8%%#8%x#o                                                      `---        `##%%` o8#8x%~   `=8%~;`     =#o%%%%%%x%#%x%xx%x.                                                                             ,~-",
  "                                  `x%%%%xoox%%%xxx%%%%%%%#,                                   -%x%%%%%%%%%x%=      +8%%#8%x#o      .~=;                          `~~,            .:xxxx-.      ,8#%%``x*##*+x=+=*x#%%x~     *#o%%%xx%x%#%x%xx%x.                                                                             ~=-",
  "                                  `oooxxxoo%%%%xx%%%%%%%x#:                                   -%x%%%%%%%%%x%*      *8%%#8%x#o      -8#%`                         *#8o          -ox%oxxxooo+    ,8%x%`;#o#8%%#888#8####o     *8x%##%%#xx#%x%xxxx.                                                                             *+-",
  "                                  ,xoxx%%ox#%%%xx%%%%%%%x8;                                   -%%%%%%%%%%%xx*      o8%%#8%x#o   :~-o##%+--.                   ;~=x%%%~~-      .x%%%x%%%xxx%*`  -@##8,+@8888@@88888888@8:,,``*#x##%%%8#x#%x%xxxx`                                                       .                     xo-",
  "                                  :xoxxxxox%%%xxx%%%%%%%x8:                                   ~%%%%%%%%#%%xx*      *#%%#8xx#x   *#%x##xx%#; .**:              x##x%%%%#%.     `x%%%x%%%xx###%=~x%%x%,*8x%%#xoxxoxxxoxxxxx%xox%#%#%%%#%x%%x%xxxx`                                              .,=++-;;+x.             .::;;--8%-",
  "                                  ;xoxx%xox%%%xxx%%%%%%%%#o*+~~~~~-;;:                        ~%%%%%%%%%%%xx*      *%%%#8xx#x.  *#xx##%x%%*.~###%-     =%x.  `%%%x%%%x%x`     :%%%%x%%%ox#%xx%x%%xo%;o@##%#%oxxoxxxx%%xoo%%%%######%8%x%%x%xxxx`                                           `+*o%%%%##%%#-....``,,,::;;*%x%%%#8x-",
  "                                  -xoxx%xox%%%xxx%%%%%%%%%####888####8~                       =%%%%%%%%%%%xxo      o%%%#8xx%x.  o#%x##%%#%%%%%%###,    o##=``~#%%x##%x%%`   . ;#%%%x%%%xx#%%%%%%%xx#-x@8#%8#xxxx%%%o%%%%%#%x#####%%%##x%%x%xx%%,                                           ;#xx%xx%%%%xooooooooxxxxxxxoooooxx#%~",
  ".  ,=,                            -xoxx%xox%%%xxx%%%%%%%%%#%%%%#%%%%%#=                       +%%%%%%%%%%%xxo      o%%%##xx#x.  o#%x##xx%#xx%xx%%%,   .%%%x%%%%##x##%x%%,   :;-#%%%x%%%oo##%%%%%%%%%*%8##88%x%#xx%#xx%xxoxxx#%%%#%%%##o%%x%%xxx,                                           ~%xx%%x%ox%xox%%xxxxxxxoxxoxxxx%x%#8=",
  ", .~%*-:,`.                       ~ooxx%xox#%%xxx%%%%%%%%%#####%%#%%%#+              .::=**+*,*%%%%%%%%%x%xxo      o%%%##ox%%.  o#%x##%#888#xo*ox#:   ;#%%o%%x%#%x##%x%%:   -x*#%%%x%%%oo##%%%%%%%%%##8%%%#%ox%ox%%ox%xx%#xx#8######8#o%%x%%xx%:                                           +%xx%%x%xx%xxxxxxxxxxxxxxxxxxxxxx%%8+",
  "~ ~ox*%xooo.,-;                   =ooxx%x*x#%%xxx%%%%%%%%%##%%%%%%%%%#*              ;%x%x%ooo%%%%%%%%%%x%xxo     .xx%%##oxx%` .x#######888##8#8o8;  `x%%%x%%%##%x%#xx%%;   =%x%%%%o%%%oo##%%%%%%%%%%#8%%%##x%xoxxxox%xxxxxo#######88#o%%x%%xx%:                                           o%x%%%x%xx%xxxxxxxxxxxxxxxxxxxxxx%%8o",
  "@:x@%x#%#88~*oo::,          ,,    o8#%%88#%#%%xx%%%%%%%%%%#%#%%%%%%%%%o              ~xxx%%ooo%##%%%%%%%x%xxx     .xx%%#%oxxx` .x%#xxooox#+*#@@@o8~  ,x%%%x%%%%##x##%x%%-   *=+##%%ox%xox##%%%%%%%%%##8%%%#%x%%xx%#xx%%xo%xo##%%##%%##o%%x%%xx%;                                ;~~~~~~~~==x%x%%%x%xx%xxxxxxxxxxxxxxxxxxxxxx%%#%",
  "+=+**oxx##8%ooxo#*,```````:x@8x8#o%xx++*x%#88#%%#%%%%%%%%####%%%%%%%%%x              +%x%%%oo*%##%%%x%%%x%xx%     `xxxx8#oxox` .%%%*+*ox#x~o#@88o8~  :x%%%o%%%##%x%#xxx%~  .x+*####x%%%ox#%%#%%%%xxx##8#####x%xox%%x%%%ox#xo#8#%#%%%##o%%x%%xx%-                               `#xx%%%%%%%%%%%%%#xxxx%xxxxxxxxxxxxxxxxxxxxxxxx%%",
  "~==+*++++*xx---=~=%###%*=+*===***xxxxx*oxoo%###8@88###%%%%##%%%%%%%%%%%.         *~  x%##88%xo#8##%%%%%%x%xx%     `%xxo8#*xoo` .%%%+*xxx#%=x#@88o8=  :xx%#o%%x##%x%%xxx%=  ,%=*##%#x%%%xx8#%###88####@@8x%@8#88888#x%%%%x#%x###%##%%##o%%x%%xx%~                               :#oxxx%%%%%%%#%%%#xxxx%x%88xxx%%%%%%%%x%%xxx%%xxx",
  "+**oxoooox8#++~---~+%@@#o#x--------~o%@8888#%x%%#8@@@8##%%%###%%%%%##88;~+**o***x##+%88@##8##%@@@8##%%%#x%xx%`    :%xox8%oxox, `#%%+oxxx%x=o#@88o8=  ;x%%#x%%x###x%%xxx%+  ;#=*8#%#x%%#x#@@888##%%888@@@8@@@@@@@@@@8#%8#x%%x###%##%%##*oooxxox%=                               ;8x%%x%%%#%#######%%xx%xx88xxx%%%*o%%%x%xxxx%%xxx",
  "**ooooooxx#x=xx*+~-;;~**+xx*=++=~~-*o~+~~~~~-~---~=+o%##%%%%%%%%%%####%%88#######%xxo+++~~++++*ox%8@@88#%%xxxx:,~x#%oox8%oxox: ,#%x=oxx%%x=x8@88o8+  -x%#%o%%%##%x%#%x%%o`;%%=*8###%8@@#%x*+++++=~+=====++++===~~~~~=o8x%#%o#8#%##%%##x%%%##%#%xo**oo*********+=; ~,           ~8x%%%###xx%xx#8##%%xx%x%88oo%%x%**%#xx#xx#%#xooo",
  "*oooxxx*o##%o@@8@x*++=~==+x888xo%##@8--;---+*##o*+-+##8#%%%%%%%%%##8%=----------;--~=*ox#8@#xx%x*+=+o%@@@8%%xxxxx%@%ooo8%*xox: ,#xx*oxxx%%=o#@88o8*  ~xx%%o%%x%%%x%%xoxx%%%%%+o@88@#%o+=+ox%#88@@##%xxxo*+;=x*=+=~++%#%xx#%x###%##%##8%%%88888@@@@@###@8##%%%%%#%*#%,,; ~+=`   *@x%%%#%x*+=~+*x88#%xx%x%88*+*#o#o-%%x%%o*88@#oox",
  "xxxx#x%x8#@%~==+#~~=xxx*+=*##+--~=*xxx@%+~-~~o8@8@8@@8#%%##%%%#%%##8@@x~=~===%x-*8@@@@@@@@@##@@@@@@#o+=*%@@8%%%xox#xxxx#%x%xx, :8%x+oxxx%%=x#@88o8o  =x%##o%%oo%#%###%#%xxx%#*x@@#*=+o#%8@@888%####8@@@@@@xx88##%###%#%xo%%o####8##88#**o888@8#%xxo==~+%88%x%%xx%xo8~~8*xxxo***ox%##%o*+=~==*=+oo%%xx%xx@8+=*#%x%~o%%xo=*%#%x=%#",
  "oxxx#*%%8%@%;--~#~-=@@@8+;+88=-~~o+=x+oxx~~~~-+*+*o%##%%%##8%xx%%%xx%#8###xoxxox@@@@88@@8xx%#@@@88@@@@8x+=*#@@8#ox#xx%%%%%%%x` ;@xo~oxx%xo~x#@88x8o  *ox%xoooo%######88###888#8x==o%8@8%x8#%##%##%%%#8@###@#oooo%##xx%%xx%%o#8#%##%%#8*o%@8@@#*-;-=~~~++%@8###%%#xx8++#%%%%%####%##@%=~+==++x*o+o%#%%%%o*%x=*x%xo+=%%%+=*xo--+%o",
  "ooxx#+%#8+@%-~-=8~-+8x%#+;+8@**x=@@*#--;-~-+xx8o=x#ox#xo%xo#x+*#8#**o%%%%%%#x%#8#8@8#8@x+~+==o##8##ox88@@8o=+#@8%#%%%%#8%####: ;8%x+o%x%%%+x8@88x8x ,%+**xx**oo*oooo***ooox%#*~+#@@%###xo#%xx%xx%oox%88#####%##x%#8xx%xox#%o##%%##%##8*o##*8oo+-~+~-*x+o*xx#@8%%#%%8xx##%#####8@88@@#+=o#*++xo++x##%o%x%*o%*~*%##++*o*=+**~-~8#x",
  "xxxxx%%x##@%-~-=8--=8-;**;+xx+=*~==+%=~-~=-+oo#%*###%#xo#%o#x+o88##88#8#%#@@%%%%888#@8x==++===~*oo#xx8xo#@@@o~o@8##%#%oxx%%%%~ ;###=oxx#%o~%8@88x8% -8+*o%xo*ooooooxxxxxx%#%=~%@@88x%%#xx8x*o%*o%oox%88%%x%#xxxoxxxox%##%#xo#%%%%%%%#8ox%*++~~~-+==~=%o==-~*%8###%%#8####8#*++++++++*=xx*++*#o**+*ox*xx*%ox+oo==o=~=x%~**-~-*@xo",
];

const SKYLINE_SHADE = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001551",
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003664",
  "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003444200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000255664",
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002456552000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000166676543",
  "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045565660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000026777776661",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014566666720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000666777865752",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046556666640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005646777875766310",
  "00000000000000000000000000000000000000000000000000001111000000000000000000000000000000000000000366676667664000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046666777776763651",
  "00000000000000000000000000000000000000000000002334445445400000000000000000000000000000000000000466677677656300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000457775567774653662",
  "00000000000000000000000000000000000000000000014456654445630000000000000000000000000000000000000466666667656510000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000347775765654773662",
  "00000000000000000000000000000000000000000000023455566666740000000000000000000000000000000000000566667666656510000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000347775775774773563",
  "00000000000000000000000000000000000000000000034544466666740000000000000000000000000000000000000566666666656510000001333344101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000347775775664674563",
  "00000000000000000000000000000000000000000000044554466666650000000000000000000000000000000000000566666666656510000001655565114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001357775765774674553",
  "00000000000000000000000000000000000000000000044544466666640000000000000000000000000000000000000566666666666520000002888897224000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001367675764774674563",
  "00000000000000000000000000000000000000000000044543466666650000000000000000000000000000000000001566666666656520000002888797234000000000000000000000000000000000000000000000000000000000000000000000220000100000000000000000001357675674674674554",
  "00000000000000000000000000000000000000000000144543566666650000000000000000000000000000000000001566666666656520000003887796245000000000000000000000000000000000000000000000000000000000000000000005640000200100000000000000001346775674664674553",
  "00000000000000000000000000000000000000000000144543566666650000000000000000000000000000000000001556556666655420000003887796345000000000000000000000000000000000000000000000000000000000000000000046640000200100000000000000002446774673774573554",
  "00000000000000000000000000000000000000000000244544565566650000000000000000000000000000000000001555666666655420000003876697245000000000000000000000000000000000000000000000000000000000000000000047650000300200000000000000002456674674674574554",
  "00000000000000000000000000000000000000000000344445666666550000000000000000000000000000000000001555556666655430000003876696255000000000000000000000000000000000000000000000000000000000000000000056650000300200000000000000003456675674574574453",
  "00000000000000000000000000000000000000000000344434666666550000000000000000000000000000000000001566666776655430000004867696255000000000000000000000000000000000000000000000000000000000000000000057750001400300000000000000003456674673574573454",
  "00000000000000000000000000000000000000000000344434666566561000000000000000000000000000000000001454555556655430000004877696485000000000000000000000000000000000000000000000000000000000000000000068750001501400000000000000003456674673564574444",
  "00000000000000000000000000000000000000000001445434665566561000000000000000000000000000000000002455556666555330000003866696484000000000000000000000000000000000000000000000000000000000000000000078750002601500000000000000004436664673575574444000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000003545434665566561000000000000000000000000000000000001455556666555340000004866796384000000000000000000000000000000000000000000000000000000000000000000078651026853600000020000000004626675563575464454000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000112332123545434665566562000000000000000000000000000000000001455556666555340000004866695385000000000000000000000000000000000000000000000000000000111100000000187651048986530000287310000004625664563575464344000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000233442113555324655566562000000000000000000000000000000000002455556666554340000004866695375000000023100000000000000000000000000133100000000000002311120000000187551142781032322276510000005615664463575464344000000000000000000000000000000000000000000000000000000000000000000000000000000300",
  "00000000000000000000000000000000000112334214656445655566472000000000000000000000000000000000002454555566544340000004856795375000000376500000000000000000000000000366400000000002444243323210000287441253795678887988765000006736665574475464344000000000000000000000000000000000000000000000000000000000000000000000000000000620",
  "00000000000000000000000000000000000224454137654346655665473000000000000000000000000000000000002455566666554350000005856795375000232588522100000000000000000000233477623200000003555366634354100398772598889999989888899211006646766686375364344100000000000000000000000000000000000000000000000000000000000000000000000000000730",
  "00000000000000000000000000000000001223444137554346655655473000000000000000000000000000000000002455555557554350000004656794375000464377434310033100000000000000456366445400000003566366633776532565561484556423313331332234326565755475365364343100000000000000000000000000000000000000000000000122221123000000000000000111223950",
  "00000000000000000000000000000000001223444136554346555655566443333332220000000000000000000000002455665666554250000004556793375000465488545440356773000003650000566466545400000014566356523853454453341596657524424442554235657678866576265364343100000000000000000000000000000000000000000000223433566445300000000011112333336850",
  "00000000000000000000000000000000001123444036554346655665568777777777773000000000000000000000003455555556554250000004555793365000465477557666666766100005773113665477545410000025666466634865565564462698668744424552566556547677755576265364354100000000000000000000000000000000000000000001433434756632222221221122222122234760",
  "00011000000000000000000000000000001123354036654236555666568666777666663000000000000000000000003465555556554250000004456782375000465477446644644655100006663665677478646510002226666466622765565565554786888535634673344224327555755576265364243100000000000000000000000000000000000000000002433553523521345443333222323334446780",
  "10132210000000000000000000000000001012353037654246555656568777766766564000000000000000012222215565565556444250000004556782366000565488678997421347200036662654676377445310003756655356522765665565557785556524424552354356438876877786165365243200000000000000000000000000000000000000000004434553523643334444433333333334445792",
  "40463132222000000000000000000000002023453037653346555555567767666665664000000000000000233341125665545556454260000004456861335100577687888987777828400036663664776467435420005436655356522765664564556795567744424442354224427666878896166355243100000000000000000000000000000000000000000005434664523633334333433233344323335584",
  "92796475788541112100000000001200006765688668654456555565568777666666655000000000000001344551105776656666454260000004356860434100666431214711699947400125663664677477545420004007766345423765564564556895657645633574456325327765775576155355343200000000000000000000000000000000111122222224545664533633333333433333334333335586",
  "21232344778642357400000000279979756430013578876676656666578777666666555000000000000003345662106775454456454260000015343860422200645200236403699937400135562665676367434430005018877355523765665564456896667655524553564236318865765566155355343200000000000000000000000000000001623334544445656674432533333334443444344434344355",
  "00000000014400010157766101211132244554344334677899888766567777666666667000000000032005678995417887666666454270000015422960422101756112436504799937500125673654776366434340016018766366633865776886667998568878878874466446537765765577155355343300000000000000000000000000000002834446665567766674432445873444554555545443265244",
  "00012111139722000003699616500000000045989987556678999977667777666667789345566666767578996887759999876667454361000025322960422201746122335403799938500125673554777366434440036019766356747988787766788999899999999998768646637765775577022244233400000000000000000000000000000003835546667678877775532544883445551256535444255433",
  "22232323358504532000004303321110000340200000000000124687666666666678886688777777775420000022223457899988564333213785112950422201754023345413799938600215762554776367535561386019878589976532222210000001222211111001247456527865765577255687666554444444333333432021000000000004845557874443478885543545782254351057447337574222",
  "11224652477529989532110110399954666980000002376321027897666666666779710000000000000013467897546542224799996532222595102850423201734134435503799938600214662554565355324454465029999764212456788998765654320142000000776347558776765678555999999998866688665555556466112023210006955668620000015897543546871017373055465218897124",
  "22337464879511127000554321188200002554962000048989899876577666766789995010011540389999999997789999974213699975641484444763542102854224445603799938700415873652167477657543456039974224768998876777679999994488665676676425527788876887002889987655300016786466445436326322232223457862000000100225543533970017535025542025665056",
  "22337366869500007001999810187100043142455000002322467765678853455544589766444545999999998445799989999985213799972464455555663103941034453203799938700503431222667777777776788785214599945865765665557996779744435774456335527974665567014989973000000011598677556447547655566666578950000001302015854552153024543115552025300164",
  "22336166829600017002856720289324199360000002558315633643643641179821255566676689789989941000027788724899984127986754557966776202754135456613799938802600043001101110000112467313799678732764564564446896667747635673344247416555675678027727442002002524245698557558667767888899999960026200321037852644225102567122321122000864",
  "33334554679600017002700330255113011260000002447627776643653741288888888768996545989897400000000233744943899940499875761335555202667034366204899938804701144111112223222234772169998466733853353353346895435624423442467647416554654568136222000021001640100368657558878878832222222210331011730101241431634132104101460220002843",
];

type ShadeRun = { level: number; text: string };

// Cells are grouped into runs of equal brightness once, at module load, so the
// plate is a few thousand spans rather than one per character.
const SKYLINE_ROWS: ShadeRun[][] = SKYLINE_CHARS.map((line, row) => {
  const shade = SKYLINE_SHADE[row] ?? "";
  const runs: ShadeRun[] = [];
  for (let i = 0; i < line.length; i += 1) {
    const level = line[i] === " " ? 0 : Number(shade[i] ?? "0");
    const last = runs[runs.length - 1];
    if (last && last.level === level) last.text += line[i];
    else runs.push({ level, text: line[i] });
  }
  return runs;
});

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand footer-brand-lockup" href="#top" aria-label="Roster home">
              <RosterMark />
              <span className="brand-name">roster</span>
            </a>
            <p>
              The self-learning tool router for MCP. One local endpoint in front
              of every server you own, ranked on what actually worked.
            </p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#showcase">What roster does</a>
              <a href={PLACEHOLDER}>Rankings</a>
            </div>
            <div className="footer-col">
              <h4>Docs</h4>
              <a href={PLACEHOLDER}>Documentation</a>
              <a href={PLACEHOLDER}>Telemetry schema</a>
            </div>
            <div className="footer-col">
              <h4>Project</h4>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a href={PLACEHOLDER}>Provenance</a>
              <a href={PLACEHOLDER}>MIT license</a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 roster</span>
        </div>
      </div>

      <div className="footer-art reveal" aria-hidden="true">
        <pre>
          {SKYLINE_ROWS.map((runs, row) => (
            <span key={row}>
              {runs.map((run, i) => (
                <span className={`sky-${run.level}`} key={i}>{run.text}</span>
              ))}
              {"\n"}
            </span>
          ))}
        </pre>
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
            <a className="nav-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
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
            <span>Your agent has 200 tools. Roster shows it only the ones that fit the task,</span>{" "}
            <br />
            <span>learns which ones actually deliver, and never leaves your machine.</span>
          </p>

          <div className="hero-actions">
            <button className="hero-button hero-button-primary" onClick={copyPrompt} type="button">
              <CopyIcon />
              <span>{copied ? "Copied to clipboard" : "Prompt for LLMs"}</span>
            </button>
            <a className="hero-button hero-button-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">
              <StarIcon />
              <span>Star on GitHub</span>
            </a>
          </div>
        </section>
      </div>

      <FeatureSection />
      <LineupSection />
      <SiteFooter />
    </main>
  );
}
