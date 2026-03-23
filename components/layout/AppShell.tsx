"use client";
import React, { useState } from "react";
import { Sidebar } from "../ui/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  sidebarItems: React.ComponentProps<typeof Sidebar>["items"];
  activeValue?: string;
  onNavigate?: (value: string) => void;
  logo?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  header?: React.ReactNode;
  bgColor?: string;
  sidebarBgColor?: string;
  borderColor?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function AppShell({
  children,
  sidebarItems,
  activeValue,
  onNavigate,
  logo,
  sidebarFooter,
  header,
  bgColor = "bg-gray-50",
  sidebarBgColor = "bg-white",
  borderColor = "border-gray-200",
  collapsible = true,
  defaultCollapsed = false,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <Sidebar
        items={sidebarItems}
        activeValue={activeValue}
        onSelect={onNavigate}
        logo={logo}
        footer={sidebarFooter}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
        bgColor={sidebarBgColor}
        borderColor={borderColor}
      />

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${bgColor}`}>
        {/* Header */}
        {header && (
          <header className={`shrink-0 h-14 flex items-center px-6
            border-b ${borderColor} bg-white`}>
            {header}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}