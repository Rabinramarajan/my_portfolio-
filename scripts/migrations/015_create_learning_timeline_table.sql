CREATE TABLE IF NOT EXISTS learning_timeline (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, year INTEGER, description TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_timeline_year ON learning_timeline(year DESC);
ALTER TABLE learning_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON learning_timeline FOR SELECT USING (true);
