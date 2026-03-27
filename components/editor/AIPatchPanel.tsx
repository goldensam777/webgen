"use client";
import { useState, useEffect, useRef } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

interface Props {
  selectedSection: string | null;
  onClose: () => void;
}

type Phase = "idle" | "streaming" | "done" | "error";

/* Même logique que côté serveur — extrait le JSON d'une réponse IA */
function extractJSON(raw: string): unknown {
  const trimmed = raw.trim();
  // Markdown code block
  const md = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (md) return JSON.parse(md[1].trim());
  // JSON direct
  return JSON.parse(trimmed);
}

export function AIPatchPanel({ selectedSection, onClose }: Props) {
  const [instruction, setInstruction] = useState("");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [liveText,    setLiveText]    = useState("");
  const [error,       setError]       = useState("");
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const liveRef   = useRef<HTMLPreElement>(null);
  /* Refs pour éviter les stale closures dans la boucle async */
  const liveTextRef    = useRef("");
  const phaseRef       = useRef<Phase>("idle");

  const { config, updateSection, setConfig } = useSiteStore();
  const activePage = useActivePage();

  const pageMode = !selectedSection;
  const context  = pageMode
    ? `Page : ${activePage?.name ?? "entière"}`
    : `Section : ${selectedSection}`;

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [liveText]);

  /* Sync phase ref */
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  function applyResult(
    rawText: string,
    internalData: Record<string, unknown>,
    kind: "section" | "page"
  ) {
    if (!config || !activePage) return;

    try {
      const parsed = extractJSON(rawText);

      if (kind === "page") {
        const { sections, data: newData } = parsed as {
          sections: string[];
          data: Record<string, Record<string, unknown>>;
        };
        const updatedPages = config.pages.map(p =>
          p.id === activePage.id
            ? { ...p, sections: sections ?? p.sections, data: newData ?? p.data }
            : p
        );
        setConfig({ ...config, pages: updatedPages });
      } else {
        // Section mode — merge parsed result with internal keys (_styles, _elStyles…)
        const updatedData = {
          ...(parsed as Record<string, unknown>),
          ...internalData,
        };
        updateSection(selectedSection!, updatedData);
      }

      setPhase("done");
      setTimeout(onClose, 700);
    } catch (e) {
      setError(`Réponse IA invalide : ${String(e)}`);
      setPhase("error");
    }
  }

  const submit = async () => {
    if (!instruction.trim() || !config || !activePage) return;

    setPhase("streaming");
    phaseRef.current = "streaming";
    setLiveText("");
    liveTextRef.current = "";
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
            const lines = (buf + "\n").split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              processLine(line);
            }
          }
          break;
        }

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          processLine(line);
        }
      }

      /* Fallback : if we never got a "done" signal but have text, try parsing */
      if (phaseRef.current === "streaming" && liveTextRef.current.trim()) {
        applyResult(liveTextRef.current, {}, pageMode ? "page" : "section");
      }

    } catch (e) {
      if (phaseRef.current === "streaming") {
        setError(e instanceof Error ? e.message : "Erreur réseau");
        setPhase("error");
      }
    }
  };

  function processLine(line: string) {
    const raw = line.slice(6).trim();
    if (!raw) return;
    try {
      const evt = JSON.parse(raw) as {
        t: string;
        v?: string;
        internalData?: Record<string, unknown>;
        kind?: "section" | "page";
        message?: string;
      };

      if (evt.t === "d" && evt.v) {
        liveTextRef.current += evt.v;
        setLiveText(t => t + evt.v);
      }

      if (evt.t === "z") {
        /* Done signal — parse accumulated liveText */
        applyResult(
          liveTextRef.current,
          evt.internalData ?? {},
          evt.kind ?? (pageMode ? "page" : "section")
        );
      }

      if (evt.t === "e") {
        setError(evt.message ?? "Erreur IA");
        setPhase("error");
      }
    } catch { /* malformed SSE line — ignore */ }
  }

  const isStreaming = phase === "streaming";
  const isDone      = phase === "done";

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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--wg-border)" }}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"
              style={{ color: "var(--wg-green)" }}>
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--wg-text)" }}>
              Modifier avec l&apos;IA
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--wg-green-muted)", color: "var(--wg-green)" }}>
              {context}
            </span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--wg-text-3)" }}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Instruction — masquée pendant le streaming */}
          {!isStreaming && !isDone && (
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(); }}
              placeholder={pageMode
                ? "Ex : Rends cette page plus moderne, ajoute une section témoignages…"
                : "Ex : Rends le titre plus percutant, change le fond en bleu marine…"}
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

          {/* Live streaming preview */}
          {(isStreaming || isDone) && (
            <div className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg)" }}>
              {/* Status bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b text-xs font-medium"
                style={{
                  borderColor: "var(--wg-border)",
                  color: isDone ? "var(--wg-green)" : "var(--wg-text-3)",
                }}>
                {isDone ? (
                  <>✓ Appliqué</>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--wg-green)", animation: "wg-pulse 1s infinite" }} />
                    Génération…
                  </>
                )}
              </div>
              {/* Text */}
              <pre ref={liveRef}
                className="text-xs px-3 py-2 overflow-auto whitespace-pre-wrap break-all font-mono"
                style={{ color: "var(--wg-text-2)", maxHeight: 220 }}>
                {liveText || " "}
              </pre>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <p className="text-xs px-3 py-2 rounded-lg"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}>
              {error}
            </p>
          )}

          {/* Footer */}
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
        </div>
      </div>
    </div>
  );
}
