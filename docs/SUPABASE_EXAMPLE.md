# Supabase Integration Examples

Practical examples of how to use the SupabaseService in your Angular 22 portfolio.

## Example 1: Display a List of Projects with Real-Time Updates

### Component

```typescriptD
import { Component, OnInit, inject } from '@angular/core';
import { SupabaseService } from '../../core/services';
import { CommonModule } from '@angular/common';

interface Project {
  id: number;
  title: string;
  description: string;
  featured: boolean;
  created_at: string;
}

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="projects-container">
      <div *ngIf="projects.loading()" class="loading">Loading projects...</div>

      <div *ngIf="projects.error()" class="error">
        Error: {{ projects.error().message }}
        <button (click)="projects.refetch()">Retry</button>
      </div>

      <div *ngIf="!projects.loading() && projects.data().length === 0" class="empty">
        No projects found.
      </div>

      <div class="projects-grid">
        <article *ngFor="let project of projects.data()" class="project-card">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <span *ngIf="project.featured" class="badge">Featured</span>
          <time>{{ project.created_at | date }}</time>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .project-card {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
      }
    `,
  ],
})
export class ProjectsListComponent implements OnInit {
  private supabase = inject(SupabaseService);

  protected projects = this.supabase.table<Project>('projects', {
    order: 'created_at',
    ascending: false,
    limit: 12,
  });

  ngOnInit() {
    // Optional: Refresh on interval
    // setInterval(() => this.projects.refetch(), 30000);
  }
}
```

## Example 2: Create a New Project Form

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services';

interface NewProject {
  title: string;
  description: string;
  featured: boolean;
}

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <label>Project Title</label>
        <input type="text" [(ngModel)]="form.title" name="title" required />
      </div>

      <div>
        <label>Description</label>
        <textarea [(ngModel)]="form.description" name="description"></textarea>
      </div>

      <label>
        <input type="checkbox" [(ngModel)]="form.featured" name="featured" />
        Mark as featured
      </label>

      <button type="submit" [disabled]="isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create Project' }}
      </button>

      <div *ngIf="successMessage" class="success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="error">
        {{ errorMessage }}
      </div>
    </form>
  `,
})
export class CreateProjectComponent {
  private supabase = inject(SupabaseService);

  form: NewProject = {
    title: '',
    description: '',
    featured: false,
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  async onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.supabase.insert('projects', this.form);

      if (result) {
        this.successMessage = 'Project created successfully!';
        this.form = { title: '', description: '', featured: false };

        // Could emit event or navigate here
        // this.router.navigate(['/projects', result.id]);
      }
    } catch (err) {
      this.errorMessage = 'Failed to create project. Please try again.';
      console.error(err);
    } finally {
      this.isSubmitting = false;
    }
  }
}
```

## Example 3: User Authentication Flow

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ isSignUp ? 'Sign Up' : 'Sign In' }}</h1>

        <form (ngSubmit)="onSubmit()">
          <div>
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>

          <div>
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>

          <button [disabled]="isLoading">
            {{ isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In' }}
          </button>
        </form>

        <button class="toggle-link" (click)="toggleMode()">
          {{ isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
        </button>

        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="message" class="success">{{ message }}</div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = '';
  password = '';
  isSignUp = false;
  isLoading = false;
  error = '';
  message = '';

  async onSubmit() {
    this.error = '';
    this.message = '';
    this.isLoading = true;

    try {
      let result;

      if (this.isSignUp) {
        result = await this.supabase.signUp(this.email, this.password);
        if (result.error) {
          this.error = result.error.message;
        } else {
          this.message = 'Sign up successful! Check your email to confirm.';
        }
      } else {
        result = await this.supabase.signIn(this.email, this.password);
        if (result.error) {
          this.error = result.error.message;
        } else {
          this.message = 'Login successful!';
          // Navigate after brief delay so user sees message
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.error = '';
    this.message = '';
  }
}
```

## Example 4: Protected Route Guard

Use Supabase auth state to protect routes:

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.supabase.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

