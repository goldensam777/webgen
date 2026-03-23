import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact,
} from "@/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar, hero: Hero, features: Features, stats: Stats,
  testimonials: Testimonials, pricing: Pricing, faq: FAQ,
  cta: CTA, contact: Contact, footer: Footer,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;

  let config;
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "sites", `${slug}.json`),
      "utf-8"
    );
    config = JSON.parse(raw).config;
  } catch {
    notFound();
  }

  const { sections, theme, data } = config;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{(data.navbar?.logo as string) ?? slug}</title>
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
        {(sections as string[]).map((section) => {
          const Component = SECTION_MAP[section];
          const sectionData = (data[section] ?? {}) as Record<string, unknown>;
          if (!Component) return null;
          return <Component key={section} {...sectionData} />;
        })}
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug };
}
