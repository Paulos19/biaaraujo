// app/(main)/layout.tsx
import { Header } from "@/components/header"; // Importe nosso novo header

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}