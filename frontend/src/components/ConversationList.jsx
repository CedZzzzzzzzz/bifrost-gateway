export function ConversationList({
  conversations = [],
  activeConversationId,
  onSelect,
  isVisible,
}) {
  if (!isVisible || conversations.length === 0) return null

  return (
    <div className="mt-2 space-y-1 overflow-y-auto max-h-64">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className="w-full px-3 py-2 rounded-lg text-left text-xs truncate transition-colors"
            style={{
              backgroundColor: isActive ? "var(--surface2)" : "transparent",
              color: isActive ? "var(--frost)" : "var(--muted2)",
            }}
          >
            {conversation.title || "New Chat"}
          </button>
        )
      })}
    </div>
  )
}
