const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function sendChatMessage(messages) {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Request failed")
  }

  return response.json()
}