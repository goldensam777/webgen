import React from "react";

interface DividerProps {
  label?: string;
  color?: string;
  thickness?: string;
  orientation?: "horizontal" | "vertical";
  labelColor?: string;
  labelBg?: string;
}

export function Divider({
  label,
  color = "border-gray-200",
  thickness = "border-t",
  orientation = "horizontal",
  labelColor = "text-gray-400",
  labelBg = "bg-white",
}: DividerProps) {
  if (orientation === "vertical") {
    return <div className={`inline-block h-full border-l ${color} mx-2`} />;
  }

  if (label) {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex-1 ${thickness} ${color}`} />
        <span className={`text-sm ${labelColor} ${labelBg} px-2`}>{label}</span>
        <div className={`flex-1 ${thickness} ${color}`} />
      </div>
    );
  }

  return <div className={`w-full ${thickness} ${color}`} />;
}
