CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, issuer TEXT NOT NULL, issued_date DATE, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_certificates_issuer ON certificates(issuer);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_date ON certificates(issued_date DESC);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON certificates FOR SELECT USING (true);
