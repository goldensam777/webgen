import sanitizeHtml from "sanitize-html";

type UnknownRecord = Record<string, unknown>;

export interface SitePageLike {
  id?: string;
  slug: string;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

const SANITIZE_OPTIONS = {
  allowedTags: ["b", "i", "em", "strong", "a", "br", "span"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style", "class"],
  },
};

function asSafeString(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return sanitizeHtml(value.trim(), SANITIZE_OPTIONS);
}

function asObjectArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.map(asRecord).filter((item) => Object.keys(item).length > 0)
    : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export function normalizeSectionKey(section: string): string {
  return section.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function sectionAnchorId(section: string): string {
  return normalizeSectionKey(section);
}

export function sanitizePageSlug(rawSlug: unknown, pageName: unknown, isHome = false): string {
  if (isHome) return "";
  const base = asSafeString(rawSlug) ?? asSafeString(pageName) ?? "page";
  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSectionData(section: string, rawData: unknown): UnknownRecord {
  const key = normalizeSectionKey(section);
  const data = asRecord(rawData);
  const normalized: UnknownRecord = { ...data };

  if (key === "hero") {
    normalized.title = asSafeString(data.title) ?? "";
    normalized.subtitle = asSafeString(data.subtitle) ?? "";
    normalized.description = asSafeString(data.description) ?? "";
    normalized.badgeLabel = asSafeString(data.badgeLabel) ?? "";
    normalized.ctaLabel = asSafeString(data.ctaLabel) ?? "";
    normalized.ctaHref = asSafeString(data.ctaHref) ?? "#";
    normalized.secondaryCtaLabel = asSafeString(data.secondaryCtaLabel) ?? "";
    normalized.secondaryCtaHref = asSafeString(data.secondaryCtaHref) ?? "#";
    normalized.imageSrc = asSafeString(data.imageSrc) ?? "";
    normalized.imageAlt = asSafeString(data.imageAlt) ?? asSafeString(data.title) ?? "";
    normalized.align = data.align === "left" || data.align === "center" ? data.align : "center";
  }

  if (key === "navbar") {
    normalized.links = asObjectArray(data.links).map((link) => ({
      ...link,
      label: asSafeString(link.label) ?? "",
      href: asSafeString(link.href) ?? "#",
    }));
  }

  if (key === "features") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      title: asSafeString(item.title) ?? "",
      description: asSafeString(item.description) ?? "",
    }));
  }

  if (key === "stats") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      value: asSafeString(item.value) ?? "",
      label: asSafeString(item.label) ?? "",
      description: asSafeString(item.description),
    }));
  }

  if (key === "testimonials") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      quote: asSafeString(item.quote) ?? asSafeString(item.content) ?? "",
      name: asSafeString(item.name) ?? "",
      role: asSafeString(item.role),
      avatarSrc: asSafeString(item.avatarSrc) ?? asSafeString(item.avatar),
      initials: asSafeString(item.initials) ?? asSafeString(item.name),
    }));
  }

  if (key === "pricing") {
    normalized.plans = asObjectArray(data.plans).map((plan) => ({
      ...plan,
      name: asSafeString(plan.name) ?? "",
      price: typeof plan.price === "number" || typeof plan.price === "string" ? plan.price : "",
      period: asSafeString(plan.period),
      description: asSafeString(plan.description),
      ctaLabel: asSafeString(plan.ctaLabel) ?? "Commencer",
      ctaHref: asSafeString(plan.ctaHref) ?? "#",
      features: asStringArray(plan.features),
      badgeLabel: asSafeString(plan.badgeLabel) ?? "",
      highlighted: !!plan.highlighted,
    }));
  }

  if (key === "faq") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      title: asSafeString(item.title) ?? asSafeString(item.question) ?? "",
      content: asSafeString(item.content) ?? asSafeString(item.answer) ?? "",
    }));
  }

  if (key === "cta") {
    normalized.description = asSafeString(data.description) ?? asSafeString(data.subtitle);
    normalized.ctaLabel = asSafeString(data.ctaLabel) ?? asSafeString(data.primaryCta);
    normalized.ctaHref = asSafeString(data.ctaHref) ?? asSafeString(data.primaryCtaHref) ?? "#contact";
    normalized.secondaryCtaLabel = asSafeString(data.secondaryCtaLabel) ?? asSafeString(data.secondaryCta);
    normalized.secondaryCtaHref = asSafeString(data.secondaryCtaHref) ?? "#";
  }

  if (key === "contact") {
    normalized.email = asSafeString(data.email);
    normalized.phone = asSafeString(data.phone);
    normalized.address = asSafeString(data.address);
    normalized.ctaLabel = asSafeString(data.ctaLabel) ?? "Envoyer";
  }

  if (key === "footer") {
    normalized.description = asSafeString(data.description) ?? asSafeString(data.tagline);
    normalized.linkGroups = asObjectArray(data.linkGroups).map((group) => ({
      ...group,
      section: asSafeString(group.section) ?? "",
      items: asObjectArray(group.items).map((link) => ({
        ...link,
        label: asSafeString(link.label) ?? "",
        href: asSafeString(link.href) ?? "#",
      })),
    }));
  }

  if (key === "blog") {
    normalized.ctaLabel = asSafeString(data.ctaLabel) ?? "Voir tous les articles";
  }

  return normalized;
}

