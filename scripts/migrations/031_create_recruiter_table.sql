CREATE TABLE IF NOT EXISTS recruiter (
  id SERIAL PRIMARY KEY, section_title TEXT, content TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE recruiter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON recruiter FOR SELECT USING (true);
