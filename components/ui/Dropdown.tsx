"use client";
import React, { useState, useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  bgColor?: string;
  borderColor?: string;
  itemTextColor?: string;
  itemHoverBg?: string;
  dangerColor?: string;
  disabledColor?: string;
  width?: string;
}

export function Dropdown({
  trigger,
  items,
  position = "bottom-left",
  bgColor = "bg-white",
  borderColor = "border-gray-200",
  itemTextColor = "text-gray-700",
  itemHoverBg = "hover:bg-gray-50",
  dangerColor = "text-red-600",
  disabledColor = "text-gray-300",
  width = "w-48",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const positionStyles = {
    "bottom-left":  "top-full left-0 mt-1",
    "bottom-right": "top-full right-0 mt-1",
    "top-left":     "bottom-full left-0 mb-1",
    "top-right":    "bottom-full right-0 mb-1",
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute z-50 ${positionStyles[position]} ${width}
            ${bgColor} border ${borderColor} rounded-xl shadow-lg py-1
            animate-in fade-in zoom-in-95 duration-150`}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className={`my-1 border-t ${borderColor}`} />;
            }

            const baseClass = `flex items-center gap-2 w-full px-4 py-2 text-sm
              transition-colors duration-150 text-left
              ${item.disabled
                ? `${disabledColor} cursor-not-allowed`
                : item.danger
                  ? `${dangerColor} ${itemHoverBg} cursor-pointer`
                  : `${itemTextColor} ${itemHoverBg} cursor-pointer`
              }`;

            if (item.href && !item.disabled) {
              return (
                <a key={i} href={item.href} className={baseClass}
                  onClick={() => setOpen(false)}>
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={i}
                disabled={item.disabled}
                className={baseClass}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setOpen(false);
                  }
                }}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}