"use client";
import React, { useState } from "react";

interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: "underline" | "pills" | "boxed";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  bgColor?: string;
  activeColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  borderColor?: string;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onChange,
  variant = "underline",
  size = "md",
  fullWidth = false,
  bgColor = "bg-white",
  activeColor = "bg-blue-600",
  activeTextColor = "text-blue-600",
  inactiveTextColor = "text-gray-500",
  borderColor = "border-gray-200",
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;

  const handleChange = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2",
  };

  const activeContent = items.find((i) => i.value === active)?.content;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab list ─────────────────────────────────────────── */}
      <div
        className={`flex ${fullWidth ? "w-full" : "w-fit"}
          ${variant === "underline"
            ? `border-b ${borderColor}`
            : variant === "boxed"
              ? `${bgColor} border ${borderColor} rounded-xl p-1`
              : "gap-1"
          }`}
      >
        {items.map((item) => {
          const isActive = item.value === active;

          const baseClass = `flex items-center font-medium transition-all duration-200
            ${sizeStyles[size]}
            ${fullWidth ? "flex-1 justify-center" : ""}
            ${item.disabled
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer"
            }`;

          const variantClass =
            variant === "underline"
              ? `border-b-2 -mb-px rounded-none
                 ${isActive
                   ? `border-blue-600 ${activeTextColor}`
                   : `border-transparent ${inactiveTextColor} hover:${activeTextColor}`
                 }`
              : variant === "pills"
                ? `rounded-full
                   ${isActive
                     ? `${activeColor} text-white shadow-sm`
                     : `${inactiveTextColor} hover:bg-gray-100`
                   }`
                : /* boxed */
                  `rounded-lg
                   ${isActive
                     ? `${activeColor} text-white shadow-sm`
                     : `${inactiveTextColor} hover:bg-gray-100`
                   }`;

          return (
            <button
              key={item.value}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleChange(item.value)}
              className={`${baseClass} ${variantClass}`}
            >
              {item.icon && (
                <span className="w-4 h-4 shrink-0">{item.icon}</span>
              )}
              {item.label}
              {item.badge !== undefined && (
                <span className={`inline-flex items-center justify-center
                  min-w-4.5 h-4.5 px-1 rounded-full text-xs font-semibold
                  ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      {activeContent && (
        <div className="animate-in fade-in duration-200">
          {activeContent}
        </div>
      )}
    </div>
  );
}