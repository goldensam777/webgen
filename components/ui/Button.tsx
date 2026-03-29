import React from "react";

interface ButtonWp {
  children: React.ReactNode;
  isDefault?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  isDefault = true,
  className = "",
  style,
  onClick,
  disabled = false,
  type = "button",
}: ButtonWp) {
  const defaultStyle = "bg-white border border-gray-300 text-gray-800 hover:border-black hover:bg-gray-50";
  const primaryStyle = "bg-blue-600 text-white hover:bg-blue-700";
  const buttonStyle = isDefault ? defaultStyle : primaryStyle;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`inline-flex items-center justify-center text-center whitespace-normal break-words
        px-6 py-2 rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonStyle} ${className}`}
    >
      {children}
    </button>
  );
}
