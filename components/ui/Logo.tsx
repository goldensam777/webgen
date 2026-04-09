// components/ui/Logo.tsx
import React from "react";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Branche de fond (Structure) */}
      <rect x="22" y="28" width="56" height="14" rx="7" transform="rotate(45 22 28)" fill="currentColor" opacity="0.1" />
      
      {/* Branche principale (Vitesse) */}
      <rect x="22" y="72" width="60" height="16" rx="8" transform="rotate(-45 22 72)" fill="url(#logo-grad)" />
      
      {/* Branche secondaire (Flux IA) */}
      <rect x="28" y="22" width="40" height="16" rx="8" transform="rotate(45 28 22)" fill="url(#logo-grad)" opacity="0.8" />

      {/* L'Étincelle de Création (Sparkle) */}
      <path d="M50 32L53.5 46.5L68 50L53.5 53.5L50 68L46.5 53.5L32 50L46.5 46.5L50 32Z" fill="white" filter="url(#glow)" />
    </svg>
  );
}
