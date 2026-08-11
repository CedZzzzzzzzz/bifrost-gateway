import { useState } from "react"

export function ChatBox({ onSubmit, isLoading }) {
  const [input, setInput] = useState("")

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
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-500"
        rows={4}
        placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />

      <button
        className={`self-end px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isLoading || !input.trim()
            ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
        }`}
        onClick={handleSubmit}
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? "Thinking..." : "Send"}
      </button>
    </div>
  )
}