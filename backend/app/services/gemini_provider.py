import asyncio

from google import genai
from google.genai import types as genai_types

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.schemas.chat import ConversationMessage


gemini_client: genai.Client | None = None

def get_gemini_client() -> genai.Client:
    global gemini_client
    if gemini_client is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY must be set in environment variables.")
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return gemini_client

async def query_gemini_flash(messages: list[ConversationMessage]) -> str:
    combined_prompt = "\n".join(f"[{m.role.upper()}] {m.content}" for m in messages)

    loop = asyncio.get_running_loop()

    response = await loop.run_in_executor(
        None,
        lambda: get_gemini_client().responses.create(
            model=GEMINI_MODEL,
            contents=combined_prompt,
            config=genai_types.GenerationConfig(
                temperature=0.2,
            ),
        ),
    )
    return response.text
