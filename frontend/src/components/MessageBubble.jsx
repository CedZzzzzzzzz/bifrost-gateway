import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      style={{ color: "var(--muted)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg overflow-hidden my-3" style={{ backgroundColor: "#0d1117" }}>
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{
          backgroundColor: "#161b22",
          borderBottom: "1px solid var(--border)",
          color: "var(--muted)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "16px",
          background: "transparent",
          fontSize: "13px",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export function MessageBubble({ message, isLast, response }) {
  const isUser = message.role === "user"
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex flex-col items-end gap-1 max-w-lg">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{
              backgroundColor: "var(--blue)",
              color: "var(--text)",
            }}
          >
            {message.content}
          </div>
          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
            {timestamp}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col mb-4">
      <div
        className="px-5 py-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
      >
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <CodeBlock language={match[1]}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              ) : (
                <code
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: "var(--border)",
                    color: "var(--frost)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  {...props}
                >
                  {children}
                </code>
              )
            },
            p({ children }) {
              return <p className="mb-3 last:mb-0">{children}</p>
            },
            ul({ children }) {
              return <ul className="mb-3 pl-4 space-y-1 list-disc">{children}</ul>
            },
            ol({ children }) {
              return <ol className="mb-3 pl-4 space-y-1 list-decimal">{children}</ol>
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Footer — timestamp + copy + metadata badge */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
          {timestamp}
        </span>
        <div className="flex items-center gap-2">
          {isLast && response && <InlineBadge response={response} />}
          <CopyButton text={message.content} />
        </div>
      </div>
    </div>
  )
}

function InlineBadge({ response }) {
  const [expanded, setExpanded] = useState(false)

  const badgeColor = response.semantic_cache_hit
    ? "var(--violet)"
    : response.tokens_saved
    ? "var(--emerald)"
    : response.web_search_used
    ? "var(--amber)"
    : "var(--blue)"

  const badgeLabel = response.semantic_cache_hit
    ? `Semantic ${(response.similarity_score * 100).toFixed(0)}%`
    : response.tokens_saved
    ? "Cache Hit"
    : response.web_search_used
    ? "Web Search"
    : response.provider || "Live"

  return (
    <div className="flex items-center gap-2">
      <span
        className="px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer"
        style={{
          backgroundColor: `${badgeColor}20`,
          color: badgeColor,
          border: `1px solid ${badgeColor}40`,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {badgeLabel}
      </span>

      {expanded && (
        <span
          className="text-xs"
          style={{
            color: "var(--muted)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {response.context_hash?.slice(0, 16)}...
        </span>
      )}
    </div>
  )
}