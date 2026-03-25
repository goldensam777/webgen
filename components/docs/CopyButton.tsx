"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-mono transition-opacity"
      style={{
        backgroundColor: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
        color:           copied ? "#34d399" : "var(--wg-text-3)",
        border:          "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {copied ? "✓" : "Copier"}
    </button>
  );
}
