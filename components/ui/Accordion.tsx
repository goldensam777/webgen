"use client";
import React, { useState } from "react";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  borderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  contentBgColor?: string;
  contentTextColor?: string;
  iconColor?: string;
  allowMultiple?: boolean;
}

export function Accordion({
  items,
  defaultOpen,
  borderColor = "var(--color-border)",
  headerBgColor = "var(--color-surface)",
  headerTextColor = "var(--color-text)",
  contentBgColor = "var(--color-background)",
  contentTextColor = "var(--color-text-muted)",
  iconColor = "var(--color-text-muted)",
  allowMultiple = false,
}: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(
    defaultOpen !== undefined ? [defaultOpen] : []
  );

  const toggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div
      className="border rounded-xl overflow-hidden"
      style={{ borderColor }}
    >
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            className={index > 0 ? "border-t" : ""}
            style={{ borderColor }}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left
                hover:brightness-95 transition-all duration-150"
              style={{ backgroundColor: headerBgColor, color: headerTextColor }}
            >
              <span className="font-medium text-sm">{item.title}</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                style={{ color: iconColor }}
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
                style={{ backgroundColor: contentBgColor, color: contentTextColor }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
