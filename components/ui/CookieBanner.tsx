// components/ui/CookieBanner.tsx
"use client";
import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("webgenx-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("webgenx-cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[200] animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass rounded-[2rem] p-6 border shadow-3xl" style={{ borderColor: "var(--wg-border)", backgroundColor: "rgba(var(--wg-bg-2-rgb), 0.95)" }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight mb-1">Confidentialité</h4>
            <p className="text-[10px] opacity-60 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. En continuant, vous acceptez notre politique.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={accept}
            className="flex-1 btn-green py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            Accepter tout
          </button>
          <button 
            onClick={() => setVisible(false)}
            className="px-4 py-2.5 rounded-xl border text-[10px] font-bold opacity-40 hover:opacity-100 transition-opacity"
            style={{ borderColor: "var(--wg-border)" }}
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
