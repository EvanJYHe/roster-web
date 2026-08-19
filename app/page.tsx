"use client";

const VIEWPORT_WIDTH = 1672;
const VIEWPORT_HEIGHT = 941;
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

const ROW_OPACITY = [0.72, 0.86, 0.92, 0.96, 0.92, 0.85, 0.68, 0.4];

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

function panelPath(side: Side, topIndex: number, bottomIndex?: number): string {
  const edgeX = side === "left" ? 0 : RIGHT_EDGE;
  const innerTop = boundaryPoint(side, topIndex, CENTER_X);
  const innerBottom = bottomIndex === undefined
    ? partialBoundaryPoint(side, CENTER_X)
    : boundaryPoint(side, bottomIndex, CENTER_X);
  const outerTop = boundaryPoint(side, topIndex, edgeX);
  const outerBottom = bottomIndex === undefined
    ? partialBoundaryPoint(side, edgeX)
    : boundaryPoint(side, bottomIndex, edgeX);

  return [
    `M ${outerTop.x} ${outerTop.y}`,
    `L ${outerBottom.x} ${outerBottom.y}`,
    `L ${innerBottom.x} ${innerBottom.y}`,
    `L ${innerTop.x} ${innerTop.y}`,
    "Z",
  ].join(" ");
}

function boundaryPath(side: Side, boundaryIndex: number): string {
  const edgeX = side === "left" ? 0 : RIGHT_EDGE;
  const outer = boundaryPoint(side, boundaryIndex, edgeX);
  const inner = boundaryPoint(side, boundaryIndex, CENTER_X);

  return `M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`;
}

type LogoKind =
  | "apple"
  | "aws"
  | "github"
  | "google"
  | "microsoft"
  | "notion"
  | "openai"
  | "stripe"
  | "vercel";

type MicrosoftLayout = {
  iconX: number;
  iconY: number;
  squareWidth: number;
  squareHeight: number;
  columnStep: number;
  rowStep: number;
  labelX: number;
  labelY: number;
  labelFontSize: number;
  labelLetterSpacing: string;
};

type LogoSpec = {
  side: Side;
  row: number;
  kind: LogoKind;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  microsoftLayout?: MicrosoftLayout;
};

