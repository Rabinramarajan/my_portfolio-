import { Component, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  protected readonly pds = inject(PortfolioDataService);

  constructor() {
    // Per-project SEO: dynamic title + meta description.
    effect(() => {
      const p = this.project();
      if (!p) {
        this.title.setTitle('Project not found | Rabin R');
        return;
      }
      const pageTitle = `${p.name} — Case Study | Rabin R`;
      const desc = p.description ?? '';
      this.title.setTitle(pageTitle);
      this.meta.updateTag({ name: 'description', content: desc });
      this.meta.updateTag({ property: 'og:title', content: pageTitle });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
    });
  }

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  // All projects (featured + grid) as one flat list.
  private readonly allProjects = computed(() => {
    const p = this.pds.projects();
    return [p?.featured, ...(p?.grid ?? [])].filter(Boolean) as any[];
  });

  protected readonly project = computed(() => {
    const slug = this.params().get('slug');
    return this.allProjects().find((p) => p.slug === slug) ?? null;
  });

  // Split highlights (stored as a comma-joined string) into a list.
  protected readonly highlights = computed<string[]>(() => {
    const h = this.project()?.highlights;
    if (!h) return [];
    return String(h).split(',').map((s) => s.trim()).filter(Boolean);
  });

  protected readonly related = computed(() => {
    const current = this.project();
    return this.allProjects()
      .filter((p) => p.slug && p.slug !== current?.slug)
      .slice(0, 2);
  });
}
