"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Globe, Calendar, FolderTree, CreditCard, 
  Moon, GraduationCap, Bell,
  LogOut, ChevronRight, Trophy, ShieldCheck, Pencil, CloudUpload, CloudDownload
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const { user, transactions, updateUser } = useStore();
  const { theme, setTheme } = useTheme();
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "user@duitin.app");
  const [useSystemTheme, setUseSystemTheme] = useState(theme === 'system');

  useEffect(() => {
    setIsClient(true);
    setUseSystemTheme(theme === 'system');
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email || "user@duitin.app");
    }
  }, [theme, user]);

  if (!isClient) return null;

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail) return;
    updateUser(editName, editEmail);
    setIsEditProfileOpen(false);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setUseSystemTheme(newTheme === 'system');
  };

  const handleSystemToggle = (checked: boolean) => {
    setUseSystemTheme(checked);
    if (checked) {
      setTheme('system');
    } else {
      setTheme('dark'); // Default fallback if disabled
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header Profile */}
      <div className="px-5 pt-10 pb-6 flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-1.5 border-2 border-background">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <button onClick={() => setIsEditProfileOpen(true)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{user.email || "user@duitin.app"}</p>
        
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-none px-3 py-1">
            <ShieldCheck className="w-3 h-3 mr-1" /> Premium
          </Badge>
        </div>
      </div>
      
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="w-[90vw] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Panggilan</Label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Masukkan nama panggilan Anda" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Email</Label>
              <Input 
                type="email"
                value={editEmail} 
                onChange={(e) => setEditEmail(e.target.value)} 
                placeholder="Masukkan alamat email Anda" 
                required 
              />
            </div>
            <Button type="submit" className="w-full">Simpan Perubahan</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gamification Stats */}
      <div className="px-5 mb-6">
        <Card className="bg-card/40 border-border/50">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-border/50">
              <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-2xl font-bold text-primary">{transactions.length}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Transaksi</span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-2xl font-bold text-blue-500">14</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hari Konsisten</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Settings Menu */}
      <div className="px-5 space-y-2">
        <h3 className="font-semibold text-base text-foreground mb-4 text-center">Pengaturan</h3>
        
        <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/50">
          
          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary">
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Bahasa & Mata Uang</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bahasa Indonesia • IDR</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <Link href="/settings/period" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary block">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Periode Transaksi</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tanggal mulai periode transaksi: 1</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link href="/settings/categories" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary block">
            <div className="flex items-center gap-4">
              <FolderTree className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Kategori</p>
                <p className="text-xs text-muted-foreground mt-0.5">Kelola hierarki kategori</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link href="/settings/payments" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary block">
            <div className="flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Riwayat Pembayaran</p>
                <p className="text-xs text-muted-foreground mt-0.5">Lihat riwayat langganan & transaksi</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <div onClick={() => setIsThemeOpen(true)} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary">
            <div className="flex items-center gap-4">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Tema</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{theme === 'system' ? 'Sistem' : (theme === 'dark' ? 'Gelap' : 'Terang')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary">
            <div className="flex items-center gap-4">
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Tutorial Aplikasi</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ulangi panduan tutorial aplikasi</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:bg-secondary">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div className="max-w-[220px]">
                <p className="font-medium text-sm">Notifikasi Push</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">Dapatkan notifikasi untuk transaksi, budget, dan pengingat penting</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

        </div>
      </div>



      {/* Theme Dialog */}
      <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
        <DialogContent className="w-[90vw] rounded-3xl p-6 sm:max-w-md bg-background border border-border/50">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-center font-bold">Preferensi Tema</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`flex-1 flex flex-col items-center gap-3 p-2 rounded-2xl border-2 transition-all ${!useSystemTheme && theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            >
              <div className="w-full aspect-[3/4] bg-[#f8fafc] rounded-xl overflow-hidden border border-border shadow-sm p-2 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-16 h-3 bg-emerald-500/20 rounded-full" />
                  <div className="w-4 h-4 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 bg-emerald-500 rounded-lg mb-2" />
                <div className="flex gap-1 justify-around">
                  {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-200" />)}
                </div>
              </div>
              <span className="font-semibold text-sm">Terang</span>
            </button>

            <button 
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 flex flex-col items-center gap-3 p-2 rounded-2xl border-2 transition-all ${!useSystemTheme && theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            >
              <div className="w-full aspect-[3/4] bg-[#0f172a] rounded-xl overflow-hidden border border-border/50 shadow-sm p-2 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-16 h-3 bg-emerald-500/20 rounded-full" />
                  <div className="w-4 h-4 rounded-full bg-slate-800" />
                </div>
                <div className="flex-1 bg-emerald-500 rounded-lg mb-2" />
                <div className="flex gap-1 justify-around">
                  {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-800" />)}
                </div>
              </div>
              <span className="font-semibold text-sm">Gelap</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/50">
            <div>
              <p className="font-semibold text-sm">Pengaturan Perangkat</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sesuaikan dengan pengaturan tampilan perangkatmu</p>
            </div>
            <Switch checked={useSystemTheme} onCheckedChange={handleSystemToggle} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