// These are screen-space anchors from the reference. Keeping them explicit
// avoids letting a perspective formula bunch marks at the far end of a wall.
const LOGOS: LogoSpec[] = [
  { side: "left", row: 1, kind: "google", x: 46.5, y: 163.1, width: 63, height: 31, opacity: 0.5 },
  { side: "left", row: 1, kind: "apple", x: 136.7, y: 190.7, width: 19, height: 29, opacity: 0.65 },
  { side: "left", row: 1, kind: "openai", x: 201.9, y: 214.3, width: 18, height: 26, opacity: 0.4 },
  // These two instances are the clearest depth pair in the reference. Their
  // row matrices differ, and their internal Microsoft marks do too: the
  // upper mark is narrower/taller while the lower mark is wider with a
  // larger wordmark. Keep those measurements local to the instance instead
  // of forcing one brand layout across the wall.
  {
    side: "left",
    row: 2,
    kind: "microsoft",
    x: 68,
    y: 249,
    width: 97,
    height: 45,
    opacity: 0.48,
    microsoftLayout: {
      iconX: 2.5,
      iconY: 11.2,
      squareWidth: 12,
      squareHeight: 14.5,
      columnStep: 13,
      rowStep: 15.5,
      labelX: 31,
      labelY: 28,
      labelFontSize: 20,
      labelLetterSpacing: "-0.12em",
    },
  },
  { side: "left", row: 2, kind: "github", x: 176.5, y: 273.1, width: 28, height: 32, opacity: 0.4 },
  { side: "left", row: 2, kind: "notion", x: 251.6, y: 290.7, width: 22, height: 30, opacity: 0.35 },
  { side: "left", row: 2, kind: "microsoft", x: 306.3, y: 302.5, width: 15, height: 22, opacity: 0.22 },
  { side: "left", row: 3, kind: "apple", x: 47.1, y: 341.5, width: 29, height: 40, opacity: 0.9 },
  { side: "left", row: 3, kind: "openai", x: 143.2, y: 349.9, width: 30, height: 37, opacity: 0.65 },
  { side: "left", row: 3, kind: "github", x: 242.3, y: 359.8, width: 58, height: 26, opacity: 0.55 },
  { side: "left", row: 3, kind: "google", x: 330.1, y: 369.2, width: 38, height: 25, opacity: 0.3 },
  {
    side: "left",
    row: 4,
    kind: "microsoft",
    x: 102,
    y: 442,
    width: 117,
    height: 37,
    opacity: 0.85,
    microsoftLayout: {
      iconX: 2.5,
      iconY: 1.2,
      squareWidth: 13,
      squareHeight: 16,
      columnStep: 15,
      rowStep: 17,
      labelX: 37,
      labelY: 20.5,
      labelFontSize: 25,
      labelLetterSpacing: "-0.133em",
    },
  },
  { side: "left", row: 4, kind: "google", x: 239, y: 438.9, width: 52, height: 27, opacity: 0.43 },
  { side: "left", row: 4, kind: "apple", x: 313.2, y: 434.9, width: 15, height: 28, opacity: 0.7 },
  { side: "left", row: 5, kind: "notion", x: 85, y: 544.9, width: 31, height: 39, opacity: 0.58 },
  { side: "left", row: 5, kind: "vercel", x: 208, y: 526.5, width: 61, height: 30, opacity: 0.48 },
  { side: "left", row: 5, kind: "aws", x: 299.3, y: 514, width: 28, height: 28, opacity: 0.5 },
  { side: "left", row: 6, kind: "apple", x: 42.5, y: 676.7, width: 33, height: 49, opacity: 0.63 },
  { side: "left", row: 6, kind: "openai", x: 154.4, y: 642.9, width: 32, height: 41, opacity: 0.72 },
  { side: "left", row: 6, kind: "aws", x: 255, y: 612.2, width: 22, height: 38, opacity: 0.68 },
  { side: "left", row: 6, kind: "vercel", x: 344.3, y: 586.2, width: 28, height: 31, opacity: 0.56 },
  { side: "left", row: 7, kind: "google", x: 84.7, y: 804.2, width: 83, height: 59, opacity: 0.65 },
  { side: "left", row: 7, kind: "notion", x: 232, y: 739, width: 79, height: 57, opacity: 0.72 },
  { side: "left", row: 7, kind: "microsoft", x: 330.6, y: 688.4, width: 21, height: 34, opacity: 0.62 },
  { side: "left", row: 8, kind: "stripe", x: 163, y: 901.5, width: 45, height: 41, opacity: 0.8 },

  { side: "right", row: 1, kind: "stripe", x: 1471.6, y: 218.1, width: 28, height: 21, opacity: 0.35 },
  { side: "right", row: 1, kind: "microsoft", x: 1549.8, y: 193.7, width: 64, height: 38, opacity: 0.35 },
  { side: "right", row: 1, kind: "openai", x: 1645.2, y: 160.2, width: 27, height: 36, opacity: 0.52 },
  { side: "right", row: 2, kind: "apple", x: 1631.8, y: 247.7, width: 22, height: 37, opacity: 0.7 },
  { side: "right", row: 2, kind: "google", x: 1479.6, y: 282.9, width: 40, height: 24, opacity: 0.38 },
  { side: "right", row: 2, kind: "aws", x: 1412.8, y: 298.9, width: 24, height: 25, opacity: 0.52 },
  { side: "right", row: 3, kind: "openai", x: 1615.5, y: 341.7, width: 32, height: 40, opacity: 0.63 },
  { side: "right", row: 3, kind: "notion", x: 1517.5, y: 352.3, width: 22, height: 32, opacity: 0.62 },
  { side: "right", row: 3, kind: "google", x: 1436.5, y: 362.5, width: 42, height: 26, opacity: 0.37 },
  { side: "right", row: 3, kind: "github", x: 1362.2, y: 369.5, width: 32, height: 21, opacity: 0.3 },
  { side: "right", row: 4, kind: "apple", x: 1438.4, y: 436.8, width: 18, height: 32, opacity: 0.85 },
  { side: "right", row: 4, kind: "notion", x: 1513.4, y: 439.3, width: 26, height: 35, opacity: 0.45 },
  { side: "right", row: 4, kind: "openai", x: 1615.2, y: 442.6, width: 34, height: 44, opacity: 0.65 },
  { side: "right", row: 5, kind: "vercel", x: 1429.7, y: 518.6, width: 22, height: 31, opacity: 0.32 },
  { side: "right", row: 5, kind: "microsoft", x: 1523, y: 535.4, width: 79, height: 38, opacity: 0.5 },
  { side: "right", row: 5, kind: "google", x: 1653.6, y: 555.7, width: 35, height: 28, opacity: 0.43 },
  { side: "right", row: 6, kind: "openai", x: 1389.3, y: 598.7, width: 28, height: 33, opacity: 0.65 },
  { side: "right", row: 6, kind: "vercel", x: 1463.8, y: 621.1, width: 54, height: 33, opacity: 0.65 },
  { side: "right", row: 6, kind: "microsoft", x: 1571.4, y: 654.3, width: 44, height: 43, opacity: 0.65 },
  { side: "right", row: 6, kind: "apple", x: 1663.3, y: 678.7, width: 20, height: 43, opacity: 0.55 },
  { side: "right", row: 7, kind: "github", x: 1353.1, y: 682.2, width: 46, height: 36, opacity: 0.46 },
  { side: "right", row: 7, kind: "google", x: 1437.5, y: 722.2, width: 42, height: 37, opacity: 0.65 },
  { side: "right", row: 7, kind: "notion", x: 1528.9, y: 764.5, width: 29, height: 46, opacity: 0.65 },
  { side: "right", row: 7, kind: "microsoft", x: 1580.9, y: 790.6, width: 77, height: 58, opacity: 0.72 },
  { side: "right", row: 8, kind: "github", x: 1327.9, y: 764.4, width: 32, height: 36, opacity: 0.5 },
  { side: "right", row: 8, kind: "notion", x: 1397.2, y: 811.5, width: 48, height: 51, opacity: 0.5 },
  { side: "right", row: 8, kind: "microsoft", x: 1487.8, y: 871.9, width: 48, height: 48, opacity: 0.55 },
  { side: "right", row: 8, kind: "apple", x: 1577, y: 924.5, width: 24, height: 30, opacity: 0.5 },
];

