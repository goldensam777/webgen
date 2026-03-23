import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  labelColor?: string;
  size?: "sm" | "md" | "lg";
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  activeColor = "bg-blue-600",
  inactiveColor = "bg-gray-200",
  labelColor = "text-gray-700",
  size = "md",
}: ToggleProps) {
  const sizeStyles = {
    sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
    md: { track: "w-11 h-6", thumb: "w-4 h-4", translate: "translate-x-5" },
    lg: { track: "w-14 h-7", thumb: "w-5 h-5", translate: "translate-x-7" },
  };

  const s = sizeStyles[size];

  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex items-center ${s.track} rounded-full transition-colors duration-200
          ${checked ? activeColor : inactiveColor}`}
      >
        <span
          className={`inline-block ${s.thumb} bg-white rounded-full shadow transform transition-transform duration-200
            ${checked ? s.translate : "translate-x-1"}`}
        />
      </div>
      {label && <span className={`text-sm font-medium ${labelColor}`}>{label}</span>}
    </label>
  );
}
