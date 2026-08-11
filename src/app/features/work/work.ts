import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SITE_SETTINGS, SITE_URL } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { ProjectCard } from '../../shared/components/project-card/project-card';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { Seo } from '../../core/services/seo';
import { breadcrumbSchema } from '../../core/services/structured-data';
import type { ProjectCategory } from '../../core/models/portfolio.models';

@Component({
  selector: 'app-work',
  imports: [SectionHeader, ProjectCard],
  templateUrl: './work.html',
  styleUrl: './work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Work {
  private readonly store = inject(PortfolioStore);
  private readonly seo = inject(Seo);

  protected readonly sections = this.store.sections;
  protected readonly uiCopy = this.store.uiCopy;
  protected readonly filter = signal<ProjectCategory | 'All'>('All');

  protected readonly categories = computed<readonly (ProjectCategory | 'All')[]>(() => [
    'All',
    ...new Set(this.store.projects().map((project) => project.category)),
  ]);

  protected readonly projects = computed(() => {
    const category = this.filter();
    const all = this.store.projects();
    return category === 'All' ? all : all.filter((project) => project.category === category);
  });

  constructor() {
    this.seo.apply({
      title: SITE_SETTINGS.seo.workTitle,
      description: SITE_SETTINGS.seo.workDescription,
      path: '/work',
    });
    this.seo.setStructuredData(
      breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Work', url: `${SITE_URL}/work` },
      ]),
    );
  }

  protected label(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
