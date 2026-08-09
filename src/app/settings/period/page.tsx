"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PeriodSettingsPage() {
  const router = useRouter();
  const { transactionPeriodStart, setTransactionPeriodStart } = useStore();
  
  const [selectedDay, setSelectedDay] = useState(transactionPeriodStart);

  // Dapatkan jumlah hari di bulan saat ini
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getNextMonthDate = (day: number) => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return `${day} ${nextMonth.toLocaleString('id-ID', { month: 'short' })}`;
  };

  const handleSave = () => {
    setTransactionPeriodStart(selectedDay);
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg pr-7">Periode Transaksi</h1>
      </header>

      <div className="p-5 flex-1 space-y-6">
        
        {/* Current Period Info */}
        <div className="bg-card/40 border border-border/50 rounded-3xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Calendar className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Periode Saat Ini</p>
                <p className="text-lg font-bold">Agustus 2026</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedDay(1)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between px-2 mb-6">
            <div className="text-center">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Mulai</p>
              <p className="text-4xl font-bold text-blue-500">{selectedDay}</p>
            </div>
            
            <div className="flex flex-col items-center flex-1 mx-4">
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 mb-1" />
              <p className="text-xs text-muted-foreground text-center">
                {selectedDay} Agu - {getNextMonthDate(selectedDay)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Selesai</p>
              <p className="text-4xl font-bold text-emerald-500">{selectedDay > 1 ? selectedDay - 1 : 31}</p>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground px-4">
            Mulai tgl {selectedDay} s/d tgl {selectedDay > 1 ? selectedDay - 1 : 31} bulan berikutnya. Tentukan tanggal mulai untuk siklus pencatatan keuangan bulananmu.
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-card/40 border border-border/50 rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
              {selectedDay}
            </div>
            <div>
              <p className="font-bold">Tanggal Mulai</p>
              <p className="text-xs text-muted-foreground">Awal periode bulanan</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  selectedDay === day 
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {day}
              </button>
            ))}
          </div>
          
          <p className="text-[11px] text-center text-muted-foreground mt-4">
            Jumlah hari otomatis menyesuaikan bulan berjalan ({daysInMonth} hari). 
            <br />Jika bulan depan memiliki hari lebih sedikit, siklus akan dipotong ke hari terakhir bulan tersebut.
          </p>
        </div>

      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
        <Button onClick={handleSave} className="w-full h-12 rounded-2xl text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white">
          Simpan
        </Button>
      </div>
    </div>
  );
}