function normalizePageData(pageRecord: UnknownRecord, sections: string[]): Record<string, UnknownRecord> {
  const dataRecord = asRecord(pageRecord.data);
  const data: Record<string, UnknownRecord> = {};

  for (const section of sections) {
    data[section] = normalizeSectionData(
      section,
      dataRecord[section] ?? pageRecord[section]
    );
  }

  return data;
}

export function normalizePagePayload(page: unknown, index = 0) {
  const record = asRecord(page);
  const sections = Array.from(
    new Set(
      (Array.isArray(record.sections) ? record.sections : [])
        .filter((section): section is string => typeof section === "string" && section.trim().length > 0)
        .map(normalizeSectionKey)
    )
  );

  return {
    ...record,
    name: asSafeString(record.name) ?? (index === 0 ? "Accueil" : `Page ${index + 1}`),
    slug: sanitizePageSlug(record.slug, record.name, index === 0),
    sections,
    data: normalizePageData(record, sections),
  };
}

export function normalizeSitePayload(rawConfig: unknown): UnknownRecord {
  const config = asRecord(rawConfig);

  if (Array.isArray(config.pages)) {
    return {
      ...config,
      pages: config.pages.map((page, index) => normalizePagePayload(page, index)),
      theme: asRecord(config.theme),
    };
  }

  const sections = Array.isArray(config.sections)
    ? (config.sections as unknown[]).filter((section): section is string => typeof section === "string")
    : [];

  const normalizedSections = Array.from(new Set(sections.map(normalizeSectionKey)));
  const data: Record<string, UnknownRecord> = {};
  for (const section of normalizedSections) {
    data[section] = normalizeSectionData(section, config[section]);
  }

  return {
    ...config,
    sections: normalizedSections,
    data,
    theme: asRecord(config.theme),
  };
}

function isSpecialHref(href: string): boolean {
  return /^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

export function findPageForHref(href: string, pages: SitePageLike[]): SitePageLike | null {
  const trimmed = href.trim();
  if (!trimmed || isSpecialHref(trimmed)) return null;

  const [pathOnly] = trimmed.split(/[?#]/, 1);
  let normalized = pathOnly.replace(/^\/+/, "").replace(/\/+$/, "");
  if (normalized === "") {
    return pages.find((page) => page.slug === "") ?? null;
  }

  if (normalized.startsWith("s/")) {
    const [, , ...rest] = normalized.split("/");
    normalized = rest.join("/");
    if (!normalized) {
      return pages.find((page) => page.slug === "") ?? null;
    }
  }

  return pages.find((page) => page.slug === normalized) ?? null;
}

export function resolveSiteHref(
  href: string,
  pages: SitePageLike[],
  siteSlug?: string
): string {
  const trimmed = href.trim();
  if (!trimmed || isSpecialHref(trimmed)) return trimmed;

  const [pathWithQuery, hashPartRaw] = trimmed.split("#");
  const [pathOnly, queryPartRaw] = pathWithQuery.split("?");
  const queryPart = queryPartRaw ? `?${queryPartRaw}` : "";
  const hashPart = hashPartRaw ? `#${hashPartRaw}` : "";

  const targetPage = findPageForHref(pathOnly, pages);
  if (!targetPage) return trimmed;

  const targetSlug = targetPage.slug;

  if (!siteSlug) {
    // Local / direct domain context
    return `${targetSlug ? `/${targetSlug}` : "/"}${queryPart}${hashPart}`;
  }

  // Multi-site / Shared domain context (/s/[slug]/...)
  // We ensure exactly one slash after /s/[siteSlug]
  const cleanSiteSlug = siteSlug.replace(/^\/+/, "").replace(/\/+$/, "");
  return `/s/${cleanSiteSlug}${targetSlug ? `/${targetSlug}` : ""}${queryPart}${hashPart}`;
}

function rewriteLinksDeep(
  value: unknown,
  pages: SitePageLike[],
  siteSlug?: string
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteLinksDeep(item, pages, siteSlug));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as UnknownRecord).map(([key, nestedValue]) => {
      if (
        typeof nestedValue === "string" &&
        (key === "href" || key.endsWith("Href"))
      ) {
        return [key, resolveSiteHref(nestedValue, pages, siteSlug)];
      }
      return [key, rewriteLinksDeep(nestedValue, pages, siteSlug)];
    })
  );
}

export function rewriteSectionLinks(
  data: Record<string, unknown>,
  pages: SitePageLike[],
  siteSlug?: string
): Record<string, unknown> {
  return rewriteLinksDeep(data, pages, siteSlug) as Record<string, unknown>;
}
