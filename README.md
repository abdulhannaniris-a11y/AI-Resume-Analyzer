# AI Resume Analyzer

A full-stack app that scores a resume against a job description, shows
matched/missing skills, and gives AI-generated, truthful recommendations
for improving the resume.

Tested during development with a live backend + frontend integration
(signup, login, JWT auth, resume upload/text extraction, CORS, and a full
production `next build`) — see "What's been tested" at the bottom.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, JavaScript), React, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy
- **Database:** SQLite (a single local file — no separate database server to install or run)
- **AI:** Groq API
- **Resume parsing:** PyMuPDF (PDF), python-docx (DOCX)
- **Semantic matching:** Sentence Transformers + FAISS
- **Auth:** JWT (python-jose) + bcrypt password hashing (used directly, no passlib)

## Project Structure

```text
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entrypoint, CORS, router wiring
│   │   ├── core/
│   │   │   ├── config.py           # Settings loaded from .env
│   │   │   ├── security.py         # Password hashing + JWT
│   │   │   └── deps.py             # get_current_user dependency
│   │   ├── db/
│   │   │   ├── session.py          # Engine/session/Base
│   │   │   └── base.py             # Imports all models for create_all()
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   ├── job_description.py
│   │   │   └── analysis.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── resume_parser.py    # PDF/DOCX text extraction
│   │   │   ├── groq_client.py      # Groq API wrapper (JSON mode)
│   │   │   ├── ai_extraction.py    # Structured resume/job extraction
│   │   │   ├── matching.py         # Rule-based + semantic matching
│   │   │   ├── scoring.py          # Deterministic weighted scoring
│   │   │   └── recommendations.py  # Strengths/weaknesses/suggestions
│   │   └── api/routes/
│   │       ├── auth.py             # POST /auth/signup, /auth/login
│   │       ├── users.py            # GET /users/me
│   │       ├── resumes.py          # POST /resumes/upload
│   │       ├── analyze.py          # POST /analyze
│   │       ├── analyses.py         # GET /analyses, /analyses/{id}
│   │       └── dashboard.py        # GET /dashboard/summary
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.js                 # Landing page
│   │   ├── signup/page.js
│   │   ├── login/page.js
│   │   ├── dashboard/page.js
│   │   ├── analyze/page.js         # Upload resume + paste job description
│   │   ├── analyze/results/[id]/page.js  # Full results dashboard
│   │   ├── history/page.js
│   │   ├── settings/page.js
│   │   └── layout.js / globals.css
│   ├── components/                 # Navbar, ScoreRing, ScoreBar, Badge, ProtectedRoute
│   ├── context/AuthContext.js      # Client-side auth state (token in localStorage)
│   ├── lib/api.js                  # Fetch wrapper for the backend API
│   └── package.json
│
├── .env.example                    # Backend environment variable template
└── README.md
```

## 1. Install required software

- **Python** 3.11 or 3.12 — https://www.python.org/downloads/
- **Node.js** 18+ — https://nodejs.org/
- **VS Code** — https://code.visualstudio.com/

No separate database install needed — this project uses SQLite, which
ships with Python and stores everything in a single file
(`backend/resume_analyzer.db`) that's created automatically the first
time the backend starts.

## 2. Configure the backend `.env`

From the project root:

```bash
cp .env.example backend/.env
```

**Windows (Command Prompt):**
```cmd
copy .env.example backend\.env
```

Open `backend/.env` and fill in:

```env
DATABASE_URL=sqlite:///./resume_analyzer.db
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
```

The `DATABASE_URL` line can stay as-is — it already points to a local
SQLite file. You only need to fill in:
- `GROQ_API_KEY` — get one at https://console.groq.com
- `SECRET_KEY` — generate one with: `python -c "import secrets; print(secrets.token_hex(32))"`

## 3. Install backend dependencies

