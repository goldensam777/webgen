import React from "react";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

interface FooterLinkGroup {
  section: string;
  items: { label: string; href: string }[];
}

interface FooterProps {
  logo: string;
  logoSrc?: string;
  description?: string;
  linkGroups?: FooterLinkGroup[];
  copyright?: string;
  bgColor?: string;
  borderColor?: string;
  logoColor?: string;
  descriptionColor?: string;
  sectionTitleColor?: string;
  linkColor?: string;
  copyrightColor?: string;
}

export function Footer({
  logo,
  logoSrc,
  description,
  linkGroups = [],
  copyright,
  bgColor = "#111827",
  borderColor = "#1f2937",
  logoColor = "#ffffff",
  descriptionColor = "#9ca3af",
  sectionTitleColor = "#e5e7eb",
  linkColor = "#9ca3af",
  copyrightColor = "#6b7280",
}: FooterProps) {
  return (
    <footer className="px-6 pt-16 pb-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 gap-10 ${linkGroups.length > 0 ? "md:grid-cols-[2fr_repeat(3,1fr)]" : ""}`}>
          {/* Brand */}
          <CanvasElement id="brand">
            <div className="flex flex-col gap-4">
              <a href="/" className="font-bold text-xl" style={{ color: logoColor }}>
                {logoSrc ? <img src={logoSrc} alt={logo} className="h-8" /> : <EditableText field="logo" value={logo} />}
              </a>
              {description && (
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: descriptionColor }}>
                  <EditableText field="description" value={description} />
                </p>
              )}
            </div>
          </CanvasElement>

          {/* Link groups */}
          {linkGroups.map((group, i) => (
            <CanvasElement id={`linkGroup-${i}`} key={i}>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: sectionTitleColor }}>
                  {group.section}
                </p>
                <ul className="flex flex-col gap-2">
                  {group.items.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        className="text-sm hover:text-white transition-colors"
                        style={{ color: linkColor }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </CanvasElement>
          ))}
        </div>

        {copyright && (
          <>
            <div className="mt-12 h-px" style={{ backgroundColor: borderColor }} />
            <p className="mt-6 text-xs text-center" style={{ color: copyrightColor }}>
              <EditableText field="copyright" value={copyright} />
            </p>
          </>
        )}
      </div>
    </footer>
  );
}
