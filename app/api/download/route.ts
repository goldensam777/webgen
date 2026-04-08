import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import type { SiteConfig, SitePage, SiteTheme } from "@/app/store/siteStore";

/* ── Types ──────────────────────────────────────────────────── */

interface FieldStyle   { fontSize?: string; fontWeight?: string; }
interface ElementStyle {
  backgroundColor?: string; color?: string; borderRadius?: string;
  padding?: string; fontWeight?: string; fontSize?: string;
  opacity?: string; hideOnMobile?: boolean;
}

type SectionData = Record<string, unknown>;

/* ── Style helpers ──────────────────────────────────────────── */

function fStyle(s?: FieldStyle): string {
  if (!s) return "";
  const p: string[] = [];
  if (s.fontSize)   p.push(`font-size:${s.fontSize}`);
  if (s.fontWeight) p.push(`font-weight:${s.fontWeight}`);
  return p.length ? ` style="${p.join(";")}"` : "";
}

function eStyle(s?: ElementStyle): string {
  if (!s) return "";
  const p: string[] = [];
  if (s.backgroundColor) p.push(`background-color:${s.backgroundColor}`);
  if (s.color)           p.push(`color:${s.color}`);
  if (s.borderRadius)    p.push(`border-radius:${s.borderRadius}`);
  if (s.padding)         p.push(`padding:${s.padding}`);
  if (s.fontWeight)      p.push(`font-weight:${s.fontWeight}`);
  if (s.fontSize)        p.push(`font-size:${s.fontSize}`);
  if (s.opacity)         p.push(`opacity:${s.opacity}`);
  return p.length ? ` style="${p.join(";")}"` : "";
}

function eClass(s?: ElementStyle): string {
  return s?.hideOnMobile ? " wg-hide-mobile" : "";
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/* ── Section templates ──────────────────────────────────────── */

function renderNavbar(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>, pages: SitePage[], prefix = ""): string {
  const logo       = str(d.logo, "Logo");
  const logoSrc    = str(d.logoSrc);
  const ctaLabel   = str(d.ctaLabel);
  const ctaHref    = str(d.ctaHref, "#");
  const bgColor    = str(d.bgColor, "var(--color-surface)");
  const textColor  = str(d.textColor, "var(--color-text-muted)");
  const borderColor = str(d.borderColor, "var(--color-border)");
  const logoColor  = str(d.logoColor, "var(--color-text)");
  const links      = Array.isArray(d.links) ? d.links as { label: string; href: string }[] : [];

  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="${logo}" style="height:2rem">`
    : `<span${fStyle(fs.logo)}>${logo}</span>`;

  const navLinks = links.map(l =>
    `<a href="${l.href}" style="color:${textColor};font-size:.875rem;font-weight:500;text-decoration:none;transition:opacity .2s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${l.label}</a>`
  ).join("");

  const ctaBtn = ctaLabel
    ? `<a href="${ctaHref}" class="btn-primary${eClass(es.ctaBtn)}"${eStyle(es.ctaBtn)}>${ctaLabel}</a>` : "";

  const mobileLinks = links.map(l =>
    `<a href="${l.href}" style="color:${textColor};font-size:.875rem;font-weight:500;text-decoration:none;display:block;padding:.5rem 0">${l.label}</a>`
  ).join("");

  const pagesNav = pages.length > 1
    ? pages.map((p, i) =>
        `<a href="${i === 0 ? `${prefix}index.html` : `${prefix}${p.slug}/index.html`}" style="color:${textColor};font-size:.875rem;font-weight:500;text-decoration:none">${p.name}</a>`
      ).join("")
    : navLinks;

  return `
<nav style="background:${bgColor};border-bottom:1px solid ${borderColor};position:sticky;top:0;z-index:50;width:100%">
  <div style="max-width:72rem;margin:0 auto;padding:0 1.5rem;height:4rem;display:flex;align-items:center;justify-content:space-between">
    <a href="${prefix}index.html" style="font-weight:700;font-size:1.25rem;color:${logoColor};text-decoration:none">${logoHtml}</a>
    <div class="nav-links" style="display:flex;align-items:center;gap:2rem">${pagesNav}</div>
    <div style="display:flex;align-items:center;gap:.75rem">${ctaBtn}</div>
    <button class="burger" onclick="toggleMenu()" style="display:none;background:none;border:none;cursor:pointer;color:${textColor}">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </div>
  <div id="mobile-menu" style="display:none;padding:1rem 1.5rem;border-top:1px solid ${borderColor};background:${bgColor}">
    ${mobileLinks}
    ${ctaLabel ? `<a href="${ctaHref}" class="btn-primary" style="margin-top:.75rem;display:inline-flex">${ctaLabel}</a>` : ""}
  </div>
</nav>`;
}

