"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowDownLeft, ArrowUpRight, ArrowLeft,
  Wallet, Calendar, AlignLeft, 
  ChevronRight, Delete, Bookmark, LayoutTemplate
} from "lucide-react";
import { cn, getGlassyColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore, TransactionType, getCategoryIcon, getAccountIcon, TransactionTemplate } from "@/store/useStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function AddTransaction() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-background"></div>}>
      <AddTransactionContent />
    </Suspense>
  );
}

function AddTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  
  const { accounts, addTransaction, updateTransaction, transactions, templates, saveTemplate, customCategories } = useStore();
  
  const [type, setType] = useState<TransactionType>("expense");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState<Date>(new Date());
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  useEffect(() => {
    if (editId) {
      const txToEdit = transactions.find(t => t.id === editId);
      if (txToEdit) {
        setType(txToEdit.type);
        setAmountStr(txToEdit.amount.toString());
        setNote(txToEdit.note || "");
        setTitle(txToEdit.title);
        setCategoryId(txToEdit.categoryId);
        setAccountId(txToEdit.accountId);
        setDate(new Date(txToEdit.date));
      }
    } else if (!categoryId) {
      const firstCat = customCategories.find(c => c.type === type);
      if (firstCat) setCategoryId(firstCat.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, transactions, type, customCategories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = customCategories.find(c => c.type === newType);
    if (firstCat) setCategoryId(firstCat.id);
  };

  const handleNumpad = (val: string) => {
    if (val === "backspace") {
      setAmountStr(prev => prev.slice(0, -1));
    } else if (val === "000") {
      if (amountStr.length > 0) setAmountStr(prev => prev + "000");
    } else if (["+", "-", "*", "%"].includes(val)) {
      if (amountStr === "") return;
      const lastChar = amountStr.slice(-1);
      if (["+", "-", "*", "%"].includes(lastChar)) {
        setAmountStr(prev => prev.slice(0, -1) + val);
      } else {
        setAmountStr(prev => prev + val);
      }
    } else {
      setAmountStr(prev => prev === "0" ? val : prev + val);
    }
  };

  const getCalculatedAmount = () => {
    try {
      if (!amountStr) return 0;
      let expr = amountStr;
      const lastChar = expr.slice(-1);
      if (["+", "-", "*", "%"].includes(lastChar)) {
        expr = expr.slice(0, -1);
      }
      expr = expr.replace(/%/g, '/100');
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expr)();
      return isNaN(result) ? 0 : Math.floor(result);
    } catch {
      return 0;
    }
  };

  const formatDisplayAmount = (str: string) => {
    if (!str) return "0";
    let formatted = "";
    let currentNumber = "";
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (["+", "-", "*", "%"].includes(char)) {
        if (currentNumber) {
          formatted += Number(currentNumber).toLocaleString('id-ID');
          currentNumber = "";
        }
        formatted += ` ${char === '*' ? 'x' : char} `;
      } else {
        currentNumber += char;
      }
    }
    if (currentNumber) {
      formatted += Number(currentNumber).toLocaleString('id-ID');
    }
    return formatted;
  };

  const handleSave = () => {
    const finalAmount = getCalculatedAmount();
    if (finalAmount <= 0) return alert("Nominal tidak valid");
    if (!accountId) return alert("Pilih akun terlebih dahulu");

    const txData = {
      title: title || (type === "expense" ? "Pengeluaran" : "Pemasukan"),
      amount: finalAmount,
      type,
      categoryId,
      accountId,
      date: date.toISOString(),
      note,
    };

    if (editId) {
      updateTransaction(editId, txData);
    } else {
      addTransaction(txData);
    }

    router.push("/");
  };

  const applyTemplate = (t: TransactionTemplate) => {
    setType(t.type);
    setTitle(t.title);
    setAmountStr(t.amount.toString());
    setCategoryId(t.categoryId);
    setAccountId(t.accountId);
    setIsTemplateOpen(false);
  };

  const handleSaveTemplate = () => {
    const finalAmount = getCalculatedAmount();
    if (finalAmount <= 0) return alert("Nominal tidak valid untuk template");
    const templateName = prompt("Masukkan nama untuk template ini (cth: Tagihan Listrik Bulanan):");
    if (!templateName) return;

    saveTemplate({
      name: templateName,
      title: title || templateName,
      amount: finalAmount,
      type,
      categoryId,
      accountId,
    });
    alert("Template berhasil disimpan!");
  };

  const selectedCat = customCategories.find(c => c.id === categoryId);
  const accInfo = accounts.find(a => a.id === accountId);
  const accIconInfo = getAccountIcon(accInfo?.type || "bank");

  const filteredCategories = customCategories.filter(c => c.type === type);
  const groupedCategories = filteredCategories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<string, typeof customCategories>);

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center p-3 shrink-0">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="flex bg-secondary p-1 rounded-full w-full max-w-[280px]">
            <button
              onClick={() => handleTypeChange("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                type === "income" ? "bg-emerald-500/20 text-emerald-500" : "text-muted-foreground"
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Pemasukan
            </button>
            <button
              onClick={() => handleTypeChange("expense")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                type === "expense" ? "bg-rose-500 text-white" : "text-muted-foreground"
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
            </button>
          </div>
        </div>
        <button onClick={() => setIsTemplateOpen(true)} className="p-2 -mr-2 text-muted-foreground hover:text-primary rounded-full transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </header>

      {/* Amount Display */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 min-h-0">
        <div className="flex items-start text-4xl sm:text-5xl font-bold tracking-tight text-center break-all">
          <span className="text-lg sm:text-xl text-muted-foreground mt-1 mr-1">Rp</span>
          {formatDisplayAmount(amountStr)}
          <span className="w-0.5 h-8 sm:h-10 bg-emerald-500 animate-pulse ml-1 mt-1"></span>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-4 pb-2 space-y-2 shrink-0">
        <div className="flex gap-2">
          <button onClick={() => setIsCategoryOpen(true)} className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors overflow-hidden">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", selectedCat ? getGlassyColor(selectedCat.color) : getGlassyColor("bg-blue-500"))}>
              <span className="text-[13px] leading-none">{selectedCat?.iconName || "💡"}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium capitalize text-left flex-1 truncate">{selectedCat?.name || "Pilih"}</span>
          </button>
          
          <button onClick={() => setIsAccountOpen(true)} className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", accIconInfo.bg)}>
              <accIconInfo.icon className={cn("w-3.5 h-3.5", accIconInfo.color)} />
            </div>
            <span className="text-xs sm:text-sm font-medium text-left flex-1 truncate">{accInfo?.name || "Pilih"}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50">
            <AlignLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Catatan..."
              className="bg-transparent outline-none w-full text-xs sm:text-sm font-medium"
            />
          </div>
          
          <button 
            onClick={() => setIsDatePickerOpen(true)}
            className="w-[140px] sm:w-[160px] flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
          >
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate text-left flex-1">
              {(() => {
                const today = new Date();
                const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

                if (isToday) return "Hari ini";
                if (isYesterday) return "Kemarin";
                
                return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              })()}
            </span>
          </button>
        </div>

        <button onClick={handleSaveTemplate} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs font-semibold">Simpan sebagai Template Rutin</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Numpad */}
      <div className="bg-card/40 border-t border-border/50 rounded-t-3xl p-3 pb-4 sm:p-4 sm:pb-6 shrink-0">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {['7', '8', '9', '%'].map(btn => (
            <button key={btn} onClick={() => handleNumpad(btn)} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-lg sm:text-xl font-medium transition-colors">
              {btn}
            </button>
          ))}
          {['4', '5', '6', '*'].map(btn => (
            <button key={btn} onClick={() => handleNumpad(btn)} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-lg sm:text-xl font-medium transition-colors">
              {btn === '*' ? '×' : btn}
            </button>
          ))}
          {['1', '2', '3', '-'].map(btn => (
            <button key={btn} onClick={() => handleNumpad(btn)} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-lg sm:text-xl font-medium transition-colors">
              {btn}
            </button>
          ))}
          {['0', '000', 'backspace', '+'].map(btn => (
            <button key={btn} onClick={() => handleNumpad(btn)} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-lg sm:text-xl font-medium transition-colors">
              {btn === 'backspace' ? <Delete className="w-5 h-5 sm:w-6 sm:h-6" /> : btn}
            </button>
          ))}
        </div>
        
        <Button onClick={handleSave} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {editId ? "Simpan Transaksi" : "Tambah Transaksi"}
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DialogContent className="w-[95vw] h-[90vh] sm:max-w-md rounded-[32px] p-0 bg-background border border-border/50 overflow-hidden flex flex-col">
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
          <DialogHeader className="px-6 py-2 shrink-0">
            <DialogTitle className="text-center text-lg font-bold">Pilih Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
            {Object.entries(groupedCategories).map(([groupName, categories]) => (
              <div key={groupName} className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
                {/* Header Group */}
                <div className="flex items-center gap-3 p-4 bg-secondary/20">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-sm">💡</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground flex-1">{groupName}</h3>
                </div>
                {/* List Items */}
                <div className="flex flex-col">
                  {categories.map((cat, i) => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setCategoryId(cat.id); setIsCategoryOpen(false); }}
                      className={cn(
                        "flex items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/40",
                        i !== 0 && "border-t border-border/30",
                        categoryId === cat.id && "bg-emerald-500/10 hover:bg-emerald-500/20"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", getGlassyColor(cat.color))}>
                        <span className="text-sm leading-none">{cat.iconName}</span>
                      </div>
                      <span className="text-sm font-semibold flex-1">{cat.name}</span>
                      {categoryId === cat.id && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                           <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="w-[90vw] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle>Pilih Dompet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {accounts.filter(a => !a.isLocked).map(acc => {
              const icon = getAccountIcon(acc.type);
              return (
                <button key={acc.id} onClick={() => { setAccountId(acc.id); setIsAccountOpen(false); }} className={cn("w-full flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors", accountId === acc.id && "ring-2 ring-primary bg-primary/5")}>
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

      <DateTimePicker 
        open={isDatePickerOpen}
        onOpenChange={setIsDatePickerOpen}
        value={date}
        onChange={setDate}
      />

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="w-[90vw] max-h-[80vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle>Template Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada template. Simpan transaksi sebagai template agar muncul di sini.</p>
            ) : (
              templates.map(t => {
                const cat = customCategories.find(c => c.id === t.categoryId);
                return (
                  <button key={t.id} onClick={() => applyTemplate(t)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors text-left group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getGlassyColor(cat?.color))}>
                        <span className="text-lg leading-none">{cat?.iconName || "💡"}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className={cn("text-xs font-medium", t.type === 'expense' ? "text-rose-500" : "text-emerald-500")}>
                          {t.type === 'expense' ? '-' : '+'}Rp{t.amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
