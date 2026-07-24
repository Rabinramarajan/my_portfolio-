# Supabase Seed Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Your Portfolio JSON Data Files              │   │
│  │  ┌────────────────┬────────────────┬────────────┐   │   │
│  │  │ projects.json  │  blogs.json    │skills.json │   │   │
│  │  │   (9 items)    │   (7 items)    │(28 items)  │   │   │
│  │  └────────────────┴────────────────┴────────────┘   │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│                         ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  npm run seed                                       │    │
│  │  (seed-supabase.ts)                                 │    │
│  │                                                     │    │
│  │  ✓ Read JSON files                                  │    │
│  │  ✓ Load env vars (SUPABASE_URL, SUPABASE_KEY)      │    │
│  │  ✓ Map data to tables                              │    │
│  │  ✓ Insert into Supabase                            │    │
│  │  ✓ Log results                                      │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │      SUPABASE CLOUD (Internet)     │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │   PostgreSQL Database        │  │
        │  │                              │  │
        │  │  ┌────────────────────────┐  │  │
        │  │  │   projects table       │  │  │
        │  │  │  ✓ 9 rows inserted     │  │  │
        │  │  │  ✓ indexed, RLS ready  │  │  │
        │  │  └────────────────────────┘  │  │
        │  │                              │  │
        │  │  ┌────────────────────────┐  │  │
        │  │  │  blog_posts table      │  │  │
        │  │  │  ✓ 7 rows inserted     │  │  │
        │  │  │  ✓ indexed, RLS ready  │  │  │
        │  │  └────────────────────────┘  │  │
        │  │                              │  │
        │  │  ┌────────────────────────┐  │  │
        │  │  │   skills table         │  │  │
        │  │  │  ✓ 28 rows inserted    │  │  │
        │  │  │  ✓ indexed, RLS ready  │  │  │
        │  │  └────────────────────────┘  │  │
        │  └──────────────────────────────┘  │
        │                                    │
        └────────────────────────────────────┘
                         ▲
                         │
        ┌────────────────────────────────────┐
        │    YOUR ANGULAR APP (Browser)      │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  SupabaseService            │  │
        │  │  (Reactive queries)         │  │
        │  │                              │  │
        │  │  .from('projects').select() │  │
        │  │  .from('blog_posts').select()│  │
        │  │  .from('skills').select()   │  │
        │  └──────────────────────────────┘  │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  Components Display Data     │  │
        │  │                              │  │
        │  │  • ProjectsComponent        │  │
        │  │  • BlogsComponent           │  │
        │  │  • SkillsComponent          │  │
        │  └──────────────────────────────┘  │
        │                                    │
        └────────────────────────────────────┘
```

---

## Setup Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Environment Setup (2 min)                           │
├─────────────────────────────────────────────────────────────┤
│ • Create Supabase account                                   │
│ • Get URL & API key                                         │
│ • Create .env.local file                                    │
│ • Add SUPABASE_URL and SUPABASE_KEY                        │
│ • Install dependencies (npm install)                        │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Database Setup (2 min)                              │
├─────────────────────────────────────────────────────────────┤
│ • Open Supabase SQL Editor                                  │
│ • Copy-paste: 001_create_projects_table.sql                 │
│ • Copy-paste: 002_create_blog_posts_table.sql               │
│ • Copy-paste: 003_create_skills_table.sql                   │
│ • Click "Run" for each                                      │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Seed Data (1 min)                                   │
├─────────────────────────────────────────────────────────────┤
│ • Terminal: npm run seed                                    │
│ • Watch: ✅ Seeded X projects/blogs/skills                 │
│ • Done! All data in Supabase                                │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Verify (1 min)                                      │
├─────────────────────────────────────────────────────────────┤
│ • Supabase Dashboard → Table Editor                         │
│ • Check projects (9 rows)                                   │
│ • Check blog_posts (7 rows)                                 │
│ • Check skills (28 rows)                                    │
└─────────────────────────────────────────────────────────────┘

        ✅ Total Time: ~6 minutes
```

---

## Data Flow in Components

