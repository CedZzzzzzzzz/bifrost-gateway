const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const LOCAL_API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL
const BIFROST_API_KEY = import.meta.env.VITE_BIFROST_API_KEY

const AUTH_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${BIFROST_API_KEY}`,
}

const BASE_URL = LOCAL_API_BASE_URL || API_BASE_URL

export async function sendChatMessage(messages) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: AUTH_HEADER,
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Request failed")
    }

    return response.json();
  } catch {
    const response = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: AUTH_HEADER,
      body: JSON.stringify({ messages }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Request failed")
    }
    return response.json();
  }
}