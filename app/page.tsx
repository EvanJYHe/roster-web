"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { name: "Exa Search", action: "web_search", score: "0.94", latency: "82ms", tone: "exa", mark: "✦" },
  { name: "Brave Search", action: "web_search", score: "0.79", latency: "146ms", tone: "brave", mark: "B" },
  { name: "Tavily", action: "search", score: "0.64", latency: "181ms", tone: "tavily", mark: "T" },
  { name: "Serper", action: "search", score: "0.42", latency: "224ms", tone: "serper", mark: "S" },
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

function ToolMark({ tool }: { tool: (typeof tools)[number] }) {
  return (
    <span className={`provider-mark provider-mark-${tool.tone}`} aria-hidden="true">
      {tool.mark}
    </span>
  );
}

function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const targetCanvas: HTMLCanvasElement = canvas;

    const context = targetCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!context) return;
    const gl: WebGLRenderingContext = context;

    const vertexSource = `
      attribute vec2 a_position;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;

      uniform vec2 u_resolution;
      uniform float u_time;

      float hash21(vec2 point) {
        point = fract(point * vec2(123.34, 456.21));
        point += dot(point, point + 45.32);
        return fract(point.x * point.y);
      }

      float softRing(float distanceToCenter, float radius, float width) {
        return exp(-pow((distanceToCenter - radius) / width, 2.0));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float verticalFade = smoothstep(0.02, 0.16, uv.y) * smoothstep(0.98, 0.84, uv.y);
        float leftSide = 1.0 - smoothstep(0.03, 0.40, uv.x);
        float rightSide = 1.0 - smoothstep(0.03, 0.40, 1.0 - uv.x);
        float side = pow(max(leftSide, rightSide), 2.35);

        vec2 leftPoint = (uv - vec2(-0.08, 0.52)) * vec2(0.62, 1.16);
        vec2 rightPoint = (uv - vec2(1.08, 0.48)) * vec2(0.62, 1.16);
        float leftRadius = length(leftPoint);
        float rightRadius = length(rightPoint);
        float rings = 0.0;

        for (int index = 0; index < 8; index++) {
          float layer = float(index);
          float radius = 0.075 + layer * 0.085 + 0.018 * sin(u_time * 0.23 + layer * 0.7);
          float width = 0.004 + layer * 0.0005;
          rings += softRing(leftRadius, radius, width);
          rings += softRing(rightRadius, radius, width);
        }

        float leftHaze = exp(-pow(leftRadius / 0.66, 2.0));
        float rightHaze = exp(-pow(rightRadius / 0.66, 2.0));
        float grain = 0.92 + 0.08 * hash21(floor(uv * 38.0) + vec2(u_time * 0.03));
        vec3 cool = vec3(0.035, 0.12, 0.19);
        vec3 signal = vec3(0.10, 0.34, 0.30);
        vec3 color = mix(cool, signal, 0.45 + 0.18 * sin(u_time * 0.12 + uv.y * 3.0));
        float alpha = (rings * 0.052 + (leftHaze + rightHaze) * 0.014) * pow(side, 1.35) * verticalFade * grain;

        gl_FragColor = vec4(color * alpha, alpha);
      }
    `;

    function compileShader(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(targetCanvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(targetCanvas.clientHeight * pixelRatio));

      if (targetCanvas.width !== width || targetCanvas.height !== height) {
        targetCanvas.width = width;
        targetCanvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function render(time: number) {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, targetCanvas.width, targetCanvas.height);
      gl.uniform1f(timeLocation, reducedMotion ? 0 : time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion) frameId = window.requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    render(0);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="signal-field" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scanningToolIndex, setScanningToolIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setScanningToolIndex((index) => (index + 1) % tools.length);
    }, 950);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function updateNavState() {
      setIsScrolled(window.scrollY > 24);
    }

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });

    return () => window.removeEventListener("scroll", updateNavState);
  }, []);

  async function copyInstallCommand() {
    await navigator.clipboard?.writeText("npx @roster/cli init");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="site-shell">
      <SignalField />
      <div className="grain" aria-hidden="true" />

      <header className={`site-nav ${isScrolled ? "site-nav-scrolled" : ""}`}>
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
          <h1>
            The self-learning
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
        </div>

        <section className="routing-showcase" aria-label="Live Roster tool routing showcase">
          <span className="border-light" aria-hidden="true" />
          <div className="route-showcase-topline">
            <span className="route-showcase-label"><i className="live-dot" /> ROSTER / ROUTING</span>
            <span className="route-showcase-state">LOCAL-FIRST <i /> ACTIVE</span>
          </div>

          <div className="route-flow">
            <article className="route-card route-request-card">
              <div className="route-card-kicker"><span>01</span> REQUEST</div>
              <div className="route-client-pill">ANY MCP CLIENT <i /></div>
              <div className="route-query-card">
                <span className="route-query-mark" aria-hidden="true">⌕</span>
                <p>Find the latest news about MCP servers.</p>
              </div>
              <div className="route-data-row"><span>intent</span><strong>web_search</strong></div>
            </article>

            <div className="route-bridge" aria-hidden="true"><span /></div>

            <article className="route-card route-match-card">
              <div className="route-card-kicker"><span>02</span> MATCH</div>
              <div className="route-match-heading">
                <strong>Search the tool surface</strong>
                <span>BM25 + vector</span>
              </div>
              <div className="route-tool-list">
                {tools.map((tool, index) => (
                  <div className={`route-tool ${index === scanningToolIndex ? "route-tool-scanning" : ""} ${index === 0 ? "route-tool-selected" : ""}`} key={tool.name}>
                    <ToolMark tool={tool} />
                    <div className="route-tool-name"><strong>{tool.name}</strong><small>{tool.action}</small></div>
                    <div className="route-tool-score"><span><i style={{ width: `${Number(tool.score) * 100}%` }} /></span><b>{tool.score}</b></div>
                  </div>
                ))}
              </div>
              <div className="route-match-foot"><i /> ranked from 4 available tools</div>
            </article>

            <div className="route-bridge" aria-hidden="true"><span /></div>

            <article className="route-card route-result-card-wrap">
              <div className="route-card-kicker"><span>03</span> RESULT</div>
              <div className="route-result-heading">Best match selected</div>
              <div className="route-selected-tool">
                <ToolMark tool={tools[0]} />
                <div><strong>{tools[0].name}</strong><small>{tools[0].action} · {tools[0].latency}</small></div>
                <b>{tools[0].score}</b>
              </div>
              <div className="route-result-status"><span><i /> 200 OK</span><small>result returned</small></div>
              <div className="route-learning"><span className="route-learning-bars" aria-hidden="true"><i /><i /><i /></span><div><strong>Local outcome memory</strong><small>next route learns from the result</small></div></div>
            </article>
          </div>
        </section>
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
