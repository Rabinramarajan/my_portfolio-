CREATE TABLE IF NOT EXISTS bundle_size (
  id SERIAL PRIMARY KEY, build_date DATE NOT NULL, bundle_name TEXT NOT NULL, size_bytes INTEGER, gzipped_bytes INTEGER, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bundle_size_date ON bundle_size(build_date DESC);
CREATE INDEX IF NOT EXISTS idx_bundle_size_name ON bundle_size(bundle_name);
ALTER TABLE bundle_size ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON bundle_size FOR SELECT USING (true);