function renderHero(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title, "Titre");
  const subtitle = str(d.subtitle);
  const desc     = str(d.description);
  const badge    = str(d.badgeLabel);
  const ctaLabel = str(d.ctaLabel);
  const ctaHref  = str(d.ctaHref, "#");
  const secLabel = str(d.secondaryCtaLabel);
  const secHref  = str(d.secondaryCtaHref, "#");
  const imageSrc = str(d.imageSrc);
  const align    = str(d.align, "center");
  const bgColor  = str(d.bgColor, "var(--color-background)");
  const titleColor = str(d.titleColor, "var(--color-text)");
  const subColor   = str(d.subtitleColor, "var(--color-primary)");
  const descColor  = str(d.descriptionColor, "var(--color-text-muted)");
  const center     = align === "center";

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto;${center ? "text-align:center" : ""}">
    <div style="display:flex;flex-direction:column;align-items:${center ? "center" : "flex-start"};gap:1.5rem">
      ${badge ? `<span class="${eClass(es.badge)}" style="display:inline-flex;align-items:center;padding:.25rem .75rem;border-radius:9999px;font-size:.875rem;font-weight:500;background:var(--color-primary);color:#fff;opacity:.9${eStyle(es.badge) ? ";" + eStyle(es.badge).replace(/ style="/,"").replace(/"$/,"") : ""}"${eStyle(es.badge)}><span${fStyle(fs.badgeLabel)}>${badge}</span></span>` : ""}
      <h1 style="font-size:clamp(2rem,5vw,3.75rem);font-weight:700;line-height:1.15;color:${titleColor}"><span${fStyle(fs.title)}>${title}</span></h1>
      ${subtitle ? `<p style="font-size:clamp(1rem,2.5vw,1.5rem);font-weight:500;color:${subColor}"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
      ${desc ? `<p style="font-size:1rem;max-width:42rem;color:${descColor};line-height:1.7"><span${fStyle(fs.description)}>${desc}</span></p>` : ""}
      ${(ctaLabel || secLabel) ? `
      <div style="display:flex;flex-wrap:wrap;gap:.75rem;${center ? "justify-content:center" : ""};margin-top:.5rem">
        ${ctaLabel ? `<a href="${ctaHref}" class="btn-primary${eClass(es.ctaBtn)}"${eStyle(es.ctaBtn)}><span${fStyle(fs.ctaLabel)}>${ctaLabel}</span></a>` : ""}
        ${secLabel ? `<a href="${secHref}" class="btn-outline${eClass(es.ctaBtnSecondary)}"${eStyle(es.ctaBtnSecondary)}><span${fStyle(fs.secondaryCtaLabel)}>${secLabel}</span></a>` : ""}
      </div>` : ""}
      ${imageSrc ? `<div class="${eClass(es.image)}" style="margin-top:2.5rem;width:100%;max-width:56rem"${eStyle(es.image)}><img src="${imageSrc}" alt="" style="width:100%;border-radius:1rem;box-shadow:0 20px 60px rgba(0,0,0,.15);border:1px solid var(--color-border)"></div>` : ""}
    </div>
  </div>
</section>`;
}

