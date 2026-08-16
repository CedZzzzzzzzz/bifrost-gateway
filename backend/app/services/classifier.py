import asyncio
from google.genai import types as genai_types

from app.core.config import GROQ_MODEL, GEMINI_MODEL
from app.services.groq_provider import get_groq_client
from app.services.gemini_provider import get_gemini_client

CLASSIFICATION_PROMPT = (
    "Given this conversation, does the latest question require current, "
    "real-time, or up-to-date information to answer accurately?\n"
    "Consider these as ALWAYS needing current info:\n"
    "- Questions about living people (celebrities, athletes, politicians)\n"
    "- Questions about ongoing events, shows, movies, sports\n"
    "- Questions about prices, rankings, standings\n"
    "- Follow-up questions about any person or event mentioned earlier\n\n"
    "Answer only 'yes' or 'no'.\n\n"
    "Conversation:\n{conversation}"
)

async def requires_web_search(conversation: str) -> bool:
    try:
        response = await get_groq_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": CLASSIFICATION_PROMPT.format(conversation=conversation)
            }],
            max_tokens=5,
        )
        answer = response.choices[0].message.content.strip().lower()
        return answer.startswith("yes")
    except Exception:
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: get_gemini_client().models.generate_content(
                model=GEMINI_MODEL,
                contents=CLASSIFICATION_PROMPT.format(conversation=conversation),
                config=genai_types.GenerateContentConfig(max_output_tokens=5),
            ),
        )
        return response.text.strip().lower().startswith("yes")

async def generate_search_query(conversation: str, last_message: str) -> str:
    try:
        response = await get_groq_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": (
                    "Given this conversation and the latest question, "
                    "generate a short, specific web search query (max 10 words) "
                    "that would find the most relevant current information.\n\n"
                    f"Conversation:\n{conversation}\n\n"
                    f"Latest question: {last_message}\n\n"
                    "Search query:"
                )
            }],
            max_tokens=20,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return last_message
