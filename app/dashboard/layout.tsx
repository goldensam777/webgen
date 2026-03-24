import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Dashboard",
  description: "Gérez vos sites web créés avec Webgen.",
  robots:      { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
