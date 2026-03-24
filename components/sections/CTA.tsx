import React from "react";
import { Button } from "../ui/Button";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

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
          <EditableText field="title" value={title} />
        </h2>

        {description && (
          <p className="mt-4 text-lg" style={{ color: descriptionColor }}>
            <EditableText field="description" value={description} />
          </p>
        )}

        <div className={`mt-8 flex flex-wrap gap-3 ${isCenter ? "justify-center" : ""}`}>
          <CanvasElement id="ctaBtn">
            <a href={ctaHref}>
              <Button isDefault={false} className="bg-white text-blue-600 hover:bg-gray-100 border-white">
                <EditableText field="ctaLabel" value={ctaLabel} />
              </Button>
            </a>
          </CanvasElement>
          {secondaryCtaLabel && (
            <CanvasElement id="ctaBtnSecondary">
              <a href={secondaryCtaHref}>
                <Button className="border-white/40 text-white hover:bg-white/10 bg-transparent">
                  <EditableText field="secondaryCtaLabel" value={secondaryCtaLabel} />
                </Button>
              </a>
            </CanvasElement>
          )}
        </div>
      </div>
    </section>
  );
}