function wallCenterY(side: Side, row: number, x: number): number {
  const top = boundaryPoint(side, (row - 1) * 2, x).y;
  const bottom = row === 8
    ? partialBoundaryPoint(side, x).y
    : boundaryPoint(side, (row - 1) * 2 + 1, x).y;

  return (top + bottom) / 2;
}

const TAIL_LOGO_KINDS: LogoKind[] = ["openai", "google", "notion", "github", "aws", "vercel", "microsoft", "stripe"];
const TAIL_LOGOS: LogoSpec[] = (["left", "right"] as Side[]).flatMap((side) =>
  Array.from({ length: 7 }, (_, rowIndex) =>
    [390, 470, 550, 630, 710, 780].map((distance, markIndex) => {
      const x = side === "left" ? distance : RIGHT_EDGE - distance;
      const size = Math.max(9, 25 - distance * 0.014);

      return {
        side,
        row: rowIndex + 1,
        kind: TAIL_LOGO_KINDS[(rowIndex * 2 + markIndex + (side === "right" ? 3 : 0)) % TAIL_LOGO_KINDS.length],
        x,
        y: wallCenterY(side, rowIndex + 1, x),
        width: size * (markIndex % 3 === 0 ? 1.25 : 1),
        height: size,
        opacity: Math.max(0.07, 0.18 - distance * 0.00008),
      };
    }),
  ).flat(),
);

const ALL_LOGOS = [...LOGOS, ...TAIL_LOGOS];

