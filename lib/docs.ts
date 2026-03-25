import fs   from "fs";
import path from "path";
import matter from "gray-matter";
import { DOCS_NAV } from "./docs-nav";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocMeta {
  title:       string;
  description: string;
  slug:        string;
}

export interface NavItem extends DocMeta {
  category: string;
}

export interface TocEntry {
  level: 2 | 3;
  text:  string;
  id:    string;
}

/* ── Lecture d'un fichier MDX ───────────────────────────────── */

export function getDoc(slug: string): { meta: DocMeta; content: string } {
  const filepath = path.join(DOCS_DIR, `${slug}.mdx`);
  const raw      = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: {
      title:       data.title       ?? slug,
      description: data.description ?? "",
      slug,
    },
    content,
  };
}

/* ── Navigation enrichie (titre depuis frontmatter) ─────────── */

export function getNavWithTitles(): { category: string; items: DocMeta[] }[] {
  return DOCS_NAV.map(({ category, slugs }) => ({
    category,
    items: slugs.map(slug => {
      try {
        return getDoc(slug).meta;
      } catch {
        return { title: slug, description: "", slug };
      }
    }),
  }));
}

/* ── Table des matières ─────────────────────────────────────── */

export function extractToc(content: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    const level = m[1].length as 2 | 3;
    const text  = m[2].replace(/`([^`]+)`/g, "$1"); // retire les backticks
    const id    = text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    entries.push({ level, text, id });
  }
  return entries;
}

/* ── Génération des slugs statiques ─────────────────────────── */

export function getAllDocSlugs(): string[] {
  return DOCS_NAV.flatMap(c => c.slugs);
}
