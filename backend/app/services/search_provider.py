import httpx

from app.core.config import TAVILY_API_KEY
from app.services.classifier import requires_web_search

TAVILY_API_URL = "https://api.tavily.com/search"


async def web_search(conversation: str) -> bool:
    return await requires_web_search(conversation)

async def fetch_search_context(query: str) -> str:
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "topic": "news",
        "max_results": 5,
        "include_answer": True,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(TAVILY_API_URL, json=payload, timeout=10)
        data = response.json()

    results = data.get("results", [])
    tavily_answer = data.get("answer", "")

    if not results and not tavily_answer:
        return "No relevant information found."

    context_lines = []

    if tavily_answer:
        context_lines.append(f"Summary: {tavily_answer}")

    for result in results:
        context_lines.append(
            f"Source: {result.get('url', '')}\n{result.get('content', '')}"
        )

    return "\n\n".join(context_lines)
