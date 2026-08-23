import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { BarChart2, RefreshCw } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL
const BIFROST_API_KEY = import.meta.env.VITE_BIFROST_API_KEY
const AUTH_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${BIFROST_API_KEY}`,
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

  useEffect(() => { loadStats() }, [])

  const embeddingCoverage = stats?.total_entries > 0
    ? Math.round((stats.entries_with_embeddings / stats.total_entries) * 100)
    : 0

  const chartData = stats ? [
    { name: "Exact Cache", value: stats.total_entries - stats.entries_with_embeddings },
    { name: "Semantic Cache", value: stats.entries_with_embeddings },
  ] : []

  const CHART_COLORS = ["#2d7dd2", "#7c6af5"]

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--violet), var(--frost))",
              boxShadow: "0 0 12px rgba(124,106,245,0.2)",
            }}
          >
            <BarChart2 size={14} color="#fff" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text2)" }}>
              Analytics
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Cache performance overview
            </p>
          </div>
        </div>

        <button
          onClick={loadStats}
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
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          Loading analytics...
        </div>
      ) : !stats ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          Failed to load analytics.
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="glass-card rounded-2xl p-5 flex flex-col gap-2"
            >
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Total Cached
              </span>
              <span className="text-4xl font-bold" style={{ color: "var(--text2)" }}>
                {stats.total_entries}
              </span>
              <span className="text-xs" style={{ color: "var(--muted2)" }}>
                entries in Supabase
              </span>
            </div>

            <div
              className="glass-card rounded-2xl p-5 flex flex-col gap-2"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(86,200,232,0.06), 0 0 20px rgba(15,168,122,0.06)",
              }}
            >
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Semantic Coverage
              </span>
              <span className="text-4xl font-bold" style={{ color: "var(--emerald)" }}>
                {embeddingCoverage}%
              </span>
              <span className="text-xs" style={{ color: "var(--muted2)" }}>
                {stats.entries_with_embeddings} of {stats.total_entries} have embeddings
              </span>
            </div>
          </div>

          {/* Chart */}
          {stats.total_entries > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3
                className="text-xs font-medium uppercase tracking-widest mb-6"
                style={{ color: "var(--muted)" }}
              >
                Cache Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i]}
                        opacity={0.9}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface2)",
                      border: "1px solid var(--border2)",
                      borderRadius: "12px",
                      color: "var(--text)",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "var(--muted2)", fontSize: "12px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
