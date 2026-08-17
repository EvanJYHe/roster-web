"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { name: "Exa Search", action: "web_search", score: "0.94", latency: "82ms", tone: "exa", mark: "✦" },
  { name: "Brave Search", action: "web_search", score: "0.79", latency: "146ms", tone: "brave", mark: "B" },
  { name: "Tavily", action: "search", score: "0.64", latency: "181ms", tone: "tavily", mark: "T" },
  { name: "Serper", action: "search", score: "0.42", latency: "224ms", tone: "serper", mark: "S" },
];

const clients = [
  { name: "Claude Code", mark: "✳" },
  { name: "Codex", mark: "⌘" },
  { name: "Cursor", mark: "↗" },
  { name: "OpenClaw", mark: "◈" },
  { name: "Any MCP client", mark: "∞" },
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

      float noise21(vec2 point) {
        vec2 cell = floor(point);
        vec2 local = fract(point);
        local = local * local * (3.0 - 2.0 * local);

        float bottom = mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x);
        float top = mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), local.x);
        return mix(bottom, top, local.y);
      }

      float cloud(vec2 point) {
        float value = 0.0;
        float weight = 0.5;

        for (int index = 0; index < 5; index++) {
          value += weight * noise21(point);
          point = point * 2.03 + vec2(7.1, 3.7);
          weight *= 0.5;
        }

        return value;
      }

      float softBlob(vec2 point, vec2 center, vec2 scale) {
        vec2 delta = (point - center) / scale;
        return exp(-dot(delta, delta) * 1.35);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float verticalFade = smoothstep(0.02, 0.18, uv.y) * smoothstep(0.98, 0.78, uv.y);
        float sideDistance = abs(uv.x - 0.5) * 2.0;
        float sideMask = pow(smoothstep(0.08, 0.72, sideDistance), 1.35);
        vec2 point = vec2((uv.x - 0.5) * 1.65, uv.y);
        vec2 drift = vec2(u_time * 0.018, -u_time * 0.012);

        float slowCloud = cloud(point * 2.3 + drift);
        float fineCloud = cloud(point * 4.8 - drift * 1.7);
        float texture = mix(slowCloud, fineCloud, 0.26);
        float leftBlob = softBlob(point, vec2(-0.64, 0.38), vec2(0.72, 0.5));
        float rightBlob = softBlob(point, vec2(0.64, 0.42), vec2(0.72, 0.52));
        float upperLeft = softBlob(point, vec2(-0.48, 0.12), vec2(0.5, 0.32));
        float upperRight = softBlob(point, vec2(0.48, 0.16), vec2(0.5, 0.34));
        float haze = (leftBlob + rightBlob) * 0.72 + (upperLeft + upperRight) * 0.44;
        float shapedTexture = smoothstep(0.34, 0.74, texture);
        float signal = haze * (0.35 + shapedTexture * 0.65) * sideMask * verticalFade;
        float balance = smoothstep(-0.5, 0.5, point.x);
        vec3 leftColor = vec3(0.09, 0.12, 0.115);
        vec3 rightColor = vec3(0.09, 0.105, 0.13);
        vec3 color = mix(leftColor, rightColor, balance);
        color = mix(color, vec3(0.17, 0.18, 0.18), shapedTexture * 0.2);
        float grain = 0.94 + 0.06 * hash21(floor(uv * 42.0) + vec2(u_time * 0.02));
        float alpha = signal * 0.3 * grain;

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
          <div className="eyebrow" aria-label="Latest update: Beta v0.1 now live">
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
              <div className="engine-row"><span className="engine-key">Intent</span><span>analyze_error · open_file</span></div>
              <div className="engine-row"><span className="engine-key">Context</span><span>project: api-gateway</span></div>
              <div className="engine-row"><span className="engine-key">Search</span><span>BM25 + vector</span></div>
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
              {[
                { name: "Filesystem", score: "0.92", active: true },
                { name: "Git", score: "0.71", active: false },
                { name: "Web Search", score: "0.46", active: false },
                { name: "Slack", score: "0.32", active: false },
              ].map((tool) => (
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

      <section className="principles-section" id="why-roster">
        <div className="section-heading">
          <span className="section-kicker">WHY ROSTER</span>
          <h2>Keep your agent focused.<br />Let Roster handle the tool surface.</h2>
        </div>

        <div className="principles-grid">
          <article className="principle-card principle-card-search">
            <div className="principle-card-top"><span>01</span><span>SEARCH WHEN NEEDED</span></div>
            <div className="principle-copy">
              <h3>Only the right tools enter context.</h3>
              <p>Roster searches your connected MCP surface when a task needs it, then returns the smallest useful set.</p>
            </div>
            <div className="mini-search-demo">
              <div className="mini-query"><span>⌕</span><span>find the latest MCP news</span></div>
              <div className="mini-result"><ToolMark tool={tools[0]} /><span>Exa Search</span><b>0.94</b></div>
              <div className="mini-result mini-result-muted"><ToolMark tool={tools[1]} /><span>Brave Search</span><b>0.79</b></div>
            </div>
          </article>

          <article className="principle-card principle-card-learning">
            <div className="principle-card-top"><span>02</span><span>LEARN WHAT WORKS</span></div>
            <div className="principle-copy">
              <h3>Every successful route leaves a local signal.</h3>
              <p>Good outcomes strengthen future matches. Nothing leaves the machine unless you choose to send it.</p>
            </div>
            <div className="mini-learning-demo">
              <div className="learning-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
              <div><strong>local outcome memory</strong><small>Exa Search · +0.08 this session</small></div>
            </div>
          </article>

          <article className="principle-card principle-card-clients">
            <div className="principle-card-top"><span>03</span><span>WORKS EVERYWHERE</span></div>
            <div className="principle-copy">
              <h3>One router. Any MCP client.</h3>
              <p>Put Roster in front of the clients and servers you already use. The interface stays the same.</p>
            </div>
            <div className="client-mark-row">
              {clients.slice(0, 4).map((client) => (
                <span className="client-mark" key={client.name} title={client.name}>{client.mark}</span>
              ))}
              <span className="client-mark client-mark-more">+</span>
            </div>
          </article>
        </div>
      </section>

      <section className="client-section">
        <div className="client-section-copy">
          <span className="section-kicker">ONE ROUTER / EVERY CLIENT</span>
          <h2>Bring your tool surface with you.</h2>
          <p>Roster sits in front of your MCP servers, finds the right capability, and keeps improving from the outcomes it sees locally.</p>
          <a className="button button-primary" href="#get-started">Get Started <Arrow diagonal /></a>
        </div>

        <div className="client-surface">
          <div className="client-surface-top"><span>ROSTER / CLIENTS</span><span><i /> 5 compatible surfaces</span></div>
          <div className="client-list">
            {clients.map((client, index) => (
              <div className={`client-list-row ${index === 0 ? "client-list-row-active" : ""}`} key={client.name}>
                <span className="client-list-mark">{client.mark}</span>
                <strong>{client.name}</strong>
                <small>{index === clients.length - 1 ? "MCP protocol" : "connected"}</small>
                <i />
              </div>
            ))}
          </div>
          <div className="client-command"><span>$</span><code>npx @roster/cli init</code><b>ready</b></div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-cta-inner">
          <span className="section-kicker">READY WHEN YOU ARE</span>
          <h2>Let your agent<br />use less to do more.</h2>
          <p>Start with one local router in front of your MCP servers.</p>
          <div className="closing-actions">
            <a className="button button-primary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Get Started <Arrow diagonal /></a>
            <a className="button button-secondary" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">View on GitHub <Arrow diagonal /></a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="brand" href="#top">
              <RosterMark />
              <span>Roster</span>
            </a>
            <p>The self-healing, self-learning<br />tool router for MCP.</p>
          </div>
          <a className="footer-cta" href="#get-started">Start routing <Arrow diagonal /></a>
        </div>

        <div className="footer-links">
          <div><span>PRODUCT</span><a href="#why-roster">Why Roster</a><a href="#get-started">Get started</a><a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Documentation</a></div>
          <div><span>COMMUNITY</span><a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">GitHub</a><a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Issues</a><a href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Contribute</a></div>
          <div><span>COMPATIBLE WITH</span><a href="#why-roster">Claude Code</a><a href="#why-roster">Codex</a><a href="#why-roster">Cursor &amp; OpenClaw</a></div>
        </div>

        <div className="footer-bottom"><span>© 2026 Roster</span><span>Local by default · open source</span><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
