import type { Category, Goal, Obligation, PersonProfile, Transaction } from "../../types";
import { deterministicCategoryColor } from "../categoryColor";

// Snake_case row shapes exactly matching supabase/schema.sql. Kept private to this file —
// the rest of the app only ever sees the existing camelCase app types.

export interface ProfileRow {
  [key: string]: unknown;
  id: string;
  household_id: string;
  name: string;
  role: string;
  photo_url: string | null;
}

export interface CategoryRow {
  [key: string]: unknown;
  id: string;
  household_id: string;
  name: string;
  icon: string;
  color: string;
  budget_amount: number | null;
  budget_period: string | null;
  is_custom: boolean;
}

export interface TransactionRow {
  [key: string]: unknown;
  id: string;
  household_id: string;
  type: string;
  name: string;
  amount: number;
  date: string;
  category_id: string | null;
  person_id: string | null;
  grams: number | null;
  note: string | null;
  obligation_id: string | null;
}

export interface GoalRow {
  [key: string]: unknown;
  id: string;
  household_id: string;
  title: string;
  subtitle: string | null;
  icon: string;
  color: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  notes: string | null;
}

export interface ObligationRow {
  [key: string]: unknown;
  id: string;
  household_id: string;
  name: string;
  monthly_amount: number;
  total_months: number;
  paid_months: number;
  start_date: string;
}

export interface HouseholdSettingsRow {
  [key: string]: unknown;
  household_id: string;
  shared_saving_target: number;
  gold_target_grams: number;
  gratitude_text: string | null;
  building_together_text: string | null;
}

export function profileFromRow(row: ProfileRow): PersonProfile {
  return { id: row.id as PersonProfile["id"], name: row.name, role: row.role, photoUrl: row.photo_url };
}
export function profileToRow(p: PersonProfile, householdId: string): ProfileRow {
  return { id: p.id, household_id: householdId, name: p.name, role: p.role, photo_url: p.photoUrl };
}

export function categoryFromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    // Defensive fallback only — every write path already sets a real color, but a row
    // that somehow reaches the app with an empty/missing color (a legacy row edited
    // outside the app, for instance) still gets a valid, deterministic, name-based
    // color instead of rendering with nothing.
    color: row.color || deterministicCategoryColor(row.name),
    budgetAmount: row.budget_amount != null ? Number(row.budget_amount) : undefined,
    budgetPeriod: (row.budget_period as Category["budgetPeriod"]) ?? undefined,
    isCustom: row.is_custom,
  };
}
export function categoryToRow(c: Category, householdId: string): CategoryRow {
  return {
    id: c.id,
    household_id: householdId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    budget_amount: c.budgetAmount ?? null,
    budget_period: c.budgetPeriod ?? null,
    is_custom: Boolean(c.isCustom),
  };
}

export function transactionFromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction["type"],
    name: row.name,
    amount: Number(row.amount),
    date: row.date,
    categoryId: row.category_id ?? undefined,
    personId: (row.person_id as Transaction["personId"]) ?? undefined,
    grams: row.grams != null ? Number(row.grams) : undefined,
    note: row.note ?? undefined,
    obligationId: row.obligation_id ?? undefined,
  };
}
export function transactionToRow(t: Transaction, householdId: string): TransactionRow {
  return {
    id: t.id,
    household_id: householdId,
    type: t.type,
    name: t.name,
    amount: t.amount,
    date: t.date,
    category_id: t.categoryId ?? null,
    person_id: t.personId ?? null,
    grams: t.grams ?? null,
    note: t.note ?? null,
    obligation_id: t.obligationId ?? null,
  };
}

export function goalFromRow(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    icon: row.icon,
    color: row.color,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    notes: row.notes ?? undefined,
  };
}
export function goalToRow(g: Goal, householdId: string): GoalRow {
  return {
    id: g.id,
    household_id: householdId,
    title: g.title,
    subtitle: g.subtitle || null,
    icon: g.icon,
    color: g.color,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    target_date: g.targetDate,
    notes: g.notes ?? null,
  };
}

export function obligationFromRow(row: ObligationRow): Obligation {
  return {
    id: row.id,
    name: row.name,
    monthlyAmount: Number(row.monthly_amount),
    totalMonths: row.total_months,
    paidMonths: row.paid_months,
    startDate: row.start_date,
  };
}
export function obligationToRow(o: Obligation, householdId: string): ObligationRow {
  return {
    id: o.id,
    household_id: householdId,
    name: o.name,
    monthly_amount: o.monthlyAmount,
    total_months: o.totalMonths,
    paid_months: o.paidMonths,
    start_date: o.startDate,
  };
}
