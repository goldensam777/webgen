import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  height?: string;
  bgColor?: string;
  fillColor?: string;
  labelColor?: string;
  percentColor?: string;
  rounded?: "none" | "sm" | "md" | "full";
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  height = "h-2",
  bgColor = "bg-gray-200",
  fillColor = "bg-blue-600",
  labelColor = "text-gray-700",
  percentColor = "text-gray-500",
  rounded = "full",
  animated = false,
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    full: "rounded-full",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className={`text-sm font-medium ${labelColor}`}>{label}</span>}
          {showPercent && <span className={`text-sm ${percentColor}`}>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={`w-full ${height} ${bgColor} ${roundedStyles[rounded]} overflow-hidden`}>
        <div
          className={`h-full ${fillColor} ${roundedStyles[rounded]}
            transition-all duration-500 ease-out
            ${animated ? "animate-pulse" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
