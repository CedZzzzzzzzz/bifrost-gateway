import hashlib
import json

from app.schemas.chat import ConversationMessage

def compute_context_hash(messages: list[ConversationMessage]) -> str:
    serialized = json.dumps(
        [m.model_dump() for m in messages],
        sort_keys=True,
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def flatten_messages_text(messages: list[ConversationMessage]) -> str:
    return "\n".join(f"[{m.role.upper()}] {m.content}" for m in messages)