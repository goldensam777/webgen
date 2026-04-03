"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useSiteStore } from "@/app/store/siteStore";
import { useAuthStore } from "@/app/store/authStore";

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
  const { token }  = useAuthStore();
  const [slug, setSlug]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [published, setPublished] = useState<string | null>(null);

  // Pré-remplir le slug depuis le logo/titre du site
  useEffect(() => {
    if (!isOpen) { setPublished(null); setError(""); return; }
    const homeData = config?.pages?.[0]?.data ?? {};
    const raw =
      (homeData?.navbar?.logo as string) ??
      (homeData?.hero?.title as string) ??
      "mon-site";
    setSlug(toSlug(raw));
  }, [isOpen, config]);

  const handlePublish = async () => {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/publish", {
        method:  "POST",
        headers,
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
          <div className="flex items-center gap-2" style={{ color: "var(--wg-green)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">Site publié !</span>
          </div>

          <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 border"
            style={{ backgroundColor: "var(--wg-bg-3)", borderColor: "var(--wg-border)" }}>
            <span className="text-sm font-mono truncate" style={{ color: "var(--wg-text)" }}>{published}</span>
            <button
              onClick={() => navigator.clipboard.writeText(published)}
              className="text-xs font-medium shrink-0 transition-opacity hover:opacity-70"
              style={{ color: "var(--wg-green)" }}
            >
              Copier
            </button>
          </div>

          <a
            href={published}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-green text-center py-2.5 rounded-xl text-sm font-semibold block"
          >
            Voir le site →
          </a>
        </div>
      ) : (
        /* ── Formulaire ── */
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--wg-text-2)" }}>
            Votre site sera accessible à cette adresse :
          </p>

          {/* URL preview */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-1 border"
            style={{ backgroundColor: "var(--wg-bg-3)", borderColor: "var(--wg-border)" }}
          >
            <span className="text-sm shrink-0" style={{ color: "var(--wg-text-3)" }}>https://</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                setError("");
              }}
              className="flex-1 bg-transparent text-sm font-mono focus:outline-none min-w-0"
              style={{ color: "var(--wg-text)" }}
              placeholder="mon-site"
              maxLength={40}
            />
            <span className="text-sm shrink-0" style={{ color: "var(--wg-text-3)" }}>.webgenx.app</span>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handlePublish}
            disabled={loading || slug.length < 2}
            className="btn-green py-2.5 rounded-xl text-sm font-semibold
              flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Publication…" : "Publier →"}
          </button>
        </div>
      )}
    </Modal>
  );
}