// The strips are sheared planes, not rotated cards. These are the measured
// center-line slopes of each row's top/bottom boundary pair. Applying them
// as the b term of an SVG matrix keeps vertical glyph strokes vertical while
// carrying their baselines along the strip.
const ROW_SHEARS: Record<Side, number[]> = {
  left: [
    (LEFT_BOUNDARIES[0].slope + LEFT_BOUNDARIES[1].slope) / 2,
    (LEFT_BOUNDARIES[2].slope + LEFT_BOUNDARIES[3].slope) / 2,
    (LEFT_BOUNDARIES[4].slope + LEFT_BOUNDARIES[5].slope) / 2,
    (LEFT_BOUNDARIES[6].slope + LEFT_BOUNDARIES[7].slope) / 2,
    (LEFT_BOUNDARIES[8].slope + LEFT_BOUNDARIES[9].slope) / 2,
    (LEFT_BOUNDARIES[10].slope + LEFT_BOUNDARIES[11].slope) / 2,
    (LEFT_BOUNDARIES[12].slope + LEFT_BOUNDARIES[13].slope) / 2,
    (LEFT_BOUNDARIES[14].slope + -0.68) / 2,
  ],
  right: [
    -(RIGHT_BOUNDARIES[0].slope + RIGHT_BOUNDARIES[1].slope) / 2,
    -(RIGHT_BOUNDARIES[2].slope + RIGHT_BOUNDARIES[3].slope) / 2,
    -(RIGHT_BOUNDARIES[4].slope + RIGHT_BOUNDARIES[5].slope) / 2,
    -(RIGHT_BOUNDARIES[6].slope + RIGHT_BOUNDARIES[7].slope) / 2,
    -(RIGHT_BOUNDARIES[8].slope + RIGHT_BOUNDARIES[9].slope) / 2,
    -(RIGHT_BOUNDARIES[10].slope + RIGHT_BOUNDARIES[11].slope) / 2,
    -(RIGHT_BOUNDARIES[12].slope + RIGHT_BOUNDARIES[13].slope) / 2,
    -(RIGHT_BOUNDARIES[14].slope + -0.66) / 2,
  ],
};

