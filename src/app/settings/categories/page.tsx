"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStore, CustomCategory } from "@/store/useStore";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from "next-themes";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CategoriesSettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { customCategories, addCustomCategory, editCustomCategory, deleteCustomCategory } = useStore();
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerView, setPickerView] = useState<"form" | "icon" | "color">("form");
  const [editingCat, setEditingCat] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "", group: "", badge: "", iconName: "💡", color: "bg-blue-500"
  });

  const availableColors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", 
    "bg-cyan-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", 
    "bg-fuchsia-500", "bg-rose-500"
  ];

  const filteredCategories = customCategories.filter(
    (c) => c.type === activeTab && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by 'group' property
  const groupedCategories = filteredCategories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<string, typeof customCategories>);

  const openAddModal = () => {
    setEditingCat(null);
    setFormData({ name: "", group: "Lainnya", badge: "Umum", iconName: "💡", color: "bg-blue-500" });
    setPickerView("form");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CustomCategory) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, group: cat.group, badge: cat.badge, iconName: cat.iconName, color: cat.color || "bg-blue-500" });
    setPickerView("form");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (editingCat) {
      editCustomCategory(editingCat.id, formData);
    } else {
      addCustomCategory({ ...formData, type: activeTab });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingCat) {
      deleteCustomCategory(editingCat.id);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg pr-7">Kategori</h1>
      </header>

      <div className="p-4 space-y-4">
        
        {/* Tabs */}
        <div className="flex bg-secondary/50 border border-border/50 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("expense")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === "expense" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className="w-4 h-4" /> Pengeluaran
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === "income" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownLeft className="w-4 h-4" /> Pemasukan
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari kategori..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Category List */}
        <div className="space-y-4">
          {Object.entries(groupedCategories).map(([groupName, categories]) => (
            <div key={groupName} className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden relative">
              <div className={cn("absolute top-0 left-0 w-full h-1", activeTab === "expense" ? "bg-rose-500" : "bg-emerald-500")} />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <LucideIcons.Lightbulb className={cn("w-5 h-5", activeTab === "expense" ? "text-amber-500" : "text-emerald-500")} />
                    </div>
                    <h3 className="font-bold">{groupName}</h3>
                  </div>
                  {/* Badge representing group default badge */}
                  {categories.length > 0 && (
                    <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                      {categories[0].badge.split("•")[0].trim()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3 px-1">
                  <span>Geser kiri hapus · Ketuk edit</span>
                  <button onClick={openAddModal} className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-secondary transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div onClick={() => openEditModal(cat)} key={cat.id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/60 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", cat.color || "bg-blue-500")}>
                          <span className="text-base leading-none">{cat.iconName}</span>
                        </div>
                        <span className="font-semibold text-sm">{cat.name}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-1 rounded-md border",
                        cat.badge.includes("Tabungan") ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      )}>
                        {cat.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {Object.keys(groupedCategories).length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Tidak ada kategori yang ditemukan.
            </div>
          )}
        </div>

      </div>

      {/* Floating Add Button */}
      <button onClick={openAddModal} className="fixed bottom-8 sm:bottom-12 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all z-20">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-[32px] p-0 bg-background border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />
          
          <DialogHeader className="px-6 py-2">
            <DialogTitle className="text-center text-lg font-bold">
              {pickerView === "form" ? (editingCat ? "Edit Subkategori" : "Tambah Subkategori") : 
               pickerView === "icon" ? "Pilih Ikon" : "Pilih Warna"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-4 overflow-y-auto space-y-6">
            
            {pickerView === "form" && (
              <>
                {/* Nama Kategori */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Nama Kategori</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="mis. Belanja Harian"
                    className="bg-secondary/20 border-border/50 rounded-xl h-12 px-4"
                  />
                </div>

                {/* Tampilan */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Tampilan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPickerView("icon")} className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors text-left">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white", formData.color)}>
                        <span className="text-xl leading-none">{formData.iconName}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Emoji</p>
                        <p className="text-xs font-bold flex items-center gap-1">Ubah emoji <LucideIcons.ChevronRight className="w-3 h-3" /></p>
                      </div>
                    </button>

                    <button onClick={() => setPickerView("color")} className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors text-left">
                      <div className={cn("w-10 h-10 rounded-xl shrink-0", formData.color)} />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Warna</p>
                        <p className="text-xs font-bold flex items-center gap-1">Ubah warna <LucideIcons.ChevronRight className="w-3 h-3" /></p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Kategori Induk */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Kategori Induk</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
                    <button 
                      onClick={() => setFormData({ ...formData, group: "Lainnya" })}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[100px] shrink-0 transition-colors",
                        formData.group === "Lainnya" ? "bg-secondary/50 border-primary/50" : "bg-secondary/20 border-border/50"
                      )}
                    >
                      <LucideIcons.Folder className="w-6 h-6 text-amber-500 mb-2 fill-amber-500" />
                      <span className="text-[10px] font-bold text-muted-foreground">Pilih induk (opsional)</span>
                    </button>

                    {Object.keys(groupedCategories).filter(g => g !== "Lainnya").map((groupName) => (
                      <button 
                        key={groupName}
                        onClick={() => setFormData({ ...formData, group: groupName })}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[100px] shrink-0 transition-colors",
                          formData.group === groupName ? "bg-secondary/50 border-primary/50" : "bg-secondary/20 border-border/50"
                        )}
                      >
                        <LucideIcons.Lightbulb className={cn("w-6 h-6 mb-2", activeTab === "expense" ? "text-amber-500" : "text-emerald-500")} />
                        <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{groupName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipe Finansial */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold text-foreground">Tipe Finansial</Label>
                    <LucideIcons.Info className="w-3.5 h-3.5 text-muted-foreground" />
                    {formData.group !== "Lainnya" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground flex items-center gap-1 ml-auto">
                        <LucideIcons.Zap className="w-2.5 h-2.5" /> Mengikuti Induk
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground -mt-2">Untuk membantu analisa keuangan kamu</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "Kebutuhan", color: "text-blue-400", border: "border-blue-500/30", bg: "hover:bg-blue-500/10" },
                      { id: "Keinginan", color: "text-purple-400", border: "border-purple-500/30", bg: "hover:bg-purple-500/10" },
                      { id: "Masa Depan", color: "text-emerald-400", border: "border-emerald-500/30", bg: "hover:bg-emerald-500/10" },
                      { id: "Tagihan", color: "text-rose-400", border: "border-rose-500/30", bg: "hover:bg-rose-500/10" }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, badge: type.id })}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          type.border, type.bg,
                          formData.badge.includes(type.id) ? "bg-secondary border-primary" : "bg-secondary/20"
                        )}
                      >
                        <span className={cn("text-xs font-bold", type.color)}>{type.id}</span>
                        <LucideIcons.ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {pickerView === "icon" && (
              <div className="flex justify-center py-2 -mx-2">
                <Picker 
                  data={data} 
                  onEmojiSelect={(emoji: any) => { 
                    setFormData({...formData, iconName: emoji.native}); 
                    setPickerView("form"); 
                  }} 
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  previewPosition="none"
                  skinTonePosition="none"
                  i18n={{
                    search: 'Cari emoji...',
                    categories: {
                      recent: 'Sering Digunakan',
                      smileys: 'Smileys & Orang',
                      people: 'Orang & Tubuh',
                      nature: 'Hewan & Alam',
                      foods: 'Makanan & Minuman',
                      activity: 'Aktivitas',
                      places: 'Perjalanan & Tempat',
                      objects: 'Objek',
                      symbols: 'Simbol',
                      flags: 'Bendera',
                    }
                  }}
                />
              </div>
            )}

            {pickerView === "color" && (
              <div className="grid grid-cols-5 gap-4 py-2">
                {availableColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => { setFormData({...formData, color}); setPickerView("form"); }}
                    className={cn(
                      "aspect-square rounded-full transition-all",
                      color,
                      formData.color === color ? "scale-110 shadow-lg ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105"
                    )}
                  />
                ))}
              </div>
            )}
            
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50 flex gap-3 bg-background">
            {pickerView !== "form" ? (
              <Button onClick={() => setPickerView("form")} className="w-full rounded-xl h-12 bg-secondary text-foreground hover:bg-secondary/80 font-bold">
                Kembali
              </Button>
            ) : editingCat ? (
              <>
                <Button variant="secondary" onClick={handleDelete} className="flex-1 rounded-xl h-12 bg-secondary/50 text-rose-500 hover:bg-rose-500/20 font-bold">
                  Hapus
                </Button>
                <Button onClick={handleSave} className="flex-[2] rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                  Simpan Perubahan
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12 bg-secondary text-foreground hover:bg-secondary/80 font-bold">
                  Batal
                </Button>
                <Button onClick={handleSave} className="flex-[2] rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                  Tambah Kategori
                </Button>
              </>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
