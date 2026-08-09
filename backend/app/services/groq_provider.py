from groq import AsyncGroq

from app.core.config import GROQ_API_KEY, GROQ_MODEL
from app.schemas.chat import ConversationMessage


groq_client: AsyncGroq | None = None

def get_groq_client() -> AsyncGroq:
    global groq_client
    if groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY must be set in environment variables.")
        groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return groq_client

async def query_groq_llama(messages: list[ConversationMessage]) -> str:
    chat_completion = await get_groq_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": m.role, "content": m.content} for m in messages],
    )
    return chat_completion.choices[0].message.content