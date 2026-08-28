import { useState, useRef, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ChatBox({ onSubmit, isLoading }) {
  const [input, setInput] = useState("")
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  function handleSubmit() {
    if (!input.trim() || isLoading) return
    onSubmit(input.trim())
    setInput("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className="px-6 py-4"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div
        className="max-w-3xl mx-auto flex items-end gap-3 px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
          className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
          style={{
            color: "var(--text)",
            caretColor: "var(--frost)",
            maxHeight: "160px",
            fontFamily: "Inter, sans-serif",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all"
          style={{
            backgroundColor:
              isLoading || !input.trim() ? "var(--border)" : "var(--blue)",
            color:
              isLoading || !input.trim() ? "var(--muted)" : "var(--text)",
            cursor:
              isLoading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          <ArrowUp size={16} />
        </button>
      </div>

      <p
        className="text-center text-xs mt-2"
        style={{ color: "var(--muted)" }}
      >
        Bifrost may return cached responses. Always verify critical information.
      </p>
    </div>
  )
}