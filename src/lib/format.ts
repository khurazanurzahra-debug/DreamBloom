const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp${(amount / 1_000).toFixed(0)}rb`;
  }
  return formatCurrency(amount);
}

export function formatGrams(grams: number): string {
  return `${grams.toFixed(3)} gram`;
}

export function formatDate(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function formatFullDate(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatDateID(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  return `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
