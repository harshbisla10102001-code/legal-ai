"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <aside className="absolute inset-y-0 left-0 z-50 w-[280px] shadow-xl animate-slide-in">
            <Sidebar onNavigate={closeMenu} />
          </aside>
        </div>
      )}

      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col">
          <DashboardHeader name={name} onMenuToggle={toggleMenu} />
          <main className="mx-auto w-full max-w-6xl flex-1 p-3 sm:p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
