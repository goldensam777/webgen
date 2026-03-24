import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact,
} from "@/components";
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
  const raw = await readFile(
    path.join(process.cwd(), "data", "sites", `${slug}.json`),
    "utf-8"
  );
  return JSON.parse(raw).config as SiteConfig;
}

function renderPage(page: SitePage, theme: SiteConfig["theme"]) {
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
    body { font-family: system-ui, -apple-system, sans-serif; }
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
        <style>{cssVars}</style>
      </head>
      <body>
        {page.sections.map((section) => {
          const Component  = SECTION_MAP[section];
          const sectionData = (page.data[section] ?? {}) as Record<string, unknown>;
          if (!Component) return null;
          return <Component key={section} {...sectionData} />;
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
    const raw = config as any;
    const page = Array.isArray(config.pages) ? config.pages[0] : null;
    const title = page?.data?.navbar?.logo
               || page?.data?.hero?.title
               || raw?.data?.navbar?.logo
               || slug;
    return { title: String(title) };
  } catch {
    return { title: slug };
  }
}
