-- About table - Portfolio introduction and bio
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_about_updated ON about(updated_at);
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON about FOR SELECT USING (true);
