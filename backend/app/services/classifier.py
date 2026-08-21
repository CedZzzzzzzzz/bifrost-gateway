import asyncio
from datetime import datetime
from google.genai import types as genai_types

from app.core.config import GROQ_MODEL, GEMINI_MODEL
from app.services.groq_provider import get_groq_client, get_groq_model_options
from app.services.gemini_provider import get_gemini_client

CLASSIFICATION_PROMPT = (
    "Today's date is {current_date}. "
    "Given this conversation, does the latest question require current, "
    "real-time, or up-to-date information to answer accurately?\n\n"
    "Answer 'yes' for ANY of these:\n"
    "- Questions about living people (celebrities, athletes, politicians, coaches)\n"
    "- Questions about sports teams, rosters, standings, scores\n"
    "- Questions about ongoing events, shows, movies, sports seasons\n"
    "- Questions about prices, rankings, markets\n"
    "- Questions using words like 'latest', 'current', 'now', 'recent', 'today'\n"
    "- Questions about who holds a position or role right now\n"
    "- Follow-up questions about any person or event mentioned earlier\n"
    "- ANY question where the answer could have changed in the last 2 years\n\n"
    "When in doubt, answer 'yes'.\n"
    "Answer only 'yes' or 'no'.\n\n"
    "Conversation:\n{conversation}"
)

CURRENT_DATE = datetime.now().strftime("%B %d, %Y")

async def requires_web_search(conversation: str) -> bool:
    current_date = datetime.now().strftime("%B %d, %Y")
    try:
        response = await get_groq_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": CLASSIFICATION_PROMPT.format(
                    current_date=current_date,
                    conversation=conversation
                )
            }],
            max_completion_tokens=64,
            temperature=0,
            **get_groq_model_options(),
        )
        answer = response.choices[0].message.content.strip().lower()
        return answer.startswith("yes")
    except Exception:
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: get_gemini_client().models.generate_content(
                model=GEMINI_MODEL,
                contents=CLASSIFICATION_PROMPT.format(
                    current_date=current_date,
                    conversation=conversation
                ),
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
                    "that would find the most relevant current information. "
                    f"Today's date is {CURRENT_DATE}. Include the year in the query.\n\n"
                    f"Conversation:\n{conversation}\n\n"
                    f"Latest question: {last_message}\n\n"
                    "Search query:"
                )
            }],
            max_completion_tokens=64,
            temperature=0,
            **get_groq_model_options(),
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return last_message
