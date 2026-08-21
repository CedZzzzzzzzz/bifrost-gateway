import { useState } from "react"
import { Sidebar } from "./components/Sidebar"
import { ChatArea } from "./components/ChatArea"
import { ChatBox } from "./components/ChatBox"
import { CacheTable } from "./components/CacheTable"
import { Analytics } from "./components/Analytics"
import { useChat } from "./hooks/useChat"

export default function App() {
  const [activeTab, setActiveTab] = useState("Chat")
  const { messages, response, isLoading, error, submitMessage, clearChat } = useChat()

  function handleNewChat() {
    clearChat()
    setActiveTab("Chat")
  }

  function handlePromptSelect(prompt) {
    submitMessage(prompt)
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChat={handleNewChat}
      />

      {/* Main content — offset by sidebar width */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              {activeTab === "Chat"
                ? "Chat"
                : activeTab === "Cache"
                ? "Cache Browser"
                : "Analytics"}
            </span>

            {activeTab === "Chat" && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                gpt-oss-120b
              </span>
            )}
          </div>

          {activeTab === "Chat" && messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Chat Tab */}
        {activeTab === "Chat" && (
          <>
            <ChatArea
              messages={messages}
              response={response}
              isLoading={isLoading}
              onPromptSelect={handlePromptSelect}
            />

            {error && (
              <div
                className="mx-6 mb-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "#1a0a0a",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <ChatBox onSubmit={submitMessage} isLoading={isLoading} />
          </>
        )}

        {/* Cache Tab */}
        {activeTab === "Cache" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CacheTable />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "Analytics" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Analytics />
          </div>
        )}

      </div>
    </div>
  )
}