"use client";

import { useState } from "react";

import { CopyIcon } from "@/components/icons";
import { LLM_PROMPT } from "@/lib/site";

/* The only interactive part of the hero. Split out so the hero itself, and
   with it the 128-glyph corridor, can stay a server component. */
export function PromptButton() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard
      ?.writeText(LLM_PROMPT)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <button className="hero-button hero-button-primary" onClick={copyPrompt} type="button">
      <CopyIcon />
      <span>{copied ? "Copied to clipboard" : "Prompt for LLMs"}</span>
    </button>
  );
}
