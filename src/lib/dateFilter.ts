const BASE_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036];
const MIN_VALID_YEAR = 2026;
const MIN_VALID_MONTH_IN_2026 = 8; // August

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getAvailableYears(): number[] {
  const years = [...BASE_YEARS];
  const currentYear = new Date().getFullYear();
  if (currentYear > years[years.length - 1]) {
    years.push(currentYear);
  }
  return years;
}

export function getAvailableMonths(year: number): { value: number; label: string }[] {
  if (year < MIN_VALID_YEAR) return [];

  const startMonth = year === MIN_VALID_YEAR ? MIN_VALID_MONTH_IN_2026 : 1;

  const months: { value: number; label: string }[] = [];
  for (let m = startMonth; m <= 12; m++) {
    months.push({ value: m, label: MONTH_LABELS[m - 1] });
  }
  return months;
}

export function isPeriodValid(year: number, month: number): boolean {
  if (year < MIN_VALID_YEAR) return false;
  if (year === MIN_VALID_YEAR && month < MIN_VALID_MONTH_IN_2026) return false;
  return month >= 1 && month <= 12;
}

export function getDefaultPeriod(): { year: number; month: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (isPeriodValid(year, month)) return { year, month };
  return { year: MIN_VALID_YEAR, month: MIN_VALID_MONTH_IN_2026 };
}

export function monthLabel(month: number): string {
  return MONTH_LABELS[month - 1];
}

export function isSamePeriod(dateIso: string, year: number, month: number): boolean {
  const d = new Date(dateIso + "T00:00:00");
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}
