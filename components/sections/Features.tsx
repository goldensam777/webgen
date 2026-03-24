import React from "react";
import { Card } from "../ui/Card";
import { EditableText } from "../editor/EditableText";

interface FeatureItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  id?: string;
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  itemTitleColor?: string;
  itemDescColor?: string;
  hoverable?: boolean;
}

export function Features({
  id,
  title,
  subtitle,
  items = [],
  columns = 3,
  bgColor = "var(--color-surface)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
  itemTitleColor = "var(--color-text)",
  itemDescColor = "var(--color-text-muted)",
  hoverable = true,
}: FeaturesProps) {
  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section id={id} className="py-20 px-6" style={{ backgroundColor: bgColor }}>
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

        <div className={`grid gap-6 ${colStyles[columns]}`}>
          {items.map((item, i) => (
            <Card key={i} hoverable={hoverable} shadow="sm">
              {item.icon && (
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                  style={{ backgroundColor: "var(--color-primary)", opacity: 0.15 }}
                />
              )}
              <h3 className="font-semibold text-base mb-2" style={{ color: itemTitleColor }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: itemDescColor }}>
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
