// components/docs/MDXComponents.tsx
"use client";
import { ReactNode, useState } from "react";
import { Callout } from "./Callout";

/* ── CopyButton ─────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
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

/* ── Pre / Code ─────────────────────────────────────────────── */

function Pre({ children, ...props }: { children: ReactNode }) {
  // Extraire le texte brut pour le bouton copier
  const rawText = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el = children as any;
      return el?.props?.children ?? "";
    } catch { return ""; }
  })();

  return (
    <div className="relative my-5 group">
      <pre
        {...props}
        className="rounded-xl px-5 py-4 overflow-x-auto text-sm leading-relaxed"
        style={{
          backgroundColor: "var(--wg-bg-3)",
          border:          "1px solid var(--wg-border)",
          color:           "var(--wg-text)",
        }}
      >
        {children}
      </pre>
      <CopyButton text={String(rawText)} />
    </div>
  );
}

/* ── Headings avec ancre ────────────────────────────────────── */

function Heading({ as: Tag, children, ...props }: { as: "h2" | "h3" | "h4"; children: ReactNode; id?: string }) {
  const sizeMap = { h2: "text-2xl mt-10 mb-4", h3: "text-xl mt-8 mb-3", h4: "text-base mt-6 mb-2" };
  return (
    <Tag
      {...props}
      className={`${sizeMap[Tag]} font-bold scroll-mt-24 group`}
      style={{ color: "var(--wg-text)" }}
    >
      <a href={`#${props.id}`} className="no-underline hover:no-underline">
        {children}
        <span
          className="ml-2 opacity-0 group-hover:opacity-40 transition-opacity text-lg font-normal"
          style={{ color: "var(--wg-green)" }}
          aria-hidden
        >
          #
        </span>
      </a>
    </Tag>
  );
}

/* ── Table ──────────────────────────────────────────────────── */

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto my-5">
      <table
        className="w-full text-sm border-collapse"
        style={{ borderColor: "var(--wg-border)" }}
      >
        {children}
      </table>
    </div>
  );
}

/* ── Composants exportés ────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  /* blocs */
  pre:  Pre,
  code: ({ children, className, ...props }: { children: ReactNode; className?: string }) => (
    className
      ? <code className={className} {...props}>{children}</code>
      : <code
          className="px-1.5 py-0.5 rounded text-sm font-mono"
          style={{ backgroundColor: "var(--wg-bg-3)", color: "#34d399", border: "1px solid var(--wg-border)" }}
          {...props}
        >{children}</code>
  ),

  /* headings */
  h2: (p: { children: ReactNode; id?: string }) => <Heading as="h2" {...p} />,
  h3: (p: { children: ReactNode; id?: string }) => <Heading as="h3" {...p} />,
  h4: (p: { children: ReactNode; id?: string }) => <Heading as="h4" {...p} />,

  /* texte */
  p: ({ children }: { children: ReactNode }) => (
    <p className="my-4 leading-7 text-base" style={{ color: "var(--wg-text-2)" }}>{children}</p>
  ),
  strong: ({ children }: { children: ReactNode }) => (
    <strong className="font-semibold" style={{ color: "var(--wg-text)" }}>{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="font-medium underline underline-offset-2 transition-opacity hover:opacity-75"
      style={{ color: "var(--wg-green)" }}>{children}</a>
  ),

  /* listes */
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="my-4 ml-5 space-y-1.5 list-disc" style={{ color: "var(--wg-text-2)" }}>{children}</ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="my-4 ml-5 space-y-1.5 list-decimal" style={{ color: "var(--wg-text-2)" }}>{children}</ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="leading-relaxed pl-1">{children}</li>
  ),

  /* tableau */
  table: Table,
  thead: ({ children }: { children: ReactNode }) => (
    <thead style={{ backgroundColor: "var(--wg-bg-3)", color: "var(--wg-text-3)" }}>{children}</thead>
  ),
  th: ({ children }: { children: ReactNode }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide border-b"
      style={{ borderColor: "var(--wg-border)" }}>{children}</th>
  ),
  td: ({ children }: { children: ReactNode }) => (
    <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--wg-border)", color: "var(--wg-text-2)" }}>{children}</td>
  ),

  /* séparateur */
  hr: () => <hr className="my-8" style={{ borderColor: "var(--wg-border)" }} />,

  /* custom */
  Callout,
};
