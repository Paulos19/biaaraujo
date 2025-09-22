// components/admin/mobile-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, List, Calendar, GanttChartSquare, Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Início", icon: Home },
  { href: "/admin/dashboard/servicos", label: "Serviços", icon: List },
  { href: "/admin/dashboard/agenda", label: "Agenda", icon: Calendar },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-4">
        <div className="mb-8 flex items-center">
            <GanttChartSquare className="h-8 w-8 text-secondary" />
            <h1 className="ml-3 text-2xl font-bold text-primary">Bia Araujo</h1>
        </div>
        <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== "/admin/dashboard" || pathname === item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)} // Fecha o menu ao clicar
                        className={cn(
                        "flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                        isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}