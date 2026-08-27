import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Category,
  FileCategory,
  Goal,
  Obligation,
  PersonId,
  PersonProfile,
  Transaction,
  UploadedFile,
} from "../types";
import {
  seedCategories,
  seedGoals,
  seedObligations,
  seedProfiles,
  seedTransactions,
  SHARED_SAVING_DEFAULT_TARGET,
  GOLD_TARGET_GRAMS,
} from "../lib/mockData";
import { getDefaultPeriod } from "../lib/dateFilter";
import { base44 } from "../lib/base44";

const STORAGE_KEYS = {
  profiles: "dreambloom_profiles",
  activeProfileId: "dreambloom_active_profile",
  customLogo: "dreambloom_custom_logo",
  categories: "dreambloom_categories",
  transactions: "dreambloom_transactions",
  goals: "dreambloom_goals",
  obligations: "dreambloom_obligations",
  sharedSavingTarget: "dreambloom_shared_saving_target",
  goldTargetGrams: "dreambloom_gold_target_grams",
  files: "dreambloom_files",
  gratitudeText: "dreambloom_gratitude_text",
  buildingTogetherText: "dreambloom_building_together_text",
  period: "dreambloom_period",
  onboarded: "dreambloom_onboarded",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently, in-memory state still works
  }
}

function makeId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

interface DreamContextValue {
  profiles: PersonProfile[];
  updateProfile: (id: PersonId, patch: Partial<Omit<PersonProfile, "id">>) => void;

  activeProfileId: PersonId | null;
  setActiveProfileId: (id: PersonId) => void;
  activeProfile: PersonProfile | null;

  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string) => void;

  selectedYear: number;
  selectedMonth: number;
  setSelectedPeriod: (year: number, month: number) => void;

  categories: Category[];
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;

  goals: Goal[];
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => void;
  deleteGoal: (id: string) => void;

  obligations: Obligation[];
  addObligation: (o: Omit<Obligation, "id" | "paidMonths">) => void;
  updateObligation: (id: string, patch: Partial<Omit<Obligation, "id">>) => void;
  deleteObligation: (id: string) => void;
  recordObligationPayment: (obligationId: string, date: string) => void;

  sharedSavingTarget: number;
  setSharedSavingTarget: (amount: number) => void;

  goldTargetGrams: number;
  setGoldTargetGrams: (grams: number) => void;

  files: UploadedFile[];
  addFile: (file: File, category: FileCategory) => Promise<void>;
  removeFile: (id: string) => void;

  gratitudeText: string;
  setGratitudeText: (v: string) => void;
  buildingTogetherText: string;
  setBuildingTogetherText: (v: string) => void;

  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
}

const DreamContext = createContext<DreamContextValue | null>(null);

