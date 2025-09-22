// components/header.tsx
"use client"; // Precisa ser um client component para usar hooks

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
    { href: "/agendar", label: "Agendar" },
    { href: "/cursos", label: "Cursos" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Bia Araujo</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="relative transition-colors hover:text-primary text-muted-foreground"
                    >
                        {/* Adiciona cor primária se o link estiver ativo */}
                        {isActive && <span className="absolute -inset-1 z-0 rounded-full" aria-hidden="true" />}
                        <span className="relative z-10">{link.label}</span>
                        
                        {/* O sublinhado animado */}
                        {isActive && (
                            <motion.span
                                layoutId="underline" // A mágica da animação acontece aqui
                                className="absolute left-0 top-full block h-[2px] w-full bg-secondary"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </Link>
                )
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}