```bash
cd backend
python -m venv venv
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```cmd
venv\Scripts\activate
```

Then, on all platforms:

```bash
pip install -r requirements.txt
```

> Note: `sentence-transformers` will download a small embedding model
> (~90MB) the first time it's used. This requires an internet connection
> on first run only.

## 4. Run the FastAPI backend

From inside `backend/` (with the virtual environment activated):

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://127.0.0.1:8000**, with interactive
docs at **http://127.0.0.1:8000/docs**. The SQLite database file and all
tables are created automatically on first startup — no separate setup step.

## 5. Install frontend dependencies

Open a **second terminal** (leave the backend running):

```bash
cd frontend
npm install
```

Then create the frontend's environment file:

```bash
cp .env.local.example .env.local
```

**Windows:**
```cmd
copy .env.local.example .env.local
```

The default value (`NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`) already
matches the backend above, so you shouldn't need to change it for local use.

## 6. Run the Next.js frontend

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

## 7. Open the application

1. Visit http://localhost:3000
2. Click **Get started** and create an account
3. From the dashboard, click **+ Analyze new resume**
4. Upload a PDF or DOCX resume, paste a job description, and click **Analyze resume**
5. View your score breakdown, matched/missing skills, and recommendations
6. Visit **History** to see all past analyses

## How scoring works

The final 0–100 score is always calculated in Python
(`backend/app/services/scoring.py`) — the AI is never allowed to invent the
number. Weights (easy to change in one place):

```text
Skills Match          35%
Experience Match      25%
Keyword Match         15%
Education Match       10%
Projects Match        10%
Resume Quality          5%
```

Matching is a combination of exact/substring matching
(`matching.py: rule_based_match`) and semantic similarity via Sentence
Transformers + FAISS (`matching.py: semantic_match`), so skills phrased
differently (e.g. "REST APIs" vs. "RESTful web services") can still match.

The AI (Groq) is only used for two things: extracting structured data that
actually exists in the resume/job text, and writing qualitative
strengths/weaknesses/recommendations — both are explicitly instructed
never to invent skills, experience, or achievements.

## Error handling

The backend returns clear, specific error messages for: duplicate email
on signup, incorrect login credentials, invalid/expired JWTs, unsupported
file types, empty or unreadable resumes, empty job descriptions, and Groq
API failures (surfaced as HTTP 502 with a readable message). The frontend
displays these inline on the relevant form instead of a generic failure.

## Known limitation: Next.js version

This project uses Next.js 14.2.35, the final patched release in the 14.x
line, which reached end-of-life in October 2025. `npm audit` will still
flag a number of advisories inherited from the broader 14.x version range
(mostly server-hosting/edge-runtime issues, not relevant to local
development). For a production deployment, plan to upgrade to a
currently-supported Next.js 15.x or 16.x release — that's a larger change
(React 19, some API differences) that hasn't been tested in this project.

## A note on Python version and native dependencies

Several packages here (`bcrypt`, `pymupdf`, `sentence-transformers`,
`faiss-cpu`, `numpy`, and the transitive dependencies of `fastapi`/
`pydantic`) are C/Rust-backed and only ship precompiled wheels for
specific Python versions. `requirements.txt` uses `>=` version floors
for every package (rather than exact pins) so `pip` always resolves to
whatever current release actually has a wheel for your Python version —
this was tested by installing with no exact pins at all on Python 3.13,
where everything resolved cleanly to current releases.

If `pip install -r requirements.txt` ever fails partway through — **pip
aborts the entire install if any single package fails to build**, even
packages listed earlier in the file, so a later failure can look
confusingly like an earlier, unrelated package "didn't install" — it's
almost always one compiled package lacking a wheel for your exact Python
version + OS combination and falling back to a from-source build that
needs a compiler toolchain you don't have. If that happens:

1. Run `pip install -r requirements.txt` again and scroll to the **top**
   of the error output, not just the last few lines — the real error
   (e.g. `error: subprocess-exited-with-error` under a specific package's
   name) is near the top; everything after is stack-trace noise.
2. Look for which package name appears right before that first error.
   Search `"<package name> pypi wheel <your Python version>"` to confirm
   whether a wheel exists yet.
3. If it's a compiled package with no wheel available yet for your Python
   version, the most reliable fix is installing **Python 3.11 or 3.12**
   alongside your current Python and creating the virtual environment with
   that instead (e.g. `py -3.12 -m venv venv` on Windows) — these versions
   have the widest, most mature wheel support across the whole ecosystem.
4. The app still works without the semantic-matching packages specifically:
   `matching.py` has a built-in fallback to rule-based-only matching if
   `sentence-transformers` or `faiss` aren't installed, so you can comment
   those two lines out of `requirements.txt` and get a fully working app
   minus the "similar wording" matching layer.

## What's been tested

During development, this exact code was installed and run (not just
written) to catch real bugs before delivery:

- **Backend:** a live Uvicorn server was started and exercised via curl —
  signup, login, JWT-protected `/users/me` and `/dashboard/summary`,
  duplicate-email and wrong-password error paths, and both PDF and DOCX
  resume upload with real text extraction, all against the real SQLite
  database (file created automatically, tables created on startup).
- **Re-verified against the actual latest resolvable package versions**
  (not just the versions used during initial development) after switching
  `requirements.txt` to version floors — `pip install` was run with no
  exact pins, pulling in whatever the newest compatible releases were
  (e.g. FastAPI 0.141, Pydantic 2.13, SQLAlchemy 2.0.52, bcrypt 5.0.0,
  PyMuPDF 1.28.2 at time of writing), and the full signup/login/upload
  flow was re-tested against those to confirm no breaking API changes.
- Two real bugs were caught and fixed this way: newer `bcrypt` (4.1+)
  breaks `passlib` 1.7.4's version detection, so `app/core/security.py`
  now calls `bcrypt` directly with no `passlib` dependency at all; and
  PyMuPDF's `fitz` import name is deprecated in current releases (prints
  a warning), so `resume_parser.py` now uses `import pymupdf` instead.
- **Matching/scoring logic** was unit-tested directly with sample data.
- **Frontend:** `npm run build` was run and completed successfully for
  every page; a production server (`npm run start`) was started and every
  route returned HTTP 200.
- **Integration:** both servers were run together and a real signup
  request was sent from the frontend's origin to the backend, confirming
  CORS headers are correctly configured end-to-end.

**Not tested** (requires resources not available in the build environment):
the full analyze pipeline against a real Groq API key, and the
semantic-matching layer against real sentence-transformers/FAISS installs
(disk space in the build environment couldn't fit the ML dependencies;
the code has a graceful fallback to rule-based-only matching if those
libraries are ever missing).
If you hit an issue in either of these areas, the interactive docs at
`/docs` are the fastest way to isolate which endpoint is failing.
