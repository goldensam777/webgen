import React from "react";

interface AlertProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  titleColor?: string;
  onClose?: () => void;
}

export function Alert({
  children,
  title,
  icon,
  bgColor = "bg-blue-50",
  textColor = "text-blue-700",
  borderColor = "border-blue-200",
  titleColor = "text-blue-800",
  onClose,
}: AlertProps) {
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1">
        {title && <p className={`font-semibold text-sm mb-1 ${titleColor}`}>{title}</p>}
        <p className={`text-sm ${textColor}`}>{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
