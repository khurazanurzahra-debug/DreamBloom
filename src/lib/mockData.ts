import type { Category, Goal, Obligation, PersonProfile, Transaction } from "../types";

export const INCOME_CATEGORY_NAMES = ["Gaji Pokok", "THR", "SHU", "Jasprod", "Bonus", "Lainnya"];

export const GOLD_PRICE_PER_GRAM = 1_850_000;
export const GOLD_TARGET_GRAMS = 10_000;
export const SHARED_SAVING_DEFAULT_TARGET = 5_000_000;

export const seedProfiles: PersonProfile[] = [
  { id: "khuraza", name: "Khuraza", role: "Istri", photoUrl: null },
  { id: "yusuf", name: "Yusuf", role: "Suami", photoUrl: null },
];

export const seedCategories: Category[] = [
  { id: "makan", name: "Makan", icon: "UtensilsCrossed", color: "#F3C9B4", budgetAmount: 100000, budgetPeriod: "daily" },
  { id: "bensin", name: "Bensin", icon: "Fuel", color: "#9DC3E8", budgetAmount: 500000, budgetPeriod: "monthly" },
  { id: "cash", name: "Cash", icon: "Wallet", color: "#E4D9C4", budgetAmount: 100000, budgetPeriod: "monthly" },
  { id: "rumah-tangga", name: "Rumah Tangga", icon: "Home", color: "#BFD3BC", budgetAmount: 800000, budgetPeriod: "monthly" },
  { id: "tabungan", name: "Tabungan", icon: "Coins", color: "#C9B8E4", budgetAmount: 5000000, budgetPeriod: "monthly" },
  { id: "lainnya", name: "Lainnya", icon: "Sparkles", color: "#F0C99A", budgetAmount: undefined, budgetPeriod: undefined },
];

export const seedTransactions: Transaction[] = [
  { id: "t1", type: "income", name: "Gaji Pokok", amount: 7800000, date: "2026-08-24", personId: "khuraza" },
  { id: "t2", type: "income", name: "Gaji Pokok", amount: 9500000, date: "2026-08-24", personId: "yusuf" },
  { id: "t3", type: "obligation", name: "Pinjaman Koperasi", amount: 5000000, date: "2026-08-24", obligationId: "ob1" },
  { id: "t4", type: "expense", name: "Belanja mingguan", amount: 320000, date: "2026-08-03", categoryId: "makan" },
  { id: "t5", type: "expense", name: "Isi bensin", amount: 25000, date: "2026-08-04", categoryId: "bensin" },
  { id: "t6", type: "expense", name: "Listrik & air", amount: 650000, date: "2026-08-05", categoryId: "rumah-tangga" },
  { id: "t7", type: "expense", name: "Jajan sore", amount: 45000, date: "2026-08-06", categoryId: "makan" },
  { id: "t8", type: "expense", name: "Internet", amount: 400000, date: "2026-08-07", categoryId: "rumah-tangga" },
  { id: "t9", type: "saving", name: "Tabungan Bersama", amount: 2500000, date: "2026-08-08", personId: "khuraza", categoryId: "tabungan" },
  { id: "t10", type: "saving", name: "Tabungan Bersama", amount: 2500000, date: "2026-08-08", personId: "yusuf", categoryId: "tabungan" },
  { id: "t11", type: "expense", name: "Isi bensin", amount: 30000, date: "2026-08-10", categoryId: "bensin" },
  { id: "t12", type: "gold", name: "Tabungan Emas", amount: 1850000, date: "2026-08-12", grams: 1, note: "Cicilan emas bulanan" },
  { id: "t13", type: "expense", name: "Warung siang", amount: 40000, date: "2026-08-13", categoryId: "makan" },
  { id: "t14", type: "expense", name: "Sabun & sampo", amount: 120000, date: "2026-08-14", categoryId: "rumah-tangga" },
  { id: "t15", type: "expense", name: "Tarik tunai", amount: 100000, date: "2026-08-15", categoryId: "cash" },
  { id: "t16", type: "expense", name: "Kado kecil", amount: 150000, date: "2026-08-18", categoryId: "lainnya" },
];

export const seedGoals: Goal[] = [
  {
    id: "g1",
    title: "Dana Darurat",
    subtitle: "Ketenangan untuk hal tak terduga",
    icon: "ShieldCheck",
    color: "#A8D9C9",
    targetAmount: 30000000,
    currentAmount: 12500000,
    targetDate: "2027-06-01",
  },
  {
    id: "g2",
    title: "Rumah Impian",
    subtitle: "Ruang yang benar-benar milik kita",
    icon: "Home",
    color: "#B7D9A8",
    targetAmount: 500000000,
    currentAmount: 45000000,
    targetDate: "2032-01-01",
  },
  {
    id: "g3",
    title: "Liburan Keluarga",
    subtitle: "Waktu berkualitas bersama",
    icon: "Plane",
    color: "#A8DDE0",
    targetAmount: 25000000,
    currentAmount: 8000000,
    targetDate: "2027-01-01",
  },
];

export const seedObligations: Obligation[] = [
  {
    id: "ob1",
    name: "Pinjaman Koperasi",
    monthlyAmount: 5000000,
    totalMonths: 7,
    paidMonths: 1,
    startDate: "2026-08-01",
  },
];
