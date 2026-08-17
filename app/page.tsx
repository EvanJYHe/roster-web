"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { name: "Exa Search", action: "web_search", score: "0.94", latency: "82ms", tone: "exa", icon: "https://exa.ai/images/favicon-32x32.png" },
  { name: "Brave Search", action: "web_search", score: "0.79", latency: "146ms", tone: "brave", icon: "https://brave.com/favicon.ico" },
  { name: "Tavily", action: "search", score: "0.64", latency: "181ms", tone: "tavily", icon: "https://tavily.com/favicon.ico" },
  { name: "Serper", action: "search", score: "0.42", latency: "224ms", tone: "serper", icon: "https://res.cloudinary.com/apideck/image/upload/v1679535605/icons/serper-dev.png" },
];

const clients = [
  { name: "Claude Code", icon: "https://cdn.simpleicons.org/claude/ffffff" },
  { name: "Codex", icon: "https://api.iconify.design/logos/openai-icon.svg?color=%23ffffff" },
  { name: "Cursor", icon: "https://cdn.simpleicons.org/cursor/ffffff" },
  { name: "OpenClaw", icon: "https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/pixel-lobster.svg" },
];

type Tool = (typeof tools)[number];
type Client = (typeof clients)[number];

function RosterMark() {
  return (
    <span className="grid size-[18px] grid-cols-3 gap-[3px]" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} className="block size-1 rounded-full bg-current" />
      ))}
    </span>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span className={`inline-block leading-none ${diagonal ? "translate-y-[-1px]" : ""}`} aria-hidden="true">
      ↗
    </span>
  );
}

