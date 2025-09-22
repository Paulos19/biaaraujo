// app/admin/dashboard/layout.tsx
"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileSidebar } from "@/components/admin/mobile-sidebar"; // Importe a sidebar mobile
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar para Desktop (só aparece em telas 'md' ou maiores) */}
      <Sidebar />

      {/* Conteúdo Principal com padding responsivo */}
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          // Em telas 'md' ou maiores, o padding depende do estado da sidebar
          isOpen ? "md:pl-64" : "md:pl-16" 
        )}
      >
        {/* Header que só aparece em telas mobile para o botão hambúrguer */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <MobileSidebar />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}