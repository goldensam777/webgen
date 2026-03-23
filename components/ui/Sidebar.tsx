"use client";
import React, { useState } from "react";

interface SidebarItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  divider?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  activeValue?: string;
  onSelect?: (value: string) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  width?: string;
  collapsedWidth?: string;
  bgColor?: string;
  borderColor?: string;
  activeColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  labelColor?: string;
  iconColor?: string;
}

export function Sidebar({
  items,
  activeValue,
  onSelect,
  logo,
  footer,
  collapsible = false,
  defaultCollapsed = false,
  width = "w-64",
  collapsedWidth = "w-16",
  bgColor = "bg-white",
  borderColor = "border-gray-200",
  activeColor = "bg-blue-50",
  activeTextColor = "text-blue-600",
  inactiveTextColor = "text-gray-600",
  labelColor = "text-gray-900",
  iconColor = "text-gray-400",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (value: string) => {
    setExpanded((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const renderItems = (list: SidebarItem[], depth = 0) =>
    list.map((item, i) => {
      if (item.divider) {
        return (
          <div key={i} className={`my-2 border-t ${borderColor}`} />
        );
      }

      const isActive = item.value === activeValue;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expanded.includes(item.value);

      const baseClass = `flex items-center gap-3 w-full px-3 py-2 rounded-lg
        text-sm font-medium transition-all duration-150 text-left
        ${depth > 0 ? "ml-4 w-[calc(100%-1rem)]" : ""}
        ${item.disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
        }
        ${isActive
          ? `${activeColor} ${activeTextColor}`
          : `${inactiveTextColor} hover:bg-gray-50 hover:${activeTextColor}`
        }`;

      return (
        <div key={item.value}>
          <button
            disabled={item.disabled}
            className={baseClass}
            onClick={() => {
              if (item.disabled) return;
              if (hasChildren) toggleExpand(item.value);
              else onSelect?.(item.value);
            }}
          >
            {/* Icon */}
            {item.icon && (
              <span className={`shrink-0 w-5 h-5
                ${isActive ? activeTextColor : iconColor}`}>
                {item.icon}
              </span>
            )}

            {/* Label */}
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}

            {/* Badge */}
            {!collapsed && item.badge !== undefined && (
              <span className={`inline-flex items-center justify-center
                min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold
                ${isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
                }`}>
                {item.badge}
              </span>
            )}

            {/* Chevron */}
            {!collapsed && hasChildren && (
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-200
                  ${isExpanded ? "rotate-180" : ""} ${iconColor}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Children */}
          {hasChildren && isExpanded && !collapsed && (
            <div className="mt-1 animate-in fade-in slide-in-from-top-2 duration-150">
              {renderItems(item.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <aside
      className={`flex flex-col h-full border-r ${borderColor} ${bgColor}
        transition-all duration-300
        ${collapsed ? collapsedWidth : width}`}
    >
      {/* Logo */}
      {logo && (
        <div className={`flex items-center px-4 py-5 border-b ${borderColor}
          ${collapsed ? "justify-center" : "justify-between"}`}>
          {logo}
          {collapsible && (
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={`text-gray-400 hover:text-gray-600 transition-colors
                ${collapsed ? "mt-0" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d={collapsed
                    ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                    : "M11 19l-7-7 7-7M19 19l-7-7 7-7"
                  } />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {renderItems(items)}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className={`px-3 py-4 border-t ${borderColor}`}>
          {footer}
        </div>
      )}
    </aside>
  );
}