import asyncio

from app.db import cache

CONVERSATIONS_TABLE = "conversations"
MESSAGES_TABLE = "conversation_messages"


async def list_conversations() -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, supabase_list_conversations)


async def create_conversation(title: str | None = None) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, supabase_create_conversation, title)


async def get_conversation_messages(conversation_id: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, supabase_get_messages, conversation_id)


async def add_message(
    conversation_id: str,
    role: str,
    content: str,
    metadata: dict | None = None,
) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, supabase_add_message, conversation_id, role, content, metadata
    )


async def delete_conversation(conversation_id: str) -> bool:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, supabase_delete_conversation, conversation_id)


async def update_conversation_title(conversation_id: str, title: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, supabase_update_title, conversation_id, title
    )


def supabase_list_conversations() -> list[dict]:
    result = (
        cache.supabase_client.table(CONVERSATIONS_TABLE)
        .select("id, title, created_at, updated_at")
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


def supabase_create_conversation(title: str | None) -> dict:
    result = (
        cache.supabase_client.table(CONVERSATIONS_TABLE)
        .insert({"title": title or "New Chat"})
        .execute()
    )
    return result.data[0]


def supabase_get_messages(conversation_id: str) -> list[dict]:
    result = (
        cache.supabase_client.table(MESSAGES_TABLE)
        .select("id, role, content, metadata, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


def supabase_add_message(
    conversation_id: str,
    role: str,
    content: str,
    metadata: dict | None,
) -> dict:
    result = (
        cache.supabase_client.table(MESSAGES_TABLE)
        .insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "metadata": metadata,
        })
        .execute()
    )
    cache.supabase_client.table(CONVERSATIONS_TABLE).update(
        {"updated_at": "now()"}
    ).eq("id", conversation_id).execute()
    return result.data[0]


def supabase_delete_conversation(conversation_id: str) -> bool:
    result = (
        cache.supabase_client.table(CONVERSATIONS_TABLE)
        .delete()
        .eq("id", conversation_id)
        .execute()
    )
    return len(result.data) > 0


def supabase_update_title(conversation_id: str, title: str) -> dict:
    result = (
        cache.supabase_client.table(CONVERSATIONS_TABLE)
        .update({"title": title})
        .eq("id", conversation_id)
        .execute()
    )
    return result.data[0]