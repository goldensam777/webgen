import React from "react";

interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  borderColor?: string;
  focusRingColor?: string;
  labelColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export function Input({
  value,
  onChange,
  placeholder = "",
  label,
  type = "text",
  disabled = false,
  error,
  borderColor = "border-gray-300",
  focusRingColor = "focus:ring-blue-500",
  labelColor = "text-gray-700",
  bgColor = "bg-white",
  textColor = "text-gray-900",
  className = "",
}: InputProps) {
  const borderStyle = error ? "border-red-500" : borderColor;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${labelColor}`}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border ${borderStyle} ${bgColor} ${textColor}
          focus:outline-none focus:ring-2 ${focusRingColor} focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
