import { RosterMark } from "@/components/icons";
import { SKYLINE_ROWS } from "@/data/skyline";
import { GITHUB_URL, PLACEHOLDER } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand footer-brand-lockup" href="#top" aria-label="Roster home">
              <RosterMark />
              <span className="brand-name">roster</span>
            </a>
            <p>
              The self-learning tool router for MCP. One local endpoint in front
              of every server you own, ranked on what actually worked.
            </p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#showcase">What roster does</a>
              <a href={PLACEHOLDER}>Rankings</a>
            </div>
            <div className="footer-col">
              <h4>Docs</h4>
              <a href={PLACEHOLDER}>Documentation</a>
              <a href={PLACEHOLDER}>Telemetry schema</a>
            </div>
            <div className="footer-col">
              <h4>Project</h4>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a href={PLACEHOLDER}>Provenance</a>
              <a href={PLACEHOLDER}>MIT license</a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 roster</span>
        </div>
      </div>

      <div className="footer-art reveal" aria-hidden="true">
        <pre>
          {SKYLINE_ROWS.map((runs, row) => (
            <span key={row}>
              {runs.map((run, i) => (
                <span className={`sky-${run.level}`} key={i}>{run.text}</span>
              ))}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>
    </footer>
  );
}
