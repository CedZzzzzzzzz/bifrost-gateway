export function TypingIndicator() {
  return (
    <div className="flex mb-4">
      <div
        className="px-5 py-4 rounded-2xl rounded-tl-sm"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: "var(--muted)",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}