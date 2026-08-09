from pydantic import BaseModel, Field

class ConversationMessage(BaseModel):
    role: str = Field(..., examples = ["user", "assistant", "system"])
    content: str

class ChatRequest(BaseModel): # Accept OpenAI/Claude payloads from cursor, claude code, and codex
    messages: list[ConversationMessage]
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    stream: bool = False


class ChatGatewayResponse(BaseModel):
    reponse: str
    source: str
    tokens_saved: int
    provider: str | None
    context_hash: str

