export default function Badge({ children, tone = "neutral" }) {
  const tones = {
    matched: "bg-signal-50 text-signal-700 border-signal-600/30",
    missing: "bg-clay-50 text-clay border-clay/30",
    neutral: "bg-line/40 text-ink-soft border-line",
  };

  return (
    <span
      className={`inline-block text-sm px-3 py-1 rounded-sm border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
