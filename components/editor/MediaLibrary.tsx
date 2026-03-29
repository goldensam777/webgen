"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/use-hydrated";

interface MediaFile {
  filename:   string;
  url:        string;
  type:       "image" | "video" | "audio" | "pdf" | "other";
  size:       number;
  uploadedAt: string;
}

type Filter = "all" | "image" | "video" | "audio" | "pdf";

interface Props {
  onSelect: (url: string) => void;
  onClose:  () => void;
  accept?:  string;
}

function fmt(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TypeIcon({ type }: { type: string }) {
  const cls = "w-8 h-8";
  if (type === "video") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
  if (type === "audio") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
  if (type === "pdf") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",   label: "Tout"   },
  { key: "image", label: "Images" },
  { key: "video", label: "Vidéos" },
  { key: "audio", label: "Audio"  },
  { key: "pdf",   label: "PDF"    },
];

export function MediaLibrary({ onSelect, onClose, accept }: Props) {
  const [files,    setFiles]    = useState<MediaFile[]>([]);
  const [filter,   setFilter]   = useState<Filter>("all");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();

  const load = useCallback(async () => {
    const r = await fetch("/api/media");
    const d = await r.json();
    setFiles(d.files ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() =>
      setProgress(p => Math.min(p + 8, 88)), 120
    );

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Erreur d'upload");
      } else {
        await load();
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0); }, 600);
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (list?.[0]) upload(list[0]);
  };

  const visible = files.filter(f => filter === "all" || f.type === filter);

  if (!hydrated) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[86vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "var(--wg-border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--wg-text)" }}>
            Médiathèque
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-green px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {uploading ? `${progress}%` : "Importer"}
            </button>
            <button
              onClick={onClose}
              style={{ color: "var(--wg-text-3)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div
          className="flex gap-1 px-5 py-2 border-b shrink-0"
          style={{ borderColor: "var(--wg-border)" }}
        >
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: filter === f.key ? "var(--wg-green-muted)" : "transparent",
                color:           filter === f.key ? "var(--wg-green)"       : "var(--wg-text-3)",
                border:          filter === f.key ? "1px solid var(--wg-green)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div
          className="flex-1 overflow-y-auto p-4 relative"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          {/* Progress bar */}
          {uploading && (
            <div
              className="mb-4 rounded-xl p-3 border"
              style={{ backgroundColor: "var(--wg-bg-3)", borderColor: "var(--wg-border)" }}
            >
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: "var(--wg-text-2)" }}>Upload en cours…</span>
                <span className="text-xs font-mono" style={{ color: "var(--wg-green)" }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--wg-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--wg-grad)" }}
                />
              </div>
            </div>
          )}

          {/* Drag overlay */}
          {dragOver && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed m-2"
              style={{ borderColor: "var(--wg-green)", backgroundColor: "var(--wg-green-muted)" }}
            >
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: "var(--wg-green)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm font-semibold" style={{ color: "var(--wg-green)" }}>Déposer ici</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {visible.length === 0 && !uploading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: "var(--wg-text-3)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-sm" style={{ color: "var(--wg-text-3)" }}>
                {filter === "all" ? "Aucun média. Importez votre premier fichier." : `Aucun ${filter} trouvé.`}
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-green px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Importer un fichier
              </button>
            </div>
          )}

          {/* Grid */}
          {visible.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {visible.map(file => (
                <button
                  key={file.filename}
                  onClick={() => { onSelect(file.url); onClose(); }}
                  className="group relative rounded-xl overflow-hidden border aspect-square flex items-center justify-center transition-all"
                  style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg-3)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  title={file.filename}
                >
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-2" style={{ color: "var(--wg-text-3)" }}>
                      <TypeIcon type={file.type} />
                      <span className="text-[10px] font-medium text-center truncate w-full"
                        style={{ color: "var(--wg-text-2)" }}>
                        {file.filename.length > 18 ? file.filename.slice(0, 15) + "…" : file.filename}
                      </span>
                    </div>
                  )}

                  {/* Hover info */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                      flex flex-col items-center justify-end pb-2"
                    style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.65))" }}
                  >
                    <span className="text-[11px] text-white font-medium">{fmt(file.size)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept ?? "image/*,video/*,audio/*,application/pdf"}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>,
    document.body
  );
}
