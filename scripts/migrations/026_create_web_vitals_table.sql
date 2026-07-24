CREATE TABLE IF NOT EXISTS web_vitals (
  id SERIAL PRIMARY KEY, measured_date DATE NOT NULL, metric_name TEXT NOT NULL, metric_value NUMERIC, rating TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_web_vitals_date ON web_vitals(measured_date DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON web_vitals(metric_name);
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON web_vitals FOR SELECT USING (true);
