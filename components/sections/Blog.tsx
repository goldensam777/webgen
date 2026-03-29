import React from "react";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

interface BlogPost {
  id:    string;
  title: string;
  excerpt?: string;
  cover_url?: string;
  published_at?: string;
  slug:  string;
}

interface BlogProps {
  title?:       string;
  subtitle?:    string;
  ctaLabel?:    string;
  posts?:       BlogPost[];
  siteSlug?:    string;
  bgColor?:     string;
  titleColor?:  string;
}

export function Blog({
  title       = "Notre Blog",
  subtitle    = "Articles et actualités",
  ctaLabel    = "Voir tous les articles",
  posts       = [],
  siteSlug,
  bgColor     = "var(--color-background)",
  titleColor  = "var(--color-text)",
}: BlogProps) {
  const blogUrl = siteSlug ? `/s/${siteSlug}/blog` : "#";

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: titleColor }}>
            <EditableText field="title" value={title} />
          </h2>
          {subtitle && (
            <p className="text-lg break-words" style={{ color: "var(--color-text-muted)" }}>
              <EditableText field="subtitle" value={subtitle} />
            </p>
          )}
        </div>

        {posts.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            <p className="text-lg mb-2">Aucun article publié pour l&apos;instant.</p>
            <p className="text-sm">Gérez votre blog via /manage/{siteSlug ?? "votre-site"}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {posts.slice(0, 3).map(post => (
              <CanvasElement key={post.id ?? post.slug} id={`post-${post.slug}`}>
                <a
                  href={siteSlug ? `/s/${siteSlug}/blog/${post.slug}` : "#"}
                  className="block rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                >
                  {post.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-44 object-cover"
                    />
                  )}
                  <div className="p-5">
                    {post.published_at && (
                      <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(post.published_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                    <h3 className="font-semibold text-base mb-1 leading-snug break-words" style={{ color: titleColor }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm break-words" style={{ color: "var(--color-text-muted)" }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </a>
              </CanvasElement>
            ))}
          </div>
        )}

        {ctaLabel && (
          <div className="text-center">
            <a
              href={blogUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              <EditableText field="ctaLabel" value={ctaLabel} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
