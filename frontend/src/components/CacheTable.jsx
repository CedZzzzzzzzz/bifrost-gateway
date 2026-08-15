import { useState, useEffect } from "react"

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
        {
          headers: AUTH_HEADER,
        }
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

  useEffect(() => {
    loadEntries(page)
  }, [page])

  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Cache Entries</h2>
        <button
          onClick={clearAll}
          disabled={isClearing}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClearing ? "Clearing..." : "Clear All"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              <th className="px-4 py-3 w-1/2">Prompt</th>
              <th className="px-4 py-3">Hash</th>
              <th className="px-4 py-3">Embedding</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No cache entries yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.context_hash} className="bg-zinc-900 hover:bg-zinc-800 transition-colors">
                  <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">
                    {entry.prompt}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 font-mono">
                    {entry.context_hash.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3">
                    {entry.has_embedding ? (
                      <span className="text-green-400">✓ Yes</span>
                    ) : (
                      <span className="text-zinc-600">— No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteEntry(entry.context_hash)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < 10}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

    </div>
  )
}