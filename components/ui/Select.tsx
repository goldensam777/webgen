import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  borderColor?: string;
  focusRingColor?: string;
  labelColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  borderColor = "border-gray-300",
  focusRingColor = "focus:ring-blue-500",
  labelColor = "text-gray-700",
  bgColor = "bg-white",
  textColor = "text-gray-900",
  className = "",
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${labelColor}`}>{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor}
          focus:outline-none focus:ring-2 ${focusRingColor} focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
