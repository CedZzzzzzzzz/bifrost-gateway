import asyncio 

from google import genai

from app.core.config import GEMINI_API_KEY

GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"  

gemini_client: genai.Client | None = None

def get_gemini_client() -> genai.Client:
    global gemini_client
    if gemini_client is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY must be set.")
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return gemini_client

async def generate_embedding(text: str) -> list[float]:
    loop = asyncio.get_running_loop()

    response = await loop.run_in_executor(
        None,
        lambda: get_gemini_client().models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=text,
        ),
    )
    return response.embeddings[0].values