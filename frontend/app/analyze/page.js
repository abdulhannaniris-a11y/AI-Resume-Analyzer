"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function AnalyzeContent() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState("idle"); // idle | uploading | analyzing

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const lower = selected.name.toLowerCase();
    const isValid = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!isValid) {
      setError("Please upload a PDF or DOCX file.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setError("");

    try {
      setStage("uploading");
      const uploadedResume = await api.uploadResume(file);

      setStage("analyzing");
      const analysis = await api.analyze({
        resume_id: uploadedResume.id,
        job_title: jobTitle || "Untitled Role",
        job_description: jobDescription,
      });

      router.push(`/analyze/results/${analysis.id}`);
    } catch (err) {
      setError(err.message);
      setStage("idle");
    }
  }

  const isBusy = stage !== "idle";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">Analyze a resume</h1>
      <p className="text-ink-soft mb-8">
        Upload your resume and paste the job description you&apos;re targeting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-ink mb-1.5">Resume (PDF or DOCX)</label>
          <div className="border border-dashed border-line rounded-lg p-6 bg-white">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-ink file:text-paper file:cursor-pointer"
            />
            {file && (
              <p className="text-sm text-signal-700 mt-3">Selected: {file.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="jobTitle">
            Job title (optional)
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Backend Developer"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="jobDescription">
            Job description
          </label>
          <textarea
            id="jobDescription"
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none resize-y"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full bg-ink text-paper py-3 rounded-sm hover:bg-signal-700 transition-colors disabled:opacity-60"
        >
          {stage === "uploading" && "Uploading resume..."}
          {stage === "analyzing" && "Analyzing against job description..."}
          {stage === "idle" && "Analyze resume"}
        </button>
      </form>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <ProtectedRoute>
      <AnalyzeContent />
    </ProtectedRoute>
  );
}
