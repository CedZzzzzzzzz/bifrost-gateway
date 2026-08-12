import asyncio
import sqlite3

from supabase import create_client, Client

from app.core.config import (
    SUPABASE_MODE,
    SQLITE_DB_PATH,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SEMANTIC_SIMILARITY_THRESHOLD,
)

supabase_client: Client | None = None

SQLITE_DLL = """
    CREATE TABLE IF NOT EXISTS prompt_cache (
        context_hash TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at DATETIME TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
"""

PROMPT_CACHE_TABLE = "prompt_cache"

def init_supabase_client() -> None:
    global supabase_client
    if SUPABASE_MODE:
        supabase_client = create_client(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        )

    print("✔️  Supabase client initialized." if SUPABASE_MODE else "Supabase client not initialized. Missing configuration.")


def init_sqlite_db() -> None:
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        conn.execute(SQLITE_DLL)
        conn.commit()
    print(f"SQLite database initialized at {SQLITE_DB_PATH}.")



async def read_cached_response(context_hash: str) -> str | None:
    loop = asyncio.get_event_loop()

    if SUPABASE_MODE:
        return await loop.run_in_executor(None, supabase_read, context_hash)

    return await loop.run_in_executor(None, sqlite_read, context_hash)

async def read_semantic_cached_response(query_embedding: list[float]) -> tuple[str, float] | None:
    if not SUPABASE_MODE:
        return None
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, supabase_semantic_read, query_embedding)

async def write_cached_response(context_hash: str, prompt: str, response: str, embedding: list[float] | None = None) -> None:
    loop = asyncio.get_event_loop()

    if SUPABASE_MODE:
        await loop.run_in_executor(None, supabase_write, context_hash, prompt, response, embedding)
    else:
        await loop.run_in_executor(None, sqlite_write, context_hash, prompt, response)

def supabase_read(context_hash: str) -> str | None:

    result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .select("response")
        .eq("context_hash", context_hash)
        .limit(1)
        .execute()
    )
    return result.data[0]["response"] if result.data else None

def supabase_semantic_read(query_embedding: list[float]) -> tuple[str, float] | None:
    result = supabase_client.rpc(
        "match_prompt_cache",
        {
            "query_embedding": query_embedding,
            "similarity_threshold": SEMANTIC_SIMILARITY_THRESHOLD,
            "match_count": 1,
        },
    ).execute()
    if result.data:
        row = result.data[0]
        return row["response"], row["similarity"]
    return None

def supabase_write(context_hash: str, prompt: str, response: str, embedding: list[float] | None) -> None:
    row = {
        "context_hash": context_hash,
        "prompt": prompt,
        "response": response,
    }
    if embedding is not None:
        row["embedding"] = embedding

    supabase_client.table(PROMPT_CACHE_TABLE).upsert(
        row,
        on_conflict="context_hash",
    ).execute()

def sqlite_read(context_hash: str) -> str | None:
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT response FROM {PROMPT_CACHE_TABLE} WHERE context_hash = ?",
            (context_hash,),
        )
        row = cursor.fetchone()
        return row[0] if row else None

def sqlite_write(context_hash: str, prompt: str, response: str) -> None:
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"""
            INSERT INTO {PROMPT_CACHE_TABLE} (context_hash, prompt, response)
            VALUES (?, ?, ?)
            ON CONFLICT(context_hash) DO UPDATE SET
                prompt=excluded.prompt,
                response=excluded.response
            """,
            (context_hash, prompt, response),
        )
        conn.commit()