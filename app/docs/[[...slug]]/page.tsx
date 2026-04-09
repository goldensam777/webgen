// app/docs/[[...slug]]/page.tsx
import { notFound }    from "next/navigation";
import { MDXRemote }   from "next-mdx-remote/rsc";
import remarkGfm       from "remark-gfm";
import rehypeSlug      from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import Link            from "next/link";
import { getDoc, extractToc, getAllDocSlugs, type TocEntry } from "@/lib/docs";
import { getAdjacentSlugs, DOCS_NAV }                       from "@/lib/docs-nav";
import { mdxComponents }                                     from "@/components/docs/MDXComponents";
import "highlight.js/styles/github-dark.css";

/* ── Params ─────────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

/* ── Static params ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return getAllDocSlugs().map(slug => ({ slug: [slug] }));
}

/* ── Metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: PageProps) {
  const { slug: slugArr } = await params;
  const slug = slugArr?.[0] ?? "introduction";
  try {
    const { meta } = getDoc(slug);
    return { title: meta.title, description: meta.description };
  } catch {
    return {};
  }
}

/* ── TOC Component ──────────────────────────────────────────── */

function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <aside className="hidden xl:block w-52 shrink-0 sticky top-20 h-fit pl-6">
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--wg-text-3)" }}>
        Sur cette page
      </p>
      <ul className="flex flex-col gap-1">
        {entries.map(e => (
          <li key={e.id} style={{ paddingLeft: e.level === 3 ? "12px" : "0" }}>
            <a
              href={`#${e.id}`}
              className="text-xs leading-relaxed transition-colors hover:opacity-80 block py-0.5"
              style={{ color: "var(--wg-text-3)" }}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ── Breadcrumb ─────────────────────────────────────────────── */

function Breadcrumb({ slug }: { slug: string }) {
  const cat = DOCS_NAV.find(c => c.slugs.includes(slug));
  return (
    <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--wg-text-3)" }}>
      <Link href="/docs" className="hover:opacity-80 transition-opacity">Docs</Link>
      {cat && (
        <>
          <span>/</span>
          <span>{cat.category}</span>
        </>
      )}
    </div>
  );
}

/* ── Prev / Next ────────────────────────────────────────────── */

async function PrevNext({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentSlugs(slug);
  if (!prev && !next) return null;

  const prevMeta = prev ? getDoc(prev).meta : null;
  const nextMeta = next ? getDoc(next).meta : null;

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t" style={{ borderColor: "var(--wg-border)" }}>
      {prevMeta ? (
        <Link
          href={`/docs/${prev}`}
          className="flex flex-col gap-1 text-sm transition-opacity hover:opacity-80 max-w-[45%]"
        >
          <span className="text-xs" style={{ color: "var(--wg-text-3)" }}>← Précédent</span>
          <span className="font-medium" style={{ color: "var(--wg-text)" }}>{prevMeta.title}</span>
        </Link>
      ) : <div />}

      {nextMeta && (
        <Link
          href={`/docs/${next}`}
          className="flex flex-col gap-1 text-sm text-right transition-opacity hover:opacity-80 max-w-[45%]"
        >
          <span className="text-xs" style={{ color: "var(--wg-text-3)" }}>Suivant →</span>
          <span className="font-medium" style={{ color: "var(--wg-text)" }}>{nextMeta.title}</span>
        </Link>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function DocPage({ params }: PageProps) {
  const { slug: slugArr } = await params;
  const slug = slugArr?.[0] ?? "introduction";

  let meta, content: string;
  try {
    ({ meta, content } = getDoc(slug));
  } catch {
    notFound();
  }

  const toc = extractToc(content);

  return (
    <div className="flex gap-8 max-w-5xl">
      {/* Article */}
      <article className="flex-1 min-w-0">
        <Breadcrumb slug={slug} />

        <h1
          className="text-4xl font-bold mb-3 leading-tight"
          style={{ color: "var(--wg-text)" }}
        >
          {meta.title}
        </h1>
        {meta.description && (
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--wg-text-2)" }}>
            {meta.description}
          </p>
        )}

        <div className="prose-webgen">
          <MDXRemote
            source={content}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            components={mdxComponents as any}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  rehypeHighlight,
                ],
              },
            }}
          />
        </div>

        <PrevNext slug={slug} />
      </article>

      {/* TOC */}
      <TableOfContents entries={toc} />
    </div>
  );
}
