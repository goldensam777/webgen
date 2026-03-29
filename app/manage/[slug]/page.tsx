"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  published: boolean;
  published_at?: string;
  updated_at?: string;
}

export default function ManageDashboard() {
  const { slug }  = useParams<{ slug: string }>();
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blog/${slug}?all=1`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  async function togglePublish(post: Post) {
    await fetch(`/api/blog/${slug}/${post.slug}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ published: !post.published }),
    });
    setPosts(ps => ps.map(p => p.slug === post.slug ? { ...p, published: !p.published } : p));
  }

  async function deletePost(post: Post) {
    if (!confirm(`Supprimer l'article "${post.title}" ?`)) return;
    setDeleting(post.slug);
    await fetch(`/api/blog/${slug}/${post.slug}`, { method: "DELETE" });
    setPosts(ps => ps.filter(p => p.slug !== post.slug));
    setDeleting(null);
  }

  const s: Record<string, React.CSSProperties> = {
    page:    { minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", padding: "0" },
    header:  { padding: "20px 32px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo:    { fontSize: 18, fontWeight: 700 },
    back:    { fontSize: 13, color: "#94a3b8", textDecoration: "none" },
    main:    { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
    topRow:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
    h1:      { fontSize: 28, fontWeight: 800 },
    btn:     { padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 },
    btnPrimary: { background: "#2563eb", color: "#fff" },
    card:    { background: "#1e293b", borderRadius: 12, padding: "20px 24px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 },
    postTitle: { fontWeight: 600, fontSize: 16, flex: 1 },
    postMeta:  { fontSize: 12, color: "#64748b", marginTop: 4 },
    badge:   { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    actions: { display: "flex", gap: 8 },
    actionBtn: { padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13 },
    empty:   { textAlign: "center", padding: "80px 0", color: "#64748b" },
    viewLink: { fontSize: 13, color: "#94a3b8", textDecoration: "none" },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>Webgen — Blog</span>
        <a href={`/s/${slug}`} style={s.back} target="_blank" rel="noreferrer">
          Voir le site →
        </a>
      </header>
      <main style={s.main}>
        <div style={s.topRow}>
          <h1 style={s.h1}>Articles</h1>
          <Link href={`/manage/${slug}/posts/new`}>
            <button style={{ ...s.btn, ...s.btnPrimary }}>+ Nouvel article</button>
          </Link>
        </div>

        {loading ? (
          <div style={s.empty}>Chargement…</div>
        ) : posts.length === 0 ? (
          <div style={s.empty}>Aucun article. Créez-en un !</div>
        ) : (
          posts.map(post => (
            <div key={post.slug} style={s.card}>
              <div style={{ flex: 1 }}>
                <p style={s.postTitle}>{post.title}</p>
                <p style={s.postMeta}>
                  {post.published_at
                    ? `Publié le ${new Date(post.published_at).toLocaleDateString("fr-FR")}`
                    : "Brouillon"}
                  {post.excerpt && ` · ${post.excerpt.slice(0, 60)}…`}
                </p>
              </div>
              <span style={{ ...s.badge, background: post.published ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)", color: post.published ? "#10b981" : "#64748b" }}>
                {post.published ? "Publié" : "Brouillon"}
              </span>
              <div style={s.actions}>
                <a href={`/s/${slug}/blog/${post.slug}`} target="_blank" rel="noreferrer" style={s.viewLink}>Voir</a>
                <Link href={`/manage/${slug}/posts/${post.slug}`}>
                  <button style={{ ...s.actionBtn, background: "#334155", color: "#f1f5f9" }}>Éditer</button>
                </Link>
                <button
                  style={{ ...s.actionBtn, background: post.published ? "#1e293b" : "rgba(37,99,235,0.2)", color: post.published ? "#94a3b8" : "#60a5fa", border: `1px solid ${post.published ? "#334155" : "#2563eb"}` }}
                  onClick={() => togglePublish(post)}
                >
                  {post.published ? "Dépublier" : "Publier"}
                </button>
                <button
                  style={{ ...s.actionBtn, background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                  onClick={() => deletePost(post)}
                  disabled={deleting === post.slug}
                >
                  {deleting === post.slug ? "…" : "Supprimer"}
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
