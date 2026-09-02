"""
AI Resume Analyzer - FastAPI application entrypoint.

Creates the FastAPI app, enables CORS for the Next.js frontend,
creates database tables on startup, and wires up all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine
from app.db import base as db_base  # noqa: F401  (imports all models for create_all)
from app.api.routes import analyses, analyze, auth, dashboard, resumes, users

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Backend API for analyzing resumes against job descriptions.",
    version="0.1.0",
)

# Allow the local Next.js dev server to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Create any database tables that don't exist yet."""
    db_base.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    """Simple health-check endpoint so we can confirm the server is running."""
    return {"status": "ok", "message": "AI Resume Analyzer API is running"}


@app.get("/health")
def health_check():
    """Used by the frontend / monitoring to check backend availability."""
    return {"status": "healthy"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(analyses.router, prefix="/analyses", tags=["analyses"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
