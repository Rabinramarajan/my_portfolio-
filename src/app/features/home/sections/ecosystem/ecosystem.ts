import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { CATEGORY_DESCRIPTIONS } from '../../../../core/config/portfolio.content';
import type { EcosystemCategory } from '../../../../core/models/portfolio.models';

interface SkillItem {
  id: string;
  name: string;
  category: EcosystemCategory;
  description?: string;
  experience?: string;
  features?: readonly string[];
  primary: boolean;
  relatedProjects?: readonly string[];
}

interface CategoryGroup {
  category: EcosystemCategory;
  skills: SkillItem[];
}

/**
 * Premium editorial engineering stack section.
 * Replaces the constellation design with a grid-based, content-focused layout.
 */
@Component({
  selector: 'app-ecosystem',
  templateUrl: './ecosystem.html',
  styleUrl: './ecosystem.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Ecosystem {
  private readonly store = inject(PortfolioStore);

  protected readonly sections = this.store.sections;
  protected readonly CATEGORIES: readonly EcosystemCategory[] = [
    'Frontend',
    'Mobile',
    'Backend',
    'Data',
    'Design',
    'Testing',
    'Tools',
  ];

  protected readonly activeCategory = signal<EcosystemCategory | null>(null);
  protected readonly selectedTech = signal<SkillItem | null>(null);

  // Skills data
  private readonly allSkills: SkillItem[] = [
    // Core Stack
    {
      id: 'angular',
      name: 'Angular',
      category: 'Frontend',
      description: 'Modern TypeScript framework for scalable web applications',
      experience: '4+',
      features: ['Signals', 'Standalone Components', 'Zoneless', 'SSR'],
      primary: true,
      relatedProjects: ['fiji-immigration-internal', 'prims-member-portal'],
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'Frontend',
      description: 'Type-safe JavaScript for robust development',
      experience: '4+',
      primary: true,
    },
    {
      id: 'signals',
      name: 'Signals',
      category: 'Frontend',
      description: 'Fine-grained reactivity for Angular',
      experience: '1+',
      primary: true,
    },
    {
      id: 'rxjs',
      name: 'RxJS',
      category: 'Frontend',
      description: 'Reactive programming for async operations',
      experience: '3+',
      primary: true,
    },

    // Frontend Extended
    {
      id: 'html5',
      name: 'HTML5',
      category: 'Frontend',
      experience: '4+',
      primary: false,
    },
    {
      id: 'css3',
      name: 'CSS3',
      category: 'Frontend',
      experience: '4+',
      primary: false,
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      category: 'Frontend',
      experience: '3+',
      primary: false,
    },
    {
      id: 'sass',
      name: 'Sass',
      category: 'Frontend',
      experience: '3+',
      primary: false,
    },

    // Mobile
    {
      id: 'ionic',
      name: 'Ionic',
      category: 'Mobile',
      experience: '2+',
      primary: false,
      relatedProjects: ['insuremet'],
    },
    {
      id: 'capacitor',
      name: 'Capacitor',
      category: 'Mobile',
      experience: '2+',
      primary: false,
    },
    {
      id: 'flutter',
      name: 'Flutter',
      category: 'Mobile',
      primary: false,
    },
    {
      id: 'pwa',
      name: 'PWA',
      category: 'Mobile',
      primary: false,
    },

    // Backend
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'Backend',
      experience: '3+',
      primary: false,
    },
    {
      id: 'express',
      name: 'Express.js',
      category: 'Backend',
      experience: '2+',
      primary: false,
    },
    {
      id: 'rest-api',
      name: 'REST APIs',
      category: 'Backend',
      primary: false,
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      category: 'Backend',
      primary: false,
    },

    // Data
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'Data',
      experience: '2+',
      primary: false,
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'Data',
      primary: false,
    },
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'Data',
      experience: '1+',
      primary: false,
    },
    {
      id: 'prisma',
      name: 'Prisma',
      category: 'Data',
      primary: false,
    },

    // Design
    {
      id: 'figma',
      name: 'Figma',
      category: 'Design',
      experience: '3+',
      primary: false,
    },
    {
      id: 'adobe-xd',
      name: 'Adobe XD',
      category: 'Design',
      primary: false,
    },
    {
      id: 'photoshop',
      name: 'Photoshop',
      category: 'Design',
      primary: false,
    },

    // Testing
    {
      id: 'playwright',
      name: 'Playwright',
      category: 'Testing',
      experience: '2+',
      primary: false,
      relatedProjects: ['fiji-immigration-internal'],
    },
    {
      id: 'jest',
      name: 'Jest',
      category: 'Testing',
      experience: '2+',
      primary: false,
    },
    {
      id: 'e2e-testing',
      name: 'E2E Testing',
      category: 'Testing',
      primary: false,
    },

    // Tools
    {
      id: 'git',
      name: 'Git',
      category: 'Tools',
      experience: '4+',
      primary: false,
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'Tools',
      experience: '4+',
      primary: false,
    },
    {
      id: 'vscode',
      name: 'VS Code',
      category: 'Tools',
      primary: false,
    },
    {
      id: 'eslint',
      name: 'ESLint',
      category: 'Tools',
      experience: '3+',
      primary: false,
    },
  ];

  protected readonly categorizedSkills = computed<CategoryGroup[]>(() => {
    const activeCat = this.activeCategory();
    const skills = activeCat
      ? this.allSkills.filter((s) => s.category === activeCat)
      : this.allSkills;

    // Group by category
    const groups = new Map<EcosystemCategory, SkillItem[]>();
    for (const skill of skills) {
      const list = groups.get(skill.category) ?? [];
      list.push(skill);
      groups.set(skill.category, list);
    }

    // Return in category order
    const result: CategoryGroup[] = [];
    for (const cat of this.CATEGORIES) {
      const skillsInCat = groups.get(cat);
      if (skillsInCat) {
        // Sort: primary first, then by name
        skillsInCat.sort((a, b) => {
          if (a.primary !== b.primary) return a.primary ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        result.push({ category: cat, skills: skillsInCat });
      }
    }

    return result;
  });

  protected getCategoryDescription(category: EcosystemCategory): string {
    const desc = CATEGORY_DESCRIPTIONS.find((d) => d.category === category);
    return desc?.description ?? '';
  }

  protected getProjectsBySkill(skillId: string): any[] {
    const skill = this.allSkills.find((s) => s.id === skillId);
    if (!skill?.relatedProjects?.length) return [];
    const projects = this.store.projects();
    return skill.relatedProjects
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter((p): p is any => p !== undefined);
  }

  protected padZero(num: number): string {
    return String(num).padStart(2, '0');
  }

  protected onCategorySelect(category: EcosystemCategory | null): void {
    this.activeCategory.set(category);
    this.selectedTech.set(null);
  }

  protected onTechSelect(tech: SkillItem | null): void {
    this.selectedTech.set(this.selectedTech() === tech ? null : tech);
  }
}
