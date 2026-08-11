export function MetaBadge({ source, provider, tokensSaved, contextHash }) {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border font-mono text-xs ${
      tokensSaved
        ? "bg-green-950 border-green-500"
        : "bg-indigo-950 border-indigo-500"
    }`}>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-0.5 rounded-full text-white font-bold ${
          tokensSaved ? "bg-green-500" : "bg-indigo-500"
        }`}>
          {tokensSaved ? "✦ Cache Hit" : "✅ Live"}
        </span>

        <span className="text-zinc-400">
          {provider ? `Provider: ${provider}` : "Provider: —"}
        </span>

        <span className={tokensSaved ? "text-green-400" : "text-zinc-400"}>
          {tokensSaved ? "Tokens saved ✓" : "Tokens used"}
        </span>
      </div>

      <div className="text-zinc-600 text-[11px]">
        Hash: {contextHash}
      </div>

    </div>
  )
}