function renderFeatures(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title);
  const subtitle = str(d.subtitle);
  const items    = Array.isArray(d.items) ? d.items as { title: string; description: string; icon?: string }[] : [];
  const cols     = (d.columns as number) ?? 3;
  const bgColor  = str(d.bgColor, "var(--color-surface)");
  const titleColor = str(d.titleColor, "var(--color-text)");
  const subColor   = str(d.subtitleColor, "var(--color-text-muted)");

  const cards = items.map((item, i) => `
    <div class="${eClass(es[`feature-${i}`])}" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:.75rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.06)"${eStyle(es[`feature-${i}`])}>
      ${item.icon ? `<div style="width:2.75rem;height:2.75rem;border-radius:.75rem;background:var(--color-primary);background-color:rgba(var(--color-primary-rgb, 37, 99, 235), 0.15);display:flex;align-items:center;justify-content:center;font-size:1.25rem;margin-bottom:1rem">${item.icon}</div>` : ""}
      <h3 style="font-weight:600;font-size:1rem;margin-bottom:.5rem;color:var(--color-text)">${item.title}</h3>
      <p style="font-size:.875rem;line-height:1.6;color:var(--color-text-muted)">${item.description}</p>
    </div>`).join("");

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto">
    ${(title || subtitle) ? `<div style="text-align:center;margin-bottom:3.5rem">
      ${title ? `<h2 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:${titleColor}"><span${fStyle(fs.title)}>${title}</span></h2>` : ""}
      ${subtitle ? `<p style="margin-top:1rem;font-size:1.125rem;max-width:42rem;margin-left:auto;margin-right:auto;color:${subColor}"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
    </div>` : ""}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${cols === 4 ? "220" : "260"}px,1fr));gap:1.5rem">${cards}</div>
  </div>
</section>`;
}

function renderStats(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title);
  const subtitle = str(d.subtitle);
  const items    = Array.isArray(d.items) ? d.items as { value: string; label: string }[] : [];
  const bgColor  = str(d.bgColor, "var(--color-background)");

  const stats = items.map((item, i) => `
    <div class="stat-item${eClass(es[`stat-${i}`])}" style="text-align:center"${eStyle(es[`stat-${i}`])}>
      <div style="font-size:clamp(2rem,5vw,3rem);font-weight:700;color:var(--color-primary)">${item.value}</div>
      <div style="font-size:.875rem;color:var(--color-text-muted);margin-top:.25rem">${item.label}</div>
    </div>`).join("");

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto">
    ${title ? `<h2 style="text-align:center;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:var(--color-text);margin-bottom:3rem"><span${fStyle(fs.title)}>${title}</span></h2>` : ""}
    ${subtitle ? `<p style="text-align:center;color:var(--color-text-muted);margin-bottom:3rem"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:2rem">${stats}</div>
  </div>
</section>`;
}

function renderTestimonials(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title);
  const subtitle = str(d.subtitle);
  const items    = Array.isArray(d.items) ? d.items as { name: string; role?: string; content: string }[] : [];
  const bgColor  = str(d.bgColor, "var(--color-surface)");

  const cards = items.map((item, i) => `
    <div class="${eClass(es[`testimonial-${i}`])}" style="background:var(--color-background);border:1px solid var(--color-border);border-radius:.75rem;padding:1.5rem"${eStyle(es[`testimonial-${i}`])}>
      <p style="font-size:.9375rem;line-height:1.7;color:var(--color-text);margin-bottom:1rem">"${item.content}"</p>
      <div>
        <p style="font-weight:600;font-size:.875rem;color:var(--color-text)">${item.name}</p>
        ${item.role ? `<p style="font-size:.8125rem;color:var(--color-text-muted)">${item.role}</p>` : ""}
      </div>
    </div>`).join("");

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto">
    ${title ? `<h2 style="text-align:center;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:var(--color-text);margin-bottom:1rem"><span${fStyle(fs.title)}>${title}</span></h2>` : ""}
    ${subtitle ? `<p style="text-align:center;color:var(--color-text-muted);margin-bottom:3rem"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem">${cards}</div>
  </div>
