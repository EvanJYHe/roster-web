/* Corridor geometry for the hero marquee.

The scene is a perspective tunnel: sixteen lanes fan out from a vanishing
point at CENTER_X toward the screen edges, and logos ride those lanes. Every
boundary is a straight line, so a lane position is linear in depth and a
logo's whole journey is a lerp between its depth-1 and exit-depth points.
*/
export const ART_WIDTH = 1672;
export const ART_HEIGHT = 941;
export const CENTER_X = 836;
export const RIGHT_EDGE = 1671;

export type Side = "left" | "right";

export type Boundary = {
  outerY: number;
  slope: number;
};

export type Point = {
  x: number;
  y: number;
};

export const LEFT_BOUNDARIES: Boundary[] = [
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

export const RIGHT_BOUNDARIES: Boundary[] = [
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

export const BOUNDARIES: Record<Side, Boundary[]> = {
  left: LEFT_BOUNDARIES,
  right: RIGHT_BOUNDARIES,
};

export function boundaryPoint(side: Side, boundaryIndex: number, x: number): Point {
  const boundary = BOUNDARIES[side][boundaryIndex];
  const distanceFromEdge = side === "left" ? x : RIGHT_EDGE - x;

  return {
    x,
    y: boundary.outerY + boundary.slope * distanceFromEdge,
  };
}

export function partialBoundaryPoint(side: Side, x: number): Point {
  const boundary = side === "left"
    ? { outerY: 1080, slope: -0.68 }
    : { outerY: 1060, slope: -0.66 };
  const distanceFromEdge = side === "left" ? x : RIGHT_EDGE - x;

  return { x, y: boundary.outerY + boundary.slope * distanceFromEdge };
}

export function boundaryPath(side: Side, boundaryIndex: number): string {
  const edgeX = side === "left" ? 0 : RIGHT_EDGE;
  const outer = boundaryPoint(side, boundaryIndex, edgeX);
  const inner = boundaryPoint(side, boundaryIndex, CENTER_X);

  return `M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`;
}

// The supplied MCP logo pack gives the corridor a broad tool-ecosystem mix.
export const LOGO_KINDS = [
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

export type LogoKind = typeof LOGO_KINDS[number];

export type LogoSpec = {
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
export const SECTION_DEPTHS = [0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88] as const;
export const LOGO_SLOTS_PER_WALL = SECTION_DEPTHS.length * 8;
export const SIDE_LOGO_OFFSETS: Record<Side, number> = { left: 0, right: LOGO_SLOTS_PER_WALL };

// Marquee flow: every logo drifts outward along its wall lane, from the
// vanishing point (depth 1) to just past the screen edge (a slightly
// negative depth so glyphs fully exit before wrapping back to the center).
export const FLOW_DURATION_S = 60;
export const FLOW_EXIT_DEPTH = -0.05;

// A corridor whose lanes converge but whose glyphs never change size has no
// depth cue at all: near the vanishing point every lane overlaps at full size,
// which is what reads as "squished", and with nothing shrinking the eye cannot
// tell that constant screen speed is correct. Size is therefore tied to depth,
// interpolated over the same keyframe as the position so the two stay in step.
// 1 is the size at the screen edge; the far end is FLOW_NEAR_SCALE of that.
export const FLOW_NEAR_SCALE = 0.3;

export function depthScale(depth: number): number {
  return FLOW_NEAR_SCALE + (1 - FLOW_NEAR_SCALE) * (1 - depth);
}

// Deterministic hash so lanes get stable, hydration-safe stagger offsets.
export function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildLogoSpecs(side: Side): LogoSpec[] {
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

export const ALL_LOGOS = (Object.keys(SIDE_LOGO_OFFSETS) as Side[]).flatMap(buildLogoSpecs);

// Every brand receives the same exact icon height. Perspective is carried by
// wall placement, row geometry, opacity, and occlusion rather than changing
// the dimensions of repeated marks.
export const LOGO_ICON_SIZE = 42;
export const LOGO_INK_SCALE = 0.82;
export const LOGO_ICON_ASPECTS: Partial<Record<LogoKind, number>> = {
  amazonaws: 1.67,
  kafka: 2.19,
  openai: 1.03,
  playwright: 1.33,
  salesforce: 1.42,
};

// Several pack assets use a generous square viewBox around a shorter mark.
// These measured optical corrections make their visible ink comparable to
// the exact shared logo height without changing the wall geometry.
export const LOGO_OPTICAL_SCALES: Partial<Record<LogoKind, number>> = {
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

export const ROW_LOGO_OPACITY = [0.62, 0.56, 0.68, 0.82, 0.66, 0.58, 0.56, 0.46];

// These marks draw their inner detail with contrasting fills (white text or
// features over a colored base), so a flat silhouette would erase it; they
// keep the tonal grayscale mapping instead.
export const MULTI_TONE_LOGOS = new Set<LogoKind>([
  "playwright",
  "salesforce",
  "sendgrid",
]);

export type LogoGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
};

export function rowShear(side: Side, row: number): number {
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
export function lanePoint(logo: LogoSpec, depth: number): Point {
  const distanceFromEdge = depth * (CENTER_X - 1);
  const x = logo.side === "left" ? distanceFromEdge : RIGHT_EDGE - distanceFromEdge;
  const top = boundaryPoint(logo.side, (logo.row - 1) * 2, x).y;
  const bottom = logo.row === 8
    ? partialBoundaryPoint(logo.side, x).y
    : boundaryPoint(logo.side, (logo.row - 1) * 2 + 1, x).y;

  return { x, y: (top + bottom) / 2 };
}

export function logoGeometry(logo: LogoSpec): LogoGeometry {
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
