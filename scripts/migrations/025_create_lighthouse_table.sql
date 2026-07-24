CREATE TABLE IF NOT EXISTS lighthouse (
  id SERIAL PRIMARY KEY, audit_date DATE NOT NULL, performance_score INTEGER, accessibility_score INTEGER, best_practices_score INTEGER, seo_score INTEGER, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lighthouse_audit_date ON lighthouse(audit_date DESC);
ALTER TABLE lighthouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON lighthouse FOR SELECT USING (true);
