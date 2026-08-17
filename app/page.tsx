"use client";

import { useEffect, useRef, useState } from "react";

const tools = [
  { name: "Exa Search", action: "web_search", score: "0.94", latency: "82ms", tone: "exa", icon: "https://exa.ai/images/favicon-32x32.png" },
  { name: "Brave Search", action: "web_search", score: "0.79", latency: "146ms", tone: "brave", icon: "https://brave.com/favicon.ico" },
  { name: "Tavily", action: "search", score: "0.64", latency: "181ms", tone: "tavily", icon: "https://tavily.com/favicon.ico" },
  { name: "Serper", action: "search", score: "0.42", latency: "224ms", tone: "serper", icon: "https://res.cloudinary.com/apideck/image/upload/v1679535605/icons/serper-dev.png" },
];

const routedTools = [
  { name: "Filesystem", score: "0.92", active: true },
  { name: "Git", score: "0.71", active: false },
  { name: "Web Search", score: "0.46", active: false },
  { name: "Slack", score: "0.32", active: false },
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
    <div
      className="signal-field pointer-events-none absolute inset-x-0 top-[68px] z-0 h-[760px] overflow-hidden opacity-80"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
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
    <main id="top" className="relative isolate min-h-screen overflow-hidden bg-[#030404] font-mono text-paper selection:bg-white selection:text-black">
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
        className="relative z-30 flex h-[68px] items-center justify-between border-b border-white/10 px-[clamp(20px,3.2vw,56px)] font-sans antialiased"
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

      <section className="relative z-10 mx-auto flex min-h-[850px] max-w-[1840px] flex-col px-[clamp(24px,5vw,72px)] pb-[42px] pt-[76px]">
        <div className="mx-auto flex w-full max-w-[1040px] flex-col items-center text-center">
          <div className="inline-flex items-stretch border border-white/24 bg-black/[0.48] p-1 text-[clamp(11px,1vw,14px)] leading-none tracking-[-0.035em] text-white/77">
            <span className="flex min-h-[31px] items-center bg-white/[0.07] px-[17px] text-white/93">Latest update</span>
            <span className="flex min-h-[31px] items-center px-[17px] text-white/78">
              Beta v0.1 Now Live <span className="pl-2 text-[1.2em]">↗</span>
            </span>
          </div>

          <h1 className="mb-6 mt-7 w-full max-w-[840px] text-[clamp(46px,4.5vw,72px)] font-normal leading-[0.96] tracking-[-0.105em] text-paper">
            The self-healing
            <br />
            tool router for MCP.
          </h1>

          <p className="m-0 text-[clamp(12px,1.05vw,14px)] leading-[1.65] text-white/56">
            Roster finds the right tools when needed, learns from what works,
            <br className="hidden sm:block" />
            and works with any MCP client.
          </p>

          <div className="mt-[27px] flex flex-wrap items-center justify-center gap-3" id="get-started">
            <a
              className="inline-flex min-h-[44px] items-center justify-center bg-paper px-[30px] text-[14px] text-black transition-transform duration-200 hover:-translate-y-0.5"
              href="https://github.com/ManagementMO/roster"
              target="_blank"
              rel="noreferrer"
            >
              Get Started <span className="pl-2"><Arrow diagonal /></span>
            </a>
            <a
              className="inline-flex min-h-[44px] items-center justify-center border border-white/14 px-6 text-[14px] text-white/82 transition-colors duration-200 hover:border-white/32 hover:text-paper"
              href="https://github.com/ManagementMO/roster"
              target="_blank"
              rel="noreferrer"
            >
              View Docs <span className="pl-3 text-[1.2em]">▱</span>
            </a>
          </div>

          <button
            className="mt-[25px] flex h-[46px] w-full max-w-[320px] items-center justify-between border border-white/27 bg-black/[0.28] px-[15px] text-left text-[13px] text-white/90 transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.03]"
            type="button"
            onClick={copyInstallCommand}
            aria-label="Copy the Roster install command"
          >
            <span>$ npx @roster/cli init</span>
            <span className="text-[1.1em] text-white/80" aria-hidden="true">{copied ? "✓" : "▣"}</span>
            <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
          </button>
          <p className="m-0 mt-2 text-[9px] text-white/31">CLI preview · local by default</p>
        </div>

        <section className="mx-auto mt-12 grid w-full max-w-[1140px] gap-0 border border-white/17 bg-black/[0.43] p-[18px_21px_20px] text-left backdrop-blur-[5px] md:grid-cols-[1.05fr_20px_1.35fr_20px_1.02fr]" aria-label="How Roster routes tools">
          <div className="min-w-0">
            <div className="mb-[14px] text-[9px] tracking-[0.02em] text-white/50"><span className="mr-[11px] text-white/90">1</span>MCP CLIENT REQUEST</div>
            <div className="flex min-h-[180px] flex-col justify-between border border-white/10 bg-black/[0.38] p-[20px_18px_14px]">
              <p className="m-0 text-[clamp(13px,1.15vw,15px)] leading-[1.5] text-white/90">Summarize the latest errors<br />and open the related files.</p>
              <div className="flex justify-between border-t border-white/10 pt-[11px] text-[9px] text-white/36"><span>client</span><span>any MCP client</span></div>
            </div>
          </div>

          <div className="hidden items-center justify-center pt-[23px] text-[19px] text-white/35 md:flex" aria-hidden="true">→</div>

          <div className="min-w-0">
            <div className="mb-[14px] text-[9px] tracking-[0.02em] text-white/50"><span className="mr-[11px] text-white/90">2</span>ROSTER MATCH ENGINE</div>
            <div className="min-h-[180px] border border-white/10 bg-black/[0.38] p-[16px_17px]">
              {[
                ["Intent", "analyze_error · open_file"],
                ["Context", "project: api-gateway"],
                ["Search", "BM25 + vector"],
              ].map(([label, value]) => (
                <div className="mb-[11px] flex items-baseline justify-between gap-2 whitespace-nowrap text-[9px] text-white/72" key={label}>
                  <span className="text-white/35">{label}</span><span>{value}</span>
                </div>
              ))}
              <div className="mt-[14px] border-t border-white/10 pt-[11px] text-[9px] text-white/35">
                <span className="mb-[9px] block">Tool scoring</span>
                {["92%", "71%", "46%", "32%"].map((width) => <div className="my-[7px] flex items-center gap-[9px]" key={width}><i className="h-1 bg-white/78" style={{ width }} /><b className="font-normal text-white/63">{Number.parseInt(width, 10) / 100}</b></div>)}
              </div>
            </div>
          </div>

          <div className="hidden items-center justify-center pt-[23px] text-[19px] text-white/35 md:flex" aria-hidden="true">→</div>

          <div className="min-w-0">
            <div className="mb-[14px] text-[9px] tracking-[0.02em] text-white/50"><span className="mr-[11px] text-white/90">3</span>MATCHED TOOLS</div>
            <div className="min-h-[180px] border border-white/10 bg-black/[0.38] p-[10px_10px_9px]">
              {routedTools.map((tool) => (
                <div className={`flex min-h-[34px] items-center gap-[9px] px-[9px] text-[11px] ${tool.active ? "border border-white/66 text-white/93" : "text-white/59"}`} key={tool.name}>
                  <span className={`size-1.5 rounded-full ${tool.active ? "bg-white/92" : "bg-white/24"}`} />
                  <span>{tool.name}</span>
                  <span className="ml-auto text-white/67">{tool.score}</span>
                </div>
              ))}
            </div>
            <p className="m-[9px_0_0] text-right text-[9px] text-white/30">Best match selected</p>
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[1140px] justify-between px-0.5 pt-[13px] text-[9px] text-white/29">
          <span>ROSTER / MATCH / 0001</span>
          <span><i className="mr-1 inline-block size-[5px] rounded-full bg-[#a4d69c]" /> Learning locally from tool outcomes</span>
        </div>
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
