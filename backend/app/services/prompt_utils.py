import hashlib
import json

from app.schemas.chat import ConversationMessage

def compute_context_hash(messages: list[ConversationMessage]) -> str:
    last_user_message = next(
        (m for m in reversed(messages) if m.role == "user"),
        messages[-1],
    )
    serialized = json.dumps(last_user_message.model_dump(), sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def flatten_messages_text(messages: list[ConversationMessage]) -> str:
    return "\n".join(
        f"[{m['role'].upper()}] {m['content']}" for m in messages
    )