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
          className="text-3xl md:text-4xl font-bold leading-tight break-words"
          style={{ color: titleColor }}
        >
          <EditableText field="title" value={title} />
        </h2>

        {description && (
          <p className="mt-4 text-lg break-words" style={{ color: descriptionColor }}>
            <EditableText field="description" value={description} />
          </p>
        )}

        <div className={`mt-8 flex flex-wrap gap-3 ${isCenter ? "justify-center" : ""}`}>
          <a href={ctaHref}>
            <CanvasElement id="ctaBtn">
              <Button
                isDefault={false}
                className="hover:opacity-90"
                style={{ backgroundColor: "#ffffff", color: "var(--color-primary)", border: "none" }}
              >
                <EditableText field="ctaLabel" value={ctaLabel} hrefField="ctaHref" hrefValue={ctaHref} />
              </Button>
            </CanvasElement>
          </a>
          {secondaryCtaLabel && (
            <a href={secondaryCtaHref}>
              <CanvasElement id="ctaBtnSecondary">
                <Button
                  isDefault={false}
                  className="hover:opacity-90"
                  style={{ backgroundColor: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.5)" }}
                >
                  <EditableText field="secondaryCtaLabel" value={secondaryCtaLabel} hrefField="secondaryCtaHref" hrefValue={secondaryCtaHref} />
                </Button>
              </CanvasElement>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
