import { useState, useEffect } from "react"
import { SideBar } from "./components/SideBar"
import { ChatArea } from "./components/ChatArea"
import { ChatBox } from "./components/ChatBox"
import { CacheTable } from "./components/CacheTable"
import { Analytics } from "./components/Analytics"
import { useChat } from "./hooks/useChat"
import { useConversation } from "./hooks/useConversation"

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL

export default function App() {
  const [activeTab, setActiveTab] = useState("Chat")
  const [model, setModel] = useState(null)
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversationById,
    loadConversationMessages,
    updateConversationTitle,
  } = useConversation()
  const { messages, response, isLoading, error, submitMessage, clearChat, loadMessages } = useChat(
    activeConversationId
  )

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversationId, conversations, setActiveConversationId])

  useEffect(() => {
    if (!activeConversationId) {
      loadMessages([])
      return
    }

    loadConversationMessages(activeConversationId).then(loadMessages)
  }, [activeConversationId])

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`${API_BASE_URL}/health`)
        const data = await res.json()
        setModel(data.groq_model)
      } catch {
        setModel("Gemini")
      }
    }
    fetchHealth()
  }, [])

  async function handleNewChat() {
    const conversationId = await createNewConversation()
    if (conversationId) {
      clearChat()
      setActiveTab("Chat")
    }
  }

  async function handleConversationDelete(conversationId) {
    await deleteConversationById(conversationId)
    if (conversationId === activeConversationId) {
      setActiveConversationId(null)
      clearChat()
    }
  }

  async function handleConversationRename(conversationId, title) {
    await updateConversationTitle(conversationId, title)
  }

  function handleConversationSelect(conversationId) {
    setActiveConversationId(conversationId)
    setActiveTab("Chat")
  }

  async function handleSubmit(userInput) {
    const activeConversation = conversations.find(
      (conversation) => conversation.id === activeConversationId
    )
    const isUntitled = messages.length === 0 && activeConversation?.title === "New Chat"

    if (isUntitled) {
      const title = userInput.trim().replace(/\s+/g, " ")
      await updateConversationTitle(
        activeConversationId,
        title.length > 40 ? `${title.slice(0, 40).trimEnd()}...` : title
      )
    }

    await submitMessage(userInput)
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <SideBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
        onConversationDelete={handleConversationDelete}
        onConversationRename={handleConversationRename}
      />

      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{
            height: "56px",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: "var(--text2)" }}>
              {activeTab === "Chat" ? "Chat"
                : activeTab === "Cache" ? "Cache Browser"
                : "Analytics"}
            </span>

            {activeTab === "Chat" && model && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
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

        {/* Chat */}
        {activeTab === "Chat" && (
          <>
            <ChatArea
              messages={messages}
              response={response}
              isLoading={isLoading}
              onPromptSelect={handleSubmit}
              model={model}
            />

            {error && (
              <div
                className="mx-6 mb-2 px-4 py-3 rounded-xl text-xs"
                style={{
                  backgroundColor: "#0f0a0a",
                  border: "1px solid var(--rose)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <ChatBox onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        )}

        {activeTab === "Cache" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CacheTable />
          </div>
        )}

        {activeTab === "Analytics" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Analytics />
          </div>
        )}
      </div>
    </div>
  )
}
