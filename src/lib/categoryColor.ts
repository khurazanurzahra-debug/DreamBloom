import { CATEGORY_COLOR_OPTIONS } from "../components/common/ColorSwatchPicker";

/**
 * Deterministic, stable color for a category derived purely from its name — the same
 * name always maps to the same color, on every device, with no randomness and no
 * dependency on how many other categories exist or in what order. Used only to pick the
 * default color for a brand-new custom category when the user hasn't explicitly chosen
 * one from the swatch picker; never recomputed for an existing category (its stored
 * `color` field is the only source of truth once set, and that value syncs like any
 * other field).
 */
export function deterministicCategoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CATEGORY_COLOR_OPTIONS.length;
  return CATEGORY_COLOR_OPTIONS[index];
}
