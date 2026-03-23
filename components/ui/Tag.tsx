import React from "react";

interface TagProps {
  children: React.ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBgColor?: string;
}

export function Tag({
  children,
  onClick,
  onRemove,
  removable = false,
  bgColor = "bg-gray-100",
  textColor = "text-gray-700",
  borderColor = "border-gray-300",
  hoverBgColor = "hover:bg-gray-200",
}: TagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm
        border ${bgColor} ${textColor} ${borderColor} ${hoverBgColor}
        ${onClick ? "cursor-pointer" : ""} transition-colors duration-150`}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
