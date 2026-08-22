import type { CSSProperties } from "react";

import {
  ART_HEIGHT,
  ART_WIDTH,
  ALL_LOGOS,
  BOUNDARIES,
  CENTER_X,
  FLOW_DURATION_S,
  FLOW_EXIT_DEPTH,
  LOGO_ICON_ASPECTS,
  LOGO_ICON_SIZE,
  LOGO_INK_SCALE,
  LOGO_OPTICAL_SCALES,
  MULTI_TONE_LOGOS,
  RIGHT_EDGE,
  ROW_LOGO_OPACITY,
  SECTION_DEPTHS,
  boundaryPath,
  depthScale,
  hash01,
  lanePoint,
  logoGeometry,
  partialBoundaryPoint,
  rowShear,
  type LogoGeometry,
  type LogoSpec,
  type Side,
} from "@/lib/corridor";

export function LogoGlyph({ logo: sourceLogo }: { logo: LogoSpec }) {
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
  } as CSSProperties;

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

export function PerspectiveMarquee() {
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

export function SignalField() {
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
