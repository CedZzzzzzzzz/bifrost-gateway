import { MetaBadge } from "./MetaBadge"

export function ResponseCard({ response }) {
  if (!response) return null

  return (
    <MetaBadge
      source={response.source}
      provider={response.provider}
      tokensSaved={response.tokens_saved}
      contextHash={response.context_hash}
      webSearchUsed={response.web_search_used}
      semanticCacheHit={response.semantic_cache_hit}
      similarityScore={response.similarity_score}
    />
  )
}