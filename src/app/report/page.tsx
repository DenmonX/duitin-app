"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, getCategoryIcon } from "@/store/useStore";
import { ChevronLeft, ChevronRight, PieChart, TrendingDown, TrendingUp, Wallet, ArrowLeft } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function ReportPage() {
  const router = useRouter();
  const { transactions, customCategories } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return tDate >= startOfMonth && tDate <= new Date(endOfMonth.setHours(23, 59, 59, 999));
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory)
    .map(([categoryId, amount]) => {
      const customCat = customCategories.find(c => c.id === categoryId);
      const name = customCat ? customCat.name : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
      return { name, amount, categoryId };
    })
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground text-xs p-3 rounded-lg shadow-xl border border-border">
          <p className="font-semibold mb-1">{payload[0].name}</p>
          <p className="text-primary font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-transparent">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors bg-secondary/50 rounded-full active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base">Laporan Lengkap</h1>
        <div className="w-10"></div>
      </header>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={goToPrevMonth} className="p-2 bg-secondary rounded-full active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold tracking-tight uppercase">
            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <button onClick={goToNextMonth} className="p-2 bg-secondary rounded-full active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-none">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pemasukan</p>
              <p className="font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="bg-rose-500/10 border-rose-500/20 shadow-none">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pengeluaran</p>
              <p className="font-bold text-rose-500">{formatCurrency(totalExpense)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className={cn("bg-card/40 border-border/50", netSavings >= 0 ? "border-emerald-500/30" : "border-rose-500/30")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", netSavings >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500")}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sisa Saldo Bersih</p>
                <p className={cn("font-bold text-lg", netSavings >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {formatCurrency(netSavings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        {chartData.length > 0 ? (
          <Card className="bg-card/40 border-border/50 overflow-hidden mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-center mb-6">Distribusi Pengeluaran</h3>
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </RechartsPie>
                </ResponsiveContainer>
                
                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-10 opacity-50">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Tidak ada pengeluaran di bulan ini.</p>
          </div>
        )}

        {/* Breakdown List */}
        {chartData.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold px-2">Rincian Pengeluaran</h3>
            <div className="space-y-3">
              {chartData.map((item, index) => {
                const percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
                const customCat = customCategories.find(c => c.id === item.categoryId);
                
                let IconComp = LucideIcons.HelpCircle as LucideIcons.LucideIcon;
                if (customCat && (LucideIcons as any)[customCat.iconName]) {
                  IconComp = (LucideIcons as any)[customCat.iconName];
                } else if (!customCat) {
                  const fallback = getCategoryIcon(item.categoryId);
                  IconComp = fallback.icon;
                }

                return (
                  <Card key={item.categoryId} className="bg-card/40 border-border/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0" style={{ color: COLORS[index % COLORS.length] }}>
                        {customCat && customCat.iconName && !(LucideIcons as any)[customCat.iconName] ? (
                          <span className="text-xl">{customCat.iconName}</span>
                        ) : (
                          <IconComp className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                          <p className="font-bold text-sm">{formatCurrency(item.amount)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground w-8 text-right">{percentage}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
