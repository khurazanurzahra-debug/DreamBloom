import { Flower2 } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import MonthYearPicker from "../common/MonthYearPicker";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi,";
  if (hour < 15) return "Selamat siang,";
  if (hour < 19) return "Selamat sore,";
  return "Selamat malam,";
}

export default function HomeHeader() {
  const { customLogoUrl, activeProfile } = useDream();
  const isVideo = customLogoUrl?.startsWith("data:video");
  const name = activeProfile?.name || "Kamu";

  return (
    <div className="mb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: "#F7EEDF" }}
          >
            {customLogoUrl ? (
              isVideo ? (
                <video src={customLogoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={customLogoUrl} alt="DreamBloom" className="h-full w-full object-cover" />
              )
            ) : (
              <Flower2 size={18} strokeWidth={1.8} style={{ color: "#C89B52" }} />
            )}
          </div>
          <p className="truncate" style={{ fontSize: 18, fontWeight: 600, color: "#1F1F1F" }}>
            DreamBloom
          </p>
        </div>

        <div className="shrink-0">
          <MonthYearPicker variant="compact" />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 14, fontWeight: 400, color: "#8B8B82", lineHeight: "20px" }}>{greeting()}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#1F1F1F", lineHeight: "29px" }}>{name}.</p>
      </div>

      <p
        className="font-display"
        style={{
          marginTop: 2,
          fontSize: 13,
          fontStyle: "italic",
          fontWeight: 400,
          color: "#9B968D",
          lineHeight: "18px",
        }}
      >
        Ruang kecil untuk menjaga apa yang berarti.
      </p>
    </div>
  );
}
