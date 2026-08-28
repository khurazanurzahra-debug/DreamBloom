import Icon from "./Icon";
import { softIconBackground, softCardBorder, softCardShadow } from "../../lib/cardGradient";

interface IconGroup {
  label: string;
  icons: string[];
}

// Grouped so a much larger icon set (household-finance categories: entertainment,
// travel, subscriptions, worship/Islamic giving, food, transport, home, health,
// shopping, family, education, sports/hobby, beauty) stays scannable instead of one
// long undifferentiated grid. Every identifier here is a real, verified lucide-react
// export — none are invented.
export const ICON_GROUPS: IconGroup[] = [
  { label: "Keuangan", icons: ["Wallet", "Coins", "Banknote", "CreditCard", "Landmark", "ShieldCheck"] },
  { label: "Makanan", icons: ["UtensilsCrossed", "Coffee", "Pizza", "Soup", "Cake", "Apple", "ShoppingBasket"] },
  { label: "Transportasi", icons: ["Car", "Bus", "TrainFront", "Bike", "Fuel"] },
  { label: "Rumah", icons: ["Home", "Sofa", "Bed", "Lamp", "WashingMachine", "Refrigerator"] },
  { label: "Hiburan", icons: ["Film", "Popcorn", "Ticket", "Gamepad", "Music", "Headphones", "Camera"] },
  { label: "Wisata", icons: ["Plane", "Map", "MapPin", "Umbrella", "Luggage", "Compass", "Sun"] },
  {
    label: "Subscription / Tagihan",
    icons: ["RefreshCw", "Tv", "Cloud", "Receipt", "Crown", "Laptop", "Link", "Wifi", "Zap", "Droplets", "Smartphone"],
  },
  { label: "Kesehatan", icons: ["HeartPulse", "Stethoscope", "Pill", "Hospital", "Syringe", "Activity"] },
  { label: "Belanja", icons: ["ShoppingBag", "ShoppingCart", "Store", "Shirt", "Gem"] },
  { label: "Keluarga", icons: ["Users", "UserRound", "Baby", "Heart", "Gift"] },
  { label: "Pendidikan", icons: ["GraduationCap", "BookOpen", "School", "Pencil", "Notebook"] },
  { label: "Olahraga & Hobi", icons: ["Dumbbell", "Trophy", "Palette"] },
  { label: "Kecantikan", icons: ["Scissors", "SprayCan"] },
  // Kaaba doesn't exist in lucide-react — Mosque is the closest real, valid icon.
  // "Cow"/"Goat" don't exist either — Beef (already the established Qurban icon) covers
  // Qurban Sapi, and PawPrint is the closest distinct available icon for Qurban Kambing.
  { label: "Ibadah", icons: ["Mosque", "HandCoins", "Beef", "PawPrint", "HandHeart"] },
  { label: "Lainnya", icons: ["Target", "Sparkles"] },
];

export const CATEGORY_ICON_OPTIONS = ICON_GROUPS.flatMap((g) => g.icons);

// Representative identity color per icon, purely for making the picker itself read as
// colorful — the actual saved category/goal color always comes from ColorSwatchPicker,
// this is independent of that choice. Anything not listed falls back to soft gray below.
const ICON_TINTS: Record<string, string> = {
  Wallet: "#C9B8E4",
  Coins: "#C9B8E4",
  Banknote: "#C6A670",
  CreditCard: "#9DC3E8",
  Landmark: "#BFD3BC",
  ShieldCheck: "#A8D9C9",
  UtensilsCrossed: "#F3C9B4",
  Coffee: "#F3C9B4",
  Pizza: "#F3B4B4",
  Soup: "#F3C9B4",
  Cake: "#F3C4D9",
  Apple: "#B7D9A8",
  ShoppingBasket: "#F0C99A",
  Car: "#9DC3E8",
  Bus: "#9DC3E8",
  TrainFront: "#B9CBE0",
  Bike: "#A8DDE0",
  Fuel: "#9DC3E8",
  Home: "#BFD3BC",
  Sofa: "#E4D9C4",
  Bed: "#D9CFE8",
  Lamp: "#F0C99A",
  WashingMachine: "#A8DDE0",
  Refrigerator: "#9DC3E8",
  Film: "#C9B8E4",
  Popcorn: "#F0C99A",
  Ticket: "#F3C4D9",
  Gamepad: "#C9B8E4",
  Music: "#D9CFE8",
  Headphones: "#9DC3E8",
  Camera: "#C9C4BE",
  Plane: "#A8DDE0",
  Map: "#A8DDE0",
  MapPin: "#F3B4B4",
  Umbrella: "#9DC3E8",
  Luggage: "#E4D9C4",
  Compass: "#B9CBE0",
  Sun: "#F0C99A",
  RefreshCw: "#A8D9C9",
  Tv: "#9DC3E8",
  Cloud: "#B9CBE0",
  Receipt: "#E4D9C4",
  Crown: "#C6A670",
  Laptop: "#C9C4BE",
  Link: "#A8DDE0",
  Wifi: "#9DC3E8",
  Zap: "#F0C99A",
  Droplets: "#A8DDE0",
  Smartphone: "#9DC3E8",
  HeartPulse: "#F3B4B4",
  Stethoscope: "#F3B4B4",
  Pill: "#F3C4D9",
  Hospital: "#F3B4B4",
  Syringe: "#A8DDE0",
  Activity: "#F3B4B4",
  ShoppingBag: "#F0C99A",
  ShoppingCart: "#F0C99A",
  Store: "#E4D9C4",
  Shirt: "#E4D9C4",
  Gem: "#C9B8E4",
  Users: "#C9B8E4",
  UserRound: "#F3C4D9",
  Baby: "#F3C4D9",
  Heart: "#F3B4B4",
  Gift: "#F3C4D9",
  GraduationCap: "#C9B8E4",
  BookOpen: "#C9B8E4",
  School: "#9DC3E8",
  Pencil: "#F0C99A",
  Notebook: "#D9CFE8",
  Dumbbell: "#F3B4B4",
  Trophy: "#C6A670",
  Palette: "#C9B8E4",
  Scissors: "#F3C4D9",
  SprayCan: "#F3C4D9",
  Mosque: "#BFD3BC",
  HandCoins: "#A8D9C9",
  Beef: "#F3B4B4",
  PawPrint: "#F3B4B4",
  HandHeart: "#F3B4B4",
  Target: "#C9C4BE",
  Sparkles: "#F0C99A",
};

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="max-h-72 overflow-y-auto pr-1">
      {ICON_GROUPS.map((group) => (
        <div key={group.label} className="mb-3 last:mb-0">
          <p className="label-caps mb-1.5">{group.label}</p>
          <div className="grid grid-cols-6 gap-2">
            {group.icons.map((name) => {
              const tint = ICON_TINTS[name] ?? "#C9C4BE";
              const selected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange(name)}
                  aria-label={name}
                  aria-pressed={selected}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition ${
                    selected ? "ring-2 ring-gold ring-offset-1" : ""
                  }`}
                  style={{
                    backgroundColor: softIconBackground(tint, selected ? 45 : 22),
                    borderColor: selected ? "#2B2620" : softCardBorder(tint, 30),
                    boxShadow: softCardShadow(),
                  }}
                >
                  {/* The glyph must never be an independent hit-target — without this,
                      taps landing on the SVG's stroke paths (rather than the button's
                      own solid background) can fail to register on some mobile browsers. */}
                  <Icon name={name} size={22} style={{ color: tint }} className="pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
