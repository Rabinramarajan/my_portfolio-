# Supabase Seeding Guide

This guide explains how to set up and seed your Supabase database with portfolio data from JSON files.

## Prerequisites

1. **Supabase Account**: Create one at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set up your `.env.local` file with Supabase credentials
3. **Node.js**: Ensure you have Node.js 18+ installed

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project

- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Click "New Project"
- Fill in project name and database password
- Wait for provisioning to complete

### 1.2 Get Your Credentials

From the Supabase dashboard:

1. Go to **Project Settings** → **API**
2. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_KEY`

### 1.3 Update Environment File

Create or update `.env.local`:

```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

## Step 2: Create Database Tables

You have two options:

### Option A: Using Supabase SQL Editor (Recommended for first-time)

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy the SQL from each migration file:
   - `scripts/migrations/001_create_projects_table.sql`
   - `scripts/migrations/002_create_blog_posts_table.sql`
   - `scripts/migrations/003_create_skills_table.sql`
4. Run each query

### Option B: Using CLI (if Supabase CLI is installed)

```bash
supabase db push
```

## Step 3: Install Dependencies

```bash
npm install
```

> **Note**: If you don't have `ts-node` installed globally, it will be run via npx

## Step 4: Run Seed Script

```bash
npm run seed
```

### Expected Output

```
🌱 Starting Supabase seed...

ℹ️  Seeding projects...
✅ Seeded 9 projects

ℹ️  Seeding blog posts...
✅ Seeded 7 blog posts

ℹ️  Seeding skills...
✅ Seeded 28 skills

ℹ️  Seeding other data files...
✅ Seeded theme
✅ Seeded technologies
...

🎉 Seed complete!
```

## Step 5: Verify Data in Supabase

1. Go to Supabase **Table Editor**
2. You should see:
   - `projects` table with 9 rows
   - `blog_posts` table with 7 rows
   - `skills` table with 28 rows

## Using Seeded Data in Your App

### Get Projects

```typescript
import { SupabaseService } from '@app/core/services/supabase.service';

export class ProjectsComponent {
  constructor(private supabase: SupabaseService) {
    this.loadProjects();
  }

  async loadProjects() {
    const { data, error } = await this.supabase.from('projects').select('*').eq('featured', true);

    if (error) console.error(error);
    return data;
  }
}
```

### Get Blog Posts

```typescript
async loadBlogs() {
  const { data, error } = await this.supabase
    .from('blog_posts')
    .select('*')
    .eq('featured', true)
    .order('published_date', { ascending: false })
    .limit(10);

  return data;
}
```

### Get Skills by Category

```typescript
async getSkillsByCategory(category: string) {
  const { data, error } = await this.supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('level', { ascending: false });

  return data;
}
```

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY environment variables are required"

**Solution**: Ensure your `.env.local` file exists with both variables set.

```bash
# Check if .env.local exists
ls -la .env.local

# If not, create it with your credentials
echo "SUPABASE_URL=your-url" > .env.local
echo "SUPABASE_KEY=your-key" >> .env.local
```

### Error: "Table 'projects' doesn't exist"

**Solution**: Run the SQL migrations in Supabase SQL Editor before seeding.

### Error: "Permission denied"

**Solution**: Check your RLS (Row Level Security) policies. The seed script includes public read access policies.

### Error: "ts-node: command not found"

**Solution**: Install ts-node locally:

```bash
npm install --save-dev ts-node @types/node
```

## Re-seeding (Clearing & Reloading)

To clear and re-seed your data:

### Option 1: Using Supabase Dashboard

1. Go to **Table Editor**
2. For each table (projects, blog_posts, skills):
   - Right-click → **Truncate**
3. Run `npm run seed` again

### Option 2: Using SQL

```sql
-- Run in Supabase SQL Editor
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE blog_posts CASCADE;
TRUNCATE TABLE skills CASCADE;
```

Then run `npm run seed` again.

## Data Structure Reference

### Projects Table

```json
{
  "id": "fiji-immigration",
  "title": "Fiji Immigration External Management System",
  "category": "Web Applications",
  "description": "A secure digital self-service platform...",
  "technologies": ["Angular", "TypeScript", "Tailwind CSS"],
  "featured": true,
  "status": "finished",
  "created_at": "2024-06-01T00:00:00Z",
  "data": {/* full project object */}
}
```

### Blog Posts Table

```json
{
  "id": "b1",
  "slug": "building-scalable-angular-applications",
  "title": "Modern Angular 17 with Signals & Zoneless",
  "category": "Angular",
  "author": "Rabin R.",
  "published_date": "2024-06-10",
  "featured": true,
  "data": {/* full post object including body, tags, etc */}
}
```

### Skills Table

```json
{
  "id": "angular",
  "name": "Angular",
  "level": 95,
  "category": "frontend",
  "accent": "red",
  "data": {/* full skill object including logo, icon */}
}
```

## Next Steps

1. ✅ Environment configured
2. ✅ Tables created
3. ✅ Data seeded
4. **→ Query data from your components** (use examples above)
5. **→ Build UI components that display the data**
6. **→ Add filtering, sorting, and pagination as needed**

## Useful Supabase Queries

### Search Projects by Technology

```typescript
async searchByTechnology(tech: string) {
  const { data } = await this.supabase
    .from('projects')
    .select('*')
    .contains('technologies', [tech]);
  return data;
}
```

### Get Recent Blog Posts

```typescript
async getRecentBlogs(limit = 5) {
  const { data } = await this.supabase
    .from('blog_posts')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(limit);
  return data;
}
```

### Get Skills Above Threshold

```typescript
async getExpertSkills(minLevel = 80) {
  const { data } = await this.supabase
    .from('skills')
    .select('*')
    .gte('level', minLevel)
    .order('level', { ascending: false });
  return data;
}
```

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- Check the [seed-supabase.ts](./seed-supabase.ts) script for implementation details
