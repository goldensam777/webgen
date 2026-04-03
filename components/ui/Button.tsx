// components/ui/Button.tsx
import React from "react";

interface ButtonWp {
  children: React.ReactNode;
  isDefault?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function Button({
  children,
  isDefault = true,
  className = "",
  style = {},
  onClick,
  disabled = false,
  type = "button",
}: ButtonWp) {
  const buttonStyle = isDefault
    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98]"
    : "glass border-white/10 hover:bg-white/10";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`
        inline-flex items-center text-center whitespace-normal break-words
        px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${buttonStyle} ${className}`}
    >
      {children}
    </button>
  );
}
