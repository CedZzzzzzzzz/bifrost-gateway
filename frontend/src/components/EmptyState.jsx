const EXAMPLE_PROMPTS = [
  "What is the latest news in the Philippines today?",
  "Who is the current president of the Philippines?",
  "Explain how binary search trees work",
  "What are the latest AI models released this month?",
]

export function EmptyState({ onPromptSelect, model }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-8">

      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight mb-2"
            style={{ color: "var(--text2)" }}
          >
            Hi, How can Bifrost Help?
          </h1>
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            Intelligent AI proxy with semantic caching and real-time web search.
          </p>
        </div>

        {model && (
          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: "var(--surface2)",
              border: "1px solid var(--border2)",
              color: "var(--frost)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {model}
          </span>
        )}
      </div>

      {/* Prompt cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptSelect(prompt)}
            className="px-4 py-3 rounded-xl text-left text-xs leading-relaxed transition-all duration-200"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--frost)"
              e.currentTarget.style.color = "var(--text)"
              e.currentTarget.style.backgroundColor = "var(--surface2)"
              e.currentTarget.style.boxShadow = "0 0 16px rgba(86,200,232,0.08)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.color = "var(--muted2)"
              e.currentTarget.style.backgroundColor = "var(--surface)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

    </div>
  )
}