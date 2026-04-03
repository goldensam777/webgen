import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact, Blog, ChatWidget,
} from "@/components";
import { EditableContext } from "@/components/editor/EditableContext";
import type { FieldStyle, ElementStyle } from "@/components/editor/EditableContext";
import type { SiteConfig, SitePage } from "@/app/store/siteStore";
import { buildAnimClass } from "@/lib/animations";
import type { SectionAnimation } from "@/lib/animations";
import { normalizeSectionData, rewriteSectionLinks, sectionAnchorId } from "@/lib/site-schema";

/* Inline animation CSS once at build/request time */
const ANIM_CSS = (() => {
  try {
    return readFileSync(path.join(process.cwd(), "lib/animations.css"), "utf8");
  } catch { return ""; }
})();

/* Inline scroll-observer script for entrance animations */
const SCROLL_SCRIPT = `
(function(){
  var els = document.querySelectorAll('.wg-anim');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) { e.target.classList.add('wg-play'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function(el){ io.observe(el); });
  // load-triggered: play immediately
  document.querySelectorAll('.wg-anim[data-trigger="load"]').forEach(function(el){
    el.classList.add('wg-play');
  });
})();
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar, hero: Hero, features: Features, stats: Stats,
  testimonials: Testimonials, pricing: Pricing, faq: FAQ,
  cta: CTA, contact: Contact, footer: Footer,
  blog: Blog, chatwidget: ChatWidget,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadConfig(slug: string): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from("sites")
    .select("config")
    .eq("slug", slug)
    .single();

  if (error || !data) throw new Error("Site not found");
  return data.config as SiteConfig;
}

function renderPage(
  page: SitePage,
  theme: SiteConfig["theme"],
  slug: string,
  sitePages: SitePage[]
) {
  const font    = theme.font || "Inter";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;
  const cssVars = `
    :root {
      --color-primary:    ${theme.primary};
      --color-secondary:  ${theme.secondary};
      --color-background: ${theme.background};
      --color-surface:    ${theme.surface};
      --color-text:       ${theme.text};
      --color-text-muted: ${theme.textMuted};
      --color-border:     ${theme.border};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: '${font}', system-ui, sans-serif; overflow-x: hidden; }
  `;

  const title = (page.data.navbar?.logo as string)
             || (page.data.hero?.title as string)
             || page.name;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <style>{cssVars}</style>
        <style>{ANIM_CSS}</style>
      </head>
      <body>
        {page.sections.map((section) => {
          const Component   = SECTION_MAP[section];
          const sectionData = normalizeSectionData(section, page.data[section] ?? {});
          if (!Component) return null;

          const fieldStyles   = ((sectionData._styles   ?? {}) as Record<string, FieldStyle>);
          const elementStyles = ((sectionData._elStyles  ?? {}) as Record<string, ElementStyle>);
          const cleanData = rewriteSectionLinks(
            Object.fromEntries(
              Object.entries(sectionData).filter(([k]) => !k.startsWith("_"))
            ),
            sitePages,
            slug
          );

          const slugSections = new Set(["contact", "blog", "chatwidget"]);
          const extraProps = slugSections.has(section) ? { siteSlug: slug } : {};

          const sectionAnims: SectionAnimation[] = page.animations?.[section] ?? [];
          const animClass = sectionAnims.map(a => buildAnimClass(a)).filter(Boolean).join(" ");
          const trigger   = sectionAnims[0]?.trigger ?? "scroll";

          return (
            <div key={section} id={sectionAnchorId(section)} className={animClass || undefined}
              {...(animClass ? { "data-trigger": trigger } : {})}>
              <EditableContext.Provider
                value={{
                  isEditing: false,
                  canvasMode: false,
                  fieldStyles,
                  elementStyles,
                  onUpdate: () => {},
                  onStyleUpdate: () => {},
                  onElementStyleUpdate: () => {},
                }}
              >
                <Component {...cleanData} {...extraProps} />
              </EditableContext.Provider>
            </div>
          );
        })}
        <script dangerouslySetInnerHTML={{ __html: SCROLL_SCRIPT }} />
      </body>
    </html>
  );
}

/* ── Home page : /s/[slug] ────────────────────────────────── */
export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;

  let config: SiteConfig;
  try {
    config = await loadConfig(slug);
  } catch {
    notFound();
  }

  // Support ancien format mono-page (sections + data flat)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = config as any;
  if (!Array.isArray(config.pages) && raw.sections) {
    const page: SitePage = {
      id: "home", name: "Accueil", slug: "",
      sections: raw.sections,
      data:     raw.data ?? {},
    };
    return renderPage(page, config.theme ?? raw.theme, slug, [page]);
  }

  const homePage = config.pages[0];
  if (!homePage) notFound();

  return renderPage(homePage, config.theme, slug, config.pages);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const config = await loadConfig(slug);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw  = config as any;
    const page = Array.isArray(config.pages) ? config.pages[0] : null;

    const title = String(
      page?.data?.navbar?.logo  ||
      page?.data?.hero?.title   ||
      raw?.data?.navbar?.logo   ||
      slug
    );
    const description = String(
      page?.data?.hero?.description ||
      page?.data?.hero?.subtitle    ||
      `Site web créé avec Webgenx — ${title}`
    );
    const siteUrl = `https://webgenx.app/s/${slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url:      siteUrl,
        type:     "website",
        locale:   "fr_FR",
      },
      twitter: {
        card:        "summary",
        title,
        description,
      },
      alternates: { canonical: siteUrl },
    };
  } catch {
    return { title: slug };
  }
}
