from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import SUPABASE_MODE
from app.db.cache import init_sqlite_db, init_supabase_client

@asynccontextmanager
async def lifespan(app: FastAPI):

    if SUPABASE_MODE:
        init_supabase_client()
    else:
        init_sqlite_db()
    yield