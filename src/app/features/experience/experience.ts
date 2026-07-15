import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, FilterTabs, GlassCard, ProgressBar, QuoteCard, StatsCard, Timeline, TimelineItem, ExperienceCard, Footer } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';


const ALL = 'All Experience';

/** Experience page (design 1) — filterable timeline, highlights, evolution. */
@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Icon,
    PageLayout,
    FilterTabs,
    GlassCard,
    ProgressBar,
    QuoteCard,
    StatsCard,
    Timeline,
    TimelineItem,
    ExperienceCard,
    Footer,
  ],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  host: { class: 'block' },
})
export class ExperiencePage {
  private readonly data = inject(DataService);

  protected readonly experience = this.data.load('experience');
  protected readonly stats = this.data.load('stats');

  protected readonly filter = signal(ALL);
  protected readonly filters = computed<readonly string[]>(() => [
    ALL,
    ...new Set((this.experience.value()?.timeline ?? []).map((e) => e.employmentType)),
  ]);

  protected readonly timeline = computed(() => {
    const items = this.experience.value()?.timeline ?? [];
    const active = this.filter();
    return active === ALL ? items : items.filter((e) => e.employmentType === active);
  });

  protected readonly experienceStats = computed(() => this.stats.value()?.['experience'] ?? []);

  protected readonly trackById = trackById;
}
