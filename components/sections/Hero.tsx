import { SignalField } from "@/components/corridor/SignalField";
import { PromptButton } from "@/components/hero/PromptButton";
import { DiagonalArrow, GitHubMark, RosterMark, StarIcon } from "@/components/icons";
import { GITHUB_URL } from "@/lib/site";

export function Hero() {
  return (
    <div className="hero-stage">
      <SignalField />

      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Roster home">
          <RosterMark />
          <span className="brand-name">roster</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a className="nav-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <GitHubMark />
            <span>GitHub</span>
          </a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="update-pill">
          <span className="update-label"><i />Latest update</span>
          <span className="update-message">Beta v0.1 Now Live <DiagonalArrow /></span>
        </div>

        <h1 id="hero-title">
          <span>The self-learning</span>
          <br />
          <span>tool router for MCP.</span>
        </h1>

        <p className="hero-description">
          <span>Your agent has 200 tools. Roster shows it only the ones that fit the task,</span>{" "}
          <br />
          <span>learns which ones actually deliver, and never leaves your machine.</span>
        </p>

        <div className="hero-actions">
          <PromptButton />
          <a className="hero-button hero-button-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <StarIcon />
            <span>Star on GitHub</span>
          </a>
        </div>
      </section>
    </div>
  );
}
