import httpx

from app.core.config import TAVILY_API_KEY

TAVILY_API_URL = "https://api.tavily.com/search"

CURRENT_INFO_KEYWORDS = [
    "current", "latest", "today", "now", "recent",
    "2024", "2025", "2026", "who is", "price",
    "news", "update", "right now", "happening",
    "score", "weather", "stock", "election",
    "info about", "tell me about", "what is happening",
    "pax silica", "any info", "give me info",
]

def web_search(user_message: str) -> bool:
    message_lower = user_message.lower()
    return any(keyword in message_lower for keyword in CURRENT_INFO_KEYWORDS)

async def fetch_search_context(query: str) -> str:
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "max_results": 3,
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