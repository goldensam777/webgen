import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  trackColor?: string;
  thickness?: string;
  label?: string;
  labelColor?: string;
}

export function Spinner({
  size = "md",
  color = "border-blue-600",
  trackColor = "border-gray-200",
  thickness = "border-2",
  label,
  labelColor = "text-gray-500",
}: SpinnerProps) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className={`${sizeStyles[size]} ${thickness} ${trackColor} ${color}
          border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label ?? "Chargement..."}
      />
      {label && <span className={`text-sm ${labelColor}`}>{label}</span>}
    </div>
  );
}
