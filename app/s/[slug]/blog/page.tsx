import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SiteConfig } from "@/app/store/siteStore";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogListPage({ params }: Props) {
  const { slug } = await params;

  const [siteRes, postsRes] = await Promise.all([
    supabase.from("sites").select("config").eq("slug", slug).single(),
    supabase
      .from("posts")
      .select("slug, title, excerpt, cover_url, published_at")
      .eq("site_slug", slug)
      .eq("published", true)
      .order("published_at", { ascending: false }),
  ]);

  if (siteRes.error || !siteRes.data) notFound();

  const config = siteRes.data.config as SiteConfig;
  const theme  = config.theme;
  const posts  = postsRes.data ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw     = config as any;
  const pages   = Array.isArray(config.pages) ? config.pages : [];
  const home    = pages[0];
  const siteName = String(home?.data?.navbar?.logo || home?.data?.hero?.title || raw?.data?.navbar?.logo || slug);
  const font    = theme?.font || "Inter";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;

  const cssVars = `
    :root {
      --color-primary:    ${theme?.primary    ?? "#2563eb"};
      --color-secondary:  ${theme?.secondary  ?? "#7c3aed"};
      --color-background: ${theme?.background ?? "#f9fafb"};
      --color-surface:    ${theme?.surface    ?? "#ffffff"};
      --color-text:       ${theme?.text       ?? "#111827"};
      --color-text-muted: ${theme?.textMuted  ?? "#6b7280"};
      --color-border:     ${theme?.border     ?? "#e5e7eb"};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: '${font}', system-ui, sans-serif; background: var(--color-background); color: var(--color-text); }
    a { color: inherit; text-decoration: none; }
  `;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Blog — {siteName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <style>{cssVars}</style>
        <style>{`
          .blog-header { padding: 20px 24px; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
          .blog-header a { font-size: 18px; font-weight: 700; color: var(--color-text); }
          .blog-header a:hover { color: var(--color-primary); }
          .blog-main { max-width: 900px; margin: 0 auto; padding: 60px 24px; }
          .blog-title { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
          .blog-subtitle { color: var(--color-text-muted); margin-bottom: 48px; }
          .post-grid { display: grid; gap: 28px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
          .post-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s; }
          .post-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .post-cover { width: 100%; height: 180px; object-fit: cover; }
          .post-body { padding: 20px; }
          .post-date { font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px; }
          .post-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
          .post-name:hover { color: var(--color-primary); }
          .post-excerpt { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; }
          .empty { text-align: center; padding: 80px 0; color: var(--color-text-muted); }
        `}</style>
      </head>
      <body>
        <header className="blog-header">
          <a href={`/s/${slug}`}>← {siteName}</a>
        </header>
        <main className="blog-main">
          <h1 className="blog-title">Blog</h1>
          <p className="blog-subtitle">{posts.length} article{posts.length !== 1 ? "s" : ""} publié{posts.length !== 1 ? "s" : ""}</p>
          {posts.length === 0 ? (
            <div className="empty">Aucun article publié pour l&apos;instant.</div>
          ) : (
            <div className="post-grid">
              {posts.map(post => (
                <a key={post.slug} href={`/s/${slug}/blog/${post.slug}`} className="post-card">
                  {post.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_url} alt={post.title} className="post-cover" />
                  )}
                  <div className="post-body">
                    {post.published_at && (
                      <p className="post-date">
                        {new Date(post.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                    <p className="post-name">{post.title}</p>
                    {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </body>
    </html>
  );
}
