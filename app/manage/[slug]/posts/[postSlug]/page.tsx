"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sharedStyles, PostForm, PostFormData } from "../../posts/new/page";

export default function EditPost() {
  const { slug, postSlug } = useParams<{ slug: string; postSlug: string }>();
  const router = useRouter();

  const [form, setForm] = useState<PostFormData>({
    title:     "",
    slug:      postSlug,
    excerpt:   "",
    content:   "",
    cover_url: "",
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/blog/${slug}/${postSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.post) {
          setForm({
            title:     d.post.title     ?? "",
            slug:      d.post.slug      ?? postSlug,
            excerpt:   d.post.excerpt   ?? "",
            content:   d.post.content   ?? "",
            cover_url: d.post.cover_url ?? "",
            published: d.post.published ?? false,
          });
        }
        setLoading(false);
      });
  }, [slug, postSlug]);

  function toSlug(s: string) {
    return s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function save(publish?: boolean) {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Titre et contenu sont requis.");
      return;
    }
    setSaving(true);
    setError("");
    const body = { ...form } as Record<string, unknown>;
    if (publish !== undefined) body.published = publish;

    const res = await fetch(`/api/blog/${slug}/${postSlug}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erreur"); setSaving(false); return; }
    router.push(`/manage/${slug}`);
  }

  const s = sharedStyles();

  if (loading) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <a href={`/manage/${slug}`} style={s.back}>← Retour</a>
        <span style={s.headerTitle}>Éditer l&apos;article</span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`/s/${slug}/blog/${postSlug}`} target="_blank" rel="noreferrer"
            style={{ ...s.back, padding: "9px 18px" }}>Voir →</a>
          <button style={{ ...s.btn, ...s.btnGhost }}
            onClick={() => save(form.published ? undefined : false)} disabled={saving}>
            Enregistrer
          </button>
          {!form.published && (
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => save(true)} disabled={saving}>
              {saving ? "…" : "Publier"}
            </button>
          )}
        </div>
      </header>
      <main style={s.main}>
        {error && <p style={s.error}>{error}</p>}
        <PostForm form={form} setForm={setForm} toSlug={toSlug} s={s} />
      </main>
    </div>
  );
}
