"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, Transaction, getAccountIcon } from "@/store/useStore";
import { Wallet, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, Trash2, PieChart } from "lucide-react";
import { cn, getGlassyColor } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function HistoryPage() {
  const router = useRouter();
  const { transactions, customCategories, accounts, deleteTransaction } = useStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const isInMonth = tDate >= startOfMonth && tDate <= new Date(endOfMonth.setHours(23, 59, 59, 999));
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.note || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount = selectedAccountId ? t.accountId === selectedAccountId : true;
    return isInMonth && matchesSearch && matchesAccount;
  });

  const monthTotal = filteredTransactions.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const d = new Date(t.date);
    const dateKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    
    if (isToday) return "HARI INI";
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
    
    if (isYesterday) return "KEMARIN";

    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-transparent">
        <div className="w-10"></div> {/* Spacer for center alignment */}
        <h1 className="font-bold text-base">Transaksi</h1>
        <Link href="/report" className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors bg-secondary/50 rounded-full active:scale-95">
          <PieChart className="w-5 h-5" />
        </Link>
      </header>

      <div className="px-4 space-y-4">
        
        {/* Top Green Card */}
        <div onClick={() => setIsWalletOpen(true)} className="bg-emerald-500 rounded-[20px] p-4 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              {selectedAccountId ? (
                (() => {
                  const acc = accounts.find(a => a.id === selectedAccountId);
                  const AccIcon = acc ? getAccountIcon(acc.type).icon : Wallet;
                  return <AccIcon className="w-5 h-5 text-white" />;
                })()
              ) : (
                <Wallet className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold opacity-90 tracking-wider uppercase">
                {selectedAccountId ? accounts.find(a => a.id === selectedAccountId)?.name || "Semua Dompet" : "Semua Dompet"}
              </p>
              <h2 className="text-xl font-bold mt-0.5">
                {monthTotal < 0 ? '-' : ''}Rp{Math.abs(monthTotal).toLocaleString('id-ID')}
              </h2>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <button onClick={goToPrevMonth} className="w-9 h-9 rounded-xl border border-border/50 bg-secondary/30 flex items-center justify-center hover:bg-secondary/60 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold">
            1 {currentDate.toLocaleDateString('id-ID', { month: 'short' })} - {endOfMonth.getDate()} {currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          </span>
          <button onClick={goToNextMonth} className="w-9 h-9 rounded-xl border border-border/50 bg-secondary/30 flex items-center justify-center hover:bg-secondary/60 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/30 border border-border/50 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-primary/50 transition-colors h-[46px]"
            />
          </div>
          <button className="w-[46px] h-[46px] shrink-0 border border-border/50 bg-secondary/30 rounded-2xl flex items-center justify-center hover:bg-secondary/60 transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-6 pt-2">
          {sortedDates.map(dateKey => (
            <div key={dateKey} className="space-y-2">
              {/* Group Header */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{formatDateHeader(dateKey)}</span>
                <span className="text-[10px] font-bold text-muted-foreground">{groupedTransactions[dateKey].length}</span>
              </div>
              
              {/* Transactions */}
              <div className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
                {groupedTransactions[dateKey].map((t, i) => {
                  const cat = customCategories.find(c => c.id === t.categoryId);
                  const acc = accounts.find(a => a.id === t.accountId);
                  
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => router.push(`/add?editId=${t.id}`)}
                      className={cn(
                        "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/40 transition-colors",
                        i !== 0 && "border-t border-border/30"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", cat ? getGlassyColor(cat.color) : getGlassyColor("bg-blue-500"))}>
                        <span className="text-xl leading-none">{cat?.iconName || "💡"}</span>
                      </div>
                      
                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{t.title}</p>
                      </div>
                      
                      {/* Amount & Account */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <p className={cn(
                          "font-bold text-sm",
                          t.type === 'expense' ? "text-rose-500" : "text-emerald-500"
                        )}>
                          {t.type === 'expense' ? '-' : '+'}Rp{t.amount.toLocaleString('id-ID')}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/80 border border-border/50 text-[9px] font-bold text-muted-foreground">
                            <Wallet className="w-2.5 h-2.5" />
                            <span>{acc?.name || "Cash"}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }} 
                            className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {sortedDates.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">Tidak ada transaksi ditemukan.</p>
            </div>
          )}
        </div>

      </div>

      {/* Wallet Selector Dialog */}
      <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
        <DialogContent className="w-[90vw] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle>Pilih Dompet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <button 
              onClick={() => { setSelectedAccountId(null); setIsWalletOpen(false); }} 
              className={cn("w-full flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors", !selectedAccountId && "ring-2 ring-primary bg-primary/5")}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left font-semibold text-sm">Semua Dompet</div>
            </button>
            {accounts.filter(a => !a.isLocked).map(acc => {
              const icon = getAccountIcon(acc.type);
              return (
                <button 
                  key={acc.id} 
                  onClick={() => { setSelectedAccountId(acc.id); setIsWalletOpen(false); }} 
                  className={cn("w-full flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors", selectedAccountId === acc.id && "ring-2 ring-primary bg-primary/5")}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", icon.bg)}>
                    <icon.icon className={cn("w-5 h-5", icon.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">Rp{acc.balance.toLocaleString('id-ID')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Transaksi?"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan kembali secara otomatis."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
