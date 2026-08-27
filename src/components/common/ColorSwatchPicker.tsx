import { softCardShadow } from "../../lib/cardGradient";

export const CATEGORY_COLOR_OPTIONS = [
  "#F3C9B4", // peach
  "#BFD3BC", // sage
  "#B7D9A8", // fresh green
  "#A8D9C9", // teal
  "#A8DDE0", // cyan
  "#D9CFE8", // lavender
  "#C9B8E4", // soft purple
  "#B9CBE0", // sky blue
  "#9DC3E8", // soft blue
  "#E4D9C4", // beige
  "#F0C99A", // soft orange
  "#F3B4B4", // soft coral/red
  "#F3C4D9", // soft pink
  "#C6A670", // gold
  "#C9C4BE", // soft gray
];

export default function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CATEGORY_COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Warna ${c}`}
          aria-pressed={value === c}
          className="h-9 w-9 shrink-0 rounded-full border-2 transition active:scale-95"
          style={{
            backgroundColor: c,
            borderColor: value === c ? "#2B2620" : "transparent",
            boxShadow: softCardShadow(),
          }}
        />
      ))}
    </div>
  );
}
