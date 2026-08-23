import { useState, useEffect } from "react"
import { MessageSquare, Database, BarChart2, Plus, Zap } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || import.meta.env.VITE_API_BASE_URL

const BOTTOM_NAV = [
  { id: "Cache", icon: Database, label: "Cache" },
  { id: "Analytics", icon: BarChart2, label: "Analytics" },
]

export function Sidebar({ activeTab, onTabChange, onNewChat }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-out"
      style={{
        width: hovered ? "200px" : "56px",
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
        boxShadow: hovered ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-3 overflow-hidden shrink-0"
        style={{
          height: "56px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: "linear-gradient(135deg, var(--blue), var(--frost))",
            boxShadow: "0 0 12px rgba(86,200,232,0.3)",
          }}
        >
          <Zap size={14} color="#fff" />
        </div>
        <div
          className="flex flex-col overflow-hidden transition-all duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            width: hovered ? "130px" : "0px",
          }}
        >
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text2)" }}>
            Bifrost
          </span>
          <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>
            AI Gateway
          </span>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-2 pt-3 pb-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-all duration-200 overflow-hidden"
          style={{ color: "var(--muted2)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface2)"
            e.currentTarget.style.color = "var(--frost)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "var(--muted2)"
          }}
        >
          <Plus size={16} className="shrink-0" />
          <span
            className="text-xs whitespace-nowrap font-medium transition-all duration-300"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            New Chat
          </span>
        </button>
      </div>

      {/* Chat Nav */}
      <div className="flex-1 px-2 overflow-hidden">
        <NavItem
          id="Chat"
          icon={MessageSquare}
          label="Chat"
          isActive={activeTab === "Chat"}
          hovered={hovered}
          onClick={() => onTabChange("Chat")}
        />
      </div>

      {/* Bottom Nav */}
      <div
        className="flex flex-col gap-1 px-2 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {BOTTOM_NAV.map(({ id, icon, label }) => (
          <NavItem
            key={id}
            id={id}
            icon={icon}
            label={label}
            isActive={activeTab === id}
            hovered={hovered}
            onClick={() => onTabChange(id)}
          />
        ))}
      </div>
    </div>
  )
}

function NavItem({ id, icon: Icon, label, isActive, hovered, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-2 py-2 rounded-lg transition-all duration-200 overflow-hidden relative"
      style={{
        backgroundColor: isActive ? "var(--surface2)" : "transparent",
        color: isActive ? "var(--frost)" : "var(--muted2)",
        borderLeft: isActive
          ? "2px solid transparent"
          : "2px solid transparent"
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
          e.currentTarget.style.color = "var(--muted2)"
        }
      }}
    >
      <Icon size={16} className="shrink-0" />
      <span
        className="text-xs whitespace-nowrap font-medium transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {label}
      </span>
    </button>
  )
}