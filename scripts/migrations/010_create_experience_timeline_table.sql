CREATE TABLE IF NOT EXISTS experience_timeline (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, role_type TEXT, duration_start DATE, duration_end DATE, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_experience_timeline_start ON experience_timeline(duration_start);
ALTER TABLE experience_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON experience_timeline FOR SELECT USING (true);
