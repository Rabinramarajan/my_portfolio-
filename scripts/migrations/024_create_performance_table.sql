CREATE TABLE IF NOT EXISTS performance (
  id TEXT PRIMARY KEY, metric_name TEXT NOT NULL, value NUMERIC, unit TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_performance_metric ON performance(metric_name);
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON performance FOR SELECT USING (true);