</section>`;
}

function renderPricing(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title);
  const subtitle = str(d.subtitle);
  const plans    = Array.isArray(d.plans) ? d.plans as { name: string; price: string; description?: string; features?: string[]; ctaLabel?: string; highlighted?: boolean }[] : [];
  const bgColor  = str(d.bgColor, "var(--color-background)");

  const cards = plans.map((plan, i) => {
    const hl = plan.highlighted;
    const features = (plan.features ?? []).map(f =>
      `<li style="display:flex;align-items:flex-start;gap:.5rem;font-size:.875rem;color:var(--color-text-muted);margin-bottom:.5rem">
        <span style="color:var(--color-primary);flex-shrink:0">✓</span>${f}
      </li>`
    ).join("");
    return `
    <div class="${eClass(es[`plan-${i}`])}" style="background:${hl ? "var(--color-primary)" : "var(--color-surface)"};border:1.5px solid ${hl ? "var(--color-primary)" : "var(--color-border)"};border-radius:1rem;padding:2rem;position:relative"${eStyle(es[`plan-${i}`])}>
      ${hl ? `<div style="position:absolute;top:-1rem;left:50%;transform:translateX(-50%);background:var(--color-secondary);color:#fff;font-size:.75rem;font-weight:700;padding:.25rem .875rem;border-radius:9999px">Populaire</div>` : ""}
      <h3 style="font-size:1.125rem;font-weight:700;color:${hl ? "#fff" : "var(--color-text)"}">${plan.name}</h3>
      <div style="font-size:2.5rem;font-weight:800;color:${hl ? "#fff" : "var(--color-text)"};margin:.75rem 0">${plan.price}</div>
      ${plan.description ? `<p style="font-size:.875rem;color:${hl ? "rgba(255,255,255,.75)" : "var(--color-text-muted)"};margin-bottom:1.5rem">${plan.description}</p>` : ""}
      ${features ? `<ul style="list-style:none;margin-bottom:1.5rem">${features}</ul>` : ""}
      ${plan.ctaLabel ? `<a href="#" style="display:block;text-align:center;padding:.625rem;border-radius:.5rem;font-weight:600;font-size:.875rem;text-decoration:none;background:${hl ? "#fff" : "var(--color-primary)"};color:${hl ? "var(--color-primary)" : "#fff"}">${plan.ctaLabel}</a>` : ""}
    </div>`;
  }).join("");

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto">
    ${title ? `<h2 style="text-align:center;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:var(--color-text);margin-bottom:1rem"><span${fStyle(fs.title)}>${title}</span></h2>` : ""}
    ${subtitle ? `<p style="text-align:center;color:var(--color-text-muted);margin-bottom:3rem"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;align-items:start">${cards}</div>
  </div>
</section>`;
}

function renderFAQ(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title);
  const subtitle = str(d.subtitle);
  const items    = Array.isArray(d.items) ? d.items as { question: string; answer: string }[] : [];
  const bgColor  = str(d.bgColor, "var(--color-surface)");

  const faqs = items.map((item, i) => `
    <div class="faq-item${eClass(es[`faq-${i}`])}" style="border:1px solid var(--color-border);border-radius:.75rem;overflow:hidden;margin-bottom:.75rem"${eStyle(es[`faq-${i}`])}>
      <button onclick="toggleFaq(this)" style="width:100%;text-align:left;padding:1.25rem 1rem;background:var(--color-surface);border:none;cursor:pointer;font-weight:600;font-size:.9375rem;color:var(--color-text);display:flex;justify-content:space-between;align-items:center">
        ${item.question}
        <span style="transition:transform .2s;flex-shrink:0;margin-left:.5rem">▼</span>
      </button>
      <div class="faq-body" style="display:none;padding:1rem 1.25rem;font-size:.875rem;line-height:1.7;color:var(--color-text-muted);background:var(--color-background)">${item.answer}</div>
    </div>`).join("");

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:48rem;margin:0 auto">
    ${title ? `<h2 style="text-align:center;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:var(--color-text);margin-bottom:1rem"><span${fStyle(fs.title)}>${title}</span></h2>` : ""}
    ${subtitle ? `<p style="text-align:center;color:var(--color-text-muted);margin-bottom:3rem"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
    <div>${faqs}</div>
  </div>
