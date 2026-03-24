import React from "react";
import { Accordion } from "../ui/Accordion";
import { EditableText } from "../editor/EditableText";

interface FAQItem {
  title: string;
  content: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export function FAQ({
  title,
  subtitle,
  items = [],
  bgColor = "var(--color-background)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
}: FAQProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: titleColor }}>
                <EditableText field="title" value={title} />
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg" style={{ color: subtitleColor }}>
                <EditableText field="subtitle" value={subtitle} />
              </p>
            )}
          </div>
        )}

        <Accordion items={items} />
      </div>
    </section>
  );
}
