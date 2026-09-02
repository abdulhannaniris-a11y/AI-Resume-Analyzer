"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScoreRing from "@/components/ScoreRing";
import ScoreBar from "@/components/ScoreBar";
import Badge from "@/components/Badge";
import { api } from "@/lib/api";

function Section({ title, children }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="font-display text-xl text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ResultsContent() {
  const params = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnalysis(params.id)
      .then(setAnalysis)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-clay">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-ink-soft">
        Loading analysis...
      </div>
    );
  }

  const result = analysis.analysis_result;
  const scores = result.scores;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-sm text-ink-soft mb-1">{analysis.job_title}</p>
      <h1 className="font-display text-2xl text-ink mb-8">
        Results for {analysis.resume_filename}
      </h1>

      <div className="bg-white border border-line rounded-lg p-8 grid md:grid-cols-[auto_1fr] gap-10 items-center">
        <ScoreRing score={scores.overall_score} />
        <div className="space-y-4 w-full">
          <ScoreBar label="Skills match" score={scores.skills_score} />
          <ScoreBar label="Experience match" score={scores.experience_score} />
          <ScoreBar label="Keyword match" score={scores.keyword_score} />
          <ScoreBar label="Education match" score={scores.education_score} />
          <ScoreBar label="Project match" score={scores.projects_score} />
          <ScoreBar label="Resume quality" score={scores.quality_score} />
        </div>
      </div>

      <Section title="Matched skills">
        <div className="flex flex-wrap gap-2">
          {result.matched_skills.length > 0 ? (
            result.matched_skills.map((s) => (
              <Badge key={s} tone="matched">
                {s}
              </Badge>
            ))
          ) : (
            <p className="text-ink-soft text-sm">No direct skill matches found.</p>
          )}
        </div>
      </Section>

      <Section title="Missing skills">
        <div className="flex flex-wrap gap-2">
          {result.missing_skills.length > 0 ? (
            result.missing_skills.map((s) => (
              <Badge key={s} tone="missing">
                {s}
              </Badge>
            ))
          ) : (
            <p className="text-ink-soft text-sm">No missing skills — great coverage.</p>
          )}
        </div>
      </Section>

      <Section title="Keywords">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-ink-soft mb-2">Matched</p>
            <div className="flex flex-wrap gap-2">
              {result.matched_keywords.map((k) => (
                <Badge key={k} tone="matched">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-ink-soft mb-2">Missing</p>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords.map((k) => (
                <Badge key={k} tone="missing">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Experience analysis">
        <p className="text-ink-soft leading-relaxed">{result.experience_analysis}</p>
      </Section>

      <Section title="Education analysis">
        <p className="text-ink-soft leading-relaxed">{result.education_analysis}</p>
      </Section>

      <Section title="Project analysis">
        <p className="text-ink-soft leading-relaxed">{result.projects_analysis}</p>
      </Section>

      <Section title="Strengths">
        <ul className="space-y-2">
          {result.strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-ink-soft">
              <span className="text-signal-600">+</span> {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Weaknesses">
        <ul className="space-y-2">
          {result.weaknesses.map((w, i) => (
            <li key={i} className="flex gap-2 text-ink-soft">
              <span className="text-clay">–</span> {w}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="AI recommendations">
        <ol className="space-y-3">
          {result.recommendations.map((r, i) => (
            <li key={i} className="flex gap-3 text-ink-soft">
              <span className="font-display text-signal-700">{i + 1}.</span> {r}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
