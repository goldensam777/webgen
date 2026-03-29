import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

interface PricingPlan {
  name: string;
  price: number | string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  highlighted?: boolean;
  badgeLabel?: string;
}

interface PricingProps {
  id?: string;
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export function Pricing({
  id,
  title,
  subtitle,
  plans = [],
  bgColor = "var(--color-surface)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
}: PricingProps) {
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  } as const;
  const gridClass = colStyles[Math.min(Math.max(plans.length, 1), 3) as 1 | 2 | 3];

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

        <div className={`grid gap-6 ${gridClass}`}>
          {plans.map((plan, i) => {
            const isHighlighted = plan.highlighted;
            return (
              <CanvasElement id={`plan-${i}`} key={i}>
              <Card
                bgColor={isHighlighted ? "var(--color-primary)" : "var(--color-surface)"}
                shadow={isHighlighted ? "xl" : "sm"}
                className="flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: isHighlighted ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)" }}
                  >
                    {plan.name}
                  </span>
                  {plan.badgeLabel && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: isHighlighted ? "rgba(255,255,255,0.2)" : "var(--color-primary)",
                        color: "#ffffff",
                      }}
                    >
                      {plan.badgeLabel}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span
                    className="text-4xl font-bold break-words"
                    style={{ color: isHighlighted ? "#ffffff" : "var(--color-text)" }}
                  >
                    {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm ml-1"
                      style={{ color: isHighlighted ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>

                {plan.description && (
                  <p
                    className="text-sm mb-6 break-words"
                    style={{ color: isHighlighted ? "rgba(255,255,255,0.7)" : "var(--color-text-muted)" }}
                  >
                    {plan.description}
                  </p>
                )}

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {(plan.features ?? []).map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: isHighlighted ? "#ffffff" : "var(--color-primary)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="break-words" style={{ color: isHighlighted ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a href={plan.ctaHref ?? "#"}>
                  <Button isDefault={isHighlighted ? false : true} className="w-full justify-center">
                    {plan.ctaLabel ?? "Commencer"}
                  </Button>
                </a>
              </Card>
              </CanvasElement>
            );
          })}
        </div>
      </div>
    </section>
  );
}
