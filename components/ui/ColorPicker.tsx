"use client";
import React, { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  presets?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  labelColor?: string;
  borderColor?: string;
  bgColor?: string;
}

const DEFAULT_PRESETS = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#64748b", "#a16207",
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) =>
    Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")
  ).join("");
}

function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  label,
  presets = DEFAULT_PRESETS,
  showInput = true,
  showPresets = true,
  disabled = false,
  size = "md",
  labelColor = "text-gray-700",
  borderColor = "border-gray-200",
  bgColor = "bg-white",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  const [inputVal, setInputVal] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHsl(hexToHsl(value));
    setInputVal(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emit = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    setInputVal(hex);
    onChange?.(hex);
  };

  const handleGradient = (clientX: number, clientY: number) => {
    const rect = gradientRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const s = Math.round(x * 100);
    const l = Math.round((1 - y) * 50 + (1 - x) * y * 50);
    const next = { ...hsl, s, l };
    setHsl(next);
    emit(next.h, next.s, next.l);
  };

  const handleHue = (clientX: number) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const h = Math.round(x * 360);
    const next = { ...hsl, h };
    setHsl(next);
    emit(next.h, next.s, next.l);
  };

  const handleInput = (v: string) => {
    setInputVal(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      const next = hexToHsl(v);
      setHsl(next);
      onChange?.(v);
    }
  };

  const sizeStyles = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const currentHex = hslToHex(hsl.h, hsl.s, hsl.l);
  const thumbX = hsl.s;
  const thumbY = 100 - (hsl.l / (hsl.s === 0 ? 1 : 1) * (100 - hsl.s / 2) / 50) * 100;

  return (
    <div ref={ref} className="relative inline-flex flex-col gap-1">
      {label && (
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
      )}

      {/* Trigger */}
      <button
        disabled={disabled}
        onClick={(e) => {
          if (!disabled) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const panelW = 256; // w-64
            // Ouvre à droite du trigger ; si ça dépasse à droite, recule
            let left = rect.right + 8;
            if (left + panelW > window.innerWidth - 8) {
              left = rect.left - panelW - 8;
            }
            // Dernier recours : centré sur le trigger
            if (left < 8) left = Math.max(8, rect.left);
            if (ref.current) {
              ref.current.style.setProperty('--picker-top', `${rect.top}px`);
              ref.current.style.setProperty('--picker-left', `${left}px`);
            }
            setOpen((v) => !v);
          }
        }}
        className={`${sizeStyles[size]} rounded-lg border-2 ${borderColor}
          shadow-sm transition-transform hover:scale-105 disabled:opacity-50
          disabled:cursor-not-allowed`}
        style={{ backgroundColor: currentHex }}
      />

      {/* Picker panel */}
      {open && (
        <div
          className={`fixed z-9999 w-64 rounded-2xl
            border ${borderColor} ${bgColor} shadow-xl p-4 flex flex-col gap-3
            animate-in fade-in zoom-in-95 duration-150`}
          style={{
            top:  ref.current?.style.getPropertyValue('--picker-top')  ?? '0px',
            left: ref.current?.style.getPropertyValue('--picker-left') ?? '0px',
          }}
        >

          {/* Gradient */}
          <div
            ref={gradientRef}
            className="relative w-full h-36 rounded-lg cursor-crosshair select-none"
            style={{
              background: `
                linear-gradient(to bottom, transparent, black),
                linear-gradient(to right, white, hsl(${hsl.h}, 100%, 50%))
              `,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleGradient(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              handleGradient(e.clientX, e.clientY);
            }}
          >
            {/* Thumb */}
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md
                -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${hsl.s}%`,
                top: `${100 - hsl.l * 2}%`,
                backgroundColor: currentHex,
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            ref={hueRef}
            className="relative w-full h-3 rounded-full cursor-pointer select-none"
            style={{
              background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleHue(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              handleHue(e.clientX);
            }}
          >
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md
                -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
              style={{
                left: `${(hsl.h / 360) * 100}%`,
                backgroundColor: `hsl(${hsl.h}, 100%, 50%)`,
              }}
            />
          </div>

          {/* Presets */}
          {showPresets && (
            <div className="flex flex-wrap gap-1.5">
              {presets.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-md border-2 transition-transform
                    hover:scale-110
                    ${color === currentHex ? "border-blue-500 scale-110" : borderColor}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const next = hexToHsl(color);
                    setHsl(next);
                    setInputVal(color);
                    onChange?.(color);
                  }}
                />
              ))}
            </div>
          )}

          {/* Hex input */}
          {showInput && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md border shrink-0"
                style={{ backgroundColor: currentHex }}
              />
              <input
                value={inputVal}
                onChange={(e) => handleInput(e.target.value)}
                className={`flex-1 px-2 py-1 text-sm font-mono rounded-lg
                  border ${borderColor} text-gray-900 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent`}
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}