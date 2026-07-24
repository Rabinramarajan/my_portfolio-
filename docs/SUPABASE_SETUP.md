# Supabase Integration Guide

This guide explains how to set up and use Supabase with your Angular 22 portfolio for backend services like authentication, real-time data, and file storage.

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: your-project-name
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (~2 minutes)

### 2. Get Your Credentials

1. Go to **Project Settings > API**
2. Copy:
   - **Project URL** (e.g., `https://YOUR_PROJECT_ID.supabase.co`)
   - **Anon Public Key** (starts with `sb_publishable_...`)

### 3. Configure Environment Variables

Create or update `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YOUR_KEY_HERE
```

**Note**: The `anon` key is safe to commit and expose in frontend code. It's specifically designed for client-side use.

### 4. Update Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  dataBasePath: 'assets/data',
  emailjs: {/* ... */},
  supabase: {
    url: 'https://your-project-id.supabase.co',
    key: 'sb_publishable_YOUR_KEY_HERE',
  },
} as const;
```

## Using the SupabaseService

### Basic Setup

Inject `SupabaseService` into your components:

```typescript
import { SupabaseService } from '../../core/services';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `...`,
})
export class ExampleComponent {
  private supabase = inject(SupabaseService);
}
```

### Reading Data (with Reactive Signals)

Fetch all records from a table and get a reactive signal:

```typescript
export class ProjectListComponent {
  private supabase = inject(SupabaseService);

  protected projectsTable = this.supabase.table<Project>('projects', {
    order: 'created_at',
    ascending: false,
    limit: 10,
  });

  // Use in template:
  // <div *ngIf="projectsTable.loading()">Loading...</div>
  // <div *ngIf="projectsTable.error()">Error: {{ projectsTable.error().message }}</div>
  // <app-project-card *ngFor="let p of projectsTable.data()" [project]="p" />
}
```

### Fetch Single Record

```typescript
export class ProjectDetailComponent {
  private supabase = inject(SupabaseService);

  async ngOnInit() {
    const project = await this.supabase.fetchById<Project>('projects', 123);
    // project is fully typed as Project | null
  }
}
```

### Query with Filters

```typescript
async loadUserProjects(userId: string) {
  const projects = await this.supabase.query<Project>(
    'projects',
    { owner_id: userId, published: true },
    { order: 'created_at', limit: 20 }
  );
}
```

### Create Record

```typescript
async createProject(formData: NewProject) {
  const project = await this.supabase.insert<Project>(
    'projects',
    {
      title: formData.title,
      description: formData.description,
      owner_id: this.user().id,
    }
  );

  if (project) {
    console.log('Created:', project.id);
  }
}
```

### Update Record

```typescript
async updateProject(id: number, changes: Partial<Project>) {
  const updated = await this.supabase.update<Project>(
    'projects',
    id,
    {
      title: changes.title,
      description: changes.description,
    }
  );
}
```

### Delete Record

```typescript
async deleteProject(id: number) {
  const success = await this.supabase.delete('projects', id);
  if (success) {
    this.projects.refetch(); // Reload table
  }
}
```

## Authentication

### Sign Up

```typescript
export class SignUpComponent {
  private supabase = inject(SupabaseService);

  async register(email: string, password: string) {
    const { user, error } = await this.supabase.signUp(email, password);

    if (error) {
      console.error('Signup failed:', error.message);
    } else {
      console.log('Signup successful, check your email for confirmation');
    }
  }
}
```

### Sign In

```typescript
async login(email: string, password: string) {
  const { user, error } = await this.supabase.signIn(email, password);

  if (error) {
    console.error('Login failed:', error.message);
  } else {
    this.router.navigate(['/dashboard']);
  }
}
```

### Sign Out

```typescript
async logout() {
  await this.supabase.signOut();
  this.router.navigate(['/']);
}
```

### Access Current User

Use the reactive signals to get current auth state:

```typescript
export class DashboardComponent {
  private supabase = inject(SupabaseService);

  protected user = this.supabase.user;
  protected isAuthenticated = this.supabase.isAuthenticated;
  protected authLoading = this.supabase.isLoading;
}
```

## Creating Tables in Supabase

### Via SQL Editor

Go to **SQL Editor** in Supabase dashboard:

```sql
create table projects (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  owner_id uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index projects_owner_id_idx on projects(owner_id);

-- Enable row-level security
alter table projects enable row level security;

-- Optional: Allow users to see only their own projects
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = owner_id);
```

## Type Definitions

Define types for your tables in `src/app/core/models/`:

```typescript
// src/app/core/models/project.model.ts
export interface Project {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly owner_id: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type NewProject = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
```

Then import and use:

```typescript
import type { Project } from '../../core/models';

const projectsTable = this.supabase.table<Project>('projects');
```

## Common Patterns

### Auto-refetch on Mutation

```typescript
async createComment(text: string) {
  const result = await this.supabase.insert('comments', { text });
  if (result) {
    // Refetch the comments table
    this.commentsTable.refetch();
  }
}
```

### Cache Management

Clear cached data when needed:

```typescript
// Clear all caches
this.supabase.clearCache();

// Refetch a specific table
this.projectsTable.refetch();
```

### SSR Considerations

The SupabaseService automatically checks if running in browser context. On the server:

- `fetchById()` returns `null`
- `query()` returns `[]`
- Auth operations return null/false with SSR error

This ensures your site builds without errors in SSR mode.

## Security Best Practices

1. **Never commit real credentials** — Use `.env.local` (already in `.gitignore`)
2. **Use Row Level Security (RLS)** — Control who can access what
3. **Anon key is safe to expose** — It's restricted by RLS policies
4. **Service key is secret** — Never use in frontend, only backend
5. **Validate on the server** — Don't trust frontend validation alone

### Example RLS Policy

```sql
-- Only allow users to update their own data
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

## Real-Time Data

For real-time updates, use Supabase's `realtimeListeners` (Supabase provides this via WebSocket):

```typescript
// Subscribe to table changes
this.supabaseClient
  .channel('public:projects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
    console.log('Change:', payload);
    this.projectsTable.refetch();
  })
  .subscribe();
```

## File Storage

Upload files to Supabase Storage:

```typescript
async uploadAvatar(file: File, userId: string) {
  const client = this.getClient(); // From SupabaseService
  const { data, error } = await client.storage
    .from('avatars')
    .upload(`${userId}/avatar.png`, file, { upsert: true });

  if (data) {
    const url = client.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
  }
}
```

## Troubleshooting

### "Supabase client not available (SSR context)"

This happens when calling Supabase operations during SSR. Use platform detection:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class MyComponent {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private supabase = inject(SupabaseService);

  ngOnInit() {
    if (this.isBrowser) {
      // Safe to call Supabase here
      this.supabase.fetchById('users', 123);
    }
  }
}
```

### "CORS or network error"

1. Check your URL is correct in environment
2. Verify Supabase project is running
3. Check browser console for actual error
4. Enable CORS in Supabase Settings if needed

### Types not working

Ensure types are properly exported from `src/app/core/models/index.ts`:

```typescript
export * from './project.model';
export * from './comment.model';
// etc.
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Angular Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-angular)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
