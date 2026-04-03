// app/dashboard/layout.tsx
import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export const metadata: Metadata = {
  title:       "Dashboard | Webgenx",
  description: "Gérez vos sites web créés avec Webgenx.",
  robots:      { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }}>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
