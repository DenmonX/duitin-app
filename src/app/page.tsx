"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, 
  PieChart, Repeat, Target, Receipt, Handshake, Trash2, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, getCategoryIcon } from "@/store/useStore";
import { CashflowDialog } from "@/components/CashflowDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Bulan");
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isCashflowOpen, setIsCashflowOpen] = useState(false);
  const router = useRouter();
  
  const { user, accounts, transactions, deleteTransaction, addAccount, deleteAccount } = useStore();

  useEffect(() => {
    setIsClient(true);
    
    // Auto-migration & cleanup for PayLater account
    const currentAccounts = useStore.getState().accounts;
    const paylaterAccounts = currentAccounts.filter(a => a.type === 'paylater');
    if (paylaterAccounts.length > 1) {
      // Keep only the first one, delete the rest
      const [, ...duplicates] = paylaterAccounts;
      duplicates.forEach(dup => useStore.getState().deleteAccount(dup.id));
    } else if (paylaterAccounts.length === 0 && currentAccounts.length > 0) {
      useStore.getState().addAccount({ name: "PayLater", type: "paylater", balance: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteTransaction = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const filters = ["Hari", "Minggu", "Bulan", "Tahun", "Semua"];

  // Calculate totals
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const incomeTransactions = transactions.filter(t => t.type === "income");
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (amount: number) => {
    if (isPrivacyMode) return "Rp••••••";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Header */}
      <header className="flex justify-between items-center p-5 pt-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">~ Hai, {user.name}!</h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-secondary text-secondary-foreground">{user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Time Filters */}
      <div className="px-4 py-2 flex justify-between items-center overflow-x-auto no-scrollbar gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeFilter === filter 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main Balance Card */}
      <div className="px-4 mt-4">
        <Card className="bg-gradient-to-br from-blue-600 to-teal-500 border-none text-white shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-1">
                Total Saldo (IDR)
                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                {formatCurrency(totalBalance)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-300" />
                  Pemasukan
                </div>
                <div className="font-semibold">{formatCurrency(totalIncome)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                  <ArrowUpCircle className="w-4 h-4 text-rose-300" />
                  Pengeluaran
                </div>
                <div className="font-semibold">{formatCurrency(totalExpense)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Menu */}
      <div className="px-5 mt-8">
        <h3 className="text-lg font-semibold mb-4">Menu</h3>
        <div className="flex justify-between items-start">
          <MenuButton onClick={() => setIsCashflowOpen(true)} icon={CalendarDays} label="Cashflow" colorClass="text-emerald-500" bgClass="bg-emerald-500/10" />
          <MenuButton href="/budget" icon={PieChart} label="Anggaran" colorClass="text-fuchsia-500" bgClass="bg-fuchsia-500/10" />
          <MenuButton href="/goals" icon={Target} label="Goals" colorClass="text-green-500" bgClass="bg-green-500/10" />
          <MenuButton href="/bills" icon={Receipt} label="Tagihan" colorClass="text-red-500" bgClass="bg-red-500/10" />
          <MenuButton href="/debt" icon={Handshake} label="Utang" colorClass="text-purple-500" bgClass="bg-purple-500/10" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mt-8 mb-4">
        <h3 className="text-lg font-semibold mb-4">Transaksi Terakhir</h3>
        
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {transactions.slice(0, 5).map((trx) => {
                const cat = getCategoryIcon(trx.categoryId);
                const accName = accounts.find(a => a.id === trx.accountId)?.name || "Unknown";
                
                return (
                  <Card 
                    key={trx.id} 
                    className="bg-card/50 border-border/50 shadow-sm cursor-pointer hover:bg-card/80 transition-colors"
                    onClick={() => router.push(`/add?editId=${trx.id}`)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", cat.bg)}>
                          <cat.icon className={cn("w-6 h-6", cat.color)} />
                        </div>
                        <div>
                          <p className="font-semibold">{trx.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{new Date(trx.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', hour12: false, timeZone: 'Asia/Jakarta'})} WIB</span>
                            <span>•</span>
                            <span>{accName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn("font-semibold", trx.type === 'expense' ? "text-rose-400" : "text-emerald-400")}>
                          {trx.type === 'expense' ? '-' : '+'}{formatCurrency(trx.amount)}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} 
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CashflowDialog open={isCashflowOpen} onOpenChange={setIsCashflowOpen} />
      
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

function MenuButton({ href, onClick, icon: Icon, label, colorClass, bgClass }: { href?: string, onClick?: () => void, icon: any, label: string, colorClass: string, bgClass: string }) {
  if (onClick) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 group-hover:bg-secondary", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </button>
    );
  }
  return (
    <Link href={href || "#"} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 group-hover:bg-secondary", bgClass)}>
        <Icon className={cn("w-6 h-6", colorClass)} />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </Link>
  );
}
