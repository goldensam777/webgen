import React from "react";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

interface StatItem {
  value: string;
  label: string;
  description?: string;
}

interface StatsProps {
  title?: string;
  subtitle?: string;
  items: StatItem[];
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  valueColor?: string;
  labelColor?: string;
  descriptionColor?: string;
  showDividers?: boolean;
}

export function Stats({
  title,
  subtitle,
  items = [],
  bgColor = "var(--color-background)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
  valueColor = "var(--color-primary)",
  labelColor = "var(--color-text)",
  descriptionColor = "var(--color-text-muted)",
  showDividers = true,
}: StatsProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: titleColor }}>
                <EditableText field="title" value={title} />
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: subtitleColor }}>
                <EditableText field="subtitle" value={subtitle} />
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center items-center gap-0">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <CanvasElement id={`stat-${i}`}>
                <div className="flex flex-col items-center text-center px-10 py-6">
                  <span className="text-4xl md:text-5xl font-bold" style={{ color: valueColor }}>
                    <EditableText field={`items.${i}.value`} value={item.value} />
                  </span>
                  <span
                    className="mt-1 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: labelColor }}
                  >
                    <EditableText field={`items.${i}.label`} value={item.label} />
                  </span>
                  {item.description && (
                    <span className="mt-1 text-xs max-w-[140px]" style={{ color: descriptionColor }}>
                      <EditableText field={`items.${i}.description`} value={item.description} />
                    </span>
                  )}
                </div>
              </CanvasElement>
              {showDividers && i < items.length - 1 && (
                <div
                  className="hidden md:block h-16 w-px"
                  style={{ backgroundColor: "var(--color-border)" }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
