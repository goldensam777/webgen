import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Connexion",
  description: "Connectez-vous à Webgen pour accéder à vos sites, les éditer et les publier.",
  robots:      { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
