"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Bill } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BillsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Belum Lunas");
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Bill | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { bills, payBill, addBill, editBill, deleteBill } = useStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    addBill({ name, amount: Number(amount), dueDate, isPaid: false });
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate || !editData) return;
    editBill(editData.id, { name, amount: Number(amount), dueDate });
    setEditData(null);
    resetForm();
  };

  const openEdit = (bill: Bill) => {
    setEditData(bill);
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDate(bill.dueDate);
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setDueDate("");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteBill(deleteId);
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

  const filteredBills = bills.filter(b => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Belum Lunas") return !b.isPaid;
    if (activeTab === "Lunas") return b.isPaid;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <header className="flex items-center justify-between p-4 pt-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">Tagihan Rutin</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary px-2">
              <Plus className="w-5 h-5 mr-1" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Tagihan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Tagihan</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Internet" required />
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
              <DialogTitle>Edit Tagihan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Tagihan</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Internet" required />
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

      <div className="px-5 mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {["Belum Lunas", "Lunas", "Semua"].map((tab) => (
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

      <div className="px-5 mt-6 space-y-4">
        {filteredBills.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">Belum ada tagihan.</p>
        )}

        {filteredBills.map((bill) => (
          <Card key={bill.id} className={cn("bg-card/40 border-border/50", bill.isPaid ? "opacity-60" : "")}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm">{bill.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {bill.isPaid ? (
                    <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">Lunas</span>
                  ) : (
                    <span className="text-[10px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Jatuh Tempo: {bill.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(bill.amount)}</p>
                  {!bill.isPaid && (
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] mt-2 rounded-full"
                      onClick={() => payBill(bill.id)}
                    >
                      Bayar
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 -mt-1 -mr-2">
                  <button onClick={() => openEdit(bill)} className="p-1 text-muted-foreground hover:text-primary rounded-full transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(bill.id)} className="p-1 text-muted-foreground hover:text-rose-500 rounded-full transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Tagihan?"
        description="Apakah Anda yakin ingin menghapus tagihan ini?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
