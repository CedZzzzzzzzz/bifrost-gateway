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

async def read_semantic_cached_response(query_embedding: list[float], threshold: float | None = None,) -> tuple[str, float] | None:
    if not SUPABASE_MODE:
        return None
    loop = asyncio.get_event_loop()
    effective_threshold = threshold if threshold is not None else SEMANTIC_SIMILARITY_THRESHOLD
    return await loop.run_in_executor(
        None, supabase_semantic_read, query_embedding, effective_threshold
    )

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

def supabase_semantic_read(query_embedding: list[float], similarity_threshold: float,) -> tuple[str, float] | None:
    result = supabase_client.rpc(
        "match_prompt_cache",
        {
            "query_embedding": query_embedding,
            "similarity_threshold": similarity_threshold,
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

def supabase_fetch_all(page: int, page_size: int) -> list[dict]:
    offset = (page - 1) * page_size
    result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .select("context_hash, prompt, created_at, embedding")
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return [
        {
            "context_hash": row["context_hash"],
            "prompt": row["prompt"],
            "created_at": row["created_at"],
            "has_embedding": row["embedding"] is not None,
        }
        for row in result.data
    ]

def supabase_delete_one(context_hash: str) -> bool:
    result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .delete()
        .eq("context_hash", context_hash)
        .execute()
    )
    return len(result.data) > 0


def supabase_delete_all() -> int:
    result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .delete()
        .neq("context_hash", "")
        .execute()
    )
    return len(result.data)


def supabase_fetch_stats() -> dict:
    total_result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .select("context_hash", count="exact")
        .execute()
    )
    embedding_result = (
        supabase_client.table(PROMPT_CACHE_TABLE)
        .select("context_hash", count="exact")
        .not_.is_("embedding", "null")
        .execute()
    )
    return {
        "total_entries": total_result.count or 0,
        "entries_with_embeddings": embedding_result.count or 0,
    }

def sqlite_fetch_all(page: int, page_size: int) -> list[dict]:
    offset = (page - 1) * page_size
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        rows = conn.execute(
            f"""
            SELECT context_hash, prompt, created_at
            FROM {PROMPT_CACHE_TABLE}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (page_size, offset),
        ).fetchall()
    return [
        {
            "context_hash": row[0],
            "prompt": row[1],
            "created_at": row[2],
            "has_embedding": False,
        }
        for row in rows
    ]


def sqlite_delete_one(context_hash: str) -> bool:
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        cursor = conn.execute(
            f"DELETE FROM {PROMPT_CACHE_TABLE} WHERE context_hash = ?",
            (context_hash,),
        )
        conn.commit()
        return cursor.rowcount > 0


def sqlite_delete_all() -> int:
    with sqlite3.connect(SQLITE_DB_PATH) as conn:
        cursor = conn.execute(f"DELETE FROM {PROMPT_CACHE_TABLE}")
        conn.commit()
        return cursor.rowcount

async def fetch_cache_entries(page: int = 1, page_size: int = 20) -> list[dict]:
    loop = asyncio.get_event_loop()
    if SUPABASE_MODE:
        return await loop.run_in_executor(None, supabase_fetch_all, page, page_size)
    return await loop.run_in_executor(None, sqlite_fetch_all, page, page_size)

async def delete_cache_entry(context_hash: str) -> bool:
    loop = asyncio.get_event_loop()
    if SUPABASE_MODE:
        return await loop.run_in_executor(None, supabase_delete_one, context_hash)
    return await loop.run_in_executor(None, sqlite_delete_one, context_hash)


async def delete_all_cache_entries() -> int:
    loop = asyncio.get_event_loop()
    if SUPABASE_MODE:
        return await loop.run_in_executor(None, supabase_delete_all)
    return await loop.run_in_executor(None, sqlite_delete_all)


async def fetch_cache_stats() -> dict:
    loop = asyncio.get_event_loop()
    if SUPABASE_MODE:
        return await loop.run_in_executor(None, supabase_fetch_stats)
    return {"total_entries": 0, "entries_with_embeddings": 0}

