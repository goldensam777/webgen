// app/create/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PublishModal } from "@/components/editor/PublishModal";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";

export default function CreatePage() {
  const [description, setDescription]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [loadingMsg, setLoadingMsg]     = useState("");
  const [error, setError]               = useState("");
  const [publishOpen, setPublishOpen]   = useState(false);
  const [confirmNew,  setConfirmNew]    = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [files, setFiles]               = useState<File[]>([]);
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const { config, setConfig, clearConfig, undo, redo, past, future } = useSiteStore();

  const handleDownload = async () => {
    if (!config) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/download", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      const multi    = config.pages.length > 1;
      a.href         = url;
      a.download     = multi ? "site.zip" : "index.html";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }} />
  );

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const allowed = Array.from(incoming).filter(
      f => f.type.startsWith("image/") || f.type === "application/pdf"
    );
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...allowed.filter(f => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    try {
      /* ── Étape 1 : résumer chaque fichier via /api/summarize ── */
      const summaries: string[] = [];
      for (const file of files) {
        setLoadingMsg(`Analyse de ${file.name}…`);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/summarize", { method: "POST", body: fd });
        const data = await res.json();
        if (data.error) throw new Error(`Résumé "${file.name}" : ${data.error}`);
        summaries.push(`[Résumé de "${file.name}"] :\n${data.summary}`);
      }

      /* ── Étape 2 : générer le site ── */
      setLoadingMsg("Génération du site…");
      const res = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ description, summaries }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConfig(apiConfigToSiteConfig(data.config));
      setFiles([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 h-14 flex items-center justify-between shrink-0 border-b"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <Link
          href="/"
          className="font-bold text-lg transition-opacity hover:opacity-75"
          style={{ color: "var(--wg-green)" }}
        >
          Webgen
        </Link>

        {config && (
          <div className="flex items-center gap-2">

            {/* Undo / Redo */}
            <div className="flex items-center rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--wg-border)" }}>
              <button
                onClick={undo}
                disabled={past.length === 0}
                title="Annuler (Ctrl+Z)"
                className="flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-30"
                style={{ color: "var(--wg-text-2)", backgroundColor: "transparent" }}
                onMouseEnter={e => { if (past.length) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <div className="w-px h-4" style={{ backgroundColor: "var(--wg-border)" }} />
              <button
                onClick={redo}
                disabled={future.length === 0}
                title="Rétablir (Ctrl+Y)"
                className="flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-30"
                style={{ color: "var(--wg-text-2)", backgroundColor: "transparent" }}
                onMouseEnter={e => { if (future.length) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Télécharger */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              title={config.pages.length > 1 ? "Télécharger en ZIP" : "Télécharger index.html"}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-50"
              style={{ color: "var(--wg-text-2)", borderColor: "var(--wg-border)", backgroundColor: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; e.currentTarget.style.color = "var(--wg-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--wg-text-2)"; }}
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--wg-green) transparent var(--wg-green) var(--wg-green)" }} />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>

            {/* Publier */}
            <button
              onClick={() => setPublishOpen(true)}
              title="Publier le site"
              className="flex items-center justify-center w-8 h-8 rounded-lg btn-green transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>

            {/* Nouveau */}
            <button
              onClick={() => setConfirmNew(true)}
              title="Nouveau site"
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors"
              style={{ color: "var(--wg-text-2)", borderColor: "var(--wg-border)", backgroundColor: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; e.currentTarget.style.color = "var(--wg-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--wg-text-2)"; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </header>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />

      {/* ── Modal confirmation Nouveau ─────────────────── */}
      {confirmNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setConfirmNew(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
            style={{ backgroundColor: "var(--wg-bg-2)", border: "1px solid var(--wg-border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold" style={{ color: "var(--wg-text)" }}>
                Créer un nouveau site ?
              </h2>
              <p className="text-sm" style={{ color: "var(--wg-text-2)" }}>
                Le site actuel sera effacé. Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmNew(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
                style={{ color: "var(--wg-text-2)", borderColor: "var(--wg-border)", backgroundColor: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg-3)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Annuler
              </button>
              <button
                onClick={() => { clearConfig(); setConfirmNew(false); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                Effacer et recommencer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Éditeur ou Formulaire ─────────────────────── */}
      {config ? (
        <EditorLayout />
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-6 w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold" style={{ color: "var(--wg-text)" }}>
              Décrivez votre site
            </h1>
            <p className="mt-3 text-lg" style={{ color: "var(--wg-text-2)" }}>
              L&apos;IA génère le contenu, la mise en page et les couleurs en quelques secondes.
            </p>
          </div>

          {/* Textarea */}
          <div
            className="rounded-xl border overflow-hidden transition-shadow"
            style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
            onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.18)")}
            onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
          >
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ex : Site pour une boulangerie artisanale à Lyon. Style chaleureux et moderne. Sections : accueil, nos pains, avis clients, contact."
              rows={6}
              className="w-full px-4 py-3 text-sm resize-none focus:outline-none bg-transparent"
              style={{ color: "var(--wg-text)" }}
            />

            {/* Fichiers attachés */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: "var(--wg-bg-3)",
                      borderColor:     "var(--wg-border)",
                      color:           "var(--wg-text-2)",
                    }}
                  >
                    {f.type === "application/pdf" ? "📄" : "🖼️"}
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity leading-none"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Barre d'actions bas */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t"
              style={{ borderColor: "var(--wg-border)" }}
            >
              {/* Bouton attacher */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: "var(--wg-text-3)" }}
                title="Ajouter des images ou un PDF comme contexte"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Joindre PDF / images
              </button>

              <span className="text-xs" style={{ color: "var(--wg-text-3)" }}>
                ⌘ + Entrée pour générer
              </span>
            </div>
          </div>

          {/* Input fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-lg"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}
            >
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={loading || !description.trim()}
            className="btn-green w-full py-3 rounded-xl text-base font-semibold"
          >
            {loading ? (loadingMsg || "Génération en cours…") : "Générer mon site →"}
          </button>

          {loading && (
            <div className="flex items-center justify-center gap-3 text-sm" style={{ color: "var(--wg-text-3)" }}>
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--wg-green) transparent var(--wg-green) var(--wg-green)" }}
              />
              {files.length > 0 ? "Analyse des fichiers…" : "L\u2019IA assemble votre site…"}
            </div>
          )}

          <p className="text-xs text-center" style={{ color: "var(--wg-text-3)" }}>
            Résultat en ~10 secondes · PDF et images utilisés comme contexte
          </p>
        </div>
      )}
    </div>
  );
}
