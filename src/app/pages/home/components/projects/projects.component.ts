import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { MagneticButtonDirective, ScrollTriggerDirective } from '../../../../shared/directives';
import type { ProjectItem } from '../../../../shared/types/portfolio-data.types';

/** Normalized card model so featured + grid projects render identically. */
interface ProjectCard {
  name: string;
  slug: string;
  category: string;
  description: string;
  tags: string[];
  image?: string;
  alt: string;
  liveUrl?: string;
  codeUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
}

interface ProcessStep {
  no: string;
  title: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollTriggerDirective, MagneticButtonDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  protected readonly pds = inject(PortfolioDataService);

  protected readonly activeCategory = signal<string>('All Projects');
  protected readonly sortBy = signal<'latest' | 'featured' | 'name'>('latest');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly sortOpen = signal(false);

  /** Slugs whose cover image failed to load → fall back to gradient placeholder. */
  private readonly failedImages = signal<Set<string>>(new Set());
  protected imgOk(slug: string): boolean {
    return !this.failedImages().has(slug);
  }
  protected onImgError(slug: string): void {
    this.failedImages.update((s) => new Set(s).add(slug));
  }
  /** Deterministic hue from a slug so each placeholder gets a stable color. */
  protected hueFor(slug: string): number {
    let h = 0;
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360;
    return h;
  }

  private readonly normalize = (p: ProjectItem, featured: boolean): ProjectCard => ({
    name: p.name ?? p.title,
    slug: p.slug,
    category: p.category ?? 'Web Applications',
    description: p.description,
    tags: p.tags ?? p.technologies ?? [],
    image: p.image ?? p.thumbnail,
    alt: p.alt ?? p.name ?? p.title,
    liveUrl: p.links?.live ?? p.link ?? p.demo,
    codeUrl: p.links?.github ?? p.github,
    caseStudyUrl: p.slug ? `/projects/${p.slug}` : undefined,
    featured,
  });

  /** All projects flattened into one normalized list. */
  protected readonly allProjects = computed<ProjectCard[]>(() => {
    const data = this.pds.projects();
    if (!data) return [];
    const featured = (data.featured ?? []).map((p) => this.normalize(p, true));
    const grid = (data.grid ?? []).map((p) => this.normalize(p, false));
    return [...featured, ...grid];
  });

  /** Category tabs: "All Projects" + unique categories present in the data. */
  protected readonly categories = computed<string[]>(() => {
    const cats = new Set<string>();
    this.allProjects().forEach((p) => cats.add(p.category));
    return ['All Projects', ...Array.from(cats)];
  });

  protected readonly filteredProjects = computed<ProjectCard[]>(() => {
    const cat = this.activeCategory();
    let list = this.allProjects();
    if (cat !== 'All Projects') {
      list = list.filter((p) => p.category === cat);
    }
    const sort = this.sortBy();
    if (sort === 'featured') {
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    } else if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  });

  protected readonly stats = computed(() => this.pds.hero()?.stats ?? []);

  protected readonly steps: ProcessStep[] = [
    { no: '01', title: 'Discover', desc: 'Understanding requirements', icon: 'search' },
    { no: '02', title: 'Plan', desc: 'Architecture and strategy', icon: 'doc' },
    { no: '03', title: 'Design', desc: 'User-friendly and modern UI', icon: 'pen' },
    { no: '04', title: 'Develop', desc: 'Scalable and efficient code', icon: 'code' },
    { no: '05', title: 'Test', desc: 'Quality and performance', icon: 'check' },
    { no: '06', title: 'Deploy', desc: 'Launch and continuous support', icon: 'rocket' },
  ];

  protected setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  protected setSort(sort: 'latest' | 'featured' | 'name'): void {
    this.sortBy.set(sort);
    this.sortOpen.set(false);
  }

  protected sortLabel(): string {
    return { latest: 'Latest', featured: 'Featured', name: 'Name' }[this.sortBy()];
  }

  protected toggleSort(): void {
    this.sortOpen.update((v) => !v);
  }

  protected setView(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
