# Complete SQL Tables Reference

## Overview

All your JSON files are mapped to Supabase tables. Run the SQL migrations in this order:

1. ✅ `001_create_projects_table.sql` — Projects
2. ✅ `002_create_blog_posts_table.sql` — Blog posts
3. ✅ `003_create_skills_table.sql` — Skills
4. ✅ `004_create_common_data_tables.sql` — All other data (21 tables)

---

## Table Mapping

| JSON File                | Table Name            | Description            | Key Fields                                             |
| ------------------------ | --------------------- | ---------------------- | ------------------------------------------------------ |
| projects.json            | `projects`            | Portfolio projects     | id, title, category, featured, status                  |
| blogs.json               | `blog_posts`          | Blog articles          | id, slug, title, category, published_date              |
| skills.json              | `skills`              | Technical skills       | id, name, level (0-100), category                      |
| about.json               | `about`               | Bio and introduction   | Full JSON storage                                      |
| technologies.json        | `technologies`        | Tech stack list        | id, name, logo, accent                                 |
| contact.json             | `contact`             | Contact channels       | id, label, value, icon                                 |
| socials.json             | `socials`             | Social media links     | id, platform, url                                      |
| experience.json          | `experience`          | Work experience        | id, company, position, duration                        |
| experience-timeline.json | `experience_timeline` | Timeline view          | id, title, role_type, duration dates                   |
| education.json           | `education`           | Educational background | id, institution, degree, graduation_year               |
| certificates.json        | `certificates`        | Certifications         | id, title, issuer, issued_date                         |
| services.json            | `services`            | Services offered       | id, name, description, icon                            |
| offerings.json           | `offerings`           | Product offerings      | id, title, description                                 |
| learning-timeline.json   | `learning_timeline`   | Learning milestones    | id, title, year, description                           |
| career-roadmap.json      | `career_roadmap`      | Career goals           | id, phase, timeline                                    |
| home.json                | `home`                | Homepage content       | heading, subheading, full data                         |
| footer.json              | `footer`              | Footer content         | Full JSON storage                                      |
| navigation.json          | `navigation`          | Navigation menu        | id, label, href, order_index                           |
| profile.json             | `profile`             | User profile           | name, email, role, avatar_url, bio                     |
| stats.json               | `stats`               | Portfolio statistics   | id, label, value, icon                                 |
| theme.json               | `theme`               | Theme configuration    | name, colors, full data                                |
| seo.json                 | `seo`                 | SEO metadata           | page_title, meta_description, keywords                 |
| performance.json         | `performance`         | Performance metrics    | metric_name, value, unit                               |
| lighthouse.json          | `lighthouse`          | Lighthouse scores      | performance, accessibility, best_practices, seo scores |
| web-vitals.json          | `web_vitals`          | Web Vitals metrics     | metric_name, metric_value, rating                      |
| bundle-size.json         | `bundle_size`         | Bundle sizes           | bundle_name, size_bytes, gzipped_bytes                 |
| security.json            | `security`            | Security checks        | check_name, check_status                               |
| knowledge.json           | `knowledge`           | Knowledge base         | id, title, category, description                       |
| showcase.json            | `showcase`            | Featured work          | id, title, featured                                    |
| recruiter.json           | `recruiter`           | Recruiter info         | section_title, content                                 |
| resume-versions.json     | `resume_versions`     | Resume downloads       | id, version_name, file_url, format                     |

---

## Table Schemas

### Migration 001: Projects Table

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  data JSONB,                    -- Full project object
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes:** category, status, featured, created_at  
**RLS:** Public read-only

---

### Migration 002: Blog Posts Table

```sql
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date DATE NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  data JSONB,                    -- Full post with body, tags
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes:** slug, category, author, published_date (DESC)  
**RLS:** Public read-only

---

### Migration 003: Skills Table

```sql
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,        -- 0-100
  category TEXT NOT NULL,
  accent TEXT,
  data JSONB,                    -- Full skill object
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes:** category, name, level (DESC)  
**RLS:** Public read-only

---

### Migration 004: Common Data Tables

#### About Table

```sql
CREATE TABLE about (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,          -- Full about data
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Technologies Table

```sql
CREATE TABLE technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Contact Table

