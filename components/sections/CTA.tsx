import React from "react";
import { Button } from "../ui/Button";

interface CTAProps {
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  align?: "left" | "center";
  bgColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

export function CTA({
  title,
  description,
  ctaLabel,
  ctaHref = "#",
  secondaryCtaLabel,
  secondaryCtaHref = "#",
  align = "center",
  bgColor = "var(--color-primary)",
  titleColor = "#ffffff",
  descriptionColor = "rgba(255,255,255,0.75)",
}: CTAProps) {
  const isCenter = align === "center";

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className={`max-w-3xl mx-auto ${isCenter ? "text-center" : "text-left"}`}>
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ color: titleColor }}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-lg" style={{ color: descriptionColor }}>
            {description}
          </p>
        )}

        <div className={`mt-8 flex flex-wrap gap-3 ${isCenter ? "justify-center" : ""}`}>
          <a href={ctaHref}>
            <Button isDefault={false} className="bg-white text-blue-600 hover:bg-gray-100 border-white">
              {ctaLabel}
            </Button>
          </a>
          {secondaryCtaLabel && (
            <a href={secondaryCtaHref}>
              <Button className="border-white/40 text-white hover:bg-white/10 bg-transparent">
                {secondaryCtaLabel}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
