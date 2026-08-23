from groq import AsyncGroq

from app.core.config import GROQ_API_KEY, GROQ_MODEL


groq_client: AsyncGroq | None = None

def get_groq_model_options() -> dict:
    if GROQ_MODEL and GROQ_MODEL.startswith("openai/gpt-oss-"):
        return {
            "reasoning_effort": "low",
            "include_reasoning": False,
        }
    return {}

def get_groq_client() -> AsyncGroq:
    global groq_client
    if groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY must be set in environment variables.")
        groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return groq_client

async def query_groq_llama(messages: list[dict]) -> str:
    chat_completion = await get_groq_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        **get_groq_model_options(),
    )
    return chat_completion.choices[0].message.content
