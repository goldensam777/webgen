"use client";
import React, { useState } from "react";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

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
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
  };

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

        <div
          className="border rounded-xl overflow-hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          {items.map((item, i) => {
            const isOpen = openIndexes.includes(i);
            return (
              <CanvasElement id={`faq-${i}`} key={i}>
                <div
                  className={i > 0 ? "border-t" : ""}
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:brightness-95 transition-all duration-150"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                    }}
                  >
                    <span className="font-medium text-sm">{item.title}</span>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--color-text-muted)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div
                      className="px-5 py-4 text-sm"
                      style={{
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                </div>
              </CanvasElement>
            );
          })}
        </div>
      </div>
    </section>
  );
}
