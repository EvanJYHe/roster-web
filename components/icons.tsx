import Image from "next/image";

// Inline marks. Kept together because they are all tiny, share one stroke
// vocabulary, and none of them owns any behaviour.

export function RosterMark() {
  return (
    <Image
      className="roster-mark"
      src="/icon.png"
      alt=""
      width={64}
      height={64}
      priority
    />
  );
}

export function DiagonalArrow() {
  return (
    <svg className="diagonal-arrow" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 14 14 4M6 4h8v8" />
    </svg>
  );
}

export function GitHubMark() {
  return (
    <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg className="hero-button-icon" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="6.5" y="6.5" width="8" height="8" rx="1.2" />
      <path d="M11.5 4.5v-.8a1.2 1.2 0 0 0-1.2-1.2H4.7a1.2 1.2 0 0 0-1.2 1.2v5.6a1.2 1.2 0 0 0 1.2 1.2h.8" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg className="hero-button-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 1.9l2.2 4.46 4.92.72-3.56 3.47.84 4.9L9 13.14l-4.4 2.31.84-4.9-3.56-3.47 4.92-.72z" />
    </svg>
  );
}

export function RouteIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M14.5 9a5.5 5.5 0 1 1-2.1-4.32" />
      <path d="M14.8 2.5v2.8H12" />
    </svg>
  );
}

export function LearnIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 14.2 6.4 9.4l3 2.6 5.2-6.6" />
      <path d="M11.6 5.4h3v3" />
    </svg>
  );
}

export function RankIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.8 15.2h12.4" />
      <path d="M4.6 15.2V9.8M9 15.2V3.4M13.4 15.2v-4" />
    </svg>
  );
}

export function EjectIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 11.4V2.6M6.1 5.5 9 2.6l2.9 2.9" />
      <path d="M3.2 10.6v3.6a1.2 1.2 0 0 0 1.2 1.2h9.2a1.2 1.2 0 0 0 1.2-1.2v-3.6" />
    </svg>
  );
}

export function EndpointIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 4.2h4.2M2.6 9h4.2M2.6 13.8h4.2" />
      <path d="M6.8 4.2c3 0 2.6 4.8 5 4.8M6.8 13.8c3 0 2.6-4.8 5-4.8" />
      <circle cx="13.4" cy="9" r="2" />
    </svg>
  );
}

export function FailoverIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.6 6.2h4.6c2.4 0 2.4 5.6 4.8 5.6h3.4" />
      <path d="M13 9.2l2.4 2.6-2.4 2.6" />
      <path d="M11.4 4.4h4M13.4 2.6v3.6" />
    </svg>
  );
}

export function DriftIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 2.2 15 4.6v4.2c0 3.4-2.6 5.6-6 7-3.4-1.4-6-3.6-6-7V4.6z" />
      <path d="M9 6.6v3M9 12h.01" />
    </svg>
  );
}

export function KeyIcon() {
  return (
    <svg className="badge-icon" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="6" cy="9" r="3.2" />
      <path d="M9.2 9h6.2M13.4 9v2.6M15.4 9v2" />
    </svg>
  );
}

// Deliberately the parts the tabbed section below does not cover, so the two
// read as overview then deep dive rather than saying the same thing twice.
