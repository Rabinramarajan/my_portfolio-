CREATE TABLE IF NOT EXISTS seo (
  id SERIAL PRIMARY KEY, page_title TEXT, meta_description TEXT, keywords TEXT[], data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON seo FOR SELECT USING (true);
