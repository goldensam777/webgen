import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  params: Promise<{ slug: string; page: string }>;
}

export default async function SiteSubPage({ params }: PageProps) {
  const { slug, page: pageSlug } = await params;

  const { data, error } = await supabase
    .from("sites")
    .select("config")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();
  const config = data.config as SiteConfig;

  if (!Array.isArray(config.pages)) notFound();

  const page: SitePage | undefined = config.pages.find(p => p.slug === pageSlug);
  if (!page) notFound();

  const { theme } = config;
  const title = (page.data.navbar?.logo as string)
             || (page.data.hero?.title as string)
             || page.name;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style>{`
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
        `}</style>
      </head>
      <body>
        {page.sections.map((section) => {
          const Component   = SECTION_MAP[section];
          const sectionData = (page.data[section] ?? {}) as Record<string, unknown>;
          if (!Component) return null;
          return <Component key={section} {...sectionData} />;
        })}
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, page: pageSlug } = await params;
  return { title: `${pageSlug} — ${slug}` };
}
