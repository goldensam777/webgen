import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "md" | "sm";
}

export function Badge({
  children,
  bgColor = "bg-gray-100",
  textColor = "text-gray-700",
  borderColor = "border-gray-200",
  size = "md",
  rounded = "full",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const roundedStyles = {
    full: "rounded-full",
    md: "rounded-md",
    sm: "rounded-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium border
        ${sizeStyles[size]} ${roundedStyles[rounded]}
        ${bgColor} ${textColor} ${borderColor}`}
    >
      {children}
    </span>
  );
}
