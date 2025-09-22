// components/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, List, Calendar, GanttChartSquare, ChevronsLeft, ChevronsRight } from "lucide-react";

import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Início", icon: Home },
  { href: "/admin/dashboard/servicos", label: "Serviços", icon: List },
  { href: "/admin/dashboard/agenda", label: "Agenda", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? "16rem" : "4rem" }} // 16rem = w-64, 4rem = w-16
      transition={{ duration: 0.3 }}
      className="hidden md:flex fixed left-0 top-0 h-full border-r bg-background z-10 p-4 flex-col"
    >
      <div className="mb-8 flex items-center justify-between">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <GanttChartSquare className="h-8 w-8 text-secondary flex-shrink-0" />
              <h1 className="ml-3 text-2xl font-bold text-primary whitespace-nowrap">Bia Araujo</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== "/admin/dashboard" || pathname === item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md p-2 my-1 text-sm font-medium transition-colors justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isOpen && "mr-3")} />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <Button onClick={toggle} variant="ghost" size="icon" className="mt-auto self-end">
        {isOpen ? <ChevronsLeft /> : <ChevronsRight />}
      </Button>
    </motion.aside>
  );
}