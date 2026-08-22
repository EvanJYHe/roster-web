import { BAR_CELLS, TermBar, TermCursorLine, TermPrompt } from "./Terminal";

export const LEARN_ROWS = [
  { tool: "github.open_pull_request", ok: "98%", was: "0.71", now: "0.96", pct: 96, from: 71, kind: "up" },
  { tool: "slack.post_message", ok: "97%", was: "0.80", now: "0.94", pct: 94, from: 80, kind: "up" },
  { tool: "git.push", ok: "99%", was: "0.90", now: "0.92", pct: 92, from: 90, kind: "up" },
  { tool: "jira.create_ticket", ok: "41%", was: "0.83", now: "bench", pct: 24, from: 83, kind: "down" },
] as const;

export function LearningVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster outcomes" arg="--since 7d" />
      <div className="term-out">
        <div className="term-row term-row-learn term-row-head">
          <span>tool</span>
          <span>ok</span>
          <span>rating</span>
          <span className="term-right">was &#8594; now</span>
        </div>
        {LEARN_ROWS.map(({ tool, ok, was, now, pct, from, kind }, index) => (
          <div
            className={`term-row term-row-learn learn-row learn-row-${kind} learn-row-${index + 1}`}
            key={tool}
          >
            <span className="term-name">{tool}</span>
            <span className={`term-status term-status-${kind}`}>{ok}</span>
            <TermBar pct={pct} from={from} />
            <span className="term-right">
              <span className="term-dim">{was}</span>
              <span className={`learn-delta learn-delta-${kind}`}> &#8594; {now}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="term-note">ranking rebuilt: 3 promoted, 1 benched</div>
      <TermCursorLine />
    </div>
  );
}

export const MATCHED_TOOLS = [
  { score: "0.96", tool: "github.open_pull_request" },
  { score: "0.93", tool: "git.push" },
  { score: "0.91", tool: "slack.post_message" },
  { score: "0.88", tool: "sentry.resolve_issue" },
  { score: "0.85", tool: "datadog.check_deploy" },
] as const;

export function SearchVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster draft" arg={"\u201chotfix and tell the team\u201d"} />
      <div className="term-out">
        <div className="term-note term-note-lead">searched 214 indexed tools, 5 matched</div>
        <div className="term-row term-row-search term-row-head">
          <span>match</span>
          <span>tool passed to the model</span>
        </div>
        {MATCHED_TOOLS.map(({ score, tool }, index) => (
          <div className={`term-row term-row-search draft-row draft-row-${index + 1}`} key={tool}>
            <span className="term-dim">{score}</span>
            <span className="term-name">{tool}</span>
          </div>
        ))}
      </div>
      <div className="term-note">209 others stay connected, out of context</div>
      <TermCursorLine />
    </div>
  );
}

export const LEAGUE_ROWS = [
  { rank: 1, name: "postgres-mcp", score: "0.947", scoreNew: "", swap: "" },
  { rank: 2, name: "supabase-mcp", score: "0.921", scoreNew: "", swap: "down" },
  { rank: 3, name: "mongodb-mcp", score: "0.898", scoreNew: "0.924", swap: "up" },
  { rank: 4, name: "mysql-mcp", score: "0.874", scoreNew: "", swap: "" },
  { rank: 5, name: "redis-mcp", score: "0.712", scoreNew: "", swap: "" },
] as const;

export function RankingsVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster standings" arg="database" />
      <div className="term-out">
        <div className="term-row term-row-league term-row-head">
          <span>#</span>
          <span className="term-league-entry">
            <span>server</span>
            <span className="term-right">score</span>
            <span>signed</span>
          </span>
        </div>
        {LEAGUE_ROWS.map(({ rank, name, score, scoreNew, swap }) => (
          <div className="term-row term-row-league" key={name}>
            <span className="term-dim">{rank}</span>
            <span className={`term-league-entry${swap ? ` league-swap-${swap}` : ""}`}>
              <span className="term-name">{name}</span>
              {scoreNew ? (
                <span className="term-right league-score-flip">
                  <span className="league-score-old">{score}</span>
                  <span className="league-score-new">{scoreNew}</span>
                </span>
              ) : (
                <span className="term-right">{score}</span>
              )}
              <span className="term-check">&#10003;</span>
            </span>
          </div>
        ))}
      </div>
      <div className="term-note">6 certified, same suite, reproducible</div>
      <TermCursorLine />
    </div>
  );
}

export const SYNC_RESULTS = [
  { client: "claude code", detail: "14 servers \u2192 1 endpoint" },
  { client: "cursor", detail: " 9 servers \u2192 1 endpoint" },
  { client: "codex", detail: " 6 servers \u2192 1 endpoint" },
] as const;

export function PortabilityVisual() {
  return (
    <div className="term-body" aria-hidden="true">
      <TermPrompt command="roster sync" />
      <div className="term-out">
        {SYNC_RESULTS.map(({ client, detail }) => (
          <div className="term-line term-line-out" key={client}>
            <span className="term-check">&#10003;</span>
            <span className="term-name">{client}</span>
            <span className="term-dim">{detail}</span>
          </div>
        ))}
        <div className="term-note term-note-tight">originals backed up before any write</div>
      </div>

      <TermPrompt command="roster eject" />
      <div className="term-out">
        <div className="term-line term-line-out">
          <span className="term-check">&#10003;</span>
          <span className="term-dim">3 configs restored byte for byte</span>
        </div>
      </div>

      <TermCursorLine />
    </div>
  );
}
