import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { isSupabaseConfigured, supabase } from "../lib/cloud/supabaseClient";
import {
  clearStoredHouseholdId,
  ensureSession,
  getStoredHouseholdId,
  joinHouseholdWithInviteCode,
} from "../lib/cloud/household";
import { subscribeToTable } from "../lib/cloud/realtime";
import { migrateLocalDataToCloud } from "../lib/cloud/migration";
import { flushPendingWrites } from "../lib/cloud/offlineQueue";
import {
  categoryFromRow,
  categoryToRow,
  goalFromRow,
  goalToRow,
  obligationFromRow,
  obligationToRow,
  profileFromRow,
  profileToRow,
  transactionFromRow,
  transactionToRow,
  type CategoryRow,
  type GoalRow,
  type HouseholdSettingsRow,
  type ObligationRow,
  type ProfileRow,
  type TransactionRow,
} from "../lib/cloud/mappers";
import { cloudWrite, type SyncStatus } from "../lib/cloud/cloudWrite";

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

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = [...list];
  next[idx] = item;
  return next;
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

  // Cloud sync — additive, does not change any existing field/behavior above.
  isCloudConfigured: boolean;
  isHouseholdConnected: boolean;
  syncStatus: SyncStatus;
  connectHousehold: (inviteCode: string) => Promise<{ ok: boolean; error?: string }>;
  disconnectHousehold: () => void;
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

  // ============================================================
  // CLOUD SYNC — additive. When Supabase isn't configured (no env vars) or no household
  // is connected yet, none of this runs and the app behaves exactly as the pure
  // localStorage version above. `household_id` itself is a device-local pointer, not
  // financial data, so it's fine to keep it in localStorage.
  // ============================================================
  const [householdId, setHouseholdIdInternal] = useState<string | null>(() => getStoredHouseholdId());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const cloudEnabled = isSupabaseConfigured && Boolean(householdId);
  const snapshotRef = useRef({
    profiles,
    categories,
    transactions,
    goals,
    obligations,
    sharedSavingTarget,
    goldTargetGrams,
    gratitudeText,
    buildingTogetherText,
  });
  snapshotRef.current = {
    profiles,
    categories,
    transactions,
    goals,
    obligations,
    sharedSavingTarget,
    goldTargetGrams,
    gratitudeText,
    buildingTogetherText,
  };

  useEffect(() => {
    if (!cloudEnabled || !supabase) return;
    let cancelled = false;

    (async () => {
      const signedIn = await ensureSession();
      if (!signedIn || cancelled) return;

      // Upload whatever this device already had locally, exactly once ever (guarded by
      // its own marker) — never overwrites cloud data that already exists (upsert only).
      await migrateLocalDataToCloud(householdId as string, snapshotRef.current);
      if (cancelled) return;

      const [profilesRes, categoriesRes, obligationsRes, transactionsRes, goalsRes, settingsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("household_id", householdId as string),
          supabase.from("categories").select("*").eq("household_id", householdId as string),
          supabase.from("obligations").select("*").eq("household_id", householdId as string),
          supabase.from("transactions").select("*").eq("household_id", householdId as string),
          supabase.from("goals").select("*").eq("household_id", householdId as string),
          supabase.from("household_settings").select("*").eq("household_id", householdId as string).maybeSingle(),
        ]);
      if (cancelled) return;

      // A genuinely empty cloud table (no error, zero rows) must still replace stale
      // local state — otherwise a table that's legitimately empty in the cloud would
      // leave old local rows on screen forever. A *failed* fetch must do the opposite:
      // never touch local state, since we can't tell "empty" from "couldn't check".
      let hadFetchError = false;

      if (!profilesRes.error) setProfiles((profilesRes.data as ProfileRow[] | null ?? []).map(profileFromRow));
      else hadFetchError = true;

      if (!categoriesRes.error)
        setCategories((categoriesRes.data as CategoryRow[] | null ?? []).map(categoryFromRow));
      else hadFetchError = true;

      if (!obligationsRes.error)
        setObligations((obligationsRes.data as ObligationRow[] | null ?? []).map(obligationFromRow));
      else hadFetchError = true;

      if (!transactionsRes.error)
        setTransactions((transactionsRes.data as TransactionRow[] | null ?? []).map(transactionFromRow));
      else hadFetchError = true;

      if (!goalsRes.error) setGoals((goalsRes.data as GoalRow[] | null ?? []).map(goalFromRow));
      else hadFetchError = true;

      if (!settingsRes.error && settingsRes.data) {
        const row = settingsRes.data as HouseholdSettingsRow;
        setSharedSavingTargetState(Number(row.shared_saving_target));
        setGoldTargetGramsState(Number(row.gold_target_grams));
        if (row.gratitude_text != null) setGratitudeTextState(row.gratitude_text);
        if (row.building_together_text != null) setBuildingTogetherTextState(row.building_together_text);
      } else if (settingsRes.error) {
        hadFetchError = true;
      }

      setSyncStatus(hadFetchError ? "error" : "saved");
    })();

    const unsubscribers = [
      subscribeToTable<ProfileRow>("profiles", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") return;
        setProfiles((prev) => upsertById(prev, profileFromRow(payload.new as ProfileRow)));
      }),
      subscribeToTable<CategoryRow>("categories", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") {
          setCategories((prev) => prev.filter((c) => c.id !== (payload.old as CategoryRow).id));
          return;
        }
        setCategories((prev) => upsertById(prev, categoryFromRow(payload.new as CategoryRow)));
      }),
      subscribeToTable<TransactionRow>("transactions", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") {
          setTransactions((prev) => prev.filter((t) => t.id !== (payload.old as TransactionRow).id));
          return;
        }
        setTransactions((prev) => upsertById(prev, transactionFromRow(payload.new as TransactionRow)));
      }),
      subscribeToTable<GoalRow>("goals", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") {
          setGoals((prev) => prev.filter((g) => g.id !== (payload.old as GoalRow).id));
          return;
        }
        setGoals((prev) => upsertById(prev, goalFromRow(payload.new as GoalRow)));
      }),
      subscribeToTable<ObligationRow>("obligations", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") {
          setObligations((prev) => prev.filter((o) => o.id !== (payload.old as ObligationRow).id));
          return;
        }
        setObligations((prev) => upsertById(prev, obligationFromRow(payload.new as ObligationRow)));
      }),
      subscribeToTable<HouseholdSettingsRow>("household_settings", householdId as string, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as HouseholdSettingsRow;
        setSharedSavingTargetState(Number(row.shared_saving_target));
        setGoldTargetGramsState(Number(row.gold_target_grams));
        if (row.gratitude_text != null) setGratitudeTextState(row.gratitude_text);
        if (row.building_together_text != null) setBuildingTogetherTextState(row.building_together_text);
      }),
    ];

    function handleOnline() {
      flushPendingWrites().then(({ remaining }) => setSyncStatus(remaining > 0 ? "error" : "saved"));
    }
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
      window.removeEventListener("online", handleOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled, householdId]);

  async function connectHousehold(inviteCode: string) {
    const result = await joinHouseholdWithInviteCode(inviteCode);
    if (result.ok && result.householdId) {
      setHouseholdIdInternal(result.householdId);
    }
    return { ok: result.ok, error: result.error };
  }

  function disconnectHousehold() {
    clearStoredHouseholdId();
    setHouseholdIdInternal(null);
    setSyncStatus("idle");
  }

  function write(table: string, op: "upsert" | "delete", payload: Record<string, unknown>) {
    if (!cloudEnabled) return;
    void cloudWrite({ table, op, payload, onStatus: setSyncStatus });
  }

  const value: DreamContextValue = {
    profiles,
    updateProfile: (id, patch) => {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      const updated = { ...profiles.find((p) => p.id === id), ...patch, id } as PersonProfile;
      write("profiles", "upsert", profileToRow(updated, householdId ?? ""));
    },

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
    addCategory: (c) => {
      const created: Category = { ...c, id: makeId("c"), isCustom: true };
      setCategories((prev) => [...prev, created]);
      write("categories", "upsert", categoryToRow(created, householdId ?? ""));
    },
    updateCategory: (id, patch) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      const updated = { ...categories.find((c) => c.id === id), ...patch, id } as Category;
      write("categories", "upsert", categoryToRow(updated, householdId ?? ""));
    },
    deleteCategory: (id) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      write("categories", "delete", { id });
    },

    transactions,
    addTransaction: (t) => {
      const created: Transaction = { ...t, id: makeId("t") };
      setTransactions((prev) => [created, ...prev]);
      write("transactions", "upsert", transactionToRow(created, householdId ?? ""));
    },
    updateTransaction: (id, patch) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      const updated = { ...transactions.find((t) => t.id === id), ...patch, id } as Transaction;
      write("transactions", "upsert", transactionToRow(updated, householdId ?? ""));
    },
    deleteTransaction: (id) => {
      const target = transactions.find((t) => t.id === id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      write("transactions", "delete", { id });

      if (target?.type === "obligation" && target.obligationId) {
        setObligations((obs) =>
          obs.map((o) => (o.id === target.obligationId ? { ...o, paidMonths: Math.max(0, o.paidMonths - 1) } : o))
        );
        const ob = obligations.find((o) => o.id === target.obligationId);
        if (ob) {
          const updatedOb = { ...ob, paidMonths: Math.max(0, ob.paidMonths - 1) };
          write("obligations", "upsert", obligationToRow(updatedOb, householdId ?? ""));
        }
      }
    },

    goals,
    addGoal: (g) => {
      const created: Goal = { ...g, id: makeId("g") };
      setGoals((prev) => [...prev, created]);
      write("goals", "upsert", goalToRow(created, householdId ?? ""));
    },
    updateGoal: (id, patch) => {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
      const updated = { ...goals.find((g) => g.id === id), ...patch, id } as Goal;
      write("goals", "upsert", goalToRow(updated, householdId ?? ""));
    },
    deleteGoal: (id) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      write("goals", "delete", { id });
    },

    obligations,
    addObligation: (o) => {
      const created: Obligation = { ...o, id: makeId("ob"), paidMonths: 0 };
      setObligations((prev) => [...prev, created]);
      write("obligations", "upsert", obligationToRow(created, householdId ?? ""));
    },
    updateObligation: (id, patch) => {
      setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      const updated = { ...obligations.find((o) => o.id === id), ...patch, id } as Obligation;
      write("obligations", "upsert", obligationToRow(updated, householdId ?? ""));
    },
    deleteObligation: (id) => {
      setObligations((prev) => prev.filter((o) => o.id !== id));
      write("obligations", "delete", { id });
    },
    recordObligationPayment: (obligationId, date) => {
      const ob = obligations.find((o) => o.id === obligationId);
      if (!ob) return;
      const paymentTx: Transaction = {
        id: makeId("t"),
        type: "obligation",
        name: ob.name,
        amount: ob.monthlyAmount,
        date,
        obligationId,
      };
      setTransactions((prev) => [paymentTx, ...prev]);
      write("transactions", "upsert", transactionToRow(paymentTx, householdId ?? ""));

      const updatedOb = { ...ob, paidMonths: Math.min(ob.totalMonths, ob.paidMonths + 1) };
      setObligations((prev) => prev.map((o) => (o.id === obligationId ? updatedOb : o)));
      write("obligations", "upsert", obligationToRow(updatedOb, householdId ?? ""));
    },

    sharedSavingTarget,
    setSharedSavingTarget: (amount) => {
      setSharedSavingTargetState(amount);
      write("household_settings", "upsert", { household_id: householdId ?? "", shared_saving_target: amount });
    },

    goldTargetGrams,
    setGoldTargetGrams: (grams) => {
      setGoldTargetGramsState(grams);
      write("household_settings", "upsert", { household_id: householdId ?? "", gold_target_grams: grams });
    },

    // Uploaded memories/receipts and the custom brand logo stay local-only for now — they
    // are base64 data URLs (up to several MB each), a materially different sync problem
    // (blob storage, not row sync) than the financial data this pass targets.
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
    setGratitudeText: (v) => {
      setGratitudeTextState(v);
      write("household_settings", "upsert", { household_id: householdId ?? "", gratitude_text: v });
    },
    buildingTogetherText,
    setBuildingTogetherText: (v) => {
      setBuildingTogetherTextState(v);
      write("household_settings", "upsert", { household_id: householdId ?? "", building_together_text: v });
    },

    hasOnboarded,
    setHasOnboarded: setHasOnboardedState,

    isCloudConfigured: isSupabaseConfigured,
    isHouseholdConnected: cloudEnabled,
    syncStatus,
    connectHousehold,
    disconnectHousehold,
  };

  return <DreamContext.Provider value={value}>{children}</DreamContext.Provider>;
}

export function useDream(): DreamContextValue {
  const ctx = useContext(DreamContext);
  if (!ctx) throw new Error("useDream must be used within DreamProvider");
  return ctx;
}
