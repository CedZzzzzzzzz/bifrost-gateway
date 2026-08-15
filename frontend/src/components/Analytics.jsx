import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL
const BIFROST_API_KEY = import.meta.env.VITE_BIFROST_API_KEY

const AUTH_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${BIFROST_API_KEY}`,
}

const COLORS = {
  cached: "#22c55e",
  semantic: "#a78bfa",
  live: "#6366f1",
}

export function Analytics() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadStats() {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics`, {
        headers: AUTH_HEADER,
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl text-center text-zinc-500 py-12">
        Loading analytics...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="w-full max-w-4xl text-center text-zinc-500 py-12">
        Failed to load analytics.
      </div>
    )
  }

  const embeddingCoverage = stats.total_entries > 0
    ? Math.round((stats.entries_with_embeddings / stats.total_entries) * 100)
    : 0

  const chartData = [
    { name: "Exact Cache", value: stats.total_entries - stats.entries_with_embeddings },
    { name: "Semantic Cache", value: stats.entries_with_embeddings },
  ]

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Analytics</h2>
        <button
          onClick={loadStats}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-xs">Total Cached Entries</span>
          <span className="text-3xl font-bold text-white">{stats.total_entries}</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-xs">Semantic Coverage</span>
          <span className="text-3xl font-bold text-green-400">{embeddingCoverage}%</span>
          <span className="text-zinc-600 text-xs">
            {stats.entries_with_embeddings} of {stats.total_entries} entries have embeddings
          </span>
        </div>
      </div>

      {/* Chart */}
      {stats.total_entries > 0 && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-zinc-400 text-xs mb-4">Cache Entry Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={COLORS.cached} />
                <Cell fill={COLORS.semantic} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#f4f4f5",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#a1a1aa", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}