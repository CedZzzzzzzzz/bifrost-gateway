import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { EmptyState } from "./EmptyState"

export function ChatArea({ messages, response, isLoading, onPromptSelect, model }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState onPromptSelect={onPromptSelect} model={model}/>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto flex flex-col">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1
          return (
            <MessageBubble
              key={index}
              message={message}
              isLast={isLast && message.role === "assistant"}
              response={isLast && message.role === "assistant" ? response : null}
            />
          )
        })}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}