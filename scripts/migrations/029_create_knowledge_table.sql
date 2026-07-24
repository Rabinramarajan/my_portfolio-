CREATE TABLE IF NOT EXISTS knowledge (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT, description TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge(title);
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON knowledge FOR SELECT USING (true);
