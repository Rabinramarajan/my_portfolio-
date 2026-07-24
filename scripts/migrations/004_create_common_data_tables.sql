-- =============================================================================
-- COMMON DATA TABLES FOR PORTFOLIO
-- =============================================================================
-- This migration creates tables for all remaining JSON data files
-- Each table has a flexible JSONB column to store the full data structure
-- =============================================================================

-- about table - Portfolio introduction and bio
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_about_updated ON about(updated_at);
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON about FOR SELECT USING (true);

-- technologies table - Tech stack information
CREATE TABLE IF NOT EXISTS technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name);
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON technologies FOR SELECT USING (true);

-- contact table - Contact channels and information
CREATE TABLE IF NOT EXISTS contact (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_label ON contact(label);
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON contact FOR SELECT USING (true);

-- socials table - Social media links
CREATE TABLE IF NOT EXISTS socials (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  label TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_socials_platform ON socials(platform);
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON socials FOR SELECT USING (true);

-- experience table - Work experience and positions
CREATE TABLE IF NOT EXISTS experience (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_experience_company ON experience(company);
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON experience FOR SELECT USING (true);

-- experience_timeline table - Timeline view of experience
CREATE TABLE IF NOT EXISTS experience_timeline (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  role_type TEXT,
  duration_start DATE,
  duration_end DATE,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_experience_timeline_start ON experience_timeline(duration_start);
ALTER TABLE experience_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON experience_timeline FOR SELECT USING (true);

-- education table - Educational background
CREATE TABLE IF NOT EXISTS education (
  id TEXT PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  graduation_year INTEGER,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_education_institution ON education(institution);
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON education FOR SELECT USING (true);

-- certificates table - Certifications and credentials
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_date DATE,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_certificates_issuer ON certificates(issuer);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_date ON certificates(issued_date DESC);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON certificates FOR SELECT USING (true);

-- services table - Services offered
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON services FOR SELECT USING (true);

-- offerings table - Product/service offerings
CREATE TABLE IF NOT EXISTS offerings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offerings_title ON offerings(title);
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON offerings FOR SELECT USING (true);

-- learning_timeline table - Learning journey/milestones
CREATE TABLE IF NOT EXISTS learning_timeline (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_timeline_year ON learning_timeline(year DESC);
ALTER TABLE learning_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON learning_timeline FOR SELECT USING (true);

-- career_roadmap table - Career progression and goals
CREATE TABLE IF NOT EXISTS career_roadmap (
  id TEXT PRIMARY KEY,
  phase TEXT NOT NULL,
  timeline TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_roadmap_phase ON career_roadmap(phase);
ALTER TABLE career_roadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON career_roadmap FOR SELECT USING (true);

-- home table - Homepage hero/intro section
CREATE TABLE IF NOT EXISTS home (
  id SERIAL PRIMARY KEY,
  heading TEXT,
  subheading TEXT,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE home ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON home FOR SELECT USING (true);

-- footer table - Footer content and links
CREATE TABLE IF NOT EXISTS footer (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON footer FOR SELECT USING (true);

-- navigation table - Navigation menu structure
CREATE TABLE IF NOT EXISTS navigation (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT,
  icon TEXT,
  order_index INTEGER,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation(order_index);
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON navigation FOR SELECT USING (true);

-- profile table - User profile information
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  avatar_url TEXT,
  bio TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON profile FOR SELECT USING (true);

-- stats table - Portfolio statistics and metrics
CREATE TABLE IF NOT EXISTS stats (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stats_label ON stats(label);
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON stats FOR SELECT USING (true);

-- theme table - Theme configuration and settings
CREATE TABLE IF NOT EXISTS theme (
  id SERIAL PRIMARY KEY,
  name TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE theme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON theme FOR SELECT USING (true);

-- seo table - SEO metadata and configuration
CREATE TABLE IF NOT EXISTS seo (
  id SERIAL PRIMARY KEY,
  page_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON seo FOR SELECT USING (true);

-- performance table - Performance metrics and monitoring
CREATE TABLE IF NOT EXISTS performance (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_performance_metric ON performance(metric_name);
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON performance FOR SELECT USING (true);

-- lighthouse table - Lighthouse audit scores
CREATE TABLE IF NOT EXISTS lighthouse (
  id SERIAL PRIMARY KEY,
  audit_date DATE NOT NULL,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lighthouse_audit_date ON lighthouse(audit_date DESC);
ALTER TABLE lighthouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON lighthouse FOR SELECT USING (true);

-- web_vitals table - Web Vitals metrics
CREATE TABLE IF NOT EXISTS web_vitals (
  id SERIAL PRIMARY KEY,
  measured_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  rating TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_web_vitals_date ON web_vitals(measured_date DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON web_vitals(metric_name);
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON web_vitals FOR SELECT USING (true);

-- bundle_size table - Bundle size tracking
CREATE TABLE IF NOT EXISTS bundle_size (
  id SERIAL PRIMARY KEY,
  build_date DATE NOT NULL,
  bundle_name TEXT NOT NULL,
  size_bytes INTEGER,
  gzipped_bytes INTEGER,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bundle_size_date ON bundle_size(build_date DESC);
CREATE INDEX IF NOT EXISTS idx_bundle_size_name ON bundle_size(bundle_name);
ALTER TABLE bundle_size ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON bundle_size FOR SELECT USING (true);

-- security table - Security configuration and checksums
CREATE TABLE IF NOT EXISTS security (
  id SERIAL PRIMARY KEY,
  check_name TEXT NOT NULL,
  check_status TEXT,
  last_checked DATE,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_check_name ON security(check_name);
ALTER TABLE security ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON security FOR SELECT USING (true);

-- knowledge table - Knowledge base/learning resources
CREATE TABLE IF NOT EXISTS knowledge (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge(title);
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON knowledge FOR SELECT USING (true);

-- showcase table - Portfolio showcase/featured work
CREATE TABLE IF NOT EXISTS showcase (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_showcase_featured ON showcase(featured);
ALTER TABLE showcase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON showcase FOR SELECT USING (true);

-- recruiter table - Recruiter-focused information
CREATE TABLE IF NOT EXISTS recruiter (
  id SERIAL PRIMARY KEY,
  section_title TEXT,
  content TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE recruiter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON recruiter FOR SELECT USING (true);

-- resume_versions table - Resume versions and downloads
CREATE TABLE IF NOT EXISTS resume_versions (
  id TEXT PRIMARY KEY,
  version_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_date DATE,
  format TEXT,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created ON resume_versions(created_date DESC);
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON resume_versions FOR SELECT USING (true);

-- =============================================================================
-- END OF COMMON DATA TABLES
-- =============================================================================
