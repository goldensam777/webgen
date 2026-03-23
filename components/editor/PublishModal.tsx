"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useSiteStore } from "@/app/store/siteStore";

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { config } = useSiteStore();
  const [slug, setSlug]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [published, setPublished] = useState<string | null>(null);

  // Pré-remplir le slug depuis le logo/titre du site
  useEffect(() => {
    if (!isOpen) { setPublished(null); setError(""); return; }
    const raw =
      (config?.data?.navbar?.logo as string) ??
      (config?.data?.hero?.title as string) ??
      "mon-site";
    setSlug(toSlug(raw));
  }, [isOpen, config]);

  const handlePublish = async () => {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/publish", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ slug, config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setPublished(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publier le site" size="sm">
      {published ? (
        /* ── Succès ── */
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">Site publié !</span>
          </div>

          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 font-mono truncate">{published}</span>
            <button
              onClick={() => navigator.clipboard.writeText(published)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
            >
              Copier
            </button>
          </div>

          <a
            href={published}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm
              font-semibold hover:bg-blue-700 transition-colors"
          >
            Voir le site →
          </a>
        </div>
      ) : (
        /* ── Formulaire ── */
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Ton site sera accessible à cette adresse :
          </p>

          {/* URL preview */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-1">
            <span className="text-sm text-gray-400 shrink-0">https://</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                setError("");
              }}
              className="flex-1 bg-transparent text-sm font-mono text-gray-900
                focus:outline-none min-w-0"
              placeholder="mon-site"
              maxLength={40}
            />
            <span className="text-sm text-gray-400 shrink-0">.webgen.app</span>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handlePublish}
            disabled={loading || slug.length < 2}
            className="py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold
              hover:bg-blue-700 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent
                rounded-full animate-spin" />
            )}
            {loading ? "Publication..." : "Publier →"}
          </button>
        </div>
      )}
    </Modal>
  );
}
