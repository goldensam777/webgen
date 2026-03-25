"use client";
import { useState, useEffect, useRef } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

interface Props {
  selectedSection: string | null;
  onClose: () => void;
}

export function AIPatchPanel({ selectedSection, onClose }: Props) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { config, updateSection, setConfig } = useSiteStore();
  const activePage = useActivePage();

  const pageMode = !selectedSection;
  const context  = pageMode
    ? `Page : ${activePage?.name ?? "entière"}`
    : `Section : ${selectedSection}`;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const submit = async () => {
    if (!instruction.trim() || !config || !activePage) return;
    setLoading(true);
    setError("");

    try {
      const body = pageMode
        ? {
            pageMode:    true,
            page:        activePage,
            theme:       config.theme,
            instruction: instruction.trim(),
          }
        : {
            sectionKey:  selectedSection,
            currentData: activePage.data[selectedSection!] ?? {},
            theme:       config.theme,
            instruction: instruction.trim(),
          };

      const res  = await fetch("/api/patch", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? "Erreur serveur");

      if (pageMode && data.updatedPage) {
        // Patch page entière
        const { sections, data: newData } = data.updatedPage;
        const updatedPages = config.pages.map(p =>
          p.id === activePage.id
            ? { ...p, sections: sections ?? p.sections, data: newData ?? p.data }
            : p
        );
        setConfig({ ...config, pages: updatedPages });
      } else if (data.updatedData) {
        updateSection(selectedSection!, data.updatedData);
      }

      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
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
            {/* Star icon */}
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
          <button
            onClick={onClose}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: "var(--wg-text-3)" }}
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <div className="p-5 flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
            }}
            placeholder={
              pageMode
                ? "Ex : Rends cette page plus moderne, ajoute une section témoignages…"
                : "Ex : Rends le titre plus percutant, change le fond en bleu marine…"
            }
            rows={3}
            className="w-full text-sm rounded-xl border px-4 py-3 resize-none focus:outline-none transition-shadow"
            style={{
              backgroundColor: "var(--wg-bg)",
              borderColor:     "var(--wg-border)",
              color:           "var(--wg-text)",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.2)")}
            onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
          />

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--wg-text-3)" }}>
              Ctrl+Entrée pour envoyer · Échap pour fermer
            </p>
            <button
              onClick={submit}
              disabled={loading || !instruction.trim()}
              className="btn-green px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
              {loading ? "Génération…" : "Appliquer →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
