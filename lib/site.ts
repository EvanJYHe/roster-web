/* Placeholder wiring for the demo deploy: GitHub points at my profile and the
other nav/footer destinations are inert until the real URLs exist. Research
citations on the feature section are real and link out. */
export const GITHUB_URL = "https://github.com/EvanJYHe";
export const PLACEHOLDER = "#";

export const LLM_PROMPT = `You are helping me set up Roster, an open-source, local-first tool router for AI agents (MCP). Roster fronts local stdio MCP servers behind one endpoint: "roster sync" replaces N client config entries with one, draft(need) returns the best tools for the task, call(tool, args) proxies the invocation, and outcomes are learned locally. Help me install it, sync my MCP clients (Claude Code, Cursor, Codex, OpenClaw), and verify the setup. "roster eject" must restore my original configs exactly as found.`;
