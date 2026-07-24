# Supabase Seed Setup Checklist

Quick 5-minute setup to sync your JSON data to Supabase.

## 🚀 Quick Setup (5 minutes)

### 1. Get Supabase Credentials

- [ ] Go to [supabase.com](https://supabase.com/dashboard)
- [ ] Create a new project or use existing one
- [ ] Copy **Project URL** from Settings → API
- [ ] Copy **anon public key** from Settings → API

### 2. Set Environment Variables

Create `.env.local` in project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### 3. Create Database Tables

Option A (Easiest):

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy-paste SQL from `scripts/migrations/001_create_projects_table.sql`
- [ ] Click "Run" → Repeat for `002_*` and `003_*` files

Option B (CLI):

```bash
supabase db push
```

### 4. Run Seed Script

```bash
npm run seed
```

### 5. Verify Data

- [ ] Open Supabase Dashboard → Table Editor
- [ ] Check `projects` table (9 rows)
- [ ] Check `blog_posts` table (7 rows)
- [ ] Check `skills` table (28 rows)

✅ **Done!** Your data is now in Supabase.

---

## 📊 What Gets Seeded

| Table        | Records       | Source                                        |
| ------------ | ------------- | --------------------------------------------- |
| `projects`   | 9             | `src/assets/data/projects.json`               |
| `blog_posts` | 7             | `src/assets/data/blogs.json`                  |
| `skills`     | 28            | `src/assets/data/skills.json`                 |
| Other tables | Auto-detected | All other `.json` files in `src/assets/data/` |

---

## 🔗 Using Data in Components

### Example: Display All Projects

```typescript
export class ProjectsPage {
  projects = signal<any[]>([]);

  constructor(private supabase: SupabaseService) {
    this.loadProjects();
  }

  async loadProjects() {
    const { data, error } = await this.supabase.from('projects').select('*').eq('featured', true);

    if (data) this.projects.set(data);
  }
}
```

### Example: Filter Blog Posts

```typescript
async loadBlogsByCategory(category: string) {
  const { data } = await this.supabase
    .from('blog_posts')
    .select('*')
    .eq('category', category)
    .order('published_date', { ascending: false });

  return data;
}
```

### Example: Get Skills by Category

```typescript
async getFrontendSkills() {
  const { data } = await this.supabase
    .from('skills')
    .select('*')
    .eq('category', 'frontend')
    .order('level', { ascending: false });

  return data;
}
```

---

## ⚠️ Common Issues & Fixes

| Issue                 | Solution                                                   |
| --------------------- | ---------------------------------------------------------- |
| `env vars not found`  | Create `.env.local` with SUPABASE_URL & SUPABASE_KEY       |
| `Table doesn't exist` | Run SQL migrations in Supabase SQL Editor first            |
| `Permission denied`   | Check RLS policies (seed script creates them)              |
| No data appears       | Verify seed script ran successfully (check console output) |

---

## 🔄 Re-seed Data

If you need to clear and re-seed:

```bash
# In Supabase SQL Editor, run:
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE blog_posts CASCADE;
TRUNCATE TABLE skills CASCADE;
```

Then run `npm run seed` again.

---

## 📚 Full Documentation

For detailed setup guide, troubleshooting, and advanced usage:
→ See [scripts/SEED_GUIDE.md](scripts/SEED_GUIDE.md)

---

## 🎯 Next Steps

1. ✅ Seed data to Supabase
2. → Update components to fetch from Supabase instead of static JSON
3. → Add real-time subscriptions for live updates
4. → Implement admin dashboard to manage data
5. → Add search, filters, and pagination

Happy coding! 🚀
