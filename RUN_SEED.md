# How to Run the Seed Script

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)

## Step 2: Run the Seed Script

Choose the command for your operating system:

### 🪟 Windows (PowerShell)

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_KEY = "your-anon-public-key"
npm run seed
```

**Example:**

```powershell
$env:SUPABASE_URL = "https://abc123.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
npm run seed
```

### 🪟 Windows (CMD)

```cmd
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_KEY=your-anon-public-key
npm run seed
```

**Example:**

```cmd
set SUPABASE_URL=https://abc123.supabase.co
set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
npm run seed
```

### 🍎 macOS / 🐧 Linux (Bash/Zsh)

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-public-key"
npm run seed
```

**Example:**

```bash
export SUPABASE_URL="https://abc123.supabase.co"
export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
npm run seed
```

## Step 3: Expected Output

If successful, you'll see:

```
🌱 Starting Supabase seed...

ℹ️  Seeding projects...
✅ Seeded 9 projects

ℹ️  Seeding blog posts...
✅ Seeded 7 blog posts

ℹ️  Seeding skills...
✅ Seeded 28 skills

ℹ️  Seeding other data files...
✅ Seeded about
✅ Seeded technologies
✅ Seeded contact
... (more tables)

🎉 Seed complete!
```

## Step 4: Verify in Supabase

Go to https://supabase.com/dashboard → Open your project → Table Editor

You should see all 24 tables with data!

---

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY environment variables are required"

**Solution:** Make sure you set BOTH environment variables before running npm run seed

Check they're set:

- **PowerShell:** `$env:SUPABASE_URL` and `$env:SUPABASE_KEY`
- **CMD:** `echo %SUPABASE_URL%` and `echo %SUPABASE_KEY%`
- **Bash:** `echo $SUPABASE_URL` and `echo $SUPABASE_KEY`

### Error: "Cannot find module"

**Solution:** Run `npm install` first

```bash
npm install
npm run seed
```

### Tables don't appear in Supabase

**Solution:**

1. Make sure you ran all 4 SQL migrations first (001-004)
2. Check Supabase SQL Editor for any errors
3. Run seed script again

---

## Optional: Use .env.local File

If you want to store credentials in a file instead of typing them each time:

1. Create `.env.local` in project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

2. Install dotenv:

```bash
npm install --save-dev dotenv
```

3. Run with Node's require:

```bash
node -r dotenv/config scripts/seed-supabase.ts
```

Or update npm script in package.json:

```json
"seed": "node -r dotenv/config -r ts-node/esm scripts/seed-supabase.ts"
```

---

## Need Help?

- Check that SUPABASE_URL starts with `https://`
- Check that SUPABASE_KEY is the "anon public" key, not the service role key
- Make sure you ran the SQL migrations before seeding
- Check the seed script output for specific error messages

**All set!** Your data is now in Supabase. 🚀
