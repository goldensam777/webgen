"use client";
import React, { useState, useEffect, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  title?: string;
}

interface ToastProps {
  position?: "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center";
}

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode; iconColor: string }> = {
  success: {
    bg: "bg-white border-green-200",
    iconColor: "text-green-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: "bg-white border-red-200",
    iconColor: "text-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-white border-yellow-200",
    iconColor: "text-yellow-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-white border-blue-200",
    iconColor: "text-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      </svg>
    ),
  },
};

const positionStyles: Record<string, string> = {
  "top-right":      "top-4 right-4 items-end",
  "top-left":       "top-4 left-4 items-start",
  "top-center":     "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right":   "bottom-4 right-4 items-end",
  "bottom-left":    "bottom-4 left-4 items-start",
  "bottom-center":  "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

/* ── Store global ────────────────────────────────────────────── */
type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

const notify = () => listeners.forEach((l) => l([...toasts]));

export const toast = {
  show: (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, message, type, title, duration }];
    notify();
    if (duration > 0) setTimeout(() => toast.dismiss(id), duration);
    return id;
  },
  success: (message: string, title?: string, duration?: number) =>
    toast.show(message, "success", title, duration),
  error: (message: string, title?: string, duration?: number) =>
    toast.show(message, "error", title, duration),
  warning: (message: string, title?: string, duration?: number) =>
    toast.show(message, "warning", title, duration),
  info: (message: string, title?: string, duration?: number) =>
    toast.show(message, "info", title, duration),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

/* ── Composant ToastContainer ────────────────────────────────── */
export function ToastContainer({ position = "top-right" }: ToastProps) {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => setItems(t);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const dismiss = useCallback((id: string) => toast.dismiss(id), []);

  return (
    <div className={`fixed z-9999 flex flex-col gap-2 pointer-events-none
      ${positionStyles[position]}`}>
      {items.map((item) => {
        const style = toastStyles[item.type ?? "info"];
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3
              rounded-xl border shadow-lg min-w-70 max-w-sm
              ${style.bg} animate-in slide-in-from-right-4 fade-in duration-200`}
          >
            <span className={`shrink-0 mt-0.5 ${style.iconColor}`}>
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              {item.title && (
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              )}
              <p className="text-sm text-gray-600">{item.message}</p>
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}