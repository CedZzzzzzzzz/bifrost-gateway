CREATE TABLE IF NOT EXISTS prompt_cache (
    context_hash TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);