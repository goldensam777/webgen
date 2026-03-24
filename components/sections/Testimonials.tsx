import React from "react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { EditableText } from "../editor/EditableText";

interface TestimonialItem {
  quote: string;
  name: string;
  role?: string;
  avatarSrc?: string;
  initials?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
  columns?: 2 | 3;
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  quoteColor?: string;
  nameColor?: string;
  roleColor?: string;
}

export function Testimonials({
  title,
  subtitle,
  items = [],
  columns = 3,
  bgColor = "var(--color-surface)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
  quoteColor = "var(--color-text-muted)",
  nameColor = "var(--color-text)",
  roleColor = "var(--color-text-muted)",
}: TestimonialsProps) {
  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

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

        <div className={`grid gap-6 ${colStyles[columns]}`}>
          {items.map((item, i) => (
            <Card key={i} shadow="sm">
              <p className="text-sm leading-relaxed mb-5" style={{ color: quoteColor }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={item.avatarSrc}
                  initials={item.initials ?? item.name}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: nameColor }}>
                    {item.name}
                  </p>
                  {item.role && (
                    <p className="text-xs" style={{ color: roleColor }}>
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
