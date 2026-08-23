import { useState, useEffect } from "react"
import { Trash2, RefreshCw, Database } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL
const BIFROST_API_KEY = import.meta.env.VITE_BIFROST_API_KEY
const AUTH_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${BIFROST_API_KEY}`,
}

export function CacheTable() {
  const [entries, setEntries] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  async function loadEntries(currentPage = 1) {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/cache?page=${currentPage}&page_size=10`,
        { headers: AUTH_HEADER }
      )
      const data = await response.json()
      setEntries(data.entries)
    } catch (error) {
      console.error("Failed to load cache entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteEntry(contextHash) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/cache/${contextHash}`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      })
      loadEntries(page)
    } catch (error) {
      console.error("Failed to delete entry:", error)
    }
  }

  async function clearAll() {
    if (!confirm("Clear all cache entries? This cannot be undone.")) return
    setIsClearing(true)
    try {
      await fetch(`${API_BASE_URL}/api/v1/cache`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      })
      setPage(1)
      loadEntries(1)
    } catch (error) {
      console.error("Failed to clear cache:", error)
    } finally {
      setIsClearing(false)
    }
  }

  useEffect(() => { loadEntries(page) }, [page])

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--frost))",
              boxShadow: "0 0 12px rgba(86,200,232,0.2)",
            }}
          >
            <Database size={14} color="#fff" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text2)" }}>
              Cache Browser
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {entries.length} entries on this page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadEntries(page)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--frost)"
              e.currentTarget.style.color = "var(--frost)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.color = "var(--muted2)"
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>

          <button
            onClick={clearAll}
            disabled={isClearing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: "rgba(232, 85, 85, 0.1)",
              border: "1px solid rgba(232, 85, 85, 0.2)",
              color: "var(--rose)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(232, 85, 85, 0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(232, 85, 85, 0.1)"
            }}
          >
            <Trash2 size={12} />
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="glass-card rounded-2xl overflow-hidden"
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(86,200,232,0.08)" }}>
              {["Prompt", "Hash", "Embedding", "Created", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-medium"
                  style={{ color: "var(--muted)", letterSpacing: "0.05em" }}
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--muted)" }}>
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--muted)" }}>
                  No cache entries yet. Start a conversation to populate the cache.
                </td>
              </tr>
            ) : (
              entries.map((entry, i) => (
                <tr
                  key={entry.context_hash}
                  style={{
                    borderBottom: i < entries.length - 1 ? "1px solid rgba(86,200,232,0.05)" : "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(86,200,232,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-3" style={{ color: "var(--text)", maxWidth: "240px" }}>
                    <span className="block truncate">{entry.prompt}</span>
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
                    {entry.context_hash.slice(0, 10)}...
                  </td>
                  <td className="px-5 py-3">
                    {entry.has_embedding ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: "rgba(15,168,122,0.12)",
                          color: "var(--emerald)",
                          border: "1px solid rgba(15,168,122,0.2)",
                        }}
                      >
                        Yes
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteEntry(entry.context_hash)}
                      className="transition-colors"
                      style={{ color: "var(--muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rose)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--muted2)",
          }}
        >
          Previous
        </button>
        <span style={{ fontFamily: "JetBrains Mono, monospace" }}>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < 10}
          className="px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--muted2)",
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}