```
Component
    │
    ▼
┌─────────────────────────┐
│  SupabaseService        │
│                         │
│  async getProjects() {  │
│    const { data } =     │
│      supabase           │
│      .from('projects')  │
│      .select('*')       │
│    return data          │
│  }                      │
└────────┬────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Supabase Query  │
    │  (HTTP Request) │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Supabase API Layer   │
    │  (Row Security)      │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ PostgreSQL Database  │
    │ (Query Execution)    │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ JSON Response        │
    │ (Array of records)   │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Signal Update        │
    │ this.data.set(...)   │
    └────────┬─────────────┘
             │
             ▼
         Template
      (Angular binds)
             │
             ▼
        UI Display
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  projects                                            │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ id (PK)        │ Unique project identifier      │ │   │
│  │  │ title          │ Project name                   │ │   │
│  │  │ category       │ ⬅️ INDEXED (filter by)        │ │   │
│  │  │ status         │ ⬅️ INDEXED (filter by)        │ │   │
│  │  │ featured       │ ⬅️ INDEXED (show featured)    │ │   │
│  │  │ created_at     │ ⬅️ INDEXED (sort by)          │ │   │
│  │  │ technologies[] │ Array of tech stack            │ │   │
│  │  │ data (JSONB)   │ Full project object stored    │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  blog_posts                                          │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ id (PK)        │ Unique post identifier         │ │   │
│  │  │ slug (UQ)      │ URL-friendly identifier        │ │   │
│  │  │ title          │ Post title                     │ │   │
│  │  │ category       │ ⬅️ INDEXED (filter by)        │ │   │
│  │  │ author         │ ⬅️ INDEXED (filter by)        │ │   │
│  │  │ published_date │ ⬅️ INDEXED (sort by DESC)    │ │   │
│  │  │ featured       │ Show on homepage               │ │   │
│  │  │ data (JSONB)   │ Full post with body, tags     │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  skills                                              │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ id (PK)        │ Unique skill identifier        │ │   │
│  │  │ name           │ Skill name                     │ │   │
│  │  │ level (0-100)  │ Proficiency level              │ │   │
│  │  │ category       │ ⬅️ INDEXED (group by)         │ │   │
│  │  │ accent         │ UI accent color                │ │   │
│  │  │ data (JSONB)   │ Full skill with logo/icon     │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Query Pattern Examples

```
┌──────────────────────────────────────────────────────────┐
│ PATTERN 1: Select All                                    │
├──────────────────────────────────────────────────────────┤
│ const { data } = await supabase                          │
│   .from('projects')                                      │
│   .select('*')                                           │
│                                                          │
│ Result: [ { id, title, category, ... }, ... ]           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PATTERN 2: Filter by Condition                           │
├──────────────────────────────────────────────────────────┤
│ const { data } = await supabase                          │
│   .from('projects')                                      │
│   .select('*')                                           │
│   .eq('featured', true)                                  │
│                                                          │
│ Result: [ { id, title, ... }, ... ] (featured only)    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PATTERN 3: Sort & Order                                  │
├──────────────────────────────────────────────────────────┤
│ const { data } = await supabase                          │
│   .from('blog_posts')                                    │
│   .select('*')                                           │
│   .order('published_date', { ascending: false })         │
│   .limit(5)                                              │
│                                                          │
│ Result: [ latest 5 posts ]                              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PATTERN 4: Search in Array                               │
├──────────────────────────────────────────────────────────┤
│ const { data } = await supabase                          │
│   .from('projects')                                      │
│   .select('*')                                           │
│   .contains('technologies', ['Angular'])                 │
│                                                          │
│ Result: [ projects using Angular ]                      │
└──────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
package.json
    │
    ├─→ "seed" script
    │   └─→ seed-supabase.ts
    │       └─→ src/assets/data/*.json
    │           ├─→ projects.json
    │           ├─→ blogs.json
    │           ├─→ skills.json
    │           └─→ ... others
    │
    └─→ devDependencies
        ├─→ ts-node (runs TypeScript)
        ├─→ typescript (compiles TypeScript)
        └─→ @supabase/supabase-js (API client)

.env.local
    ├─→ SUPABASE_URL
    └─→ SUPABASE_KEY
        └─→ seed-supabase.ts (loads via process.env)

scripts/migrations/*.sql
    └─→ Run in Supabase SQL Editor
        └─→ Creates tables (projects, blog_posts, skills)
```

---

## Performance & Indexing

```
Table           Index                    Purpose
──────────────────────────────────────────────────────────
projects        idx_projects_category    Fast category filter
                idx_projects_status      Fast status filter
                idx_projects_featured    Quick "featured only"
                idx_projects_created_at  Sort by date

blog_posts      idx_blog_posts_slug      Unique lookup
                idx_blog_posts_category  Filter by topic
                idx_blog_posts_author    Filter by writer
                idx_blog_posts_published_date  Chronological sort

skills          idx_skills_category     Group by category
                idx_skills_name         Search by name
                idx_skills_level        Sort by proficiency
```

All indexes create O(log n) query time for large datasets.

---

## Security Model (RLS)

```
┌────────────────────────────────────────┐
│   PUBLIC ACCESS (from Frontend)        │
├────────────────────────────────────────┤
│ ✅ SELECT from projects                │ (Read-only)
│ ✅ SELECT from blog_posts              │ (Read-only)
│ ✅ SELECT from skills                  │ (Read-only)
│                                        │
│ ❌ INSERT / UPDATE / DELETE            │ (Protected)
│    (Admin only, via Supabase Studio)  │
└────────────────────────────────────────┘

✅ = Enabled by RLS Policy
❌ = Blocked by RLS Policy
```

---

## Deployment Checklist

```
Before Production:
☐ .env.local has real SUPABASE_URL and SUPABASE_KEY
☐ Database tables created (001, 002, 003 migrations)
☐ npm run seed executed successfully
☐ Supabase Table Editor shows all data
☐ RLS policies enabled on all tables
☐ Public read-only policies in place
☐ Components updated to query Supabase
☐ Error handling for Supabase queries
☐ Loading states in UI
☐ Test in development
☐ Test in production (Vercel/Netlify)
```

---

This architecture ensures:
✅ Scalability (PostgreSQL backing)
✅ Performance (Indexes on frequent queries)
✅ Security (RLS policies)
✅ Flexibility (JSONB full object storage)
✅ Type Safety (TypeScript client)
