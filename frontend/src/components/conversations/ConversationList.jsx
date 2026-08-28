import { useEffect, useState } from "react"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { ConfirmModal } from "../ui/ConfirmModal"

function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect, 
  onDelete, 
  onRename }) 
  {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(conversation.title || "New Chat")

  useEffect(() => {
    setValue(conversation.title || "New Chat")
  }, [conversation.title])

  function save() {
    if (value.trim()) onRename(conversation.id, value.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface2)]">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" ? save() : e.key === "Escape" && setEditing(false)}
          className="flex-1 bg-transparent text-xs outline-none min-w-0 text-[var(--text)]"
        />
        <button onClick={save} className="p-1 text-[var(--emerald)]"><Check size={12} /></button>
        <button onClick={() => setEditing(false)} className="p-1 text-[var(--muted)]"><X size={12} /></button>
      </div>
    )
  }

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group/item flex items-center px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
        isActive ? "bg-[var(--surface2)] text-[var(--frost)]" : "text-[var(--muted2)] hover:bg-[var(--surface)]"
      }`}
    >
      <span className="flex-1 truncate">{conversation.title || "New Chat"}</span>
      <div className="hidden group-hover/item:flex gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true) }}
          className="p-1 text-[var(--muted)] hover:text-[var(--frost)]"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(conversation)
          }}
          className="p-1 text-[var(--muted)] hover:text-[var(--rose)]"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

export function ConversationList({ conversations = [], activeConversationId, onSelect, onDelete, onRename, isVisible }) {
  const [conversationToDelete, setConversationToDelete] = useState(null)

  return (
    <>
      {isVisible && conversations.length > 0 && (
        <div className="mt-2 space-y-1 overflow-y-auto max-h-64">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={onSelect}
              onDelete={setConversationToDelete}
              onRename={onRename}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={conversationToDelete !== null}
        title="Delete conversation?"
        message={`This will permanently delete "${conversationToDelete?.title || "New Chat"}".`}
        onCancel={() => setConversationToDelete(null)}
        onConfirm={() => {
          onDelete(conversationToDelete.id)
          setConversationToDelete(null)
        }}
      />
    </>
  )
}
