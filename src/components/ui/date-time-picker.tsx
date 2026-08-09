"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Date;
  onChange: (date: Date) => void;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function DateTimePicker({ open, onOpenChange, value, onChange }: DateTimePickerProps) {
  const [tempDate, setTempDate] = useState<Date>(new Date(value));
  
  useEffect(() => {
    if (open) {
      setTempDate(new Date(value));
    }
  }, [open, value]);

  const handleSave = () => {
    onChange(tempDate);
    onOpenChange(false);
  };

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);
  
  const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const ITEM_HEIGHT = 44;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'day'|'month'|'year'|'hour'|'minute') => {
    const el = e.currentTarget;
    if ((el as any).scrollTimeout) {
      clearTimeout((el as any).scrollTimeout);
    }
    
    (el as any).scrollTimeout = setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      
      const newDate = new Date(tempDate);
      if (type === 'day') newDate.setDate(DAYS[Math.min(index, DAYS.length - 1)]);
      else if (type === 'month') newDate.setMonth(index);
      else if (type === 'year') newDate.setFullYear(YEARS[Math.min(index, YEARS.length - 1)]);
      else if (type === 'hour') newDate.setHours(HOURS[Math.min(index, HOURS.length - 1)]);
      else if (type === 'minute') newDate.setMinutes(MINUTES[Math.min(index, MINUTES.length - 1)]);
      
      setTempDate(newDate);
    }, 150);
  };

  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      if (dayRef.current) dayRef.current.scrollTop = (tempDate.getDate() - 1) * ITEM_HEIGHT;
      if (monthRef.current) monthRef.current.scrollTop = tempDate.getMonth() * ITEM_HEIGHT;
      if (yearRef.current) {
        const yIndex = YEARS.indexOf(tempDate.getFullYear());
        if (yIndex !== -1) yearRef.current.scrollTop = yIndex * ITEM_HEIGHT;
      }
      if (hourRef.current) hourRef.current.scrollTop = tempDate.getHours() * ITEM_HEIGHT;
      if (minuteRef.current) minuteRef.current.scrollTop = tempDate.getMinutes() * ITEM_HEIGHT;
    }, 50);
    
    return () => clearTimeout(timer);
  }, [open]);

  const renderColumn = (
    ref: React.RefObject<HTMLDivElement | null>, 
    items: (string | number)[], 
    type: 'day'|'month'|'year'|'hour'|'minute',
    selectedValue: string | number,
    formatZero: boolean = true
  ) => {
    return (
      <div 
        ref={ref}
        className="flex-1 h-[220px] overflow-y-auto snap-y snap-mandatory scrollbar-none relative no-scrollbar"
        onScroll={(e) => handleScroll(e, type)}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ height: 220 / 2 - ITEM_HEIGHT / 2 }} />
        {items.map((item, i) => {
          const isSelected = item === selectedValue;
          const displayStr = typeof item === 'number' && formatZero ? item.toString().padStart(2, '0') : item.toString();
          return (
            <div 
              key={i} 
              className={cn(
                "h-[44px] snap-center flex items-center justify-center text-[13px] sm:text-base font-bold transition-colors duration-200 cursor-pointer",
                isSelected ? "text-emerald-500" : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => {
                if (ref.current) {
                  ref.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
                }
              }}
            >
              {displayStr}
            </div>
          );
        })}
        <div style={{ height: 220 / 2 - ITEM_HEIGHT / 2 }} />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-[32px] p-0 bg-background border border-border/50 overflow-hidden flex flex-col">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
        <DialogHeader className="px-6 py-2 shrink-0">
          <DialogTitle className="text-center text-lg font-bold">Pilih Tanggal & Waktu</DialogTitle>
        </DialogHeader>
        
        <div className="px-1 py-4 relative">
          <div className="absolute top-[50%] -translate-y-[50%] left-3 right-3 h-[44px] border-y-2 border-emerald-500/20 pointer-events-none z-10" />
          
          <div className="flex justify-between items-center relative z-20">
            {renderColumn(dayRef, DAYS, 'day', tempDate.getDate())}
            {renderColumn(monthRef, MONTHS, 'month', MONTHS[tempDate.getMonth()], false)}
            {renderColumn(yearRef, YEARS, 'year', tempDate.getFullYear(), false)}
            {renderColumn(hourRef, HOURS, 'hour', tempDate.getHours())}
            {renderColumn(minuteRef, MINUTES, 'minute', tempDate.getMinutes())}
          </div>
        </div>

        <div className="p-4 pt-2">
          <Button onClick={handleSave} className="w-full h-14 rounded-2xl text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
