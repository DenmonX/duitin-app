"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Goal } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function GoalsPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Goal | null>(null);
  const [fundData, setFundData] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { goals, addGoalFund, addGoal, editGoal, deleteGoal } = useStore();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [fundAmount, setFundAmount] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    addGoal({ name, targetAmount: Number(targetAmount), currentAmount: 0 });
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !editData) return;
    editGoal(editData.id, { name, targetAmount: Number(targetAmount) });
    setEditData(null);
    resetForm();
  };

  const openEdit = (goal: Goal) => {
    setEditData(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteGoal(deleteId);
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

  const handleAddFund = (id: string, amount: number) => {
    addGoalFund(id, amount);
  };

  const submitAddFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundData || !fundAmount) return;
    addGoalFund(fundData.id, Number(fundAmount));
    setFundData(null);
    setFundAmount("");
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <header className="flex items-center justify-between p-4 pt-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">Goals Tabungan</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary px-2">
              <Plus className="w-5 h-5 mr-1" /> Buat
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Goal Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Goal (Tujuan)</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Dana Darurat" required />
              </div>
              <div className="space-y-2">
                <Label>Target Saldo (Rp)</Label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="0" required />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Goal (Tujuan)</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Dana Darurat" required />
              </div>
              <div className="space-y-2">
                <Label>Target Saldo (Rp)</Label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="0" required />
              </div>
              <Button type="submit" className="w-full">Simpan Perubahan</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!fundData} onOpenChange={(open) => !open && setFundData(null)}>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Tabungan</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitAddFund} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0" required />
              </div>
              <Button type="submit" className="w-full">Tambahkan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="px-5 mt-4 space-y-4">
        {goals.map((goal) => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <Card key={goal.id} className="bg-card/40 border-border/50">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{goal.name}</h3>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(0)}% Tercapai</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 -mt-2 -mr-2">
                    <button onClick={() => openEdit(goal)} className="p-1.5 text-muted-foreground hover:text-primary rounded-full transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-full transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden relative mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-green-500">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-primary/20 hover:bg-primary/10 h-9"
                    onClick={() => { setFundData(goal); setFundAmount(""); }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Tambah Tabungan
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Goal?"
        description="Apakah Anda yakin ingin menghapus goal tabungan ini? Data target dan tabungan terkumpul akan hilang."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
