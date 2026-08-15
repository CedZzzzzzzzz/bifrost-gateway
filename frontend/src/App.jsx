import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Analytics } from "./components/Analytics"
import { CacheTable } from "./components/CacheTable"
import { ChatBox } from "./components/ChatBox"
import { ResponseCard } from "./components/ResponseCard"
import { useChat } from "./hooks/useChat"

const TABS = ["Chat", "Cache", "Analytics"]

function App() {
  const [activeTab, setActiveTab] = useState("Chat")
  const { messages, response, isLoading, error, submitMessage, clearChat } = useChat()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-10">

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bifrost Gateway</h1>
          <p className="text-zinc-500 text-sm">AI Proxy & Token Optimization Middleware</p>
        </div>
        {activeTab === "Chat" && (
          <button
            onClick={clearChat}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="w-full max-w-4xl flex gap-1 mb-8 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === "Chat" && (
        <>
          {messages.length > 0 && (
            <div className="w-full max-w-4xl flex flex-col gap-3 mb-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white self-end max-w-lg ml-auto"
                      : "bg-zinc-800 text-zinc-100 self-start w-full prose prose-invert prose-sm max-w-none"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <div className="flex flex-col gap-3">
                      {index === messages.length - 1 && response && (
                        <ResponseCard response={response} />
                      )}
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-zinc-700 px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="w-full max-w-4xl mb-4 px-4 py-3 rounded-lg bg-red-950 border border-red-500 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="w-full max-w-4xl">
            <ChatBox onSubmit={submitMessage} isLoading={isLoading} />
          </div>
        </>
      )}

      {/* Cache Tab */}
      {activeTab === "Cache" && <CacheTable />}

      {/* Analytics Tab */}
      {activeTab === "Analytics" && <Analytics />}

    </div>
  )
}

export default App