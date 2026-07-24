CREATE TABLE IF NOT EXISTS theme (
  id SERIAL PRIMARY KEY, name TEXT, primary_color TEXT, secondary_color TEXT, data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE theme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON theme FOR SELECT USING (true);
