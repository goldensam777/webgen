"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";

interface MediaFile {
  filename:   string;
  url:        string;
  size:       number;
  type:       string;
  uploadedAt: string;
}

export function MediaPanel() {
  const { token } = useAuthStore();
  const [files,     setFiles]     = useState<MediaFile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied,    setCopied]    = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/media", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setFiles(data.files ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    fd,
      });
      if (res.ok) await load();
      else {
        const { error } = await res.json();
        alert(error ?? "Erreur upload");
      }
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--wg-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--wg-text-3)" }}>
          Médias
        </p>

        {/* Zone drop / bouton upload */}
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-4 cursor-pointer transition-colors"
          style={{ borderColor: "var(--wg-border)" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--wg-green)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--wg-border)")}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--wg-green) transparent var(--wg-green) var(--wg-green)" }} />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: "var(--wg-text-3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          <span className="text-xs" style={{ color: "var(--wg-text-3)" }}>
            {uploading ? "Upload en cours…" : "Glisser ou cliquer pour uploader"}
          </span>
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>
            JPG, PNG, GIF, WEBP, SVG, MP4 · max 10 Mo
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
      </div>

      {/* Galerie */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square rounded-lg animate-pulse"
                style={{ backgroundColor: "var(--wg-bg-3)" }} />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: "var(--wg-text-3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs" style={{ color: "var(--wg-text-3)" }}>Aucun média uploadé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {files.map(f => (
              <div
                key={f.filename}
                onClick={() => copyUrl(f.url)}
                title="Cliquer pour copier l'URL"
                className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border transition-colors"
                style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg-3)" }}
              >
                {f.type.startsWith("video/") ? (
                  <video src={f.url} className="w-full h-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                )}

                {/* Overlay au survol */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                >
                  {copied === f.url ? (
                    <span className="text-xs font-semibold text-white">✓ Copié !</span>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
