import {useState, useEffect} from 'react';

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const BIFROST_API_KEY = import.meta.env.VITE_BIFROST_API_KEY;

const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BIFROST_API_KEY}`,
}

export function useConversation() {
    const [conversations, setConversations] = useState([])
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    async function loadConversations() {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
                headers: AUTH_HEADERS
            });
            const data = await response.json();
            setConversations(data.conversations);
        } catch (error) {
            console.error('Error loading conversation:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function createNewConversation() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
                method: 'POST',
                headers: AUTH_HEADERS,
            });

            const data = await response.json()
            const conversation = data.conversation
            setConversations((prev) => [conversation, ...prev])
            setActiveConversationId(conversation.id)
            return conversation.id
        } catch (error) {
            console.error('Error creating new conversation:', error)
            return null
        }
    }

    async function deleteConversationById(conversationId) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}`, {
        method: "DELETE",
        headers: AUTH_HEADERS,
      })
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (activeConversationId === conversationId) {
        setActiveConversationId(null)
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  async function loadConversationMessages(conversationId) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/conversations/${conversationId}`,
        { headers: AUTH_HEADERS }
      )
      const data = await res.json()
      return data.messages
    } catch (error) {
      console.error("Failed to load conversation messages:", error)
      return []
    }
  }

  async function updateConversationTitle(conversationId, title) {
    try {
      const params = new URLSearchParams({ title })
      const response = await fetch(
        `${API_BASE_URL}/api/v1/conversations/${conversationId}?${params}`,
        { method: "PATCH", headers: AUTH_HEADERS }
      )
      const data = await response.json()
      const conversation = data.conversation

      setConversations((prev) => prev.map((item) => (
        item.id === conversationId ? conversation : item
      )))
    } catch (error) {
      console.error("Failed to update conversation title:", error)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    createNewConversation,
    deleteConversationById,
    loadConversationMessages,
    updateConversationTitle,
    refreshConversations: loadConversations,
  }
}
