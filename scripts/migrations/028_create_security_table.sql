CREATE TABLE IF NOT EXISTS security (
  id SERIAL PRIMARY KEY, check_name TEXT NOT NULL, check_status TEXT, last_checked DATE, data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_check_name ON security(check_name);
ALTER TABLE security ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON security FOR SELECT USING (true);
