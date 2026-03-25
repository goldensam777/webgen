import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title:       "Connexion",
  description: "Connectez-vous à Webgen pour accéder à vos sites, les éditer et les publier.",
  robots:      { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }} />}>
      {children}
    </Suspense>
  );
}
