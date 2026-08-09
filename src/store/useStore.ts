import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { ReceiptText, Coffee, Wallet as WalletIcon, Landmark, Banknote, Lock, ShoppingBag, Gamepad2, Train, CreditCard } from "lucide-react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string;
  note?: string;
  createdAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: "bank" | "e-wallet" | "cash" | "locked" | "paylater";
  balance: number;
  isLocked?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
}

export interface Debt {
  id: string;
  person: string;
  type: "owed_to_me" | "i_owe";
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  group: string;
  badge: string;
  color?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color?: string;
  createdAt?: number;
}

export interface AppState {
  user: {
    name: string;
    email: string;
    level: number;
    points: number;
  };
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  bills: Bill[];
  goals: Goal[];
  templates: TransactionTemplate[];
  customCategories: CustomCategory[];
  categoryGroups: CategoryGroup[];
  transactionPeriodStart: number;
  
  // Supabase Sync
  migrateToSupabase: () => Promise<void>;
  fetchFromSupabase: () => Promise<void>;

  // Actions
  updateUser: (name: string, email: string) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, "id">) => void;
  payBill: (id: string) => void;
  addGoalFund: (id: string, amount: number) => void;
  payDebt: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id">) => void;
  editBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addDebt: (debt: Omit<Debt, "id">) => void;
  editDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  addBill: (bill: Omit<Bill, "id">) => void;
  editBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  addGoal: (goal: Omit<Goal, "id">) => void;
  editGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  editAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  saveTemplate: (template: Omit<TransactionTemplate, "id">) => void;
  deleteTemplate: (id: string) => void;

  setTransactionPeriodStart: (day: number) => void;
  addCustomCategory: (category: Omit<CustomCategory, "id">) => void;
  editCustomCategory: (id: string, category: Partial<CustomCategory>) => void;
  deleteCustomCategory: (id: string) => void;

  addCategoryGroup: (group: Omit<CategoryGroup, "id">) => void;
  editCategoryGroup: (id: string, group: Partial<CategoryGroup>) => void;
  deleteCategoryGroup: (id: string, keepChildren: boolean) => void;
}

const initialAccounts: Account[] = [
  { id: "a1", name: "Gopay", type: "e-wallet", balance: 1500000 },
  { id: "a2", name: "Bank BCA", type: "bank", balance: 8500000 },
  { id: "a3", name: "Tunai", type: "cash", balance: 345678 },
  { id: "a4", name: "Dana Darurat", type: "locked", balance: 2000000, isLocked: true },
  { id: "a5", name: "PayLater", type: "paylater", balance: 0 }
];

