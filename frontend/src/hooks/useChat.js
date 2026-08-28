import { useState } from "react"
import { sendChatMessage } from "../api/gateway"

export function useChat(conversationId) {
  const [messages, setMessages] = useState([])
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submitMessage(userInput) {
    const updatedMessages = [
      ...messages,
      { role: "user", content: userInput },
    ]

    setMessages(updatedMessages)
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await sendChatMessage(updatedMessages, conversationId)
      setResponse(result)
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: result.response },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function clearChat() {
    setMessages([])
    setResponse(null)
    setError(null)
  }

  function loadMessages(historicalMessages) {
    setMessages(historicalMessages) 
    setResponse(null)
    setError(null)
  }

  return {
    messages,
    response,
    isLoading,
    error,
    submitMessage,
    clearChat,
    loadMessages,
  }
}