CREATE TABLE IF NOT EXISTS offerings (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offerings_title ON offerings(title);
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON offerings FOR SELECT USING (true);
