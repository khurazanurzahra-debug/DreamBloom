const SUCCESS_MESSAGES = [
  "Alhamdulillah, langkah kecilmu membawa berkah 🌙",
  "MasyaAllah, semoga tabungan ini jadi jalan kebaikan ✨",
  "Indah sekali, setiap rupiah jadi amal yang dicatat 💖",
  "Semoga Allah mudahkan jalanmu, teruskan dengan sabar 🌿",
];

const ALMOST_MESSAGES = [
  "Tinggal {amount} lagi menuju berkah 🌙",
  "SubhanAllah, tinggal sedikit lagi… sabar itu indah 🌼",
  "InsyaAllah, sebentar lagi tujuanmu tercapai 💫",
  "Hampir sampai, semoga Allah berkahi hasilmu 🌙",
  "Sedikit lagi menuju keberhasilan, tetap istiqamah 🌟",
];

const URGENT_MESSAGES = [
  "Ayo, jangan tunda… semoga Allah beri kekuatan 💭",
  "Waktu terus berjalan, manfaatkan dengan bijak 🌙",
  "Bangkitlah, satu langkah hari ini bisa jadi keberkahan 🌿",
  "Semoga Allah lembutkan hatimu untuk bersegera 💖",
];

function seededPick(list: string[], seed: string): string {
  const sum = seed.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return list[sum % list.length];
}

/**
 * pct: 0-100 progress toward the goal/target.
 * daysToDeadline: days left until the relevant deadline, or null if there isn't one.
 * Returns null when nothing worth saying yet, so callers don't spam a bubble.
 */
export function getMotivationMessage(
  pct: number,
  daysToDeadline: number | null,
  personName: string,
  seed: string,
  remainingAmountLabel?: string
): string | null {
  const isUrgent = pct === 0 || (daysToDeadline !== null && daysToDeadline <= 10 && pct < 90);

  let template: string;
  if (pct >= 90) {
    template = seededPick(SUCCESS_MESSAGES, seed);
  } else if (isUrgent) {
    template = seededPick(URGENT_MESSAGES, seed);
  } else if (pct >= 60) {
    const pool = remainingAmountLabel ? ALMOST_MESSAGES : ALMOST_MESSAGES.slice(1);
    template = seededPick(pool, seed);
  } else {
    return null;
  }

  return template.replace("{name}", personName).replace("{amount}", remainingAmountLabel ?? "");
}
