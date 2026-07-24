CREATE TABLE IF NOT EXISTS resume_versions (
  id TEXT PRIMARY KEY, version_name TEXT NOT NULL, file_url TEXT NOT NULL, created_date DATE, format TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created ON resume_versions(created_date DESC);
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON resume_versions FOR SELECT USING (true);
