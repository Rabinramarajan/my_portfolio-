import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, Project, trackById } from '../../core';
import { PageLayout, GlassCard, ProjectCard, AnimatedButton, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';


type StatusFilter = 'all' | 'finished' | 'upcoming';
const SORTS = ['Latest', 'Oldest', 'Featured', 'A–Z'] as const;
type SortOption = (typeof SORTS)[number];

/** Projects page — two-column Finished / Upcoming showcase. */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, PageLayout, GlassCard, ProjectCard, AnimatedButton, Stagger],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  host: { class: 'block' },
})
export class ProjectsPage {
  private readonly data = inject(DataService);

  protected readonly projects = this.data.load('projects');

  protected readonly filter = signal<StatusFilter>('all');
  protected readonly sort = signal<SortOption>('Latest');
  protected readonly sortOptions = SORTS;

  private readonly items = computed<readonly Project[]>(() => this.projects.value()?.items ?? []);

  protected readonly finished = computed<readonly Project[]>(() =>
    this.applySort(this.items().filter((p) => p.status === 'finished')),
  );
  protected readonly upcoming = computed<readonly Project[]>(() =>
    this.applySort(this.items().filter((p) => p.status === 'upcoming')),
  );

  protected readonly totalCount = computed(() => this.items().length);
  protected readonly finishedCount = computed(() => this.finished().length);
  protected readonly upcomingCount = computed(() => this.upcoming().length);

  protected readonly showFinished = computed(() => this.filter() !== 'upcoming');
  protected readonly showUpcoming = computed(() => this.filter() !== 'finished');

  protected readonly trackById = trackById;

  protected setFilter(value: StatusFilter): void {
    this.filter.set(value);
  }

  protected setSort(value: string): void {
    this.sort.set(value as SortOption);
  }

  private applySort(items: readonly Project[]): Project[] {
    const list = [...items];
    switch (this.sort()) {
      case 'Latest':
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'Oldest':
        return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      case 'Featured':
        return list.sort((a, b) => Number(b.featured) - Number(a.featured));
      case 'A–Z':
        return list.sort((a, b) => a.title.localeCompare(b.title));
    }
  }
}
