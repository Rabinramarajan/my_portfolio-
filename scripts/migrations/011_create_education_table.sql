CREATE TABLE IF NOT EXISTS education (
  id TEXT PRIMARY KEY, institution TEXT NOT NULL, degree TEXT NOT NULL, field TEXT, graduation_year INTEGER, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_education_institution ON education(institution);
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON education FOR SELECT USING (true);
