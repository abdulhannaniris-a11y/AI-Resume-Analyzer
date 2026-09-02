import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import Badge from "@/components/Badge";

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="grid md:grid-cols-2 gap-12 items-center py-20 md:py-28">
        <div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink">
            Know why your resume didn&apos;t get the callback.
          </h1>
          <p className="mt-5 text-lg text-ink-soft max-w-md">
            Paste a job description, upload your resume, and get an
            ATS-style score with the exact skills you&apos;re missing —
            before a recruiter ever opens it.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/signup"
              className="bg-ink text-paper px-6 py-3 rounded-sm hover:bg-signal-700 transition-colors"
            >
              Get started
            </Link>
            <Link href="/login" className="text-ink-soft hover:text-ink">
              Log in
            </Link>
          </div>
        </div>

        <div className="bg-white border border-line rounded-lg p-8 flex flex-col items-center gap-6">
          <ScoreRing score={84} size={160} />
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge tone="matched">Python</Badge>
            <Badge tone="matched">FastAPI</Badge>
            <Badge tone="matched">SQL</Badge>
            <Badge tone="missing">Docker</Badge>
            <Badge tone="missing">AWS</Badge>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16 grid sm:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-xl text-ink mb-2">Upload once</h3>
          <p className="text-ink-soft text-sm leading-relaxed">
            Drop in a PDF or Word resume. We read the actual text — nothing
            gets invented or assumed on your behalf.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-ink mb-2">Match against any role</h3>
          <p className="text-ink-soft text-sm leading-relaxed">
            Paste any job description and we compare it against your resume
            using exact matching plus semantic similarity.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-ink mb-2">Get a real plan</h3>
          <p className="text-ink-soft text-sm leading-relaxed">
            See your score breakdown, missing keywords, and truthful,
            specific suggestions to strengthen the resume you already have.
          </p>
        </div>
      </section>
    </div>
  );
}
