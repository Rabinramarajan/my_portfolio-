import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { environment } from '../src/environments/environment.development';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies?: string[];
  featured?: boolean;
  status: string;
  createdAt: string;
  [key: string]: any;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featured?: boolean;
  [key: string]: any;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  accent?: string;
  [key: string]: any;
}

// Initialize Supabase client
const supabaseUrl = environment.supabase.url || '';
const supabaseKey = environment.supabase.key || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dataDir = path.join(__dirname, '../src/assets/data');

// Logging utilities
const log = {
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
};

async function seedProjects() {
  try {
    log.info('Seeding projects...');
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8'));
    const projects: Project[] = data.items;

    // Insert projects
    const { error: projectError } = await supabase.from('projects').insert(
      projects.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        technologies: p.technologies,
        featured: p.featured,
        status: p.status,
        created_at: p.createdAt,
        data: p, // Store full object as JSON
      })),
    );

    if (projectError) throw projectError;
    log.success(`Seeded ${projects.length} projects`);
  } catch (err) {
    log.error(`Failed to seed projects: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function seedBlogs() {
  try {
    log.info('Seeding blog posts...');
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'blogs.json'), 'utf-8'));
    const posts: BlogPost[] = data.posts;

    const { error: blogError } = await supabase.from('blog_posts').insert(
      posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        author: p.author,
        published_date: p.date,
        featured: p.featured,
        data: p, // Store full object as JSON
      })),
    );

    if (blogError) throw blogError;
    log.success(`Seeded ${posts.length} blog posts`);
  } catch (err) {
    log.error(`Failed to seed blogs: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function seedSkills() {
  try {
    log.info('Seeding skills...');
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills.json'), 'utf-8'));

    // Flatten skills from categories
    const allSkills: Skill[] = [];
    data.categories.forEach((cat: any) => {
      cat.skills.forEach((skill: any) => {
        allSkills.push({
          ...skill,
          category: cat.id,
        });
      });
    });

    const { error: skillError } = await supabase.from('skills').insert(
      allSkills.map((s) => ({
        id: s.id,
        name: s.name,
        level: s.level,
        category: s['category'],
        accent: s.accent,
        data: s, // Store full object as JSON
      })),
    );

    if (skillError) throw skillError;
    log.success(`Seeded ${allSkills.length} skills`);
  } catch (err) {
    log.error(`Failed to seed skills: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function seedOtherData() {
  try {
    log.info('Seeding other data files...');

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      if (['projects.json', 'blogs.json', 'skills.json'].includes(file)) continue;

      const tableName = file.replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));

      try {
        const { error } = await supabase.from(tableName).insert([{ data }]);

        if (error) {
          if (error.code === 'PGRST116') {
            log.warn(`Table '${tableName}' doesn't exist yet. Skipping...`);
          } else {
            throw error;
          }
        } else {
          log.success(`Seeded ${tableName}`);
        }
      } catch (err) {
        log.warn(`Skipped ${tableName}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    log.error(`Error processing data files: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  console.log('🌱 Starting Supabase seed...\n');

  try {
    // Test connection
    const { error: connError } = await supabase.auth.getSession();
    if (connError) log.warn(`Connection test result: ${connError.message}`);

    await seedProjects();
    await seedBlogs();
    await seedSkills();
    await seedOtherData();

    console.log('\n🎉 Seed complete!');
  } catch (err) {
    log.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
