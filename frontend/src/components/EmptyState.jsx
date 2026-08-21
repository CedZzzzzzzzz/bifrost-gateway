const EXAMPLE_PROMPTS = [
  "What is the latest news in the Philippines today?",
  "Who is the current president of the Philippines?",
  "Explain how binary search trees work",
  "What are the latest AI models released this month?",
]

export function EmptyState({ onPromptSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">

      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="text-3xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          How can Bifrost help?
        </div>
        <p className="text-sm max-w-sm" style={{ color: "var(--muted)" }}>
          Intelligent AI proxy with semantic caching and real-time web search.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptSelect(prompt)}
            className="px-4 py-3 rounded-xl text-left text-sm transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--blue)"
              e.currentTarget.style.color = "var(--text)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.color = "var(--muted)"
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

    </div>
  )
}