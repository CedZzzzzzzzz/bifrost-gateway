from fastapi import APIRouter

from app.core.config import GEMINI_MODEL, GROQ_MODEL, SUPABASE_MODE

router = APIRouter()

@router.get("/health")

async def health_check() -> dict:
    return {
        "status": "ok",
        "cache_backend": "supabase" if SUPABASE_MODE else "sqlite",
        "gemini_model": GEMINI_MODEL,
        "groq_model": GROQ_MODEL,
    }