Use in routing:

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  // ... other routes
];
```

## Example 5: Edit/Update a Record

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services';

interface Project {
  id: number;
  title: string;
  description: string;
  featured: boolean;
}

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div *ngIf="loading" class="loading">Loading project...</div>

    <form (ngSubmit)="onSave()" *ngIf="!loading && project">
      <div>
        <label>Title</label>
        <input type="text" [(ngModel)]="project.title" name="title" required />
      </div>

      <div>
        <label>Description</label>
        <textarea [(ngModel)]="project.description" name="description"></textarea>
      </div>

      <label>
        <input type="checkbox" [(ngModel)]="project.featured" name="featured" />
        Featured
      </label>

      <button type="submit" [disabled]="isSaving">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>

      <button type="button" (click)="onDelete()" [disabled]="isDeleting">
        {{ isDeleting ? 'Deleting...' : 'Delete Project' }}
      </button>

      <div *ngIf="message" class="success">{{ message }}</div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </form>
  `,
})
export class EditProjectComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  project: Project | null = null;
  loading = true;
  isSaving = false;
  isDeleting = false;
  message = '';
  error = '';

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.project = await this.supabase.fetchById<Project>('projects', parseInt(id));
      this.loading = false;
    }
  }

  async onSave() {
    if (!this.project) return;

    this.isSaving = true;
    this.error = '';
    this.message = '';

    try {
      const updated = await this.supabase.update<Project>('projects', this.project.id, {
        title: this.project.title,
        description: this.project.description,
        featured: this.project.featured,
      });

      if (updated) {
        this.message = 'Project updated successfully!';
        this.project = updated;
      }
    } catch (err) {
      this.error = 'Failed to update project.';
      console.error(err);
    } finally {
      this.isSaving = false;
    }
  }

  async onDelete() {
    if (!this.project || !confirm('Are you sure?')) return;

    this.isDeleting = true;
    this.error = '';

    try {
      const success = await this.supabase.delete('projects', this.project.id);
      if (success) {
        this.message = 'Project deleted!';
        // Navigate away after deletion
        // this.router.navigate(['/projects']);
      }
    } catch (err) {
      this.error = 'Failed to delete project.';
      console.error(err);
    } finally {
      this.isDeleting = false;
    }
  }
}
```

## Example 6: User Profile with Context Guard

Ensure data belongs to current user:

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

@Component({...})
export class ProfileComponent implements OnInit {
  private supabase = inject(SupabaseService);

  profile: UserProfile | null = null;

  async ngOnInit() {
    const user = this.supabase.user();
    if (user) {
      this.profile = await this.supabase.fetchById<UserProfile>(
        'profiles',
        user.id
      );
    }
  }

  async updateProfile(updates: Partial<UserProfile>) {
    const user = this.supabase.user();
    if (!user || !this.profile) return;

    // Only allow updating own profile
    const updated = await this.supabase.update<UserProfile>(
      'profiles',
      user.id,
      updates
    );

    if (updated) {
      this.profile = updated;
    }
  }
}
```

## Common Patterns to Avoid

❌ **Don't**: Bypass Supabase auth for access control

```typescript
// BAD: Trusts user input
if (userId === currentUser.id) {
  /* allow */
}
```

✅ **Do**: Use RLS policies in Supabase

```sql
-- GOOD: Server-side enforcement
create policy "Users see own data"
  on profiles for select
  using (auth.uid() = id);
```

❌ **Don't**: Fetch all records without pagination

```typescript
const all = await supabase.query('items', {}); // Could be millions!
```

✅ **Do**: Paginate for performance

```typescript
const items = await supabase.query('items', {}, { limit: 20, offset: 0 });
```

❌ **Don't**: Ignore errors

```typescript
await supabase.insert('items', data); // What if it fails?
```

✅ **Do**: Handle errors properly

```typescript
const result = await supabase.insert('items', data);
if (!result) {
  console.error('Insert failed');
  showErrorToUser();
}
```
