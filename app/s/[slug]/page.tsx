import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact,
} from "@/components";
import { EditableContext } from "@/components/editor/EditableContext";
import type { FieldStyle, ElementStyle } from "@/components/editor/EditableContext";
import type { SiteConfig, SitePage } from "@/app/store/siteStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar, hero: Hero, features: Features, stats: Stats,
  testimonials: Testimonials, pricing: Pricing, faq: FAQ,
  cta: CTA, contact: Contact, footer: Footer,
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

function renderPage(page: SitePage, theme: SiteConfig["theme"]) {
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
    body { font-family: '${font}', system-ui, sans-serif; }
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
      </head>
      <body>
        {page.sections.map((section) => {
          const Component   = SECTION_MAP[section];
          const sectionData = (page.data[section] ?? {}) as Record<string, unknown>;
          if (!Component) return null;

          const fieldStyles   = ((sectionData._styles   ?? {}) as Record<string, FieldStyle>);
          const elementStyles = ((sectionData._elStyles  ?? {}) as Record<string, ElementStyle>);
          const cleanData     = Object.fromEntries(
            Object.entries(sectionData).filter(([k]) => !k.startsWith("_"))
          );

          return (
            <EditableContext.Provider
              key={section}
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
              <Component {...cleanData} />
            </EditableContext.Provider>
          );
        })}
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
    return renderPage(page, config.theme ?? raw.theme);
  }

  const homePage = config.pages[0];
  if (!homePage) notFound();

  return renderPage(homePage, config.theme);
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
      `Site web créé avec Webgen — ${title}`
    );
    const siteUrl = `https://webgen.app/s/${slug}`;

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
