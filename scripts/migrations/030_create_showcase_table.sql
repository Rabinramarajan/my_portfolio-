CREATE TABLE IF NOT EXISTS showcase (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, featured BOOLEAN DEFAULT FALSE, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_showcase_featured ON showcase(featured);
ALTER TABLE showcase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON showcase FOR SELECT USING (true);
