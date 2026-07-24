# Complete Migration Files List (32 Total)

## All Individual SQL Migrations for Your 31 JSON Files

You now have **32 migration files** covering all your portfolio data:

### Core Tables (3)

```
001_create_projects_table.sql        → projects
002_create_blog_posts_table.sql      → blog_posts
003_create_skills_table.sql          → skills
```

### Individual Data Tables (28)

#### About & Profile (2)

```
005_create_about_table.sql          → about
020_create_profile_table.sql        → profile
```

#### Technologies & Services (2)

```
006_create_technologies_table.sql   → technologies
013_create_services_table.sql       → services
```

#### Contact & Social (3)

```
007_create_contact_table.sql        → contact
008_create_socials_table.sql        → socials
019_create_navigation_table.sql     → navigation
```

#### Experience & Education (5)

```
009_create_experience_table.sql             → experience
010_create_experience_timeline_table.sql    → experience_timeline
011_create_education_table.sql              → education
012_create_certificates_table.sql          → certificates
016_create_career_roadmap_table.sql        → career_roadmap
```

#### Learning & Development (1)

```
015_create_learning_timeline_table.sql     → learning_timeline
```

#### Content & Config (6)

```
014_create_offerings_table.sql      → offerings
017_create_home_table.sql           → home
018_create_footer_table.sql         → footer
021_create_stats_table.sql          → stats
022_create_theme_table.sql          → theme
023_create_seo_table.sql            → seo
```

#### Performance & Monitoring (4)

```
024_create_performance_table.sql    → performance
025_create_lighthouse_table.sql     → lighthouse
026_create_web_vitals_table.sql     → web_vitals
027_create_bundle_size_table.sql    → bundle_size
```

#### Security & Knowledge (2)

```
028_create_security_table.sql       → security
029_create_knowledge_table.sql      → knowledge
```

#### Featured & Recruitment (3)

```
030_create_showcase_table.sql       → showcase
031_create_recruiter_table.sql      → recruiter
032_create_resume_versions_table.sql → resume_versions
```

### Comprehensive Bundle (Optional - 1)

```
004_create_common_data_tables.sql   → Creates all 21 non-core tables at once
```

---

## Setup Options

### Option A: Run All Individual Migrations (Recommended)

Run each migration file (001-003, 005-032) in Supabase SQL Editor:

```
1. Copy 001_create_projects_table.sql → Run
2. Copy 002_create_blog_posts_table.sql → Run
3. Copy 003_create_skills_table.sql → Run
4. Copy 005_create_about_table.sql → Run
5. Copy 006_create_technologies_table.sql → Run
... (repeat for 007-032)
```

**Advantages:**

- ✅ Full control over which tables to create
- ✅ Can run selectively (e.g., only experience tables)
- ✅ Easy to debug if a single migration fails
- ✅ Better for version control and CI/CD

### Option B: Run Core + Comprehensive Bundle (Fast)

```
1. Copy 001_create_projects_table.sql → Run
2. Copy 002_create_blog_posts_table.sql → Run
3. Copy 003_create_skills_table.sql → Run
4. Copy 004_create_common_data_tables.sql → Run (creates all 21 others)
```

**Advantages:**

- ✅ Fewer steps (4 migrations instead of 32)
- ✅ Faster to set up
- ✅ All tables created together

---

## JSON File → Migration Mapping

