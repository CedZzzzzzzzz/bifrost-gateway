import { useEffect } from "react"

export function ConfirmModal({ isOpen, title, message, onCancel, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event) {
      if (event.key === "Escape") onCancel()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onMouseDown={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-sm rounded-xl p-5 shadow-2xl"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border2)",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-sm font-semibold" style={{ color: "var(--text2)" }}>
          {title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted2)" }}>
          {message}
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ color: "var(--muted2)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ backgroundColor: "var(--rose)", color: "white" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
