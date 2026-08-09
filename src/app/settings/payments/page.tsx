"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PaymentsHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pembayaran" | "langganan">("pembayaran");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg pr-7">Riwayat Pembayaran</h1>
      </header>

      <div className="p-4 flex-1 flex flex-col">
        
        {/* Tabs */}
        <div className="flex bg-secondary/50 border border-border/50 p-1 rounded-2xl mb-24">
          <button
            onClick={() => setActiveTab("pembayaran")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === "pembayaran" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className="w-4 h-4" /> Pembayaran
          </button>
          <button
            onClick={() => setActiveTab("langganan")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === "langganan" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <RefreshCcw className="w-4 h-4" /> Langganan
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center flex-1 text-center max-w-xs mx-auto -mt-20">
          <div className="w-16 h-12 bg-sky-400 rounded-lg relative mb-6 shadow-lg shadow-sky-400/20">
            <div className="absolute top-2 w-full h-2.5 bg-sky-600/50" />
            <div className="absolute bottom-2 right-2 w-4 h-2.5 bg-amber-400 rounded-sm" />
          </div>
          
          <h2 className="text-xl font-bold mb-3">Belum ada riwayat pembayaran</h2>
          <p className="text-sm text-muted-foreground">
            Riwayat akan muncul setelah kamu melakukan transaksi
          </p>
        </div>

      </div>
    </div>
  );
}