</section>`;
}

function renderCTA(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title, "Passez à l'action");
  const desc     = str(d.description);
  const ctaLabel = str(d.ctaLabel, "Commencer");
  const ctaHref  = str(d.ctaHref, "#");
  const secLabel = str(d.secondaryCtaLabel);
  const secHref  = str(d.secondaryCtaHref, "#");
  const bgColor  = str(d.bgColor, "var(--color-primary)");
  const titleColor = str(d.titleColor, "#ffffff");
  const descColor  = str(d.descriptionColor, "rgba(255,255,255,0.75)");
  const center     = str(d.align, "center") === "center";

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:48rem;margin:0 auto;${center ? "text-align:center" : ""}">
    <h2 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:${titleColor}"><span${fStyle(fs.title)}>${title}</span></h2>
    ${desc ? `<p style="margin-top:1rem;font-size:1.125rem;color:${descColor}"><span${fStyle(fs.description)}>${desc}</span></p>` : ""}
    <div style="margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem;${center ? "justify-content:center" : ""}">
      <a href="${ctaHref}" class="${eClass(es.ctaBtn)}" style="display:inline-flex;align-items:center;padding:.625rem 1.5rem;border-radius:.5rem;font-weight:600;font-size:.875rem;background:#fff;color:var(--color-primary);text-decoration:none${eStyle(es.ctaBtn) ? ";" + eStyle(es.ctaBtn).replace(/ style="/,"").replace(/"$/,"") : ""}"${eStyle(es.ctaBtn)}><span${fStyle(fs.ctaLabel)}>${ctaLabel}</span></a>
      ${secLabel ? `<a href="${secHref}" class="${eClass(es.ctaBtnSecondary)}" style="display:inline-flex;align-items:center;padding:.625rem 1.5rem;border-radius:.5rem;font-weight:600;font-size:.875rem;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.4);text-decoration:none"${eStyle(es.ctaBtnSecondary)}><span${fStyle(fs.secondaryCtaLabel)}>${secLabel}</span></a>` : ""}
    </div>
  </div>
</section>`;
}

function renderContact(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>): string {
  const title    = str(d.title, "Contact");
  const subtitle = str(d.subtitle);
  const email    = str(d.email);
  const phone    = str(d.phone);
  const address  = str(d.address);
  const bgColor  = str(d.bgColor, "var(--color-background)");
  const hasInfo  = email || phone || address;

  const infoHtml = hasInfo ? `
    <div class="${eClass(es.info)}" style="display:flex;flex-direction:column;gap:1.25rem"${eStyle(es.info)}>
      ${email   ? `<div style="display:flex;gap:.75rem;align-items:flex-start"><span>✉️</span><div><p style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted);margin-bottom:.2rem">Email</p><a href="mailto:${email}" style="font-size:.875rem;font-weight:500;color:var(--color-text);text-decoration:none">${email}</a></div></div>` : ""}
      ${phone   ? `<div style="display:flex;gap:.75rem;align-items:flex-start"><span>📞</span><div><p style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted);margin-bottom:.2rem">Téléphone</p><a href="tel:${phone}" style="font-size:.875rem;font-weight:500;color:var(--color-text);text-decoration:none">${phone}</a></div></div>` : ""}
      ${address ? `<div style="display:flex;gap:.75rem;align-items:flex-start"><span>📍</span><div><p style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted);margin-bottom:.2rem">Adresse</p><p style="font-size:.875rem;font-weight:500;color:var(--color-text)">${address}</p></div></div>` : ""}
    </div>` : "";

  const formHtml = `
    <div class="${eClass(es.form)}" style="display:flex;flex-direction:column;gap:1rem"${eStyle(es.form)}>
      <input type="text" placeholder="Votre nom" style="width:100%;padding:.75rem 1rem;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:.875rem">
      <input type="email" placeholder="Votre email" style="width:100%;padding:.75rem 1rem;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:.875rem">
      <textarea rows="4" placeholder="Votre message" style="width:100%;padding:.75rem 1rem;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:.875rem;resize:vertical"></textarea>
      <button type="submit" class="btn-primary" style="align-self:flex-start">Envoyer →</button>
    </div>`;

  return `
