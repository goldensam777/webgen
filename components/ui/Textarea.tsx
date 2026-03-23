import React from "react";

interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  rows?: number;
  borderColor?: string;
  focusRingColor?: string;
  labelColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export function Textarea({
  value,
  onChange,
  placeholder = "",
  label,
  disabled = false,
  error,
  rows = 4,
  borderColor = "border-gray-300",
  focusRingColor = "focus:ring-blue-500",
  labelColor = "text-gray-700",
  bgColor = "bg-white",
  textColor = "text-gray-900",
  className = "",
}: TextareaProps) {
  const borderStyle = error ? "border-red-500" : borderColor;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${labelColor}`}>{label}</label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`px-4 py-2 rounded-lg border ${borderStyle} ${bgColor} ${textColor}
          focus:outline-none focus:ring-2 ${focusRingColor} focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed resize-y transition-all duration-200 ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
