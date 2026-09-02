"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { scoreColor } from "@/lib/score";

function HistoryContent() {
  const [analyses, setAnalyses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnalyses()
      .then(setAnalyses)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Analysis history</h1>

      {error && <p className="text-clay text-sm mb-6">{error}</p>}

      {!analyses ? (
        <p className="text-ink-soft">Loading...</p>
      ) : analyses.length === 0 ? (
        <div className="border border-dashed border-line rounded-lg p-10 text-center text-ink-soft">
          You haven&apos;t run any analyses yet.{" "}
          <Link href="/analyze" className="text-signal-700 hover:underline">
            Analyze your first resume
          </Link>
          .
        </div>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-sm text-ink-soft">
                <th className="px-5 py-3 font-normal">Job title</th>
                <th className="px-5 py-3 font-normal">Resume</th>
                <th className="px-5 py-3 font-normal">Score</th>
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((item) => {
                const colors = scoreColor(item.overall_score);
                return (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4 text-ink">{item.job_title}</td>
                    <td className="px-5 py-4 text-ink-soft text-sm">
                      {item.resume_filename}
                    </td>
                    <td className={`px-5 py-4 font-medium ${colors.text}`}>
                      {Math.round(item.overall_score)}
                    </td>
                    <td className="px-5 py-4 text-ink-soft text-sm">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/analyze/results/${item.id}`}
                        className="text-signal-700 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
