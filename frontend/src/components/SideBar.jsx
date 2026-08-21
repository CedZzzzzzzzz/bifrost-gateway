import { MessageSquare, Database, BarChart2, Plus } from "lucide-react"

const NAV_ITEMS = [
  { id: "Chat", icon: MessageSquare, label: "Chat" },
]

const BOTTOM_NAV_ITEMS = [
  { id: "Cache", icon: Database, label: "Cache" },
  { id: "Analytics", icon: BarChart2, label: "Analytics" },
]

export function Sidebar({ activeTab, onTabChange, onNewChat }) {
  return (
    <div
      className="group fixed left-0 top-0 h-full z-50 flex flex-col"
      style={{
        width: "56px",
        transition: "width 200ms ease",
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.width = "200px")}
      onMouseLeave={(e) => (e.currentTarget.style.width = "56px")}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-3 py-4 overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)", minHeight: "56px" }}
      >
        <span
          className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: "var(--text)" }}
        >
          Bifrost Gateway
        </span>
      </div>

      {/* New Chat Button */}
      <div className="px-2 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg overflow-hidden transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface)"
            e.currentTarget.style.color = "var(--text)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "var(--muted)"
          }}
        >
          <Plus size={18} className="shrink-0" />
          <span className="text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            New Chat
          </span>
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 flex flex-col gap-1 px-2 py-2 overflow-hidden">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-lg overflow-hidden transition-colors relative"
              style={{
                backgroundColor: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--frost)" : "var(--muted)",
                borderLeft: isActive ? "2px solid var(--blue)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--surface)"
                  e.currentTarget.style.color = "var(--text)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "var(--muted)"
                }
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bottom Nav */}
      <div
        className="flex flex-col gap-1 px-2 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {BOTTOM_NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-lg overflow-hidden transition-colors"
              style={{
                backgroundColor: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--frost)" : "var(--muted)",
                borderLeft: isActive ? "2px solid var(--blue)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--surface)"
                  e.currentTarget.style.color = "var(--text)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "var(--muted)"
                }
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}