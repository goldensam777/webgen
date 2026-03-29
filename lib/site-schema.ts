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

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
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
  const base = asString(rawSlug) ?? asString(pageName) ?? "page";
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

  if (key === "navbar") {
    normalized.links = asObjectArray(data.links).map((link) => ({
      ...link,
      label: asString(link.label) ?? "",
      href: asString(link.href) ?? "#",
    }));
  }

  if (key === "features") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      title: asString(item.title) ?? "",
      description: asString(item.description) ?? "",
    }));
  }

  if (key === "stats") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      value: asString(item.value) ?? "",
      label: asString(item.label) ?? "",
      description: asString(item.description),
    }));
  }

  if (key === "testimonials") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      quote: asString(item.quote) ?? asString(item.content) ?? "",
      name: asString(item.name) ?? "",
      role: asString(item.role),
      avatarSrc: asString(item.avatarSrc) ?? asString(item.avatar),
      initials: asString(item.initials) ?? asString(item.name),
    }));
  }

  if (key === "pricing") {
    normalized.plans = asObjectArray(data.plans).map((plan) => ({
      ...plan,
      name: asString(plan.name) ?? "",
      price: typeof plan.price === "number" || typeof plan.price === "string" ? plan.price : "",
      period: asString(plan.period),
      description: asString(plan.description),
      ctaLabel: asString(plan.ctaLabel) ?? "Commencer",
      ctaHref: asString(plan.ctaHref) ?? "#",
      features: asStringArray(plan.features),
    }));
  }

  if (key === "faq") {
    normalized.items = asObjectArray(data.items).map((item) => ({
      ...item,
      title: asString(item.title) ?? asString(item.question) ?? "",
      content: asString(item.content) ?? asString(item.answer) ?? "",
    }));
  }

  if (key === "cta") {
    normalized.description = asString(data.description) ?? asString(data.subtitle);
    normalized.ctaLabel = asString(data.ctaLabel) ?? asString(data.primaryCta);
    normalized.ctaHref = asString(data.ctaHref) ?? asString(data.primaryCtaHref) ?? "#contact";
    normalized.secondaryCtaLabel = asString(data.secondaryCtaLabel) ?? asString(data.secondaryCta);
    normalized.secondaryCtaHref = asString(data.secondaryCtaHref) ?? "#";
  }

  if (key === "contact") {
    normalized.email = asString(data.email);
    normalized.phone = asString(data.phone);
    normalized.address = asString(data.address);
    normalized.ctaLabel = asString(data.ctaLabel) ?? "Envoyer";
  }

  if (key === "footer") {
    normalized.description = asString(data.description) ?? asString(data.tagline);
    normalized.linkGroups = asObjectArray(data.linkGroups).map((group) => ({
      ...group,
      section: asString(group.section) ?? "",
      items: asObjectArray(group.items).map((link) => ({
        ...link,
        label: asString(link.label) ?? "",
        href: asString(link.href) ?? "#",
      })),
    }));
  }

  if (key === "blog") {
    normalized.ctaLabel = asString(data.ctaLabel) ?? "Voir tous les articles";
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
    name: asString(record.name) ?? (index === 0 ? "Accueil" : `Page ${index + 1}`),
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

  if (!siteSlug) {
    return `${targetPage.slug ? `/${targetPage.slug}` : "/"}${queryPart}${hashPart}`;
  }

  return `${targetPage.slug ? `/s/${siteSlug}/${targetPage.slug}` : `/s/${siteSlug}`}${queryPart}${hashPart}`;
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
