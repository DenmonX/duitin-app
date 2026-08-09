"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Handshake, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore, Debt } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DebtPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Debt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { debts, payDebt, addDebt, editDebt, deleteDebt } = useStore();

  const [person, setPerson] = useState("");
  const [type, setType] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount || !dueDate) return;
    addDebt({ person, type, amount: Number(amount), dueDate, status: "pending" });
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount || !dueDate || !editData) return;
    editDebt(editData.id, { person, type, amount: Number(amount), dueDate });
    setEditData(null);
    resetForm();
  };

  const openEdit = (debt: Debt) => {
    setEditData(debt);
    setPerson(debt.person);
    setType(debt.type);
    setAmount(debt.amount.toString());
    setDueDate(debt.dueDate);
  };

  const resetForm = () => {
    setPerson("");
    setAmount("");
    setDueDate("");
    setType("owed_to_me");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteDebt(deleteId);
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

  const filteredDebts = debts.filter(d => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Piutang") return d.type === "owed_to_me";
    if (activeTab === "Utang") return d.type === "i_owe";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">Utang & Piutang</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary px-2">
              <Plus className="w-5 h-5 mr-1" /> Catat
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Catat Utang/Piutang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Orang/Pihak</Label>
                <Input value={person} onChange={e => setPerson(e.target.value)} placeholder="Cth: Budi" required />
              </div>
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owed_to_me">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        <span>Mereka berutang ke saya</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="i_owe">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                        <span>Saya berutang ke mereka</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Catatan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Orang/Pihak</Label>
                <Input value={person} onChange={e => setPerson(e.target.value)} placeholder="Cth: Budi" required />
              </div>
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owed_to_me">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        <span>Mereka berutang ke saya</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="i_owe">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                        <span>Saya berutang ke mereka</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Simpan Perubahan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Tabs */}
      <div className="px-5 mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {["Semua", "Piutang", "Utang"].map((tab) => (
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
        <p className="text-muted-foreground text-sm mb-2">Catat siapa berutang ke Anda dan utang Anda ke orang lain.</p>
        
        {filteredDebts.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">Belum ada catatan.</p>
        )}

        {filteredDebts.map((debt) => {
          const isOwedToMe = debt.type === "owed_to_me";
          const isPaid = debt.status === "paid";
          
          return (
            <Card key={debt.id} className={cn("bg-card/40 border-border/50", isPaid ? "opacity-60" : "")}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isOwedToMe ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{debt.person}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isOwedToMe ? "Berutang ke saya" : "Saya berutang"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className={cn("font-bold", isOwedToMe ? "text-emerald-500" : "text-rose-500", isPaid && "text-muted-foreground")}>
                        {isOwedToMe ? "+" : "-"}{formatCurrency(debt.amount)}
                      </p>
                      {isPaid ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px] mt-1 px-1.5 border-none h-4">Lunas</Badge>
                      ) : (
                        <p className="text-xs text-amber-500 mt-1">Jatuh Tempo: {debt.dueDate}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 -mt-1 -mr-1">
                      <button onClick={() => openEdit(debt)} className="p-1 text-muted-foreground hover:text-primary rounded-full transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(debt.id)} className="p-1 text-muted-foreground hover:text-rose-500 rounded-full transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {!isPaid && (
                  <div className="flex justify-end mt-3 border-t border-border/50 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/10"
                      onClick={() => payDebt(debt.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Lunas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Catatan Utang?"
        description="Apakah Anda yakin ingin menghapus catatan ini?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