const initialTransactions: Transaction[] = [
  { id: "t1", title: "Makan Siang", amount: 45000, type: "expense", categoryId: "makanan", accountId: "a1", date: new Date().toISOString(), createdAt: Date.now() - 100000 },
  { id: "t2", title: "Gaji Bulan Ini", amount: 10000000, type: "income", categoryId: "gaji", accountId: "a2", date: new Date().toISOString(), createdAt: Date.now() - 200000 }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        name: "Abdul",
        email: "user@duitin.app",
        level: 1,
        points: 0,
      },
      accounts: initialAccounts,
      transactions: initialTransactions,
      
      budgets: [
        { id: "b1", categoryId: "makanan", limit: 3000000 },
        { id: "b2", categoryId: "transportasi", limit: 1000000 },
        { id: "b3", categoryId: "belanja", limit: 1500000 },
      ],
      
      debts: [
        { id: "d1", person: "Budi", type: "owed_to_me", amount: 150000, dueDate: "2026-02-15", status: "pending" },
        { id: "d2", person: "Bank BCA (KTA)", type: "i_owe", amount: 2000000, dueDate: "2026-02-28", status: "pending" },
      ],

      bills: [
        { id: "bl1", name: "Listrik PLN", amount: 250000, dueDate: "2026-02-20", isPaid: false },
        { id: "bl2", name: "Internet Indihome", amount: 385000, dueDate: "2026-02-25", isPaid: false },
      ],

      goals: [
        { id: "g1", name: "Beli iPhone 16", targetAmount: 20000000, currentAmount: 5000000 },
        { id: "g2", name: "Dana Darurat (Ideal)", targetAmount: 50000000, currentAmount: 20000000 },
      ],

      templates: [],
      transactionPeriodStart: 1,
      customCategories: [
        { id: "c1", name: "Listrik", type: "expense", iconName: "⚡", group: "Tagihan & Utilitas", badge: "Kebutuhan" },
        { id: "c2", name: "Air", type: "expense", iconName: "💧", group: "Tagihan & Utilitas", badge: "Kebutuhan" },
        { id: "c3", name: "Internet", type: "expense", iconName: "🌐", group: "Tagihan & Utilitas", badge: "Kebutuhan" },
        { id: "c6", name: "Kursus", type: "expense", iconName: "📖", group: "Pendidikan", badge: "Masa Depan • Tabungan" },
        { id: "c7", name: "Buku", type: "expense", iconName: "📚", group: "Pendidikan", badge: "Masa Depan • Tabungan" },
        { id: "c8", name: "Belanja Harian", type: "expense", iconName: "🛒", group: "Makanan & Minuman", badge: "Kebutuhan" },
        { id: "c9", name: "Makan di Luar", type: "expense", iconName: "🍽️", group: "Makanan & Minuman", badge: "Keinginan" },
        { id: "c10", name: "Obat", type: "expense", iconName: "💊", group: "Kesehatan", badge: "Kebutuhan" },
        { id: "c11", name: "Dokter", type: "expense", iconName: "👨‍⚕️", group: "Kesehatan", badge: "Kebutuhan" },
        { id: "c12", name: "Pakaian", type: "expense", iconName: "👕", group: "Belanja", badge: "Keinginan" },
        { id: "c13", name: "BBM", type: "expense", iconName: "⛽", group: "Transportasi", badge: "Kebutuhan" },
        { id: "c14", name: "Ojek/Taksi Online", type: "expense", iconName: "🚗", group: "Transportasi", badge: "Keinginan" },
        { id: "c15", name: "Potong Rambut", type: "expense", iconName: "✂️", group: "Perawatan Diri", badge: "Kebutuhan" },
        { id: "c16", name: "Biaya Bank", type: "expense", iconName: "🏦", group: "Lainnya", badge: "Kebutuhan" },
      ],
      categoryGroups: [
        { id: "cg1", name: "Tagihan & Utilitas", type: "expense", iconName: "💡", color: "bg-blue-500" },
        { id: "cg2", name: "Pendidikan", type: "expense", iconName: "🎓", color: "bg-indigo-500" },
        { id: "cg3", name: "Makanan & Minuman", type: "expense", iconName: "🍔", color: "bg-orange-500" },
        { id: "cg4", name: "Kesehatan", type: "expense", iconName: "🏥", color: "bg-rose-500" },
        { id: "cg5", name: "Belanja", type: "expense", iconName: "🛍️", color: "bg-fuchsia-500" },
        { id: "cg6", name: "Transportasi", type: "expense", iconName: "🚌", color: "bg-cyan-500" },
        { id: "cg7", name: "Perawatan Diri", type: "expense", iconName: "💆", color: "bg-emerald-500" },
        { id: "cg8", name: "Lainnya", type: "expense", iconName: "📦", color: "bg-gray-500" },
      ],

      migrateToSupabase: async () => {
        const state = get();
        // Coba insert semua data dari lokal ke supabase
        try {
          if (state.accounts.length) await supabase.from('accounts').upsert(state.accounts);
          if (state.transactions.length) await supabase.from('transactions').upsert(state.transactions);
          if (state.budgets.length) await supabase.from('budgets').upsert(state.budgets);
          if (state.debts.length) await supabase.from('debts').upsert(state.debts);
          if (state.bills.length) await supabase.from('bills').upsert(state.bills);
          if (state.goals.length) await supabase.from('goals').upsert(state.goals);
          if (state.customCategories.length) await supabase.from('categories').upsert(state.customCategories);
          if (state.categoryGroups.length) await supabase.from('category_groups').upsert(state.categoryGroups);
          console.log("Migrasi berhasil!");
        } catch (e) {
          console.error("Migrasi gagal", e);
        }
      },

      fetchFromSupabase: async () => {
        try {
          const [accs, txs, bdg, dbt, bls, gls, cats, catGroups] = await Promise.all([
            supabase.from('accounts').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('budgets').select('*'),
            supabase.from('debts').select('*'),
            supabase.from('bills').select('*'),
            supabase.from('goals').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('category_groups').select('*'),
          ]);
          set({
            accounts: accs.data || [],
            transactions: txs.data || [],
            budgets: bdg.data || [],
            debts: dbt.data || [],
            bills: bls.data || [],
            goals: gls.data || [],
            customCategories: cats.data || [],
            categoryGroups: catGroups.data || [],
          });
        } catch (e) {
          console.error("Fetch gagal", e);
        }
      },

      updateUser: (name, email) => set((state) => ({
        user: { ...state.user, name, email }
      })),

      addTransaction: (tx) => {
        set((state) => {
        const newTx: Transaction = {
          ...tx,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
        };

        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === tx.accountId) {
            return {
              ...acc,
              balance: tx.type === "income" ? acc.balance + tx.amount : acc.balance - tx.amount
            };
          }
          return acc;
        });

        const accInfo = state.accounts.find(a => a.id === tx.accountId);
        let newBills = state.bills;
        if (accInfo?.type === "paylater" && tx.type === "expense") {
          const txDate = new Date(tx.date || Date.now());
          const nextMonth = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 1);
          const dueDateStr = `${nextMonth.getFullYear()}-${(nextMonth.getMonth()+1).toString().padStart(2, '0')}-09`;
          const billName = `Tagihan PayLater (${nextMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;
          
          const existingBillIndex = state.bills.findIndex(b => b.name === billName);
          
          if (existingBillIndex >= 0) {
            newBills = [...state.bills];
            newBills[existingBillIndex] = {
              ...newBills[existingBillIndex],
              amount: newBills[existingBillIndex].amount + tx.amount,
              isPaid: false
            };
          } else {
            newBills = [...state.bills, {
              id: Math.random().toString(36).substring(2, 9),
              name: billName,
              amount: tx.amount,
              dueDate: dueDateStr,
              isPaid: false
            }];
          }
        }

        return {
          transactions: [newTx, ...state.transactions],
          accounts: updatedAccounts,
          bills: newBills,
        };
      });
      // Supabase Sync
      const state = get();
      supabase.from('transactions').insert(state.transactions[0]).then();
      const updatedAcc = state.accounts.find(a => a.id === tx.accountId);
      if (updatedAcc) supabase.from('accounts').upsert(updatedAcc).then();
      if (state.bills.length) supabase.from('bills').upsert(state.bills).then();
    },

    updateTransaction: (id, updatedTx) => {
      set((state) => {
        const oldTx = state.transactions.find(t => t.id === id);
        if (!oldTx) return state;

        let tempAccounts = state.accounts.map(acc => {
          if (acc.id === oldTx.accountId) {
            return {
              ...acc,
              balance: oldTx.type === "income" ? acc.balance - oldTx.amount : acc.balance + oldTx.amount
            };
          }
          return acc;
        });

        tempAccounts = tempAccounts.map(acc => {
          if (acc.id === updatedTx.accountId) {
            return {
              ...acc,
              balance: updatedTx.type === "income" ? acc.balance + updatedTx.amount : acc.balance - updatedTx.amount
            };
          }
          return acc;
        });

        return {
          transactions: state.transactions.map(t => t.id === id ? { ...oldTx, ...updatedTx } : t),
          accounts: tempAccounts,
        };
      });
      // Supabase Sync
      const state = get();
      const newTx = state.transactions.find(t => t.id === id);
      if (newTx) supabase.from('transactions').upsert(newTx).then();
      const updatedAcc1 = state.accounts.find(a => a.id === updatedTx.accountId);
      const updatedAcc2 = state.accounts.find(a => a.id === state.transactions.find(t => t.id === id)?.accountId);
      if (updatedAcc1) supabase.from('accounts').upsert(updatedAcc1).then();
      if (updatedAcc2 && updatedAcc1?.id !== updatedAcc2.id) supabase.from('accounts').upsert(updatedAcc2).then();
    },

    deleteTransaction: (id) => {
      let deletedAccId = "";
      set((state) => {
        const txToDelete = state.transactions.find(t => t.id === id);
        if (!txToDelete) return state;

        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === txToDelete.accountId) {
            return {
              ...acc,
              balance: txToDelete.type === "income" ? acc.balance - txToDelete.amount : acc.balance + txToDelete.amount
            };
          }
          return acc;
        });

        deletedAccId = txToDelete.accountId;
        return {
          transactions: state.transactions.filter(t => t.id !== id),
          accounts: updatedAccounts,
        };
      });
      // Supabase Sync
      supabase.from('transactions').delete().eq('id', id).then();
      const state = get();
      const updatedAcc = state.accounts.find(a => a.id === deletedAccId);
      if (updatedAcc) supabase.from('accounts').upsert(updatedAcc).then();
    },

      addAccount: (account) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ accounts: [...state.accounts, { ...account, id }] }));
        supabase.from('accounts').insert({ ...account, id }).then();
      },
      editAccount: (id, account) => {
        set((state) => ({ accounts: state.accounts.map(a => a.id === id ? { ...a, ...account } : a) }));
        supabase.from('accounts').update(account).eq('id', id).then();
      },
      deleteAccount: (id) => {
        set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) }));
        supabase.from('accounts').delete().eq('id', id).then();
      },

      saveTemplate: (template) => set((state) => ({
        templates: [...state.templates, { ...template, id: Math.random().toString(36).substring(2, 9) }]
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      })),

      payBill: (id) => {
        set((state) => ({ bills: state.bills.map(b => b.id === id ? { ...b, isPaid: true } : b) }));
        supabase.from('bills').update({ isPaid: true }).eq('id', id).then();
      },
      
      setTransactionPeriodStart: (day) => set(() => ({ transactionPeriodStart: day })),
      
      addCustomCategory: (category) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ customCategories: [...state.customCategories, { ...category, id }] }));
        supabase.from('categories').insert({ ...category, id }).then();
      },
      editCustomCategory: (id, updated) => {
        set((state) => ({ customCategories: state.customCategories.map(c => c.id === id ? { ...c, ...updated } : c) }));
        supabase.from('categories').update(updated).eq('id', id).then();
      },
      deleteCustomCategory: (id) => {
        set((state) => ({ customCategories: state.customCategories.filter(c => c.id !== id) }));
        supabase.from('categories').delete().eq('id', id).then();
      },

      addCategoryGroup: (group) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ categoryGroups: [...state.categoryGroups, { ...group, id }] }));
        supabase.from('category_groups').insert({ ...group, id }).then();
      },
      editCategoryGroup: (id, group) => {
        set((state) => ({ categoryGroups: state.categoryGroups.map(g => g.id === id ? { ...g, ...group } : g) }));
        supabase.from('category_groups').update(group).eq('id', id).then();
        // Also update the `group` name in all customCategories that belonged to this group if the name changed
        const state = get();
        const existingGroup = state.categoryGroups.find(g => g.id === id);
        if (existingGroup && group.name && existingGroup.name !== group.name) {
          const oldName = existingGroup.name;
          set((s) => ({
            customCategories: s.customCategories.map(c => c.group === oldName ? { ...c, group: group.name! } : c)
          }));
          supabase.from('categories').update({ group: group.name }).eq('group', oldName).then();
        }
      },
      deleteCategoryGroup: (id, keepChildren) => {
        const state = get();
        const groupToDelete = state.categoryGroups.find(g => g.id === id);
        if (!groupToDelete) return;

        set((state) => ({ categoryGroups: state.categoryGroups.filter(g => g.id !== id) }));
        supabase.from('category_groups').delete().eq('id', id).then();

        if (keepChildren) {
          // move children to "Lainnya"
          set((s) => ({
            customCategories: s.customCategories.map(c => c.group === groupToDelete.name ? { ...c, group: "Lainnya" } : c)
          }));
          supabase.from('categories').update({ group: "Lainnya" }).eq('group', groupToDelete.name).then();
        } else {
          // delete children
          set((s) => ({
            customCategories: s.customCategories.filter(c => c.group !== groupToDelete.name)
          }));
          supabase.from('categories').delete().eq('group', groupToDelete.name).then();
        }
      },
      
      addBill: (bill) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ bills: [...state.bills, { ...bill, id }] }));
        supabase.from('bills').insert({ ...bill, id }).then();
      },
      editBill: (id, bill) => {
        set((state) => ({ bills: state.bills.map(b => b.id === id ? { ...b, ...bill } : b) }));
        supabase.from('bills').update(bill).eq('id', id).then();
      },
      deleteBill: (id) => {
        set((state) => ({ bills: state.bills.filter(b => b.id !== id) }));
        supabase.from('bills').delete().eq('id', id).then();
      },

      addGoalFund: (id, amount) => {
        set((state) => ({ goals: state.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g) }));
        const state = get();
        const goal = state.goals.find(g => g.id === id);
        if (goal) supabase.from('goals').update({ currentAmount: goal.currentAmount }).eq('id', id).then();
      },
      addGoal: (goal) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ goals: [...state.goals, { ...goal, id }] }));
        supabase.from('goals').insert({ ...goal, id }).then();
      },
      editGoal: (id, goal) => {
        set((state) => ({ goals: state.goals.map(g => g.id === id ? { ...g, ...goal } : g) }));
        supabase.from('goals').update(goal).eq('id', id).then();
      },
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
        supabase.from('goals').delete().eq('id', id).then();
      },

      payDebt: (id) => {
        set((state) => ({ debts: state.debts.map(d => d.id === id ? { ...d, status: "paid" } : d) }));
        supabase.from('debts').update({ status: "paid" }).eq('id', id).then();
      },
      addDebt: (debt) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ debts: [...state.debts, { ...debt, id }] }));
        supabase.from('debts').insert({ ...debt, id }).then();
      },
      editDebt: (id, debt) => {
        set((state) => ({ debts: state.debts.map(d => d.id === id ? { ...d, ...debt } : d) }));
        supabase.from('debts').update(debt).eq('id', id).then();
      },
      deleteDebt: (id) => {
        set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
        supabase.from('debts').delete().eq('id', id).then();
      },

      addBudget: (budget) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ budgets: [...state.budgets, { ...budget, id }] }));
        supabase.from('budgets').insert({ ...budget, id }).then();
      },
      editBudget: (id, budget) => {
        set((state) => ({ budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b) }));
        supabase.from('budgets').update(budget).eq('id', id).then();
      },
      deleteBudget: (id) => {
        set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }));
        supabase.from('budgets').delete().eq('id', id).then();
      },

    }),
    {
      name: "duitin-storage",
    }
  )
);

export const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case "tagihan": return { icon: ReceiptText, color: "text-orange-500", bg: "bg-orange-500/10" };
    case "makanan": return { icon: Coffee, color: "text-amber-600", bg: "bg-amber-600/10" };
    case "gaji": return { icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "belanja": return { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10" };
    case "hiburan": return { icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-500/10" };
    case "transportasi": return { icon: Train, color: "text-cyan-500", bg: "bg-cyan-500/10" };
    default: return { icon: WalletIcon, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
};

export const getAccountIcon = (type: string) => {
  switch (type) {
    case "e-wallet": return { icon: WalletIcon, color: "text-blue-400", bg: "bg-blue-400/10" };
    case "bank": return { icon: Landmark, color: "text-indigo-400", bg: "bg-indigo-400/10" };
    case "cash": return { icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    case "locked": return { icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" };
    case "paylater": return { icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" };
    default: return { icon: WalletIcon, color: "text-gray-400", bg: "bg-gray-400/10" };
  }
};
