"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Wallet, User, Plus, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Riwayat", href: "/history", icon: List },
    { name: "Add", href: "/add", icon: Plus, isFab: true },
    { name: "Dompet", href: "/wallet", icon: Wallet },
    { name: "Profil", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
      <nav className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.isFab) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-5 flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                <item.icon className="w-6 h-6" />
                <span className="sr-only">Tambah Transaksi</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-1", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
