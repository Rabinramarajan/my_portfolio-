CREATE TABLE IF NOT EXISTS navigation (
  id TEXT PRIMARY KEY, label TEXT NOT NULL, href TEXT, icon TEXT, order_index INTEGER, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation(order_index);
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON navigation FOR SELECT USING (true);
