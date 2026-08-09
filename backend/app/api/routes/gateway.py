from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from groq import RateLimitError as GroqRateLimitError

from app.db.cache import read_cached_response, write_cached_response
from app.schemas.chat import ChatRequest
from app.services.gemini_provider import query_gemini_flash
from app.services.groq_provider import query_groq_llama
from app.services.prompt_utils import compute_context_hash, flatten_messages_text

router = APIRouter()

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
            "context_hash": context_hash,
        })


    response_text: str
    provider: str

    try:
        response_text = await query_groq_llama(request.messages)
        provider = "Groq"

    except GroqRateLimitError as ratelimitError:
        print(f"Error Groq 429: {ratelimitError}")

        try:
            response_text = await query_gemini_flash(request.messages)
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
        prompt=flatten_messages_text(request.messages), 
        response=response_text,
    )

    return JSONResponse(content={
        "response": response_text,
        "source": "Generated",
        "tokens_saved": False,
        "provider": provider,
        "context_hash": context_hash,
    })