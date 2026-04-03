"use client";
import { useState, useEffect, useRef } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import { normalizeSectionData } from "@/lib/site-schema";

interface Props {
  selectedSection: string | null;
  onClose: () => void;
}

type Phase = "idle" | "streaming" | "done" | "error";

interface Op {
  label:  string;
  status: "applying" | "done" | "error";
}

/* Human-readable label for each tool call */
function opLabel(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "set_fields": {
      const keys = Object.keys((input.changes as Record<string, unknown>) ?? {}).join(", ");
      return `Champs mis à jour : ${keys}`;
    }
    case "set_items":   return `Tableau « ${input.field} » remplacé`;
    case "patch_item":  return `${input.field}[${input.index}] modifié`;
    case "add_item":    return `Élément ajouté dans « ${input.field} »`;
    case "remove_item": return `${input.field}[${input.index}] supprimé`;
    case "update_section":    return `Section « ${input.key} » mise à jour`;
    case "add_section":       return `Section « ${input.key} » ajoutée`;
    case "remove_section":    return `Section « ${input.key} » supprimée`;
    case "reorder_sections":  return "Sections réordonnées";
    default: return name;
  }
}

export function AIPatchPanel({ selectedSection, onClose }: Props) {
  const [instruction, setInstruction] = useState("");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [ops,         setOps]         = useState<Op[]>([]);
  const [error,       setError]       = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const phaseRef = useRef<Phase>("idle");

  const {
    config,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
  } = useSiteStore();
  const activePage = useActivePage();

  const pageMode = !selectedSection;
  const context  = pageMode
    ? `Page : ${activePage?.name ?? "entière"}`
    : `Section : ${selectedSection}`;

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ── Section mode tools ───────────────────────────────────── */

  function applySectionTool(name: string, input: Record<string, unknown>) {
    switch (name) {
      case "set_fields": {
        const changes = (input.changes ?? {}) as Record<string, unknown>;
        /* Filter out internal "_" keys — never let the AI overwrite styles */
        const safe = Object.fromEntries(
          Object.entries(changes).filter(([k]) => !k.startsWith("_"))
        );
        updateSection(selectedSection!, prev => {
          const merged = { ...prev, ...safe };
          return normalizeSectionData(selectedSection!, merged);
        });
        break;
      }

      case "set_items": {
        const { field, items } = input as { field: string; items: unknown[] };
        updateSection(selectedSection!, prev => {
          const merged = { ...prev, [field]: items };
          return normalizeSectionData(selectedSection!, merged);
        });
        break;
      }

      case "patch_item": {
        const { field, index, changes } = input as {
          field: string; index: number; changes: Record<string, unknown>;
        };
        updateSection(selectedSection!, prev => {
          const arr = [...((prev[field] as unknown[]) ?? [])];
          arr[index] = { ...(arr[index] as Record<string, unknown>), ...changes };
          const merged = { ...prev, [field]: arr };
          return normalizeSectionData(selectedSection!, merged);
        });
        break;
      }

      case "add_item": {
        const { field, item } = input as { field: string; item: unknown };
        updateSection(selectedSection!, prev => {
          const merged = {
            ...prev,
            [field]: [...((prev[field] as unknown[]) ?? []), item],
          };
          return normalizeSectionData(selectedSection!, merged);
        });
        break;
      }

      case "remove_item": {
        const { field, index } = input as { field: string; index: number };
        updateSection(selectedSection!, prev => ({
          ...prev,
          [field]: ((prev[field] as unknown[]) ?? []).filter((_, i) => i !== index),
        }));
        break;
      }
    }
  }

  /* ── Page mode tools ──────────────────────────────────────── */

  function applyPageTool(name: string, input: Record<string, unknown>) {
    switch (name) {
      case "update_section": {
        const { key, changes } = input as { key: string; changes: Record<string, unknown> };
        const safe = Object.fromEntries(
          Object.entries(changes).filter(([k]) => !k.startsWith("_"))
        );
        updateSection(key, prev => {
          const merged = { ...prev, ...safe };
          return normalizeSectionData(key, merged);
        });
        break;
      }

      case "add_section": {
        const { key, data, position } = input as {
          key: string; data: Record<string, unknown>; position?: number;
        };
        /* addSection appends to sections[], then updateSection sets data */
        addSection(key);
        updateSection(key, normalizeSectionData(key, data ?? {}));
        /* If position specified, reorder using the page state at call time */
        if (typeof position === "number" && activePage) {
          const current = activePage.sections.filter(s => s !== key);
          const next    = [
            ...current.slice(0, position),
            key,
            ...current.slice(position),
          ];
          reorderSections(next);
        }
        break;
      }

      case "remove_section": {
        const { key } = input as { key: string };
        /* Protect structural sections */
        if (key === "navbar" || key === "footer") break;
        removeSection(key);
        break;
      }

      case "reorder_sections": {
        const { sections } = input as { sections: string[] };
        reorderSections(sections);
        break;
      }
    }
  }

  /* ── Dispatch ─────────────────────────────────────────────── */

  function applyToolCall(name: string, input: Record<string, unknown>) {
    if (pageMode) applyPageTool(name, input);
    else          applySectionTool(name, input);
  }

  /* ── SSE line parser ──────────────────────────────────────── */

  function processLine(line: string) {
    const raw = line.slice(6).trim(); // strip "data: "
    if (!raw) return;

    let evt: {
      t: string;
      name?:    string;
      input?:   Record<string, unknown>;
      message?: string;
    };
    try {
      evt = JSON.parse(raw) as typeof evt;
    } catch {
      return; // malformed SSE envelope — ignore only this
    }

    /* ── Tool call complete ── */
    if (evt.t === "tool_call" && evt.name && evt.input) {
      const { name, input } = evt;
      const label = opLabel(name, input);

      /* Add op as "applying" */
      setOps(prev => [...prev, { label, status: "applying" }]);

      try {
        applyToolCall(name, input);
        /* Mark last op as done */
        setOps(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], status: "done" };
          return next;
        });
      } catch {
        setOps(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], status: "error" };
          return next;
        });
      }
    }

    /* ── All tools done ── */
    if (evt.t === "z") {
      phaseRef.current = "done";
      setPhase("done");
      setTimeout(onClose, 1400);
    }

    /* ── Server error ── */
    if (evt.t === "e") {
      phaseRef.current = "error";
      setError(evt.message ?? "Erreur IA");
      setPhase("error");
    }
  }

  /* ── Submit ───────────────────────────────────────────────── */

  const submit = async () => {
    if (!instruction.trim() || !config || !activePage) return;

    phaseRef.current = "streaming";
    setPhase("streaming");
    setOps([]);
    setError("");

    const body = pageMode
      ? { pageMode: true, page: activePage, theme: config.theme, instruction: instruction.trim() }
      : {
          sectionKey:  selectedSection,
          currentData: activePage.data[selectedSection!] ?? {},
          theme:       config.theme,
          instruction: instruction.trim(),
        };

    try {
      const res = await fetch("/api/patch", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(msg);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buf     = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          /* Flush remaining buffer */
          if (buf.trim()) {
            for (const line of (buf + "\n").split("\n")) {
              if (line.startsWith("data: ")) processLine(line);
            }
          }
          break;
        }

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) processLine(line);
        }
      }

      /* Fallback: t:"z" never arrived */
      if (phaseRef.current === "streaming") {
        phaseRef.current = "done";
        setPhase("done");
        setTimeout(onClose, 1400);
      }

    } catch (e) {
      if (phaseRef.current === "streaming") {
        phaseRef.current = "error";
        setError(e instanceof Error ? e.message : "Erreur réseau");
        setPhase("error");
      }
    }
  };

  const isStreaming = phase === "streaming";
  const isDone      = phase === "done";

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--wg-border)" }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: "var(--wg-green)" }}
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--wg-text)" }}>
              Modifier avec l&apos;IA
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--wg-green-muted)", color: "var(--wg-green)" }}
            >
              {context}
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--wg-text-3)" }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 flex flex-col gap-4">

          {/* Instruction textarea — hidden while streaming/done */}
          {!isStreaming && !isDone && (
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
              placeholder={
                pageMode
                  ? "Ex : Ajoute une section témoignages, rends la page plus moderne…"
                  : "Ex : Rends le titre plus percutant, change la couleur du CTA…"
              }
              rows={3}
              className="w-full text-sm rounded-xl border px-4 py-3 resize-none focus:outline-none"
              style={{
                backgroundColor: "var(--wg-bg)",
                borderColor:     "var(--wg-border)",
                color:           "var(--wg-text)",
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.2)")}
              onBlur={e  => (e.currentTarget.style.boxShadow = "none")}
            />
          )}

          {/* Operations log */}
          {(isStreaming || isDone) && (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg)" }}
            >
              {/* Status bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 border-b text-xs font-medium"
                style={{
                  borderColor: "var(--wg-border)",
                  color: isDone ? "var(--wg-green)" : "var(--wg-text-3)",
                }}
              >
                {isDone ? (
                  <>✓ Modifications appliquées</>
                ) : (
                  <>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--wg-green)", animation: "wg-pulse 1s infinite" }}
                    />
                    Application en cours…
                  </>
                )}
              </div>

              {/* Op list */}
              <div className="px-3 py-2.5 flex flex-col gap-2">
                {ops.length === 0 && isStreaming && (
                  <p className="text-xs" style={{ color: "var(--wg-text-3)" }}>
                    Analyse de l&apos;instruction…
                  </p>
                )}
                {ops.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {op.status === "applying" ? (
                      <span
                        className="shrink-0 w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: "var(--wg-green)" }}
                      />
                    ) : op.status === "done" ? (
                      <span className="shrink-0" style={{ color: "var(--wg-green)" }}>✓</span>
                    ) : (
                      <span className="shrink-0 text-red-400">✗</span>
                    )}
                    <span
                      style={{
                        color: op.status === "error" ? "#ef4444" : "var(--wg-text-2)",
                      }}
                    >
                      {op.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {phase === "error" && error && (
            <p
              className="text-xs px-3 py-2.5 rounded-lg"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}
            >
              {error}
            </p>
          )}

          {/* Footer — submit / retry */}
          {!isStreaming && !isDone && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--wg-text-3)" }}>
                Ctrl+Entrée · Échap pour fermer
              </p>
              <button
                onClick={submit}
                disabled={!instruction.trim()}
                className="btn-green px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Appliquer →
              </button>
            </div>
          )}

          {phase === "error" && (
            <div className="flex justify-end">
              <button
                onClick={() => { setPhase("idle"); setOps([]); setError(""); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-70"
                style={{ color: "var(--wg-text-2)", borderColor: "var(--wg-border)" }}
              >
                Réessayer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
