import Icon from "./Icon";
import { softIconBackground, softCardBorder, softCardShadow } from "../../lib/cardGradient";

export const CATEGORY_ICON_OPTIONS = [
  "Target", // general / default goal icon
  "UtensilsCrossed",
  "Fuel",
  "Wallet",
  "Home",
  "Coins",
  "Sparkles",
  "ShoppingBag",
  "HeartPulse",
  "Baby",
  "Car",
  "Gift",
  "Plane",
  "GraduationCap",
  "ShieldCheck",
  "Gem",
  "Coffee",
  "Smartphone",
  "Shirt",
  "Landmark", // Umrah / Haji
  "HandCoins", // Zakat
  "Beef", // Qurban
];

// Representative identity color per icon, purely for making the picker itself
// read as colorful — the actual saved category/goal color always comes from
// ColorSwatchPicker, this is independent of that choice.
const ICON_TINTS: Record<string, string> = {
  Target: "#C9C4BE",
  UtensilsCrossed: "#F3C9B4",
  Fuel: "#9DC3E8",
  Wallet: "#E4D9C4",
  Home: "#BFD3BC",
  Coins: "#C9B8E4",
  Sparkles: "#F0C99A",
  ShoppingBag: "#F3C4D9",
  HeartPulse: "#F3B4B4",
  Baby: "#F3C4D9",
  Car: "#A8DDE0",
  Gift: "#F3C4D9",
  Plane: "#A8DDE0",
  GraduationCap: "#C9B8E4",
  ShieldCheck: "#A8D9C9",
  Gem: "#FBBF24",
  Coffee: "#F3C9B4",
  Smartphone: "#9DC3E8",
  Shirt: "#E4D9C4",
  Landmark: "#BFD3BC",
  HandCoins: "#A8D9C9",
  Beef: "#F3B4B4",
};

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {CATEGORY_ICON_OPTIONS.map((name) => {
        const tint = ICON_TINTS[name] ?? "#C9C4BE";
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={name}
            aria-pressed={selected}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition active:scale-95 ${
              selected ? "ring-2 ring-gold" : ""
            }`}
            style={{
              backgroundColor: softIconBackground(tint, 22),
              borderColor: softCardBorder(tint, 30),
              boxShadow: softCardShadow(),
            }}
          >
            <Icon name={name} size={22} style={{ color: tint }} />
          </button>
        );
      })}
    </div>
  );
}
