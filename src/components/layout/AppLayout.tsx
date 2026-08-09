"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav = pathname === "/add";

  return (
    <div className={`relative min-h-screen bg-background ${!hideBottomNav ? 'pb-20' : ''}`}>
      {/* 
        pb-20 (80px) is to ensure content isn't hidden behind the fixed BottomNav.
        We can adjust this value based on the actual height of the BottomNav + FAB.
      */}
      <main className="max-w-md mx-auto min-h-screen w-full relative shadow-sm bg-background border-x border-border/50">
        {children}
        {!hideBottomNav && <BottomNav />}
      </main>
    </div>
  );
}
