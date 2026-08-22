/* Shared pieces of the terminal mocks: a character-cell meter bar, a prompt
   line and the blinking cursor. */

export const BAR_CELLS = 12;

// A shaded track with a solid fill clipped over it, so the meter stays on the
// monospace character grid instead of being a drawn element.
export function TermBar({ pct, from }: { pct: number; from?: number }) {
  const style = { "--w1": `${pct}%`, "--w0": `${from ?? 0}%` } as React.CSSProperties;
  return (
    <span className="term-meter">
      <span className="term-meter-track">{"\u2591".repeat(BAR_CELLS)}</span>
      <span className="term-meter-fill" style={style}>{"\u2588".repeat(BAR_CELLS)}</span>
    </span>
  );
}

export function TermPrompt({ command, arg }: { command: string; arg?: string }) {
  return (
    <div className="term-line term-line-cmd">
      <span className="term-caret">&#10095;</span>
      <span>
        {command}
        {arg ? <span className="term-arg"> {arg}</span> : null}
      </span>
    </div>
  );
}

export function TermCursorLine() {
  return (
    <div className="term-line term-line-cmd">
      <span className="term-caret">&#10095;</span>
      <span className="term-cursor" />
    </div>
  );
}
