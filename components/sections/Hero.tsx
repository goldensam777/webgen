import React from "react";
import { Button } from "../ui/Button";
import { EditableText } from "../editor/EditableText";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  badgeLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  align?: "left" | "center";
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  badgeLabel,
  ctaLabel,
  ctaHref = "#",
  secondaryCtaLabel,
  secondaryCtaHref = "#",
  imageSrc,
  imageAlt = "",
  align = "center",
  bgColor = "var(--color-background)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-primary)",
  descriptionColor = "var(--color-text-muted)",
}: HeroProps) {
  const isCenter = align === "center";

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className={`max-w-6xl mx-auto ${isCenter ? "text-center" : "text-left"}`}>
        <div className={`${isCenter ? "flex flex-col items-center" : ""} gap-6`}>

          {badgeLabel && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                opacity: 0.9,
              }}
            >
              <EditableText field="badgeLabel" value={badgeLabel} />
            </span>
          )}

          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: titleColor }}
          >
            <EditableText field="title" value={title} />
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl font-medium" style={{ color: subtitleColor }}>
              <EditableText field="subtitle" value={subtitle} />
            </p>
          )}

          {description && (
            <p className="text-base md:text-lg max-w-2xl" style={{ color: descriptionColor }}>
              <EditableText field="description" value={description} />
            </p>
          )}

          {(ctaLabel || secondaryCtaLabel) && (
            <div className={`flex flex-wrap gap-3 ${isCenter ? "justify-center" : ""} mt-2`}>
              {ctaLabel && (
                <a href={ctaHref}>
                  <Button isDefault={false}><EditableText field="ctaLabel" value={ctaLabel} /></Button>
                </a>
              )}
              {secondaryCtaLabel && (
                <a href={secondaryCtaHref}>
                  <Button><EditableText field="secondaryCtaLabel" value={secondaryCtaLabel} /></Button>
                </a>
              )}
            </div>
          )}

          {imageSrc && (
            <div className="mt-10 w-full max-w-4xl">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full rounded-2xl shadow-xl"
                style={{ borderColor: "var(--color-border)", border: "1px solid" }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
