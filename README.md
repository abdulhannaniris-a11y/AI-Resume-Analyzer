# 🤖 AI Resume Analyzer

An end-to-end **AI-powered Resume Analyzer** that evaluates how well a resume matches a given job description using a combination of **rule-based skill matching, semantic similarity, and deterministic scoring**.

The application allows users to upload a resume, provide a job description, and receive an ATS-style compatibility analysis with matched skills, missing skills, and AI-generated recommendations for improvement.

> **Built as a practical AI Engineering project focused on combining LLMs with deterministic software logic rather than relying entirely on AI-generated decisions.**

---

## ✨ Features

### 📄 Resume Analysis

* Upload resumes in **PDF** or **DOCX** format.
* Automatically extract resume content.
* Identify relevant skills, experience, education, and other information.
* Prevent the AI from fabricating information that does not exist in the resume.

### 🎯 Job Compatibility Analysis

* Compare the resume against a provided job description.
* Identify:

  * ✅ Matched skills
  * ❌ Missing skills
  * 🔍 Relevant experience
  * 📊 Overall compatibility score

### 🧠 Hybrid Matching Engine

The application combines multiple approaches:

**Rule-Based Matching**

* Detects explicit skill matches between the resume and job description.

**Semantic Similarity**

* Uses sentence embeddings to recognize skills and concepts even when they are expressed differently.

**FAISS Vector Search**

* Provides efficient similarity comparison between embedded text representations.

### 🔢 Deterministic Scoring

The final compatibility score is calculated using **Python-based deterministic logic** rather than allowing the LLM to arbitrarily assign a score.

This makes the scoring process:

* Transparent
* Reproducible
* Easier to debug
* Independent of LLM variability

### 🤖 AI-Powered Recommendations

The system generates personalized recommendations based on the actual resume analysis, helping users understand:

* Which skills they should highlight
* What information may be missing
* Where their resume could be improved
* How well their current profile aligns with the target position

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Password hashing with bcrypt
* Protected application routes

### 📊 Dashboard & History

Users can:

* View previous analyses
* Review compatibility scores
* Access previous resume evaluations
* Manage their account settings

---

# 🏗️ System Architecture

```text
                        ┌─────────────────────┐
                        │      User           │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   Next.js Frontend  │
                        │ React + Tailwind CSS│
                        └──────────┬──────────┘
                                   │
                              REST API
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │    FastAPI Backend  │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
      ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
      │ Resume       │     │ Job          │     │ Authentication│
      │ Parser       │     │ Description  │     │ JWT + bcrypt │
      └──────┬───────┘     └──────┬───────┘     └──────────────┘
             │                    │
             └──────────┬─────────┘
                        ▼
               ┌───────────────────┐
               │ Matching Engine   │
               ├───────────────────┤
               │ Rule-Based Match  │
               │ Semantic Similarity│
               │ FAISS             │
               └─────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Deterministic    │
                │ Scoring Engine   │
                └─────────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Groq AI           │
                │ Recommendations  │
                └─────────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Analysis Results │
                └──────────────────┘
```

---

# 🛠️ Technology Stack

| Layer             | Technologies                 |
| ----------------- | ---------------------------- |
| Frontend          | Next.js, React, Tailwind CSS |
| Backend           | Python, FastAPI              |
| Validation        | Pydantic                     |
| ORM               | SQLAlchemy                   |
| Database          | SQLite                       |
| AI / LLM          | Groq API                     |
| Embeddings        | Sentence Transformers        |
| Vector Search     | FAISS                        |
| Resume Parsing    | PyMuPDF, python-docx         |
| Authentication    | JWT, bcrypt                  |
| API Communication | REST                         |

---

# 📁 Project Structure

