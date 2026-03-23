import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  bordered?: boolean;
}

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  bgColor = "bg-gray-200",
  textColor = "text-gray-700",
  borderColor = "border-gray-300",
  bordered = false,
}: AvatarProps) {
  const sizeStyles = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const baseClass = `inline-flex items-center justify-center rounded-full overflow-hidden
    ${sizeStyles[size]} ${bordered ? `border-2 ${borderColor}` : ""}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${baseClass} object-cover`}
      />
    );
  }

  return (
    <div className={`${baseClass} ${bgColor} ${textColor} font-semibold`}>
      {initials?.slice(0, 2).toUpperCase()}
    </div>
  );
}
