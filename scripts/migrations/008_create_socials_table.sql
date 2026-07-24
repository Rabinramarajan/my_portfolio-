CREATE TABLE IF NOT EXISTS socials (
  id TEXT PRIMARY KEY, platform TEXT NOT NULL, url TEXT NOT NULL, icon TEXT, label TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_socials_platform ON socials(platform);
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON socials FOR SELECT USING (true);