```sql
CREATE TABLE contact (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  accent TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Socials Table

```sql
CREATE TABLE socials (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  label TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Experience Table

```sql
CREATE TABLE experience (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Experience Timeline Table

```sql
CREATE TABLE experience_timeline (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  role_type TEXT,
  duration_start DATE,
  duration_end DATE,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Education Table

```sql
CREATE TABLE education (
  id TEXT PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  graduation_year INTEGER,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Certificates Table

```sql
CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_date DATE,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Services Table

```sql
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Offerings Table

```sql
CREATE TABLE offerings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Learning Timeline Table

```sql
CREATE TABLE learning_timeline (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Career Roadmap Table

```sql
CREATE TABLE career_roadmap (
  id TEXT PRIMARY KEY,
  phase TEXT NOT NULL,
  timeline TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Home Table

```sql
CREATE TABLE home (
  id SERIAL PRIMARY KEY,
  heading TEXT,
  subheading TEXT,
  data JSONB NOT NULL,          -- Full homepage data
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Footer Table

```sql
CREATE TABLE footer (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,          -- Full footer data
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Navigation Table

```sql
CREATE TABLE navigation (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT,
  icon TEXT,
  order_index INTEGER,          -- For menu ordering
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Profile Table

```sql
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  avatar_url TEXT,
  bio TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Stats Table

```sql
CREATE TABLE stats (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Theme Table

```sql
CREATE TABLE theme (
  id SERIAL PRIMARY KEY,
  name TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  data JSONB NOT NULL,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### SEO Table

```sql
CREATE TABLE seo (
  id SERIAL PRIMARY KEY,
  page_title TEXT,
  meta_description TEXT,
  keywords TEXT[],              -- Array of keywords
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Performance Table

```sql
CREATE TABLE performance (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Lighthouse Table

```sql
CREATE TABLE lighthouse (
  id SERIAL PRIMARY KEY,
  audit_date DATE NOT NULL,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Web Vitals Table

```sql
CREATE TABLE web_vitals (
  id SERIAL PRIMARY KEY,
  measured_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  rating TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Bundle Size Table

```sql
CREATE TABLE bundle_size (
  id SERIAL PRIMARY KEY,
  build_date DATE NOT NULL,
  bundle_name TEXT NOT NULL,
  size_bytes INTEGER,
  gzipped_bytes INTEGER,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Security Table

```sql
CREATE TABLE security (
  id SERIAL PRIMARY KEY,
  check_name TEXT NOT NULL,
  check_status TEXT,
  last_checked DATE,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Knowledge Table

```sql
CREATE TABLE knowledge (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Showcase Table

```sql
CREATE TABLE showcase (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Recruiter Table

```sql
CREATE TABLE recruiter (
  id SERIAL PRIMARY KEY,
  section_title TEXT,
  content TEXT,
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Resume Versions Table

```sql
CREATE TABLE resume_versions (
  id TEXT PRIMARY KEY,
  version_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_date DATE,
  format TEXT,                   -- pdf, docx, etc
  data JSONB,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Key Features Across All Tables

✅ **Flexible Storage** — All tables have a `data JSONB` column for full object storage  
✅ **Indexed Queries** — Common filters have indexes for fast queries  
✅ **Timestamps** — All tables track `inserted_at` and `updated_at`  
✅ **Security** — Row Level Security (RLS) enabled on all tables  
✅ **Public Access** — Public read-only policies on all tables for frontend access  
✅ **Type Safety** — Specific columns for common fields + flexible JSONB for the rest

---

## Query Examples

### Get Featured Projects

```typescript
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('featured', true)
  .order('created_at', { ascending: false });
```

### Get Recent Blog Posts

```typescript
const { data } = await supabase
  .from('blog_posts')
  .select('*')
  .order('published_date', { ascending: false })
  .limit(10);
```

### Get Expert Skills

```typescript
const { data } = await supabase
  .from('skills')
  .select('*')
  .gte('level', 80)
  .eq('category', 'frontend')
  .order('level', { ascending: false });
```

### Get Contact Information

```typescript
const { data } = await supabase.from('contact').select('*').order('id', { ascending: true });
```

### Get Latest Lighthouse Scores

```typescript
const { data } = await supabase
  .from('lighthouse')
  .select('*')
  .order('audit_date', { ascending: false })
  .limit(1);
```

---

## Setup Instructions

### Step 1: Run Migrations (in order)

1. Go to Supabase Dashboard → SQL Editor
2. Copy-paste **001_create_projects_table.sql** → Click Run
3. Copy-paste **002_create_blog_posts_table.sql** → Click Run
4. Copy-paste **003_create_skills_table.sql** → Click Run
5. Copy-paste **004_create_common_data_tables.sql** → Click Run

### Step 2: Seed Data

```bash
npm install
npm run seed
```

### Step 3: Verify All Tables

Go to Supabase Dashboard → Table Editor and verify all 24 tables exist with data.

---

## Common Queries

### Search in All Projects

```typescript
async searchProjects(query: string) {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  return data;
}
```

### Get Navigation Menu in Order

```typescript
async getNavigation() {
  const { data } = await supabase
    .from('navigation')
    .select('*')
    .order('order_index', { ascending: true });
  return data;
}
```

### Get All Socials

```typescript
async getSocials() {
  const { data } = await supabase
    .from('socials')
    .select('*');
  return data;
}
```

### Get Skills by Category

```typescript
async getSkillsByCategory(category: string) {
  const { data } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('level', { ascending: false });
  return data;
}
```

---

## Notes

- **JSONB Column** — All tables include a `data` JSONB column to store the complete original JSON object for flexibility
- **No Data Loss** — By storing full JSON, no information is lost during migration
- **Queryable Fields** — Important fields are extracted and indexed for fast queries
- **Scalable** — Indexes on commonly filtered fields ensure performance as data grows
- **Secure** — All tables have RLS enabled with public read-only policies

---

This reference covers all 31 tables created from your 31 JSON files. You now have a complete, production-ready database schema! 🚀