```text
AI-Resume-Analyzer/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── analyses.py
│   │   │       ├── analyze.py
│   │   │       ├── auth.py
│   │   │       ├── dashboard.py
│   │   │       ├── resumes.py
│   │   │       └── users.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   ├── analysis.py
│   │   │   ├── job_description.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── analysis.py
│   │   │   ├── job_description.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_extraction.py
│   │   │   ├── groq_client.py
│   │   │   ├── matching.py
│   │   │   ├── recommendations.py
│   │   │   ├── resume_parser.py
│   │   │   └── scoring.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── analyze/
│   │   ├── dashboard/
│   │   ├── history/
│   │   ├── login/
│   │   ├── settings/
│   │   └── signup/
│   │
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── package.json
│   └── tailwind.config.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ How It Works

The analysis pipeline follows these major steps:

### 1. Resume Upload

The user uploads a PDF or DOCX resume.

### 2. Text Extraction

The backend extracts readable text using:

* **PyMuPDF** for PDF files
* **python-docx** for DOCX files

### 3. AI Information Extraction

The extracted resume content is processed to identify relevant information while maintaining a strict rule:

> **The system should only use information actually present in the resume.**

### 4. Job Description Processing

The provided job description is analyzed to identify relevant requirements and skills.

### 5. Skill Matching

The system performs both:

```text
Resume
   │
   ├── Rule-Based Matching
   │
   └── Semantic Similarity
             │
             ▼
       Combined Results
```

Semantic matching helps identify conceptually similar terms even when exact wording differs.

### 6. Score Calculation

The scoring engine calculates the final compatibility score using deterministic Python logic.

The LLM does **not** directly decide the final score.

### 7. AI Recommendations

The Groq-powered AI generates recommendations based on the analysis results.

### 8. Results

The user receives:

```text
Overall Score
      │
      ├── Matched Skills
      ├── Missing Skills
      ├── Analysis
      └── Recommendations
```

---

# 🔐 Environment Variables

Create the required environment files using the provided examples.

### Backend

Configure your backend environment variables according to `.env.example`.

### Frontend

Create:

```text
frontend/.env.local
```

using:

```text
frontend/.env.local.example
```

**Never commit API keys or other secrets to GitHub.**

The actual `.env.local` file is intentionally excluded through `.gitignore`.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js 18+
* npm
* Git

You will also need a valid **Groq API key** for AI-powered functionality.

---

## 1. Clone the Repository

```bash
git clone https://github.com/abdulhannaniris-a11y/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer
```

---

## 2. Backend Setup

Create and activate a virtual environment:

### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

Configure your environment variables.

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
```

Configure:

```text
.env.local
```

Then start the development server:

```powershell
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# 🧪 Development

Run the frontend and backend simultaneously:

```text
Terminal 1
──────────
cd backend
uvicorn app.main:app --reload
```

```text
Terminal 2
──────────
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🎯 Design Principles

This project was built around several important engineering principles.

### 1. AI Should Assist — Not Control Everything

LLMs are useful for extracting information and generating recommendations, but deterministic operations such as scoring should remain under application logic where possible.

### 2. No Fabricated Resume Information

The analysis pipeline is designed to avoid inventing skills, experience, or qualifications that are not present in the source resume.

### 3. Transparent Scoring

The final compatibility score is calculated using Python-based logic rather than relying on an LLM's subjective judgment.

### 4. Hybrid Intelligence

The system combines:

```text
Traditional Software Logic
          +
Semantic AI
          +
LLM Capabilities
          =
More Robust Resume Analysis
```

---

# 🔮 Future Improvements

Potential future enhancements include:

* [ ] Support for additional resume formats
* [ ] Advanced ATS keyword analysis
* [ ] Resume section quality scoring
* [ ] Multiple job-description comparisons
* [ ] Resume version management
* [ ] Exportable analysis reports
* [ ] Improved semantic skill taxonomy
* [ ] Cloud database integration
* [ ] Production deployment
* [ ] Automated testing and CI/CD
* [ ] More advanced AI-powered resume optimization

---

# 👨‍💻 Project Purpose

This project was developed as part of my journey toward becoming an **AI Engineer**, with a focus on building practical applications that combine:

* Artificial Intelligence
* Large Language Models
* Natural Language Processing
* Semantic Search
* Backend Engineering
* Full-Stack Development
* Database Design
* Authentication
* API Development

Rather than building a simple LLM wrapper, the goal was to explore how **AI components can be integrated with traditional software engineering principles to create a reliable end-to-end application.**

---

# 📌 Key Takeaway

The central idea behind this project is simple:

> **Use AI where it adds intelligence, and use deterministic software where reliability and consistency matter.**

This approach makes the application easier to reason about, test, debug, and improve.

---

# 📄 License

This project is intended for educational and portfolio purposes.

---

## ⭐ Author

**Abdul Hannan**

Aspiring AI Engineer | Python | AI/ML | FastAPI | Next.js

---

If you find the project interesting, consider giving the repository a ⭐ on GitHub.