| JSON File                | Migration # | Table Name          |
| ------------------------ | ----------- | ------------------- |
| projects.json            | 001         | projects            |
| blogs.json               | 002         | blog_posts          |
| skills.json              | 003         | skills              |
| about.json               | 005         | about               |
| technologies.json        | 006         | technologies        |
| contact.json             | 007         | contact             |
| socials.json             | 008         | socials             |
| experience.json          | 009         | experience          |
| experience-timeline.json | 010         | experience_timeline |
| education.json           | 011         | education           |
| certificates.json        | 012         | certificates        |
| services.json            | 013         | services            |
| offerings.json           | 014         | offerings           |
| learning-timeline.json   | 015         | learning_timeline   |
| career-roadmap.json      | 016         | career_roadmap      |
| home.json                | 017         | home                |
| footer.json              | 018         | footer              |
| navigation.json          | 019         | navigation          |
| profile.json             | 020         | profile             |
| stats.json               | 021         | stats               |
| theme.json               | 022         | theme               |
| seo.json                 | 023         | seo                 |
| performance.json         | 024         | performance         |
| lighthouse.json          | 025         | lighthouse          |
| web-vitals.json          | 026         | web_vitals          |
| bundle-size.json         | 027         | bundle_size         |
| security.json            | 028         | security            |
| knowledge.json           | 029         | knowledge           |
| showcase.json            | 030         | showcase            |
| recruiter.json           | 031         | recruiter           |
| resume-versions.json     | 032         | resume_versions     |

---

## Features of Each Migration

Each migration file includes:

✅ **Table Definition**

- Specific columns for important fields
- JSONB column for full data storage (no data loss)

✅ **Indexes**

- Indexes on frequently queried fields (id, name, category, date, etc.)
- O(log n) query performance

✅ **Security**

- Row Level Security (RLS) enabled
- Public read-only policies (safe for frontend)

✅ **Timestamps**

- `inserted_at` - when record was created
- `updated_at` - when record was last modified

---

## Quick Copy-Paste Guide

### Copy All 3 Core Migrations

```sql
-- Migration 001
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  data JSONB,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);

-- (then copy 002 and 003 similarly)
```

---

## After Running Migrations

### Verify in Supabase

Go to **Supabase Dashboard → Table Editor** and you should see:

- ✅ projects (9 rows)
- ✅ blog_posts (7 rows)
- ✅ skills (28 rows)
- ✅ about (1 row)
- ✅ technologies (many rows)
- ✅ contact (many rows)
- ... (all 24 tables)

### Seed Data

```bash
npm run seed
```

This uploads all data from your JSON files to Supabase!

---

## Tips

1. **Run in Order**: Use migrations 001-032 in numerical order for clean execution
2. **Or Use Bundle**: Use 001-003 + 004 for faster setup (same result)
3. **Don't Skip 001-003**: These are core tables that other features depend on
4. **Timestamps**: All tables auto-track `inserted_at` and `updated_at`
5. **Security**: All tables have public read-only access by default

---

## File Locations

All migration files are in:

```
scripts/migrations/
├── 001_create_projects_table.sql
├── 002_create_blog_posts_table.sql
├── 003_create_skills_table.sql
├── 004_create_common_data_tables.sql (optional bundle)
├── 005_create_about_table.sql
├── 006_create_technologies_table.sql
├── 007_create_contact_table.sql
├── 008_create_socials_table.sql
├── 009_create_experience_table.sql
├── 010_create_experience_timeline_table.sql
├── 011_create_education_table.sql
├── 012_create_certificates_table.sql
├── 013_create_services_table.sql
├── 014_create_offerings_table.sql
├── 015_create_learning_timeline_table.sql
├── 016_create_career_roadmap_table.sql
├── 017_create_home_table.sql
├── 018_create_footer_table.sql
├── 019_create_navigation_table.sql
├── 020_create_profile_table.sql
├── 021_create_stats_table.sql
├── 022_create_theme_table.sql
├── 023_create_seo_table.sql
├── 024_create_performance_table.sql
├── 025_create_lighthouse_table.sql
├── 026_create_web_vitals_table.sql
├── 027_create_bundle_size_table.sql
├── 028_create_security_table.sql
├── 029_create_knowledge_table.sql
├── 030_create_showcase_table.sql
├── 031_create_recruiter_table.sql
└── 032_create_resume_versions_table.sql
```

---

## Summary

✅ **32 migration files** covering all 31 JSON files  
✅ **Individual migrations** for full control  
✅ **Bundle option** (004) for fast setup  
✅ **24 database tables** total  
✅ **Indexes** for performance  
✅ **Security** with RLS policies  
✅ **JSONB storage** preserves all data

You now have complete SQL migrations for every single JSON file in your portfolio! 🚀