export function DreamProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<PersonProfile[]>(() =>
    readStorage(STORAGE_KEYS.profiles, seedProfiles)
  );
  const [activeProfileId, setActiveProfileIdState] = useState<PersonId | null>(() =>
    readStorage(STORAGE_KEYS.activeProfileId, null)
  );
  const [customLogoUrl, setCustomLogoUrlState] = useState<string | null>(() =>
    readStorage(STORAGE_KEYS.customLogo, null)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readStorage(STORAGE_KEYS.categories, seedCategories)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStorage(STORAGE_KEYS.transactions, seedTransactions)
  );
  const [goals, setGoals] = useState<Goal[]>(() => readStorage(STORAGE_KEYS.goals, seedGoals));
  const [obligations, setObligations] = useState<Obligation[]>(() =>
    readStorage(STORAGE_KEYS.obligations, seedObligations)
  );
  const [sharedSavingTarget, setSharedSavingTargetState] = useState<number>(() =>
    readStorage(STORAGE_KEYS.sharedSavingTarget, SHARED_SAVING_DEFAULT_TARGET)
  );
  const [goldTargetGrams, setGoldTargetGramsState] = useState<number>(() =>
    readStorage(STORAGE_KEYS.goldTargetGrams, GOLD_TARGET_GRAMS)
  );
  const [files, setFiles] = useState<UploadedFile[]>(() => readStorage(STORAGE_KEYS.files, []));
  const [gratitudeText, setGratitudeTextState] = useState<string>(() =>
    readStorage(STORAGE_KEYS.gratitudeText, "")
  );
  const [buildingTogetherText, setBuildingTogetherTextState] = useState<string>(() =>
    readStorage(STORAGE_KEYS.buildingTogetherText, "")
  );
  const [hasOnboarded, setHasOnboardedState] = useState<boolean>(() =>
    readStorage(STORAGE_KEYS.onboarded, false)
  );

  const defaultPeriod = useMemo(() => getDefaultPeriod(), []);
  const storedPeriod = useMemo(
    () => readStorage(STORAGE_KEYS.period, defaultPeriod),
    [defaultPeriod]
  );
  const [selectedYear, setSelectedYear] = useState<number>(storedPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(storedPeriod.month);

  useEffect(() => writeStorage(STORAGE_KEYS.profiles, profiles), [profiles]);
  useEffect(
    () => writeStorage(STORAGE_KEYS.activeProfileId, activeProfileId),
    [activeProfileId]
  );
  useEffect(() => writeStorage(STORAGE_KEYS.customLogo, customLogoUrl), [customLogoUrl]);
  useEffect(() => writeStorage(STORAGE_KEYS.categories, categories), [categories]);
  useEffect(() => writeStorage(STORAGE_KEYS.transactions, transactions), [transactions]);
  useEffect(() => writeStorage(STORAGE_KEYS.goals, goals), [goals]);
  useEffect(() => writeStorage(STORAGE_KEYS.obligations, obligations), [obligations]);
  useEffect(
    () => writeStorage(STORAGE_KEYS.sharedSavingTarget, sharedSavingTarget),
    [sharedSavingTarget]
  );
  useEffect(
    () => writeStorage(STORAGE_KEYS.goldTargetGrams, goldTargetGrams),
    [goldTargetGrams]
  );
  useEffect(() => writeStorage(STORAGE_KEYS.files, files), [files]);
  useEffect(() => writeStorage(STORAGE_KEYS.gratitudeText, gratitudeText), [gratitudeText]);
  useEffect(
    () => writeStorage(STORAGE_KEYS.buildingTogetherText, buildingTogetherText),
    [buildingTogetherText]
  );
  useEffect(() => writeStorage(STORAGE_KEYS.onboarded, hasOnboarded), [hasOnboarded]);
  useEffect(
    () => writeStorage(STORAGE_KEYS.period, { year: selectedYear, month: selectedMonth }),
    [selectedYear, selectedMonth]
  );

  const value: DreamContextValue = {
    profiles,
    updateProfile: (id, patch) =>
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),

    activeProfileId,
    setActiveProfileId: setActiveProfileIdState,
    activeProfile: profiles.find((p) => p.id === activeProfileId) ?? null,

    customLogoUrl,
    setCustomLogoUrl: setCustomLogoUrlState,

    selectedYear,
    selectedMonth,
    setSelectedPeriod: (year, month) => {
      setSelectedYear(year);
      setSelectedMonth(month);
    },

    categories,
    addCategory: (c) =>
      setCategories((prev) => [...prev, { ...c, id: makeId("c"), isCustom: true }]),
    updateCategory: (id, patch) =>
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    deleteCategory: (id) => setCategories((prev) => prev.filter((c) => c.id !== id)),

    transactions,
    addTransaction: (t) =>
      setTransactions((prev) => [{ ...t, id: makeId("t") }, ...prev]),
    updateTransaction: (id, patch) =>
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    deleteTransaction: (id) =>
      setTransactions((prev) => {
        const target = prev.find((t) => t.id === id);
        if (target?.type === "obligation" && target.obligationId) {
          setObligations((obs) =>
            obs.map((o) =>
              o.id === target.obligationId
                ? { ...o, paidMonths: Math.max(0, o.paidMonths - 1) }
                : o
            )
          );
        }
        return prev.filter((t) => t.id !== id);
      }),

    goals,
    addGoal: (g) => setGoals((prev) => [...prev, { ...g, id: makeId("g") }]),
    updateGoal: (id, patch) =>
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g))),
    deleteGoal: (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),

    obligations,
    addObligation: (o) =>
      setObligations((prev) => [...prev, { ...o, id: makeId("ob"), paidMonths: 0 }]),
    updateObligation: (id, patch) =>
      setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    deleteObligation: (id) => setObligations((prev) => prev.filter((o) => o.id !== id)),
    recordObligationPayment: (obligationId, date) => {
      const ob = obligations.find((o) => o.id === obligationId);
      if (!ob) return;
      setTransactions((prev) => [
        {
          id: makeId("t"),
          type: "obligation",
          name: ob.name,
          amount: ob.monthlyAmount,
          date,
          obligationId,
        },
        ...prev,
      ]);
      setObligations((prev) =>
        prev.map((o) =>
          o.id === obligationId ? { ...o, paidMonths: Math.min(o.totalMonths, o.paidMonths + 1) } : o
        )
      );
    },

    sharedSavingTarget,
    setSharedSavingTarget: setSharedSavingTargetState,

    goldTargetGrams,
    setGoldTargetGrams: setGoldTargetGramsState,

    files,
    addFile: async (file, category) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFiles((prev) => [
        {
          id: makeId("f"),
          fileUrl: file_url,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          category,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    removeFile: (id) => setFiles((prev) => prev.filter((f) => f.id !== id)),

    gratitudeText,
    setGratitudeText: setGratitudeTextState,
    buildingTogetherText,
    setBuildingTogetherText: setBuildingTogetherTextState,

    hasOnboarded,
    setHasOnboarded: setHasOnboardedState,
  };

  return <DreamContext.Provider value={value}>{children}</DreamContext.Provider>;
}

export function useDream(): DreamContextValue {
  const ctx = useContext(DreamContext);
  if (!ctx) throw new Error("useDream must be used within DreamProvider");
  return ctx;
}