function LogoGlyph({ logo }: { logo: LogoSpec }) {
  const shear = ROW_SHEARS[logo.side][logo.row - 1];
  const microsoftLayout = logo.microsoftLayout ?? {
    iconX: logo.height * 0.06,
    iconY: 10,
    squareWidth: Math.max(5, logo.height * 0.27),
    squareHeight: Math.max(5, logo.height * 0.27),
    columnStep: Math.max(5, logo.height * 0.3),
    rowStep: Math.max(5, logo.height * 0.32),
    labelX: logo.height * 0.72,
    labelY: logo.height * 0.56,
    labelFontSize: 18,
    labelLetterSpacing: "-0.085em",
  } satisfies MicrosoftLayout;
  const commonImageProps = {
    className: "depth-logo-image",
    height: logo.height,
    width: logo.width,
    x: -logo.width / 2,
    y: -logo.height / 2,
  };

  return (
    <g
      className="depth-mark"
      opacity={logo.opacity}
      transform={`matrix(1 ${shear} 0 1 ${logo.x} ${logo.y})`}
    >
      {logo.kind === "apple" ? (
        <svg aria-hidden="true" height={logo.height} viewBox="0 0 24 24" width={logo.width} x={-logo.width / 2} y={-logo.height / 2}>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.3.74 3.12.8 1.23-.25 2.41-.94 3.6-.84 1.44.12 2.53.69 3.22 1.71-2.97 1.78-2.27 5.69.46 6.78-.55 1.45-1.27 2.86-2.4 4.52zM12.03 7.25C11.88 5.1 13.63 3.34 15.61 3.17c.27 2.49-2.24 4.31-3.58 4.08z" />
        </svg>
      ) : logo.kind === "openai" ? (
        <svg aria-hidden="true" height={logo.height} viewBox="0 0 130 126" width={logo.width} x={-logo.width / 2} y={-logo.height / 2}>
          <path d="M116.085 51.561a31.37 31.37 0 0 0-2.695-25.774a31.77 31.77 0 0 0-34.184-15.224A31.4 31.4 0 0 0 55.536.001a31.74 31.74 0 0 0-30.278 21.99A31.4 31.4 0 0 0 4.282 37.213a31.77 31.77 0 0 0 3.906 37.218a31.4 31.4 0 0 0 2.695 25.748a31.77 31.77 0 0 0 34.21 15.256a31.4 31.4 0 0 0 23.644 10.562a31.74 31.74 0 0 0 30.278-21.99a31.4 31.4 0 0 0 20.97-15.223a31.73 31.73 0 0 0-3.9-37.224m-47.348 66.22a23.52 23.52 0 0 1-15.108-5.478c.186-.104.548-.285.756-.422l25.09-14.484a4.07 4.07 0 0 0 2.06-3.567V58.453l10.6 6.119a.37.37 0 0 1 .208.296v29.28c0 13.041-10.564 23.618-23.606 23.633M18.015 96.12a23.56 23.56 0 0 1-2.82-15.821c.185.115.514.312.744.443l25.096 14.49a4.08 4.08 0 0 0 4.12 0L75.77 77.528v12.238a.37.37 0 0 1-.148.328L50.26 104.732c-11.292 6.502-25.716 2.637-32.245-8.64zm-6.573-54.782a23.5 23.5 0 0 1 12.287-10.354v29.823a4.08 4.08 0 0 0 2.06 3.567l30.623 17.683l-10.639 6.141a.37.37 0 0 1-.356.033L20.059 73.589c-11.282-6.527-15.148-20.957-8.64-32.25zm87.102 20.27L67.92 43.924l10.59-6.125a.38.38 0 0 1 .355-.033l25.359 14.643a23.61 23.61 0 0 1-3.649 42.598V65.191a4.08 4.08 0 0 0-2.049-3.583zM109.1 45.721a30 30 0 0 0-.745-.444L83.26 30.788a4.08 4.08 0 0 0-4.12 0L48.517 48.466V36.233a.4.4 0 0 1 .154-.328l25.358-14.638a23.61 23.61 0 0 1 35.06 24.46zM42.738 67.546l-10.605-6.119a.4.4 0 0 1-.203-.295V31.85a23.605 23.605 0 0 1 38.714-18.155c-.186.105-.52.285-.756.422l-25.09 14.484a4.08 4.08 0 0 0-2.06 3.567zm5.758-12.418l13.64-7.878l13.635 7.878v15.744l-13.64 7.877l-13.64-7.877z" />
        </svg>
      ) : logo.kind === "microsoft" ? (
        <g className="depth-microsoft-mark" transform={`translate(${-logo.width / 2} ${-logo.height / 2})`}>
          <g className="depth-microsoft-icon" transform={`translate(${microsoftLayout.iconX} ${microsoftLayout.iconY})`}>
            <rect height={microsoftLayout.squareHeight} width={microsoftLayout.squareWidth} />
            <rect height={microsoftLayout.squareHeight} width={microsoftLayout.squareWidth} x={microsoftLayout.columnStep} />
            <rect height={microsoftLayout.squareHeight} width={microsoftLayout.squareWidth} y={microsoftLayout.rowStep} />
            <rect height={microsoftLayout.squareHeight} width={microsoftLayout.squareWidth} x={microsoftLayout.columnStep} y={microsoftLayout.rowStep} />
          </g>
          <text
            className="depth-combo-label"
            dominantBaseline="middle"
            style={{
              fontSize: `${microsoftLayout.labelFontSize}px`,
              letterSpacing: microsoftLayout.labelLetterSpacing,
            }}
            x={microsoftLayout.labelX}
            y={microsoftLayout.labelY}
          >
            Microsoft
          </text>
        </g>
      ) : logo.kind === "google" ? (
        <text
          className="depth-wordmark depth-google-wordmark"
          dominantBaseline="middle"
          style={{ fontSize: `${Math.max(12, logo.width * 28 / 63)}px` }}
          textAnchor="middle"
          y="1"
        >
          Google
        </text>
      ) : logo.kind === "vercel" ? (
        <g className="depth-vercel-mark" transform={`translate(${-logo.width / 2} ${-logo.height / 2})`}>
          <path d={`M ${logo.height * 0.36} 2 L ${logo.height * 0.72} ${logo.height - 2} L 0 ${logo.height - 2} Z`} />
          <text className="depth-combo-label" dominantBaseline="middle" x={logo.height * 0.88} y={logo.height * 0.47}>Vercel</text>
        </g>
      ) : (logo.kind === "github" || logo.kind === "notion") && logo.width > 40 ? (
        <g className="depth-wordmark-combo" transform={`translate(${-logo.width / 2} ${-logo.height / 2})`}>
          <image
            className="depth-logo-image"
            href={`/mcp-logos/${logo.kind}.svg`}
            height={Math.min(logo.height * 0.68, 27)}
            width={Math.min(logo.height * 0.68, 27)}
            x="0"
            y={logo.height / 2 - Math.min(logo.height * 0.68, 27) / 2}
          />
          <text
            className="depth-combo-label"
            dominantBaseline="middle"
            style={{ fontSize: `${Math.max(12, Math.min(18, logo.height * 0.52))}px` }}
            x={Math.min(logo.height * 0.68, 27) + 7}
            y={logo.height / 2}
          >
            {logo.kind === "github" ? "GitHub" : "Notion"}
          </text>
        </g>
      ) : logo.kind === "stripe" ? (
        <text className="depth-stripe-wordmark" dominantBaseline="middle" fontSize={Math.max(12, logo.height * 0.55)} fontStyle="italic" textAnchor="middle" y="1">stripe</text>
      ) : (
        <image href={`/mcp-logos/${logo.kind === "aws" ? "amazonaws" : logo.kind}.svg`} {...commonImageProps} />
      )}
    </g>
  );
}

