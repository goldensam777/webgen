// app/create/page.tsx — Immersive IA Studio Redesign
"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PublishModal } from "@/components/editor/PublishModal";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";
import { useHydrated } from "@/lib/use-hydrated";

const ACCEPTED_EXTS = ".pdf,.md,.txt,.csv,.json,.xml,.html,.htm,image/*";

/* ── Icons ────────────── */
const Icons = {
  File: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Attach: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  Sparkle: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
};

function fileIcon(f: File) {
  if (f.type.startsWith("image/")) return <Icons.Image />;
  return <Icons.File />;
}

function isAccepted(f: File): boolean {
  if (f.type.startsWith("image/")) return true;
  if (f.type === "application/pdf") return true;
  const textTypes = new Set([
    "text/markdown","text/plain","text/csv","text/html","text/xml",
    "application/json","application/xml","application/x-markdown",
  ]);
  if (textTypes.has(f.type)) return true;
  return /\.(md|txt|csv|json|xml|html|htm)$/i.test(f.name);
}

const EXAMPLES = [
  { label: "Boulangerie Artisanale", prompt: "Une boulangerie moderne à Lyon, ambiance bois et épi de blé.", color: "from-amber-500/20" },
  { label: "Studio de Design", prompt: "Agence créative minimaliste, typo grasse, noir et blanc.", color: "from-purple-500/20" },
  { label: "Cabinet Médical", prompt: "Médecin généraliste, confiance, bleu calme, prise de rendez-vous.", color: "from-blue-500/20" },
];

