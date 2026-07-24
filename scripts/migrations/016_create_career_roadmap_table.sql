CREATE TABLE IF NOT EXISTS career_roadmap (
  id TEXT PRIMARY KEY, phase TEXT NOT NULL, timeline TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_roadmap_phase ON career_roadmap(phase);
ALTER TABLE career_roadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON career_roadmap FOR SELECT USING (true);
