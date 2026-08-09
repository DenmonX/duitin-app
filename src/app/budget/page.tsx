"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, ReceiptText, Coffee, Banknote, ShoppingBag, Gamepad2, Train } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Budget } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BudgetPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Bulan Ini");
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { budgets, transactions, addBudget, editBudget, deleteBudget, customCategories } = useStore();
  const expenseCategories = customCategories.filter(c => c.type === 'expense');

  const [categoryId, setCategoryId] = useState("makanan");
  const [limit, setLimit] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit) return;
    addBudget({ categoryId, limit: Number(limit) });
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || !editData) return;
    editBudget(editData.id, { categoryId, limit: Number(limit) });
    setEditData(null);
    resetForm();
  };

  const openEdit = (budget: Budget) => {
    setEditData(budget);
    setCategoryId(budget.categoryId);
    setLimit(budget.limit.toString());
  };

  const resetForm = () => {
    setCategoryId("makanan");
    setLimit("");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate spent amounts per category based on transactions
  const expenses = transactions.filter(t => t.type === "expense");
  
  const budgetsWithSpent = budgets.map(budget => {
    const spent = expenses
      .filter(t => t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...budget, spent };
  });

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">Anggaran</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary px-2">
              <Plus className="w-5 h-5 mr-1" /> Buat
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Anggaran Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={(value: any) => setCategoryId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{cat.iconName}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batas Anggaran</Label>
                <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Cth: 1000000" required />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Anggaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={(value: any) => setCategoryId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{cat.iconName}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batas Anggaran</Label>
                <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Cth: 1000000" required />
              </div>
              <Button type="submit" className="w-full">Simpan Perubahan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Tabs */}
      <div className="px-5 mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {["Bulan Ini", "Bulan Lalu", "Tahun Ini"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              activeTab === tab 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card text-muted-foreground border-border/50 hover:bg-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 mt-6 space-y-4">
        <p className="text-muted-foreground text-sm mb-2">Pantau pengeluaran Anda agar tidak melebihi batas yang ditentukan.</p>
        
        {budgetsWithSpent.map((budget) => {
          const cat = customCategories.find(c => c.id === budget.categoryId);
          const percent = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOver = budget.spent > budget.limit;
          
          let progressColor = "bg-emerald-500";
          if (percent > 75) progressColor = "bg-amber-500";
          if (percent >= 95 || isOver) progressColor = "bg-rose-500";

          return (
            <Card key={budget.id} className="bg-card/40 border-border/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm", cat?.color || "bg-blue-500")}>
                      <span className="text-xl leading-none">{cat?.iconName || "💡"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize text-sm">{cat?.name || budget.categoryId}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isOver ? "Melebihi anggaran!" : "Sisa anggaran"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("font-bold", isOver ? "text-rose-500" : "")}>
                        {formatCurrency(budget.spent)}
                      </p>
                      <p className="text-xs text-muted-foreground">dari {formatCurrency(budget.limit)}</p>
                    </div>
                    <div className="flex flex-col gap-1 -mt-1 -mr-2">
                      <button onClick={() => openEdit(budget)} className="p-1.5 text-muted-foreground hover:text-primary rounded-full transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(budget.id)} className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-full transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden relative">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", progressColor)} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-medium text-muted-foreground">
                  <span>0%</span>
                  <span>{percent.toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Anggaran?"
        description="Apakah Anda yakin ingin menghapus anggaran ini?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
