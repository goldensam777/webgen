"use client";
import React, { useRef, useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  bgColor?: string;
  textColor?: string;
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = "top",
  bgColor = "bg-gray-900",
  textColor = "text-white",
  delay = 0,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap pointer-events-none
            ${bgColor} ${textColor} ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
