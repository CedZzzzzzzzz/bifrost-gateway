import { MetaBadge } from "./MetaBadge"

export function ResponseCard({ response }) {
  if (!response) return null

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
      
      <MetaBadge
        source={response.source}
        provider={response.provider}
        tokensSaved={response.tokens_saved}
        contextHash={response.context_hash}
      />

      <div className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap">
        {response.response}
      </div>

    </div>
  )
}