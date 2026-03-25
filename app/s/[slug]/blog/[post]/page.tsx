import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SiteConfig } from "@/app/store/siteStore";

interface Props {
  params: Promise<{ slug: string; post: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, post: postSlug } = await params;

  const [siteRes, postRes] = await Promise.all([
    supabase.from("sites").select("config").eq("slug", slug).single(),
    supabase
      .from("posts")
      .select("*")
      .eq("site_slug", slug)
      .eq("slug", postSlug)
      .eq("published", true)
      .single(),
  ]);

  if (siteRes.error || !siteRes.data) notFound();
  if (postRes.error || !postRes.data) notFound();

  const config = siteRes.data.config as SiteConfig;
  const theme  = config.theme;
  const post   = postRes.data as {
    title: string; content: string; excerpt?: string;
    cover_url?: string; published_at?: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw      = config as any;
  const pages    = Array.isArray(config.pages) ? config.pages : [];
  const home     = pages[0];
  const siteName = String(home?.data?.navbar?.logo || home?.data?.hero?.title || raw?.data?.navbar?.logo || slug);
  const font     = theme?.font || "Inter";
  const fontUrl  = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;

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
    a { color: var(--color-primary); }
  `;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{post.title} — {siteName}</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <style>{cssVars}</style>
        <style>{`
          .blog-header { padding: 20px 24px; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
          .blog-header a { font-size: 15px; color: var(--color-text-muted); text-decoration: none; }
          .blog-header a:hover { color: var(--color-primary); }
          .post-main { max-width: 720px; margin: 0 auto; padding: 60px 24px 100px; }
          .post-cover { width: 100%; max-height: 420px; object-fit: cover; border-radius: 12px; margin-bottom: 40px; }
          .post-date { font-size: 13px; color: var(--color-text-muted); margin-bottom: 12px; }
          .post-title { font-size: 40px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
          .post-excerpt { font-size: 18px; color: var(--color-text-muted); margin-bottom: 40px; border-left: 3px solid var(--color-primary); padding-left: 16px; }
          .post-content { font-size: 16px; line-height: 1.8; }
          .post-content p { margin-bottom: 20px; }
          .post-content h2 { font-size: 24px; font-weight: 700; margin: 36px 0 16px; }
          .post-content h3 { font-size: 20px; font-weight: 600; margin: 28px 0 12px; }
          .post-content ul, .post-content ol { padding-left: 24px; margin-bottom: 20px; }
          .post-content li { margin-bottom: 6px; }
          .post-content pre { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin-bottom: 20px; font-size: 14px; }
          .post-content code { background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 14px; }
          .post-content pre code { background: none; padding: 0; }
          .post-content img { max-width: 100%; border-radius: 8px; }
          .post-content blockquote { border-left: 3px solid var(--color-primary); padding-left: 16px; color: var(--color-text-muted); margin-bottom: 20px; }
        `}</style>
      </head>
      <body>
        <header className="blog-header">
          <a href={`/s/${slug}/blog`}>← Retour au blog</a>
        </header>
        <main className="post-main">
          {post.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_url} alt={post.title} className="post-cover" />
          )}
          {post.published_at && (
            <p className="post-date">
              {new Date(post.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <h1 className="post-title">{post.title}</h1>
          {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </main>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug, post: postSlug } = await params;
  try {
    const { data } = await supabase
      .from("posts")
      .select("title, excerpt")
      .eq("site_slug", slug)
      .eq("slug", postSlug)
      .single();
    if (!data) return { title: postSlug };
    return { title: data.title, description: data.excerpt ?? undefined };
  } catch {
    return { title: postSlug };
  }
}