function PerspectiveMarquee() {
  const sides: Side[] = ["left", "right"];

  return (
    <svg className="perspective-marquee" viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="left-wall-mask-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="700" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="18%" stopColor="white" stopOpacity="0.74" />
          <stop offset="35%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0.12" />
          <stop offset="70%" stopColor="white" stopOpacity="0.02" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="right-wall-mask-gradient" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE} x2="971" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="18%" stopColor="white" stopOpacity="0.74" />
          <stop offset="35%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0.12" />
          <stop offset="70%" stopColor="white" stopOpacity="0.02" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="left-logo-mask-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="700" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.74" />
          <stop offset="18%" stopColor="white" stopOpacity="0.78" />
          <stop offset="35%" stopColor="white" stopOpacity="0.48" />
          <stop offset="50%" stopColor="white" stopOpacity="0.18" />
          <stop offset="70%" stopColor="white" stopOpacity="0.03" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="right-logo-mask-gradient" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE} x2="971" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.74" />
          <stop offset="18%" stopColor="white" stopOpacity="0.78" />
          <stop offset="35%" stopColor="white" stopOpacity="0.48" />
          <stop offset="50%" stopColor="white" stopOpacity="0.18" />
          <stop offset="70%" stopColor="white" stopOpacity="0.03" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <mask id="left-wall-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={CENTER_X} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#left-wall-mask-gradient)" height={VIEWPORT_HEIGHT} width={CENTER_X} x="0" y="0" />
        </mask>
        <mask id="right-wall-mask" maskUnits="userSpaceOnUse" x={CENTER_X} y="0" width={CENTER_X} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#right-wall-mask-gradient)" height={VIEWPORT_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
        </mask>
        <mask id="left-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={CENTER_X} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#left-logo-mask-gradient)" height={VIEWPORT_HEIGHT} width={CENTER_X} x="0" y="0" />
        </mask>
        <mask id="right-logo-mask" maskUnits="userSpaceOnUse" x={CENTER_X} y="0" width={CENTER_X} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#right-logo-mask-gradient)" height={VIEWPORT_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
        </mask>
        <linearGradient id="left-panel-fill" gradientUnits="userSpaceOnUse" x1="0" x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#dce9e5" stopOpacity="0.045" />
          <stop offset="24%" stopColor="#c9d8d3" stopOpacity="0.025" />
          <stop offset="56%" stopColor="#b7c7c2" stopOpacity="0.008" />
          <stop offset="100%" stopColor="#b7c7c2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="right-panel-fill" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE} x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#dce9e5" stopOpacity="0.045" />
          <stop offset="24%" stopColor="#c9d8d3" stopOpacity="0.025" />
          <stop offset="56%" stopColor="#b7c7c2" stopOpacity="0.008" />
          <stop offset="100%" stopColor="#b7c7c2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="center-occlusion-left" gradientUnits="userSpaceOnUse" x1="350" x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="center-occlusion-right" gradientUnits="userSpaceOnUse" x1={RIGHT_EDGE - 350} x2={CENTER_X} y1="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="top-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="70" y2="290">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="24%" stopColor="white" stopOpacity="0.2" />
          <stop offset="62%" stopColor="white" stopOpacity="0.94" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="top-fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#top-fade)" height={VIEWPORT_HEIGHT} width={VIEWPORT_WIDTH} x="0" y="0" />
        </mask>
        <linearGradient id="bottom-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="700" y2={VIEWPORT_HEIGHT}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="65%" stopColor="white" stopOpacity="0.86" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
        <mask id="bottom-fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT}>
          <rect fill="url(#bottom-fade)" height={VIEWPORT_HEIGHT} width={VIEWPORT_WIDTH} x="0" y="0" />
        </mask>
      </defs>

      {sides.map((side) => {
        const wallGroup = (
          <g className={`depth-corridor depth-corridor-${side}`} key={side} mask={`url(#${side}-wall-mask)`}>
            {Array.from({ length: 8 }, (_, rowIndex) => {
              const topIndex = rowIndex * 2;
              const bottomIndex = topIndex + 1 < BOUNDARIES[side].length ? topIndex + 1 : undefined;

              return (
                <path
                  className="depth-band-fill"
                  d={panelPath(side, topIndex, bottomIndex)}
                  fill={`url(#${side}-panel-fill)`}
                  opacity={ROW_OPACITY[rowIndex]}
                  key={`${side}-panel-${rowIndex}`}
                />
              );
            })}

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
                    {LOGOS.filter((logo) => logo.side === side).map((logo, index) => (
                      <LogoGlyph key={`${side}-${logo.row}-${logo.kind}-${index}`} logo={logo} />
                    ))}
                  </g>
                </g>
              </g>
            </g>
          </g>
        );
      })}

      <g className="depth-tail-overlays">
        {sides.map((side) => (
          <g key={`${side}-tail-logo-mask`} mask={`url(#${side}-logo-mask)`}>
            <g mask="url(#top-fade-mask)">
              <g mask="url(#bottom-fade-mask)">
                {TAIL_LOGOS.filter((logo) => logo.side === side).map((logo, index) => (
                  <LogoGlyph key={`tail-${logo.side}-${logo.row}-${logo.kind}-${index}`} logo={logo} />
                ))}
              </g>
            </g>
          </g>
        ))}
      </g>

      <rect className="center-occlusion" fill="url(#center-occlusion-left)" height={VIEWPORT_HEIGHT} width={CENTER_X} x="0" y="0" />
      <rect className="center-occlusion" fill="url(#center-occlusion-right)" height={VIEWPORT_HEIGHT} width={CENTER_X} x={CENTER_X} y="0" />
    </svg>
  );
}

function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      <svg className="signal-art" viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`} preserveAspectRatio="none">
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
    <svg className="roster-mark" viewBox="0 0 48 65" aria-hidden="true">
      <path d="M13 17C10 10 16 4 25 4c10 0 18 7 19 16 1 7-3 12-9 15" />
      <path d="M12 17c-3 2-4 7-2 11 2 4 7 7 12 10l21 16" />
      <path d="M8 44 5 61" />
    </svg>
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
          <span className="brand-name">Roster</span>
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