function ToolMark({ tool, large = false }: { tool: Tool; large?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-white/[0.045] ${large ? "size-10 rounded-[11px]" : "size-8 rounded-[9px]"}`}
      aria-hidden="true"
    >
      <img className={`${large ? "size-5" : "size-4"} object-contain`} src={tool.icon} alt="" />
    </span>
  );
}

function ClientMark({ client }: { client: Client }) {
  return (
    <span className="inline-flex size-7 items-center justify-center opacity-70 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true">
      <img className="size-5 object-contain" src={client.icon} alt="" />
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
    <div
      className="pointer-events-none absolute inset-x-0 top-[68px] z-0 h-[840px] overflow-hidden opacity-80 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_17%,#000_78%,transparent_100%)]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="signal-ribbon signal-ribbon-left" />
      <div className="signal-ribbon signal-ribbon-right" />
    </div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    <main id="top" className="relative isolate min-h-screen overflow-hidden bg-[#050505] font-mono text-paper selection:bg-white selection:text-black">
      <SignalField />
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.07] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      <header
        className={`fixed inset-x-0 top-0 z-30 flex h-[68px] items-center justify-between border-b px-6 font-sans antialiased transition-all duration-300 sm:px-8 lg:px-[2.2vw] ${
          isScrolled
            ? "border-white/10 bg-[#070707]/85 shadow-[0_10px_30px_rgba(0,0,0,.22)] backdrop-blur-[14px]"
            : "border-transparent bg-transparent"
        }`}
      >
        <a className="inline-flex items-center gap-[11px] text-[18px] font-normal tracking-[-0.045em]" href="#top" aria-label="Roster home">
          <RosterMark />
          <span>Roster</span>
        </a>

        <nav className="hidden items-center gap-[clamp(18px,2.4vw,32px)] text-[14px] font-normal tracking-[-0.035em] md:flex" aria-label="Primary navigation">
          <a className="text-white/56 transition-colors duration-200 hover:text-paper" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            Docs
          </a>
          <a className="text-white/56 transition-colors duration-200 hover:text-paper" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="border border-white/14 px-[15px] py-[11px] transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.08]" href="#get-started">
            Get Started <Arrow diagonal />
          </a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[1132px] max-w-[1840px] flex-col px-6 pb-10 pt-[144px] sm:px-[5vw]">
        <div className="mx-auto flex w-full max-w-[1260px] flex-col items-center text-center">
          <div className="inline-flex items-stretch border border-white/20 bg-black/20 text-[clamp(0.95rem,1.15vw,1.25rem)] leading-none tracking-[-0.045em]">
            <span className="flex items-center bg-white/[0.075] px-5 py-3">Latest update</span>
            <span className="flex items-center px-5 py-3 text-white/80">
              Beta v0.1 Now Live <span className="pl-2 text-[1.2em]">↗</span>
            </span>
          </div>

          <h1 className="mt-14 max-w-[1260px] text-[clamp(3.6rem,6.4vw,6.6rem)] font-normal leading-[0.88] tracking-[-0.085em] text-paper">
            The self-learning
            <br />
            tool router for MCP.
          </h1>

          <p className="mt-9 text-[clamp(1rem,1.25vw,1.35rem)] leading-[1.55] tracking-[-0.045em] text-white/55">
            Roster finds the right tools when needed, learns from what works,
            <br className="hidden sm:block" />
            and works with any MCP client.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4" id="get-started">
            <a
              className="inline-flex h-20 items-center justify-center bg-paper px-10 text-[clamp(1.05rem,1.35vw,1.4rem)] tracking-[-0.05em] text-black transition-transform duration-200 hover:-translate-y-0.5"
              href="https://github.com/ManagementMO/roster"
              target="_blank"
              rel="noreferrer"
            >
              Get Started <span className="pl-2"><Arrow diagonal /></span>
            </a>
            <a
              className="inline-flex h-20 items-center justify-center border border-white/16 px-10 text-[clamp(1.05rem,1.35vw,1.4rem)] tracking-[-0.05em] text-white/80 transition-colors duration-200 hover:border-white/32 hover:text-paper"
              href="https://github.com/ManagementMO/roster"
              target="_blank"
              rel="noreferrer"
            >
              View Docs <span className="pl-3 text-[1.2em]">▱</span>
            </a>
          </div>

          <button
            className="mt-10 flex h-[60px] w-full max-w-[560px] items-center justify-between border border-white/22 bg-black/20 px-6 text-left text-[clamp(1rem,1.2vw,1.25rem)] tracking-[-0.04em] text-white/90 transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.03]"
            type="button"
            onClick={copyInstallCommand}
            aria-label="Copy the Roster install command"
          >
            <span>$ npx @roster/cli init</span>
            <span className="text-[1.1em] text-white/80" aria-hidden="true">{copied ? "✓" : "▣"}</span>
            <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
          </button>
        </div>

        <section className="mx-auto mt-20 w-full max-w-[1260px] overflow-hidden border border-white/16 bg-black/45" aria-label="Roster routes a request to the best available tool">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.06em] text-white/45 sm:px-8">
            <span>Roster / routing</span>
            <span className="inline-flex items-center gap-2"><i className="size-1.5 rounded-full bg-[#a6d7a3]" /> local-first</span>
          </div>

          <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-3">
            <article className="flex min-w-0 flex-col p-7 sm:p-8">
              <div className="text-[11px] uppercase tracking-[0.06em] text-white/42">MCP client request</div>
              <div className="mt-10 border border-white/12 bg-white/[0.025] p-6 sm:min-h-[154px]">
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex size-8 rotate-[-10deg] items-center justify-center border border-white/25 text-sm text-white/70" aria-hidden="true">⌕</span>
                  <p className="m-0 text-[clamp(1.05rem,1.45vw,1.45rem)] leading-[1.25] tracking-[-0.05em] text-white/90">Find the latest news<br />about MCP servers.</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/38"><span>client</span><span>any MCP client</span></div>
            </article>

            <article className="flex min-w-0 flex-col border-t border-white/10 bg-white/[0.018] p-7 md:border-l md:border-t-0 sm:p-8">
              <div className="text-[11px] uppercase tracking-[0.06em] text-white/42">Roster match</div>
              <div className="mt-9 flex items-end justify-between gap-4">
                <strong className="text-[clamp(1.05rem,1.4vw,1.35rem)] font-normal tracking-[-0.05em] text-white/85">Search the tool surface</strong>
                <span className="shrink-0 text-[10px] text-white/35">BM25 + vector</span>
              </div>
              <div className="mt-5">
                {tools.map((tool, index) => (
                  <div className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(90px,.85fr)] items-center gap-3 border-t border-white/10 py-3 ${index === 0 ? "border-l-2 border-l-[#a6d7a3] bg-white/[0.065] pl-3" : "pl-3"}`} key={tool.name}>
                    <ToolMark tool={tool} />
                    <span className="min-w-0"><strong className="block truncate text-[14px] font-normal tracking-[-0.04em] text-white/85">{tool.name}</strong><small className="block text-[11px] text-white/35">{tool.action}</small></span>
                    <span className="flex min-w-0 items-center gap-2"><i className="h-px flex-1 bg-white/10"><i className="block h-px bg-white/75" style={{ width: `${Number(tool.score) * 100}%` }} /></i><b className="text-[11px] font-normal text-white/55">{tool.score}</b></span>
                  </div>
                ))}
              </div>
            </article>

            <article className="flex min-w-0 flex-col border-t border-white/10 p-7 md:border-l md:border-t-0 sm:p-8">
              <div className="text-[11px] uppercase tracking-[0.06em] text-white/42">Selected tool</div>
              <div className="mt-9 text-[clamp(1.05rem,1.4vw,1.35rem)] tracking-[-0.05em] text-white/70">Best match selected</div>
              <div className="mt-5 flex items-center gap-3 border border-white/20 bg-white/[0.025] p-4">
                <ToolMark tool={tools[0]} large />
                <span className="min-w-0"><strong className="block text-[15px] font-normal text-white/90">{tools[0].name}</strong><small className="block text-[11px] text-white/35">{tools[0].action} · {tools[0].latency}</small></span>
                <b className="ml-auto text-[12px] font-normal text-[#a6d7a3]">{tools[0].score}</b>
              </div>
              <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-5 text-[11px] text-[#a6d7a3]"><i className="size-1.5 rounded-full bg-current" /> ready for the client to run</div>
            </article>
          </div>
        </section>
      </section>

      <section className="mx-auto max-w-[1260px] px-6 py-40 sm:px-[5vw] lg:py-52" id="how-it-works">
        <article className="grid items-center gap-14 border-y border-white/12 py-12 lg:grid-cols-[1.12fr_.88fr] lg:gap-[9vw] lg:py-20">
          <div className="relative min-h-[320px] overflow-hidden border border-white/12 bg-white/[0.02] p-7 sm:p-9" aria-hidden="true">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-white/35"><span>Tool search / on demand</span><span>local</span></div>
            <div className="mt-12 flex items-center gap-4 text-[11px] text-white/38"><span className="text-[#a6d7a3]">query</span><span className="h-px flex-1 bg-white/12" /><span>intent detected</span></div>
            <div className="mt-5 border border-white/12 bg-black/30 p-5 text-[clamp(1rem,1.5vw,1.4rem)] tracking-[-0.05em] text-white/82">latest news about MCP servers</div>
            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5"><ToolMark tool={tools[0]} large /><span className="min-w-0"><strong className="block text-[15px] font-normal text-white/88">Exa Search</strong><small className="block text-[11px] text-white/35">matched on intent</small></span><b className="ml-auto text-[12px] font-normal text-[#a6d7a3]">{tools[0].score}</b></div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/40">Search when needed</span>
            <h2 className="mt-6 max-w-[560px] text-[clamp(2.1rem,4vw,4rem)] font-normal leading-[.95] tracking-[-0.075em] text-white/92">Keep the full tool surface out of context.</h2>
            <p className="mt-7 max-w-[450px] text-[clamp(1rem,1.25vw,1.25rem)] leading-[1.55] tracking-[-0.045em] text-white/50">Roster searches the tools you already have only when the request needs them, then gives the client the smallest useful match.</p>
          </div>
        </article>

        <article className="grid items-center gap-14 border-b border-white/12 py-12 lg:grid-cols-[.88fr_1.12fr] lg:gap-[9vw] lg:py-20" id="why-roster">
          <div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/40">Learn what works</span>
            <h2 className="mt-6 max-w-[560px] text-[clamp(2.1rem,4vw,4rem)] font-normal leading-[.95] tracking-[-0.075em] text-white/92">Good routes get easier to find.</h2>
            <p className="mt-7 max-w-[450px] text-[clamp(1rem,1.25vw,1.25rem)] leading-[1.55] tracking-[-0.045em] text-white/50">Successful tool outcomes become local signals. The next similar request can start with what worked last time, without sending your history anywhere.</p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-white/12 bg-white/[0.02] p-7 sm:p-9" aria-hidden="true">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-white/35"><span>Outcome memory</span><span>on device</span></div>
            <div className="mt-14 flex items-center gap-6">
              <div className="flex items-center gap-3"><ToolMark tool={tools[0]} large /><span><strong className="block text-[15px] font-normal text-white/85">Exa Search</strong><small className="block text-[11px] text-white/35">route selected</small></span></div>
              <span className="h-px flex-1 bg-white/15"><i className="ml-[62%] block size-1.5 translate-y-[-3px] rounded-full bg-[#a6d7a3] shadow-[0_0_18px_rgba(166,215,163,.8)]" /></span>
              <div className="text-right"><strong className="block text-[clamp(1.7rem,3vw,2.8rem)] font-normal tracking-[-0.08em] text-[#a6d7a3]">+0.08</strong><small className="block text-[11px] text-white/35">successful outcome</small></div>
            </div>
            <div className="mt-16 border-t border-white/10 pt-5 text-[11px] text-white/40">next matching request uses the signal <span className="text-white/70">↗</span></div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1260px] border-y border-white/12 px-6 py-28 sm:px-[5vw] lg:flex lg:items-end lg:justify-between lg:gap-20 lg:py-36" id="compatibility">
        <div className="max-w-[600px]">
          <span className="text-[11px] uppercase tracking-[0.1em] text-white/40">Works everywhere</span>
          <h2 className="mt-6 text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[.9] tracking-[-0.08em] text-white/92">One router.<br />Any MCP client.</h2>
          <p className="mt-7 max-w-[500px] text-[clamp(1rem,1.25vw,1.25rem)] leading-[1.55] tracking-[-0.045em] text-white/50">Roster speaks MCP at the edge, so the clients you already use can share one local route.</p>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-white/10 pt-7 text-white/65 sm:grid-cols-4 lg:mt-0 lg:min-w-[500px] lg:border-t-0 lg:pt-0">
          {clients.map((client) => (
            <a className="group inline-flex items-center gap-2 text-[13px] tracking-[-0.04em] transition-colors hover:text-paper" key={client.name} href="#get-started">
              <ClientMark client={client} />
              <span>{client.name}</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-[1260px] px-6 pb-10 pt-36 sm:px-[5vw] lg:pt-52">
        <div className="flex flex-col gap-14 border-b border-white/12 pb-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a className="inline-flex items-center gap-[11px] text-[22px] tracking-[-0.06em]" href="#top"><RosterMark /><span>Roster</span></a>
            <p className="mt-8 max-w-[420px] text-[clamp(1.4rem,2.4vw,2.35rem)] leading-[1.05] tracking-[-0.07em] text-white/80">The self-healing,<br />self-learning tool router<br />for MCP.</p>
          </div>
          <a className="inline-flex w-fit items-center border border-white/16 px-7 py-5 text-[15px] tracking-[-0.04em] text-white/80 transition-colors hover:border-white/35 hover:text-paper" href="#get-started">Start routing <span className="pl-3"><Arrow diagonal /></span></a>
        </div>

        <div className="grid gap-12 border-b border-white/12 py-16 text-[13px] tracking-[-0.035em] sm:grid-cols-3">
          <div className="flex flex-col gap-4"><span className="text-[10px] uppercase tracking-[0.1em] text-white/35">Product</span><a className="text-white/55 transition-colors hover:text-paper" href="#why-roster">Why Roster</a><a className="text-white/55 transition-colors hover:text-paper" href="#get-started">Get started</a><a className="text-white/55 transition-colors hover:text-paper" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Documentation</a></div>
          <div className="flex flex-col gap-4"><span className="text-[10px] uppercase tracking-[0.1em] text-white/35">Community</span><a className="text-white/55 transition-colors hover:text-paper" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">GitHub</a><a className="text-white/55 transition-colors hover:text-paper" href="https://github.com/ManagementMO/roster/issues" target="_blank" rel="noreferrer">Issues</a><a className="text-white/55 transition-colors hover:text-paper" href="https://github.com/ManagementMO/roster" target="_blank" rel="noreferrer">Contribute</a></div>
          <div className="flex flex-col gap-4"><span className="text-[10px] uppercase tracking-[0.1em] text-white/35">Compatible with</span><a className="text-white/55 transition-colors hover:text-paper" href="#compatibility">Claude Code</a><a className="text-white/55 transition-colors hover:text-paper" href="#compatibility">Codex</a><a className="text-white/55 transition-colors hover:text-paper" href="#compatibility">Cursor &amp; OpenClaw</a></div>
        </div>

        <div className="flex flex-col gap-4 py-7 text-[11px] tracking-[-0.02em] text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Roster</span><span>Local by default · open source</span><a className="transition-colors hover:text-paper" href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
