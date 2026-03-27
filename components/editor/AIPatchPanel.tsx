"use client";
import { useState, useEffect, useRef } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

interface Props {
  selectedSection: string | null;
  onClose: () => void;
}

type Phase = "idle" | "streaming" | "done" | "error";

export function AIPatchPanel({ selectedSection, onClose }: Props) {
  const [instruction, setInstruction] = useState("");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [liveText,    setLiveText]    = useState("");
  const [error,       setError]       = useState("");
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const liveRef   = useRef<HTMLPreElement>(null);

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

  // Auto-scroll live preview
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.scrollTop = liveRef.current.scrollHeight;
    }
  }, [liveText]);

  const submit = async () => {
    if (!instruction.trim() || !config || !activePage) return;
    setPhase("streaming");
    setLiveText("");
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

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buf     = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          try {
            const evt = JSON.parse(raw) as {
              type: string;
              text?: string;
              updatedData?: Record<string, unknown>;
              updatedPage?: { sections: string[]; data: Record<string, unknown> };
              message?: string;
            };

            if (evt.type === "delta" && evt.text) {
              setLiveText(t => t + evt.text);
            }

            if (evt.type === "done") {
              if (pageMode && evt.updatedPage) {
                const { sections, data: newData } = evt.updatedPage;
                const updatedPages = config.pages.map(p =>
                  p.id === activePage.id
                    ? { ...p, sections: sections ?? p.sections, data: newData ?? p.data }
                    : p
                );
                setConfig({ ...config, pages: updatedPages as typeof config.pages });
              } else if (evt.updatedData) {
                updateSection(selectedSection!, evt.updatedData);
              }
              setPhase("done");
              setTimeout(onClose, 600); // Brief "done" flash before closing
            }

            if (evt.type === "error") {
              setError(evt.message ?? "Erreur IA");
              setPhase("error");
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
      setPhase("error");
    }
  };

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
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--wg-border)" }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--wg-green)" }}>
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
          <button onClick={onClose} className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--wg-text-3)" }}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Instruction input — masqué pendant le streaming */}
          {!isStreaming && !isDone && (
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(); }}
              placeholder={
                pageMode
                  ? "Ex : Rends cette page plus moderne, ajoute une section témoignages…"
                  : "Ex : Rends le titre plus percutant, change le fond en bleu marine…"
              }
              rows={3}
              className="w-full text-sm rounded-xl border px-4 py-3 resize-none focus:outline-none"
              style={{
                backgroundColor: "var(--wg-bg)",
                borderColor:     "var(--wg-border)",
                color:           "var(--wg-text)",
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.2)")}
              onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
            />
          )}

          {/* Live streaming preview */}
          {(isStreaming || isDone) && (
            <div
              className="rounded-xl border"
              style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg)" }}
            >
              {/* Status bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 border-b text-xs font-medium"
                style={{ borderColor: "var(--wg-border)", color: isDone ? "var(--wg-green)" : "var(--wg-text-3)" }}
              >
                {isDone ? (
                  <>✓ Appliqué</>
                ) : (
                  <>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: "var(--wg-green)",
                        animation: "wg-pulse 1s ease-in-out infinite",
                      }}
                    />
                    Génération en cours…
                  </>
                )}
              </div>
              {/* Streaming text */}
              <pre
                ref={liveRef}
                className="text-xs px-3 py-2 overflow-auto max-h-48 whitespace-pre-wrap break-all font-mono"
                style={{ color: "var(--wg-text-2)", maxHeight: 192 }}
              >
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
