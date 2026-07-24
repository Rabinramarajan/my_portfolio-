-- Contact table - Contact channels and information
CREATE TABLE IF NOT EXISTS contact (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_label ON contact(label);
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON contact FOR SELECT USING (true);
