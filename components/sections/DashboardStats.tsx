import React from "react";
import { StatCard } from "../ui/StatCard";

interface StatItem {
  label:   string;
  value:   string | number;
  trend?:  { value: number; label?: string };
  color?:  "green" | "blue" | "amber" | "red" | "purple" | "teal";
}

interface DashboardStatsProps {
  title?:   string;
  items:    StatItem[];
  columns?: 2 | 3 | 4;
  bgColor?: string;
}

const COL_CLS = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" };

export function DashboardStats({
  title,
  items   = [],
  columns = 3,
  bgColor = "var(--color-background)",
}: DashboardStatsProps) {
  return (
    <section className="py-8 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
        )}
        <div className={`grid gap-4 ${COL_CLS[columns]}`}>
          {items.map((item, i) => (
            <StatCard key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
