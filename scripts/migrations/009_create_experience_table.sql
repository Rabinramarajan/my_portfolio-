CREATE TABLE IF NOT EXISTS experience (
  id TEXT PRIMARY KEY, company TEXT NOT NULL, position TEXT NOT NULL, duration TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_experience_company ON experience(company);
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON experience FOR SELECT USING (true);
