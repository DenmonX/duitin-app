"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, Plus, Pencil, Trash2, Landmark, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, getAccountIcon, Account } from "@/store/useStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function WalletPage() {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { accounts, addAccount, editAccount, deleteAccount } = useStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<"bank" | "e-wallet" | "cash">("bank");
  const [balance, setBalance] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;
    addAccount({
      name,
      type,
      balance: Number(balance)
    });
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance || !editData) return;
    editAccount(editData.id, { name, type, balance: Number(balance) });
    setEditData(null);
    resetForm();
  };

  const openEdit = (account: Account) => {
    setEditData(account);
    setName(account.name);
    setType(account.type as any);
    setBalance(account.balance.toString());
  };

  const resetForm = () => {
    setName("");
    setBalance("");
    setType("bank");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAccount(deleteId);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isClient) return null;

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="p-5 pt-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dompet Saya</h1>
        <p className="text-muted-foreground text-sm">Kelola semua akun dan saldo Anda</p>
      </header>

      {/* Total Balance */}
      <div className="px-5 mb-8">
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Gabungan</p>
              <h2 className="text-2xl font-bold">{formatCurrency(totalBalance)}</h2>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="px-5 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">Daftar Akun</h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 px-2 h-8">
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Akun Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nama Akun</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Bank Jago" required />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Akun</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-indigo-400" />
                          <span>Bank</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="e-wallet">
                        <div className="flex items-center gap-2">
                          <WalletIcon className="w-4 h-4 text-blue-400" />
                          <span>E-Wallet</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-400" />
                          <span>Tunai</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Saldo Awal</Label>
                  <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" required />
                </div>
                <Button type="submit" className="w-full">Simpan Akun</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Akun</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Akun</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Bank Jago" required />
              </div>
              <div className="space-y-2">
                <Label>Tipe Akun</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-indigo-400" />
                        <span>Bank</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="e-wallet">
                      <div className="flex items-center gap-2">
                        <WalletIcon className="w-4 h-4 text-blue-400" />
                        <span>E-Wallet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span>Tunai</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saldo Awal</Label>
                <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" required />
              </div>
              <Button type="submit" className="w-full">Simpan Perubahan</Button>
            </form>
          </DialogContent>
        </Dialog>

        {accounts.map((account) => {
          const iconInfo = getAccountIcon(account.type);
          
          return (
            <Card key={account.id} className="bg-card/40 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconInfo.bg)}>
                    <iconInfo.icon className={cn("w-6 h-6", iconInfo.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{account.name}</p>
                      {account.isLocked && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 h-4 hover:bg-amber-500/30 border-none">
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{account.type.replace("-", " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-right">
                    {formatCurrency(account.balance)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(account)} className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(account.id)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Akun?"
        description="Apakah Anda yakin ingin menghapus akun ini? Data terkait akun ini mungkin akan terpengaruh."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