export default function CreatePage() {
  const [description, setDescription]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [loadingMsg, setLoadingMsg]     = useState("");
  const [error, setError]               = useState("");
  const [publishOpen, setPublishOpen]   = useState(false);
  const [confirmNew,  setConfirmNew]    = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [files, setFiles]               = useState<File[]>([]);
  const [dragging, setDragging]         = useState(false);
  
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const { config, setConfig, clearConfig, undo, redo, past, future } = useSiteStore();
  const hydrated                        = useHydrated();

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
      a.href         = url;
      a.download     = config.pages.length > 1 ? "site.zip" : "index.html";
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Erreur lors du téléchargement."); }
    finally { setDownloading(false); }
  };

  if (!hydrated) return <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }} />;

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const allowed = Array.from(incoming).filter(isAccepted);
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...allowed.filter(f => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    try {
      const summaries: string[] = [];
      for (const file of files) {
        setLoadingMsg(`Lecture de ${file.name}...`);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/summarize", { method: "POST", body: fd });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        summaries.push(`[Contenu de "${file.name}"] :\n${data.summary}`);
      }
      setLoadingMsg("Assemblage du design...");
      const res = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ summaries, description: description.trim() }),
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

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}>
      
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 px-8 h-16 flex items-center justify-between border-b backdrop-blur-md"
        style={{ backgroundColor: "rgba(var(--wg-bg-rgb), 0.8)", borderColor: "var(--wg-border)" }}>
        
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-emerald-500 group-hover:rotate-12 transition-transform" />
          <span className="font-black tracking-tight text-lg">Webgenx</span>
        </Link>

        {config && (
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center glass rounded-xl border p-0.5" style={{ borderColor: "var(--wg-border)" }}>
              <button onClick={undo} disabled={past.length === 0} className="p-1.5 opacity-50 hover:opacity-100 disabled:opacity-10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
              <button onClick={redo} disabled={future.length === 0} className="p-1.5 opacity-50 hover:opacity-100 disabled:opacity-10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg></button>
            </div>
            {/* Actions */}
            <button onClick={handleDownload} disabled={downloading} className="p-2 glass rounded-xl border opacity-60 hover:opacity-100" style={{ borderColor: "var(--wg-border)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button onClick={() => setPublishOpen(true)} className="btn-green px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">Publier</button>
            <button onClick={() => setConfirmNew(true)} className="p-2 glass rounded-xl border border-red-500/20 text-red-500 opacity-60 hover:opacity-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
          </div>
        )}
      </header>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />

      {config ? (
        <EditorLayout />
      ) : (
        <div className="max-w-3xl mx-auto px-8 py-20 flex flex-col gap-12 w-full">
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Icons.Sparkle /> Studio de Création
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Parlez-moi de <br /><span className="text-gradient">votre projet.</span></h1>
            <p className="text-lg opacity-50 font-medium max-w-xl mx-auto leading-relaxed">
              Décrivez votre activité, vos services ou joignez vos documents. L&apos;IA s&apos;occupe du reste.
            </p>
          </div>

          {/* Inspiration Grid */}
          {!description && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAMPLES.map(ex => (
                <button key={ex.label} onClick={() => setDescription(ex.prompt)}
                  className={`p-6 rounded-3xl border glass text-left transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${ex.color} to-transparent`}
                  style={{ borderColor: "var(--wg-border)" }}>
                  <p className="font-black text-sm mb-2">{ex.label}</p>
                  <p className="text-[10px] leading-relaxed opacity-50 line-clamp-2">{ex.prompt}</p>
                </button>
              ))}
            </div>
          )}

          {/* Main Area */}
          <div className={`relative rounded-[2.5rem] border-2 transition-all duration-500 shadow-2xl ${dragging ? 'border-emerald-500 scale-[1.01]' : 'border-transparent'}`}
            style={{ backgroundColor: dragging ? 'var(--wg-green-muted)' : 'var(--wg-bg-2)' }}>
            
            <div className="p-8 pb-4">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
                placeholder="Ex : Studio de yoga à Nantes avec un planning et des tarifs..."
                rows={8}
                className="w-full bg-transparent text-xl md:text-2xl font-bold placeholder:opacity-20 resize-none focus:outline-none"
                style={{ outline: "none" }}
              />
            </div>

            {/* Files Attached */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 px-8 pb-4">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border text-[10px] font-bold"
                    style={{ borderColor: "var(--wg-border)" }}>
                    <div className="opacity-50">{fileIcon(f)}</div>
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="ml-1 opacity-30 hover:opacity-100">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Bar */}
            <div className="px-8 py-6 border-t flex items-center justify-between" style={{ borderColor: "var(--wg-border)" }}>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                <Icons.Attach /> Joindre des fichiers
              </button>
              <div className="flex items-center gap-4 text-[10px] font-bold opacity-30 uppercase tracking-widest">
                <span>{description.length} caractères</span>
                <span className="hidden md:inline">⌘ + Entrée pour générer</span>
              </div>
            </div>

            {/* Drop Overlay */}
            {dragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-emerald-500 font-black text-lg uppercase tracking-widest animate-pulse">Déposez vos documents</div>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTS} multiple className="hidden" onChange={e => addFiles(e.target.files)} />

          {/* Action Button */}
          <div className="flex flex-col gap-6 items-center">
            <button
              onClick={generate}
              disabled={loading || !description.trim()}
              className="btn-green w-full py-5 rounded-[2rem] text-lg font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  {loadingMsg}
                </div>
              ) : "Générer mon univers →"}
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Résultat en moins de 30 secondes</p>
          </div>

          {error && (
            <div className="p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Modal confirmation Nouveau ── */}
      {confirmNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/40" onClick={() => setConfirmNew(false)}>
          <div className="w-full max-w-sm glass rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-3xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Réinitialiser ?</h2>
            <p className="text-sm opacity-50 font-medium leading-relaxed">Votre travail actuel sera définitivement effacé. Vous devrez recommencer la description.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { clearConfig(); setConfirmNew(false); }} className="w-full bg-red-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20">Effacer tout</button>
              <button onClick={() => setConfirmNew(false)} className="w-full py-4 text-xs font-black uppercase tracking-widest opacity-40">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
