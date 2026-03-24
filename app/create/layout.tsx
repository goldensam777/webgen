import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Créer un site",
  description: "Décrivez votre projet et laissez l'IA générer votre site web en quelques secondes.",
  robots:      { index: false, follow: false },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
