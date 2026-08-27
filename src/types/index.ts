export type PersonId = "khuraza" | "yusuf";

export interface PersonProfile {
  id: PersonId;
  name: string;
  role: string; // "Istri" | "Suami"
  photoUrl: string | null;
}

export type BudgetPeriod = "daily" | "monthly";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetAmount?: number;
  budgetPeriod?: BudgetPeriod;
  isCustom?: boolean;
}

export type TransactionType = "income" | "expense" | "saving" | "gold" | "obligation";

export interface Transaction {
  id: string;
  categoryId?: string;
  obligationId?: string;
  name: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date, e.g. 2026-08-14
  personId?: PersonId;
  grams?: number; // only for type "gold"
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date
  notes?: string;
}

export interface Obligation {
  id: string;
  name: string;
  monthlyAmount: number;
  totalMonths: number;
  paidMonths: number;
  startDate: string; // ISO date
}

export type FileCategory = "memory" | "receipt" | "document";

export interface UploadedFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string; // mime type
  category: FileCategory;
  createdAt: string;
}

export interface Period {
  year: number;
  month: number; // 1-12
}
