from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.db.conversations import (
    list_conversations,
    create_conversation,
    get_conversation_messages,
    delete_conversation,
    update_conversation_title,
)

router = APIRouter()

@router.get("/conversations")
async def get_conversations() -> JSONResponse:
    conversations = await list_conversations()
    return JSONResponse(content={"conversations": conversations})

@router.post("/conversations")
async def new_conversation(title: str | None = None) -> JSONResponse:
    conversation = await create_conversation(title)
    return JSONResponse(content={"conversation": conversation})

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str) -> JSONResponse:
    messages = await get_conversation_messages(conversation_id)
    return JSONResponse(content={"messages": messages})

@router.delete("/conversations/{conversation_id}")
async def remove_conversation(conversation_id: str) -> JSONResponse:
    await delete_conversation(conversation_id)

    if not delete_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        return JSONResponse(content={"message": "Conversation deleted successfully"})

@router.patch("/conversations/{conversation_id}")
async def rename_conversation(conversation_id: str, title: str) -> JSONResponse:
    updated_conversation = await update_conversation_title(conversation_id, title)
    return JSONResponse(content={"conversation": updated_conversation})
