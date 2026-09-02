"use client";

import { scoreColor, scoreLabel } from "@/lib/score";

/**
 * A circular progress ring showing the overall ATS score.
 * Pure SVG, no external chart library needed.
 */
export default function ScoreRing({ score, size = 180 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const colors = scoreColor(clamped);

  const ringColorHex =
    clamped >= 75 ? "#1F7A5C" : clamped >= 50 ? "#B9821A" : "#B4482F";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DAD6CC"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColorHex}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="font-display"
          fontSize={size * 0.24}
          fill="#1B2A2E"
        >
          {Math.round(clamped)}
        </text>
        <text x="50%" y="62%" textAnchor="middle" fontSize={size * 0.075} fill="#4A5A5E">
          / 100
        </text>
      </svg>
      <span className={`text-sm font-medium ${colors.text}`}>{scoreLabel(clamped)}</span>
    </div>
  );
}
