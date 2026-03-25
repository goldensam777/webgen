"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewPost() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();

  const [form, setForm] = useState({
    title:     "",
    slug:      "",
    excerpt:   "",
    content:   "",
    cover_url: "",
    published: false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  function toSlug(s: string) {
    return s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleTitle(v: string) {
    setForm(f => ({ ...f, title: v, slug: f.slug || toSlug(v) }));
  }

  async function save(publish = false) {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError("Titre, slug et contenu sont requis.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/blog/${slug}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...form, published: publish }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erreur"); setSaving(false); return; }
    router.push(`/manage/${slug}`);
  }

  const s = sharedStyles();

  return (
    <div style={s.page}>
      <header style={s.header}>
        <a href={`/manage/${slug}`} style={s.back}>← Retour</a>
        <span style={s.headerTitle}>Nouvel article</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => save(false)} disabled={saving}>
            Enregistrer brouillon
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => save(true)} disabled={saving}>
            {saving ? "Enregistrement…" : "Publier"}
          </button>
        </div>
      </header>
      <main style={s.main}>
        {error && <p style={s.error}>{error}</p>}
        <PostForm form={form} setForm={setForm} onTitle={handleTitle} toSlug={toSlug} s={s} />
      </main>
    </div>
  );
}

/* ── Shared form ── */
export interface PostFormData {
  title: string; slug: string; excerpt: string;
  content: string; cover_url: string; published: boolean;
}

function PostForm({ form, setForm, onTitle, toSlug, s }: {
  form: PostFormData;
  setForm: React.Dispatch<React.SetStateAction<PostFormData>>;
  onTitle?: (v: string) => void;
  toSlug: (s: string) => string;
  s: ReturnType<typeof sharedStyles>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <label style={s.label}>
        Titre *
        <input style={s.input} value={form.title as string}
          onChange={e => onTitle ? onTitle(e.target.value) : setForm(f => ({ ...f, title: e.target.value }))} />
      </label>
      <label style={s.label}>
        Slug (URL) *
        <input style={s.input} value={form.slug as string}
          onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))} />
        <span style={s.hint}>/s/…/blog/<strong>{(form.slug as string) || "mon-article"}</strong></span>
      </label>
      <label style={s.label}>
        Extrait
        <input style={s.input} value={form.excerpt as string}
          onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
          placeholder="Court résumé affiché dans la liste" />
      </label>
      <label style={s.label}>
        Image de couverture (URL)
        <input style={s.input} value={form.cover_url as string}
          onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
          placeholder="https://…" />
      </label>
      <label style={s.label}>
        Contenu (HTML) *
        <textarea
          style={{ ...s.input, minHeight: 400, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
          value={form.content as string}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="<p>Votre contenu ici…</p>"
        />
        <span style={s.hint}>HTML accepté — utilisez &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;img&gt;, &lt;pre&gt;, &lt;blockquote&gt;…</span>
      </label>
    </div>
  );
}

function sharedStyles() {
  return {
    page:        { minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" } as React.CSSProperties,
    header:      { padding: "16px 32px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties,
    headerTitle: { fontWeight: 700, fontSize: 16 } as React.CSSProperties,
    back:        { fontSize: 13, color: "#94a3b8", textDecoration: "none" } as React.CSSProperties,
    main:        { maxWidth: 760, margin: "0 auto", padding: "40px 24px 100px" } as React.CSSProperties,
    label:       { display: "flex", flexDirection: "column" as const, gap: 8, fontSize: 14, fontWeight: 500 },
    input:       { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" } as React.CSSProperties,
    hint:        { fontSize: 12, color: "#64748b" } as React.CSSProperties,
    btn:         { padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 } as React.CSSProperties,
    btnPrimary:  { background: "#2563eb", color: "#fff" } as React.CSSProperties,
    btnGhost:    { background: "#1e293b", color: "#94a3b8" } as React.CSSProperties,
    error:       { padding: "10px 16px", background: "rgba(239,68,68,0.1)", color: "#f87171", borderRadius: 8, marginBottom: 20, fontSize: 14 } as React.CSSProperties,
  };
}

export { PostForm, sharedStyles };
