"use client";

import { useEffect, useRef, useState } from "react";

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

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float leftSide = 1.0 - smoothstep(0.02, 0.46, uv.x);
        float rightSide = 1.0 - smoothstep(0.02, 0.46, 1.0 - uv.x);
        float side = max(leftSide, rightSide);
        float edgeDistance = min(uv.x, 1.0 - uv.x);
        float ribbons = 0.0;
        float colorShift = 0.0;

        for (int index = 0; index < 9; index++) {
          float layer = float(index);
          float center = 0.08
            + layer * 0.105
            + 0.065 * sin(edgeDistance * 5.0 + layer * 1.2 + u_time * 0.12)
            + 0.025 * sin(edgeDistance * 16.0 - layer * 1.4 - u_time * 0.18);
          float width = 0.015 + layer * 0.0018;
          float ribbon = exp(-pow((uv.y - center) / width, 2.0));
          float cell = hash21(floor(vec2(edgeDistance * 28.0, uv.y * 20.0)) + vec2(layer));
          float segments = smoothstep(0.22, 0.78, cell + 0.24 * sin(edgeDistance * 48.0 - u_time * 0.4 + layer));
          float texture = 0.62 + 0.38 * hash21(floor(vec2(edgeDistance * 46.0, uv.y * 32.0)) + vec2(layer * 2.0));

          ribbons += ribbon * (0.18 + 0.82 * segments) * texture;
          colorShift += ribbon * layer;
        }

        float edgeMask = pow(side, 1.12);
        float scan = 0.92 + 0.08 * sin(uv.y * u_resolution.y * 0.14 + u_time * 1.3);
        vec3 cool = vec3(0.08, 0.18, 0.40);
        vec3 signal = vec3(0.12, 0.52, 0.38);
        vec3 color = mix(cool, signal, 0.5 + 0.5 * sin(colorShift * 0.3 + u_time * 0.08));
        float glow = ribbons * edgeMask * 0.20;
        float haze = edgeMask * 0.032 * (0.5 + 0.5 * sin(uv.y * 8.0 + u_time * 0.15));
        float alpha = (glow + haze) * scan;

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
