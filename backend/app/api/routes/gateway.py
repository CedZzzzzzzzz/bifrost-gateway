from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google.genai import types as genai_types
from groq import RateLimitError as GroqRateLimitError

import asyncio

from app.core.config import GEMINI_MODEL, GROQ_MODEL
from app.db.cache import read_cached_response, write_cached_response, read_semantic_cached_response
from app.schemas.chat import ChatRequest
from app.services.embedding_provider import generate_embedding
from app.services.gemini_provider import query_gemini_flash
from app.services.groq_provider import query_groq_llama
from app.services.prompt_utils import compute_context_hash, flatten_messages_text
from app.services.search_provider import fetch_search_context, web_search
from app.services.classifier import generate_search_query

router = APIRouter()


def extract_last_user_message(request: ChatRequest) -> str:
    return next(
        (m.content for m in reversed(request.messages) if m.role == "user"),
        "",
    )


def build_search_enriched_messages(
    request: ChatRequest, search_context: str
) -> list[dict]:
    system_message = {
        "role": "system",
        "content": (
            "You are a helpful assistant with access to real-time web search results. "
            "Treat the search context below as your only source of truth for this answer. "
            "Do not reference your training data, prior knowledge, or a 'knowledge cutoff' "
            "in any way — act as if the search context is the only information you have.\n\n"
            "If the search context does not fully answer the question, say so explicitly "
            "rather than filling gaps from memory or assumption.\n\n"
            "For topics involving ongoing investigations, legal proceedings, accidents, or "
            "any event where cause or fault has not been officially confirmed: report only "
            "what the search context explicitly states as confirmed fact. Do not state a cause, "
            "reason, or attribution of fault unless the search context clearly presents it as "
            "established (not speculation, allegation, or under-investigation). If the context "
            "distinguishes confirmed facts from ongoing/unconfirmed claims, preserve that "
            "distinction in your answer instead of flattening it into a single narrative.\n\n"
            f"Search Context:\n{search_context}"
        ),
    }
    user_messages = [
        {"role": m.role, "content": m.content}
        for m in request.messages
    ]
    return [system_message] + user_messages


@router.post("/chat/completions")
async def chat_completion(
    request: ChatRequest,
) -> JSONResponse:
    # Bifrost chat completion endpoint, main gateway. it applies the sha-256 algorithm prompt caching.

    context_hash = compute_context_hash(request.messages)
    cached_response = await read_cached_response(context_hash)

    if cached_response is not None:
        return JSONResponse(content={
            "response": cached_response,
            "source": "Database cache hit",
            "tokens_saved": True,
            "provider": None,
            "web_search_used": False,
            "semantic_cache_hit": False,
            "similarity_score": None,
            "context_hash": context_hash,
        })

    last_user_message = extract_last_user_message(request)
    recent_conversation = flatten_messages_text(request.messages[-4:])
    query_embedding = await generate_embedding(last_user_message)

    semantic_result = await read_semantic_cached_response(query_embedding)
    if semantic_result is not None:
        semantic_response, similarity_score = semantic_result
        return JSONResponse(content={
            "response": semantic_response,
            "source": "Semantic cache hit",
            "tokens_saved": True,
            "provider": None,
            "web_search_used": False,
            "semantic_cache_hit": True,
            "similarity_score": round(similarity_score, 3),
            "context_hash": context_hash,
        })

    needs_search = await web_search(recent_conversation)

    web_search_used = False
    messages_to_send = [
        {"role": m.role, "content": m.content}
        for m in request.messages[-6:]
    ]

    if needs_search:
        search_query = await generate_search_query(recent_conversation, last_user_message)
        search_context = await fetch_search_context(search_query)
        if search_context:
            web_search_used = True
            messages_to_send = build_search_enriched_messages(
                request,
                search_context
            )

    response_text: str
    provider: str

    try:
        response_text = await query_groq_llama(messages_to_send)
        provider = "Groq"

    except GroqRateLimitError as ratelimitError:
        print(f"Error Groq 429: {ratelimitError}")

        try:
            response_text = await query_gemini_flash(messages_to_send)
            provider = "Gemini"

        except Exception as GeminiError:
            print(f"Error Gemini: {GeminiError}")
            raise HTTPException(status_code=503, detail="Both providers failed to generate a response.")

    except Exception as groq_error:
        raise HTTPException(
            status_code = 502,
            detail = f"Groq provider error: {str(groq_error)}"
        )

    await write_cached_response(
        context_hash=context_hash, 
        prompt=last_user_message, 
        response=response_text,
        embedding=query_embedding,
    )

    return JSONResponse(content={
        "response": response_text,
        "source": "Generated: "+ provider,
        "tokens_saved": False,
        "provider": provider,
        "web_search_used": web_search_used,
        "semantic_cache_hit": False,
        "similarity_score": None,
        "context_hash": context_hash,
    })