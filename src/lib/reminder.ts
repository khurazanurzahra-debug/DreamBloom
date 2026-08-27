const PERSONAL_REMINDERS = [
  "Alhamdulillah 🌙",
  "Jangan lupa bersyukur ✨",
  "Rezeki adalah amanah 🌿",
  "Sedikit, tapi berkah 🤍",
  "Allah knows your effort 🌙",
  "Keep your heart grateful ✨",
  "Spend wisely, stay blessed 🌿",
  "May Allah bless your rizq 🤍",
  "Barakah over more 🌙",
  "Rezeki hari ini, amanah hari ini ✨",
];

export function pickRandomReminder(): string {
  return PERSONAL_REMINDERS[Math.floor(Math.random() * PERSONAL_REMINDERS.length)];
}

export function getBudgetDescription(categoryId: string): string | null {
  if (categoryId === "makan") return "Jaga pengeluaran makan hari ini.";
  if (categoryId === "bensin") return "Target isi bensin 3–4x seminggu, menyesuaikan kebutuhan.";
  return null;
}
