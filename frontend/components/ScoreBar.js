"use client";

import { scoreColor } from "@/lib/score";

export default function ScoreBar({ label, score }) {
  const colors = scoreColor(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-ink">{label}</span>
        <span className={`text-sm font-medium ${colors.text}`}>{Math.round(clamped)}</span>
      </div>
      <div className="h-2 rounded-sm bg-line/60 overflow-hidden">
        <div
          className={`h-full rounded-sm ${colors.bg}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