<section style="padding:5rem 1.5rem;background:${bgColor}">
  <div style="max-width:${hasInfo ? "72rem" : "40rem"};margin:0 auto">
    <div style="${hasInfo ? "display:grid;grid-template-columns:1fr 1fr;gap:3.5rem;align-items:start" : ""}">
      <div>
        <h2 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:var(--color-text);margin-bottom:${subtitle ? ".75rem" : "2rem"}"><span${fStyle(fs.title)}>${title}</span></h2>
        ${subtitle ? `<p style="color:var(--color-text-muted);margin-bottom:2.5rem"><span${fStyle(fs.subtitle)}>${subtitle}</span></p>` : ""}
        ${infoHtml}
      </div>
      ${formHtml}
    </div>
  </div>
</section>`;
}

function renderFooter(d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>, prefix = ""): string {
  const logo       = str(d.logo, "Logo");
  const logoSrc    = str(d.logoSrc);
  const desc       = str(d.description);
  const copyright  = str(d.copyright);
  const bgColor    = str(d.bgColor, "#111827");
  const borderColor = str(d.borderColor, "#1f2937");
  const logoColor  = str(d.logoColor, "#ffffff");
  const descColor  = str(d.descriptionColor, "#9ca3af");
  const linkColor  = str(d.linkColor, "#9ca3af");
  const copyColor  = str(d.copyrightColor, "#6b7280");
  const groups     = Array.isArray(d.linkGroups) ? d.linkGroups as { section: string; items: { label: string; href: string }[] }[] : [];

  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="${logo}" style="height:2rem">`
    : `<span${fStyle(fs.logo)}>${logo}</span>`;

  const groupsHtml = groups.map((g, i) => `
    <div class="${eClass(es[`linkGroup-${i}`])}" style="display:flex;flex-direction:column;gap:.75rem"${eStyle(es[`linkGroup-${i}`])}>
      <p style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#e5e7eb">${g.section}</p>
      ${g.items.map(l => `<a href="${l.href}" style="font-size:.875rem;color:${linkColor};text-decoration:none;transition:color .2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='${linkColor}'">${l.label}</a>`).join("")}
    </div>`).join("");

  return `
<footer style="padding:4rem 1.5rem 2rem;background:${bgColor}">
  <div style="max-width:72rem;margin:0 auto">
    <div style="display:grid;grid-template-columns:${groups.length > 0 ? "2fr repeat(auto-fit,minmax(140px,1fr))" : "1fr"};gap:2.5rem;flex-wrap:wrap">
      <div class="${eClass(es.brand)}" style="display:flex;flex-direction:column;gap:1rem"${eStyle(es.brand)}>
        <a href="${prefix}index.html" style="font-weight:700;font-size:1.25rem;color:${logoColor};text-decoration:none">${logoHtml}</a>
        ${desc ? `<p style="font-size:.875rem;line-height:1.6;max-width:18rem;color:${descColor}"><span${fStyle(fs.description)}>${desc}</span></p>` : ""}
      </div>
      ${groupsHtml}
    </div>
    ${copyright ? `
    <div style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid ${borderColor};text-align:center">
      <p style="font-size:.75rem;color:${copyColor}"><span${fStyle(fs.copyright)}>${copyright}</span></p>
    </div>` : ""}
  </div>
</footer>`;
}

/* ── Section dispatcher ─────────────────────────────────────── */

const RENDERERS: Record<string, (d: SectionData, fs: Record<string, FieldStyle>, es: Record<string, ElementStyle>, pages: SitePage[], prefix: string) => string> = {
  navbar:        (d, fs, es, pages, prefix) => renderNavbar(d, fs, es, pages, prefix),
  hero:          (d, fs, es) => renderHero(d, fs, es),
  features:      (d, fs, es) => renderFeatures(d, fs, es),
  stats:         (d, fs, es) => renderStats(d, fs, es),
  testimonials:  (d, fs, es) => renderTestimonials(d, fs, es),
  pricing:       (d, fs, es) => renderPricing(d, fs, es),
  faq:           (d, fs, es) => renderFAQ(d, fs, es),
  cta:           (d, fs, es) => renderCTA(d, fs, es),
  contact:       (d, fs, es) => renderContact(d, fs, es),
  footer:        (d, fs, es, _pages, prefix) => renderFooter(d, fs, es, prefix),
};

