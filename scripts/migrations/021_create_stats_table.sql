CREATE TABLE IF NOT EXISTS stats (
  id TEXT PRIMARY KEY, label TEXT NOT NULL, value TEXT NOT NULL, icon TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stats_label ON stats(label);
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON stats FOR SELECT USING (true);
