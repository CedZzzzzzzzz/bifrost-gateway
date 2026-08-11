import { ChatBox } from "./components/ChatBox"
import { ResponseCard } from "./components/ResponseCard"
import { useChat } from "./hooks/useChat"

function App() {
  const { messages, response, isLoading, error, submitMessage, clearChat } = useChat()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-10">

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Bifrost Gateway</h1>
          <p className="text-zinc-500 text-sm">AI Proxy & Token Optimization Middleware</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear chat
        </button>
      </div>

      {/* Message History */}
      {messages.length > 0 && (
        <div className="w-full max-w-2xl flex flex-col gap-3 mb-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-lg text-sm ${
                message.role === "user"
                  ? "bg-indigo-600 text-white self-end max-w-lg ml-auto"
                  : "bg-zinc-800 text-zinc-100 self-start max-w-lg"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}

      {/* Response Metadata */}
      {response && (
        <div className="w-full max-w-2xl mb-6">
          <ResponseCard response={response} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl mb-4 px-4 py-3 rounded-lg bg-red-950 border border-red-500 text-red-400 text-sm">
          ❗ {error}
        </div>
      )}

      {/* Chat Input */}
      <div className="w-full max-w-2xl">
        <ChatBox onSubmit={submitMessage} isLoading={isLoading} />
      </div>

    </div>
  )
}

export default App