/* ── Page HTML builder ──────────────────────────────────────── */

function buildPageHTML(page: SitePage, theme: SiteTheme, allPages: SitePage[]): string {
  // prefix = "../" for sub-pages (slug/index.html), "" for root (index.html)
  const prefix = page.slug === "" ? "" : "../";
  
  // SEO logic
  const meta = page.metadata ?? {};
  const metaTitle = meta.title || str(page.data.navbar?.logo as unknown) || str(page.data.hero?.title as unknown) || page.name;
  const metaDesc = meta.description || "";
  const metaNoIndex = !!meta.noIndex;

  const font = theme.font || "Inter";
  const css = `
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
    body { font-family: '${font}', system-ui, sans-serif; background: var(--color-background); color: var(--color-text); }
    .btn-primary { display:inline-flex;align-items:center;justify-content:center;padding:.625rem 1.5rem;border-radius:.5rem;font-weight:600;font-size:.875rem;background:var(--color-primary);color:#fff;border:none;cursor:pointer;text-decoration:none;transition:opacity .2s; }
    .btn-primary:hover { opacity:.85; }
    .btn-outline { display:inline-flex;align-items:center;justify-content:center;padding:.625rem 1.5rem;border-radius:.5rem;font-weight:600;font-size:.875rem;background:transparent;color:var(--color-text);border:1.5px solid var(--color-border);text-decoration:none;transition:background-color .2s; }
    .btn-outline:hover { background:var(--color-surface); }
    @media (max-width:768px) {
      .nav-links { display:none !important; }
      .burger    { display:block !important; }
      .wg-hide-mobile { display:none !important; }
    }
  `.trim();

  const js = `
    function toggleMenu() {
      var m = document.getElementById('mobile-menu');
      if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
    }
    function toggleFaq(btn) {
      var body = btn.nextElementSibling;
      var arrow = btn.querySelector('span:last-child');
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      if (arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
    }
  `.trim();

  const sectionsHTML = page.sections.map(sectionKey => {
    const renderer = RENDERERS[sectionKey];
    if (!renderer) return "";
    const data = (page.data[sectionKey] ?? {}) as SectionData;
    const fs   = ((data._styles  ?? {}) as Record<string, FieldStyle>);
    const es   = ((data._elStyles ?? {}) as Record<string, ElementStyle>);
    const clean: SectionData = Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith("_")));
    return renderer(clean, fs, es, allPages, prefix);
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle}</title>
  ${metaDesc ? `<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">` : ""}
  ${metaNoIndex ? `<meta name="robots" content="noindex, nofollow">` : ""}
  
  <!-- Open Graph -->
  <meta property="og:title" content="${metaTitle}">
  ${metaDesc ? `<meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}">` : ""}
  <meta property="og:type" content="website">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
${sectionsHTML}
<script>${js}</script>
</body>
</html>`;
}

/* ── Route handler ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const { config } = await req.json() as { config: SiteConfig };
    if (!config?.pages?.length) {
      return NextResponse.json({ error: "Config invalide" }, { status: 400 });
    }

    const { pages, theme } = config;

    // Single page → HTML direct
    if (pages.length === 1) {
      const html = buildPageHTML(pages[0], theme, pages);
      return new NextResponse(html, {
        headers: {
          "Content-Type":        "text/html; charset=utf-8",
          "Content-Disposition": 'attachment; filename="index.html"',
        },
      });
    }

    // Multi-page → ZIP
    const zip = new JSZip();

    for (const page of pages) {
      const html     = buildPageHTML(page, theme, pages);
      const filename = page.slug === "" ? "index.html" : `${page.slug}/index.html`;
      zip.file(filename, html);
    }

    const buffer   = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
    const blob     = new Blob([buffer], { type: "application/zip" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type":        "application/zip",
        "Content-Disposition": 'attachment; filename="site.zip"',
      },
    });
  } catch (err) {
    console.error("download error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
