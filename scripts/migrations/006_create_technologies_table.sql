-- Technologies table - Tech stack information
CREATE TABLE IF NOT EXISTS technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name);
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON technologies FOR SELECT USING (true);
