CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT, role TEXT, avatar_url TEXT, bio TEXT, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON profile FOR SELECT USING (true);
