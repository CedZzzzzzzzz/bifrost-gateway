import asyncio
from google.genai import types as genai_types

from app.core.config import GROQ_MODEL, GEMINI_MODEL
from app.services.groq_provider import get_groq_client
from app.services.gemini_provider import get_gemini_client

CLASSIFICATION_PROMPT = (
    "Does this question require current, real-time, or up-to-date information "
    "to answer accurately? Answer only 'yes' or 'no'.\n\n"
    "Question: {message}"
)


async def requires_web_search(user_message: str) -> bool:
    try:
        response = await get_groq_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": CLASSIFICATION_PROMPT.format(message=user_message)
            }],
            max_tokens=5,
        )
        answer = response.choices[0].message.content.strip().lower()
        return answer == "yes"
    except Exception:
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: get_gemini_client().models.generate_content(
                model=GEMINI_MODEL,
                contents=CLASSIFICATION_PROMPT.format(message=user_message),
                config=genai_types.GenerateContentConfig(max_output_tokens=5),
            ),
        )
        return response.text.strip().lower() == "yes"