"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { scoreColor } from "@/lib/score";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-line rounded-lg p-6">
      <p className="text-sm text-ink-soft mb-2">{label}</p>
      <p className="font-display text-3xl text-ink">{value}</p>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl text-ink">Welcome, {user?.name}</h1>
        <Link
          href="/analyze"
          className="bg-ink text-paper px-5 py-2.5 rounded-sm hover:bg-signal-700 transition-colors"
        >
          + Analyze new resume
        </Link>
      </div>

      {error && <p className="text-clay text-sm mb-6">{error}</p>}

      {summary && (
        <>
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            <StatCard label="Total analyses" value={summary.total_analyses} />
            <StatCard
              label="Average score"
              value={summary.average_score ?? "—"}
            />
            <StatCard label="Best score" value={summary.best_score ?? "—"} />
          </div>

          <h2 className="font-display text-xl text-ink mb-4">Recent analyses</h2>

          {summary.recent_analyses.length === 0 ? (
            <div className="border border-dashed border-line rounded-lg p-10 text-center text-ink-soft">
              No analyses yet. Run your first one to see it here.
            </div>
          ) : (
            <div className="border border-line rounded-lg divide-y divide-line bg-white">
              {summary.recent_analyses.map((item) => {
                const colors = scoreColor(item.overall_score);
                return (
                  <Link
                    key={item.id}
                    href={`/analyze/results/${item.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors"
                  >
                    <div>
                      <p className="text-ink">{item.job_title}</p>
                      <p className="text-sm text-ink-soft">{item.resume_filename}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-ink-soft">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className={`font-display text-lg ${colors.text}`}>
                        {Math.round(item.overall_score)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
