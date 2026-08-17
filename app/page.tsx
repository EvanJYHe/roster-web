"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { name: "Filesystem", action: "open_file", score: "0.92", latency: "18ms" },
  { name: "Git", action: "show_commit", score: "0.71", latency: "42ms" },
  { name: "Web Search", action: "search", score: "0.46", latency: "160ms" },
  { name: "Slack", action: "search_messages", score: "0.32", latency: "210ms" },
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
  const [scanningToolIndex, setScanningToolIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setScanningToolIndex((index) => (index + 1) % tools.length);
    }, 950);

    return () => window.clearInterval(interval);
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
          <p className="command-note">CLI preview · local by default</p>
        </div>

        <section className="routing-showcase" aria-label="Live Roster tool routing showcase">
          <span className="border-light" aria-hidden="true" />
          <div className="showcase-header">
            <span className="showcase-title"><i className="live-dot" /> ROSTER / LIVE ROUTING</span>
            <span className="showcase-session">LOCAL-FIRST MCP ROUTER <i /> ACTIVE</span>
          </div>

          <div className="showcase-grid">
            <aside className="showcase-panel search-panel">
              <div className="showcase-panel-label"><span>01</span> ROSTER_SEARCH_TOOLS</div>
              <div className="tool-search-field">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <span>summarize errors and open files</span>
                <small>4 found</small>
              </div>

              <div className="search-results">
                {tools.map((tool, index) => (
                  <div className={`search-result ${index === scanningToolIndex ? "search-result-scanning" : ""} ${index === 0 ? "search-result-best" : ""}`} key={tool.name}>
                    <span className="result-glyph" aria-hidden="true"><i /></span>
                    <span className="search-result-copy">
                      <strong>{tool.name.toUpperCase().replace(" ", "_")}_{tool.action.toUpperCase()}</strong>
                      <small>{tool.action} · {tool.latency} response</small>
                    </span>
                    <em>{index === 0 ? "BEST" : "MATCH"}</em>
                  </div>
                ))}
              </div>

              <div className="side-plan">
                <div className="side-section-label">ROUTING PLAN</div>
                <div className="plan-step"><span>01</span><strong>Read request intent</strong></div>
                <div className="plan-step"><span>02</span><strong>Search the tool surface</strong></div>
                <div className="plan-step"><span>03</span><strong>Return the best match</strong></div>
              </div>
            </aside>

            <div className="showcase-link" aria-hidden="true"><span /></div>

            <main className="showcase-panel router-panel">
              <div className="router-surface">
                <div className="router-surface-header">
                  <div className="router-identity">
                    <div className="router-core" aria-hidden="true"><span /></div>
                    <div><strong>Roster Router</strong><small>self-learning MCP layer</small></div>
                  </div>
                  <span className="router-client"><i /> any MCP client</span>
                </div>

                <div className="router-request-bubble">
                  <span>CLIENT REQUEST</span>
                  <p>Summarize the latest errors and open the related files.</p>
                </div>

                <div className="router-flow" aria-hidden="true">
                  <div className="flow-node flow-node-active"><i /> intent</div>
                  <span />
                  <div className="flow-node"><i /> search</div>
                  <span />
                  <div className="flow-node"><i /> outcome</div>
                </div>

                <div className="router-query-header">
                  <span>ROSTER MATCH ENGINE</span>
                  <em><i /> SCANNING TOOL SURFACE</em>
                </div>

                <div className="router-facts">
                  <div><span>Intent</span><strong>analyze_error · open_file</strong></div>
                  <div><span>Context</span><strong>project: api-gateway</strong></div>
                  <div><span>Search</span><strong>BM25 + vector</strong></div>
                  <div><span>Memory</span><strong>184 local outcomes</strong></div>
                </div>

                <div className="rank-list">
                  <div className="rank-list-header"><span>TOOL SCORING</span><span>CONFIDENCE</span></div>
                  {tools.map((tool, index) => (
                    <div className={`rank-row ${index === scanningToolIndex ? "rank-row-scanning" : ""} ${index === 0 ? "rank-row-selected" : ""}`} key={tool.name}>
                      <span className="rank-index">0{index + 1}</span>
                      <span className="rank-name">{tool.name}<small>{tool.action}</small></span>
                      <span className="rank-bar"><i style={{ width: `${Number(tool.score) * 100}%` }} /></span>
                      <b>{tool.score}</b>
                    </div>
                  ))}
                </div>

                <div className="router-composer"><span>Ask Roster to find the right tool...</span><small>BM25 + vector</small><b>↑</b></div>
              </div>
            </main>

            <div className="showcase-link" aria-hidden="true"><span /></div>

            <aside className="showcase-panel outcome-panel">
              <div className="showcase-panel-label"><span>03</span> ROSTER_OUTCOME_MEMORY</div>
              <div className="memory-summary">
                <strong>184</strong>
                <span>local outcome signals</span>
                <em>+12 this session</em>
              </div>

              <div className="memory-list">
                <div><span className="memory-tool"><i /> Filesystem</span><b>+0.08</b></div>
                <div><span className="memory-tool"><i /> Git</span><b>+0.03</b></div>
                <div><span className="memory-tool"><i /> Web Search</span><b>-0.01</b></div>
              </div>

              <div className="execution-block">
                <div className="side-section-label">ROUTE_EXECUTION <span>SESSION / 0001</span></div>
                <div className="execution-tool"><span className="tool-glyph" aria-hidden="true"><i /></span><strong>Filesystem<br /><small>open_file</small></strong><b>18ms</b></div>
                <div className="execution-result"><i /> 200 OK · result returned</div>
              </div>

              <div className="learning-signal">
                <div className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                <div><strong>Learning locally from tool outcomes</strong><small>next route improves automatically</small></div>
              </div>
            </aside>
          </div>

          <div className="showcase-caption">
            <span>ONE ROUTER IN FRONT OF EVERY MCP SERVER</span>
            <span><i className="status-dot" /> SELF-HEALING · SELF-LEARNING</span>
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
