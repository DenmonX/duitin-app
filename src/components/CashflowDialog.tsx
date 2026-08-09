"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useStore, getAccountIcon } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface CashflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HOLIDAYS: Record<string, string> = {
  "01-01": "Tahun Baru Masehi",
  "05-01": "Hari Buruh Internasional",
  "06-01": "Hari Lahir Pancasila",
  "08-17": "Hari Kemerdekaan Republik Indonesia",
  "12-25": "Hari Raya Natal",
  // Dynamic holidays (approximate for 2026 as shown in user's app date)
  "03-20": "Hari Raya Idul Fitri 1447 H (Perkiraan)",
  "03-21": "Hari Raya Idul Fitri 1447 H (Perkiraan)",
};

export function CashflowDialog({ open, onOpenChange }: CashflowDialogProps) {
  const { transactions, accounts } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Wallet Selection inside dialog
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  // Calendar Grid Logic
  const startDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday
  const daysInMonth = endOfMonth.getDate();
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  // Create grid cells (42 cells for 6 rows)
  const calendarCells = [];
  
  // Padding previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      date: prevMonthDays - i,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthDays - i),
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i),
    });
  }
  
  // Padding next month
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i),
    });
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const isInMonth = tDate.getMonth() === month && tDate.getFullYear() === year;
    const matchesAccount = selectedAccountId ? t.accountId === selectedAccountId : true;
    return isInMonth && matchesAccount;
  });

  // Aggregate by date (1-31)
  const dailyData: Record<number, { income: number, expense: number }> = {};
  filteredTransactions.forEach(t => {
    const d = new Date(t.date).getDate();
    if (!dailyData[d]) dailyData[d] = { income: 0, expense: 0 };
    if (t.type === 'income') dailyData[d].income += t.amount;
    else dailyData[d].expense += t.amount;
  });

  // Find holidays in current month
  const currentMonthHolidays: {date: number, name: string}[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = i.toString().padStart(2, '0');
    const key = `${monthStr}-${dayStr}`;
    if (HOLIDAYS[key]) {
      currentMonthHolidays.push({ date: i, name: HOLIDAYS[key] });
    }
  }

  const formatShortValue = (val: number) => {
    if (val === 0) return '+0';
    if (val >= 1000 || val <= -1000) {
      return (val > 0 ? '+' : '') + Math.round(val / 1000) + 'rb';
    }
    return (val > 0 ? '+' : '') + val;
  };

  const selectedAccountName = selectedAccountId 
    ? accounts.find(a => a.id === selectedAccountId)?.name || "Cash" 
    : "Semua Dompet";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[100vw] h-[95vh] sm:h-[90vh] sm:max-w-md max-w-full rounded-t-[32px] sm:rounded-[32px] p-0 bg-background overflow-hidden flex flex-col border-border/50 translate-y-0 sm:translate-y-[-50%] absolute sm:relative bottom-0 sm:bottom-auto top-auto sm:top-[50%] mt-auto sm:mt-0">
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
          
          <DialogHeader className="px-6 py-2 shrink-0 border-b border-border/10">
            <DialogTitle className="text-center text-lg font-bold">Cashflow Harian</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-card/10 pb-10">
            {/* Month Navigator */}
            <div className="flex items-center justify-between p-4">
              <button onClick={goToPrevMonth} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold">
                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={goToNextMonth} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-4 flex gap-3 mb-6">
              <button 
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                {selectedAccountId ? "Ganti Dompet" : "Semua Dompet"}
              </button>
              {selectedAccountId && (
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full text-xs font-semibold text-muted-foreground border border-border/50">
                  {selectedAccountName}
                </div>
              )}
            </div>

            {/* Calendar Grid */}
            <div className="px-2">
              {/* Days Header */}
              <div className="grid grid-cols-7 mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                  <div key={day} className="text-center text-[11px] font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                {calendarCells.map((cell, i) => {
                  const isSunday = i % 7 === 0;
                  
                  // Check if holiday
                  const monthStr = (cell.fullDate.getMonth() + 1).toString().padStart(2, '0');
                  const dayStr = cell.date.toString().padStart(2, '0');
                  const isHoliday = HOLIDAYS[`${monthStr}-${dayStr}`] !== undefined;
                  
                  const isRedText = isSunday || isHoliday;
                  
                  const data = cell.isCurrentMonth ? dailyData[cell.date] : null;
                  const hasData = data && (data.income > 0 || data.expense > 0);
                  const net = data ? data.income - data.expense : 0;

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={cn(
                        "text-[15px] font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                        !cell.isCurrentMonth && "text-muted-foreground/30",
                        cell.isCurrentMonth && isRedText && "text-rose-500",
                        cell.isCurrentMonth && !isRedText && "text-foreground"
                      )}>
                        {cell.date}
                      </div>
                      
                      {cell.isCurrentMonth && (
                        <div className="flex flex-col items-center gap-[2px] h-14 justify-center w-full rounded-lg border border-transparent hover:border-border/30">
                          {!hasData ? (
                            <span className="text-[9px] text-muted-foreground/50 text-center leading-tight">Tidak ada<br/>data</span>
                          ) : (
                            <>
                              <span className="text-[10px] font-bold text-emerald-500 leading-none">{formatShortValue(data.income)}</span>
                              <span className="text-[10px] font-bold text-rose-500 leading-none">{formatShortValue(-data.expense)}</span>
                              <span className="text-[10px] font-bold text-blue-500 leading-none">{formatShortValue(net)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend / Info */}
            <div className="mt-8 px-4 mb-8">
              <div className="bg-card/30 border border-rose-500/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-rose-500">Libur & Akhir Pekan</span>
                </div>
                {currentMonthHolidays.length > 0 && (
                  <div className="space-y-1.5 pl-4 mt-2">
                    {currentMonthHolidays.map(h => (
                      <div key={h.date} className="text-xs text-rose-500/80">
                        {h.date} {currentDate.toLocaleDateString('id-ID', {month: 'short'})}: {h.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Pengeluaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Bersih</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Internal Wallet Selection Dialog */}
      <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
        <DialogContent className="w-[90vw] rounded-3xl p-6 z-[100]">
          <DialogHeader>
            <DialogTitle>Pilih Dompet (Cashflow)</DialogTitle>
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
    </>
  );
}
