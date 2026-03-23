// app/page.tsx
"use client";
import { useState } from "react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PublishModal } from "@/components/editor/PublishModal";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";

export default function WebgenPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const { config, setConfig, clearConfig } = useSiteStore();

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConfig(apiConfigToSiteConfig(data.config));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200
        px-6 h-14 flex items-center justify-between shrink-0">
        <span className="font-bold text-lg text-gray-900">Webgen</span>
        {config && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPublishOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm
                font-semibold hover:bg-blue-700 transition-colors"
            >
              Publier →
            </button>
            <button
              onClick={() => clearConfig()}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Nouveau site
            </button>
          </div>
        )}
      </header>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />

      {/* ── Éditeur ou Formulaire ─────────────────────── */}
      {config ? (
        <EditorLayout />
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-6 w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Créez votre site en secondes
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Décrivez votre projet, l&apos;IA génère le reste.
            </p>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Site pour mon agence de design à Cotonou. Style moderne. Sections : accueil, services, témoignages, contact."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300
              text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent resize-none text-sm"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={loading || !description.trim()}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
              hover:bg-blue-700 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed"
          >
            {loading ? "Génération en cours..." : "Générer mon site →"}
          </button>

          {loading && (
            <div className="flex items-center justify-center gap-3
              text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600
                border-t-transparent rounded-full animate-spin" />
              L&apos;IA assemble votre site...
            </div>
          )}
        </div>
      )}
    </div>
  );
}