export default function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ color, backgroundColor: `${color}1A` }}
    >
      {label}
    </span>
  );
}
