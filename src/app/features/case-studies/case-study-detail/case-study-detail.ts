import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, SeoService } from '../../../core';
import { GlassCard, Stagger } from '../../../shared';
import { Icon } from '../../../shared/components/ui/icon/icon';

/** Case Study detail — full narrative for a single project, keyed by route `:id`. */
@Component({
  selector: 'app-case-study-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, GlassCard, Stagger],
  templateUrl: './case-study-detail.html',
  styleUrl: './case-study-detail.scss',
  host: { class: 'block' },
})
export class CaseStudyDetailPage {
  /** Route param bound via withComponentInputBinding. */
  readonly id = input.required<string>();

  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);
  private readonly caseStudies = this.data.load('case-studies');

  /** The matching case study, or null while loading / if not found. */
  protected readonly study = computed(() => {
    const cfg = this.caseStudies.value();
    if (!cfg) return null;
    return cfg.items.find((c) => c.id === this.id()) ?? null;
  });

  /** True once data has loaded but no match exists. */
  protected readonly notFound = computed(
    () => !this.caseStudies.isLoading() && !!this.caseStudies.value() && this.study() === null,
  );

  constructor() {
    // The `case-studies/:id` route carries only a generic static title and no
    // meta `data`, so refresh title + description/keywords/image from the loaded
    // study — otherwise the previous page's SEO tags persist on this route.
    effect(() => {
      const study = this.study();
      const path = `/case-studies/${this.id()}`;
      if (study) {
        this.seo.apply({
          title: study.title,
          description: study.tagline,
          keywords: study.technologies,
          image: study.images[0],
          path,
        });
      } else if (this.notFound()) {
        this.seo.apply({ title: 'Case Study Not Found', path });
      }
    });
  }
}
