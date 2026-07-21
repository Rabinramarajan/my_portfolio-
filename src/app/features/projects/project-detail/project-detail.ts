import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataService, Project, SeoService, trackByValue } from '../../../core';
import { Icon } from '../../../shared/components/ui/icon/icon';

/** One entry in the sticky section nav under the hero. */
interface DetailTab {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

/** Project case-study detail page — the full write-up for one project, keyed by route `:slug`. */
@Component({
  selector: 'app-project-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  host: { class: 'block' },
})
export class ProjectDetailPage {
  /** Route param bound via withComponentInputBinding. */
  readonly slug = input.required<string>();

  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);
  private readonly projects = this.data.load('projects');

  private readonly items = computed<readonly Project[]>(() => this.projects.value()?.items ?? []);

  protected readonly project = computed<Project | null>(
    () => this.items().find((p) => p.id === this.slug()) ?? null,
  );

  protected readonly detail = computed(() => this.project()?.detail ?? null);

  protected readonly notFound = computed(
    () => !this.projects.isLoading() && !!this.projects.value() && this.project() === null,
  );

  /** All screenshots for the gallery; a single-image project yields one slide. */
  protected readonly gallery = computed<readonly string[]>(() => {
    const image = this.project()?.image;
    if (!image) return [];
    return typeof image === 'string' ? [image] : image;
  });

  /** Hero visual — the first screenshot. */
  protected readonly hero = computed(() => this.gallery()[0] ?? '');

  /** Sibling projects named in `detail.related`, resolved to real records. */
  protected readonly related = computed<readonly Project[]>(() => {
    const ids = this.detail()?.related ?? [];
    const all = this.items();
    const named = ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Project => !!p);
    if (named.length) return named;
    // Fall back to same-category siblings when no explicit list is authored.
    const current = this.project();
    if (!current) return [];
    return all.filter((p) => p.id !== current.id && p.category === current.category).slice(0, 3);
  });

  /** Section nav — only tabs whose section actually has content. */
  protected readonly tabs = computed<readonly DetailTab[]>(() => {
    const d = this.detail();
    const out: DetailTab[] = [{ id: 'overview', label: 'Overview', icon: 'Info' }];
    if (d?.features?.length) out.push({ id: 'features', label: 'Features', icon: 'List' });
    if (d?.stack?.length) out.push({ id: 'stack', label: 'Tech Stack', icon: 'Layers' });
    if (this.gallery().length > 1) {
      out.push({ id: 'screenshots', label: 'Screenshots', icon: 'LayoutGrid' });
    }
    if (d?.metrics?.length) out.push({ id: 'impact', label: 'Impact', icon: 'TrendingUp' });
    return out;
  });

  protected readonly activeTab = signal('overview');

  /** Index of the leading slide in the screenshot carousel. */
  protected readonly slide = signal(0);

  protected select(id: string): void {
    this.activeTab.set(id);
    if (typeof document === 'undefined') return;
    document.getElementById(`pd-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected prevSlide(): void {
    this.slide.update((i) => (i === 0 ? this.gallery().length - 1 : i - 1));
  }

  protected nextSlide(): void {
    this.slide.update((i) => (i + 1) % this.gallery().length);
  }

  protected goToSlide(i: number): void {
    this.slide.set(i);
  }

  /** Share targets — each opens the network's composer in a new tab. */
  protected shareTo(network: 'twitter' | 'linkedin'): void {
    if (typeof window === 'undefined') return;
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(this.project()?.title ?? '');
    const targets = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    } as const;
    window.open(targets[network], '_blank', 'noopener');
  }

  protected copyLink(): void {
    if (typeof location === 'undefined') return;
    navigator.clipboard?.writeText(location.href).catch(() => {});
  }

  protected readonly trackByValue = trackByValue;

  constructor() {
    effect(() => {
      const p = this.project();
      const path = `/projects/${this.slug()}`;
      if (p) {
        this.seo.apply({
          title: p.title,
          description: p.description,
          keywords: [...p.technologies],
          path,
        });
      } else if (this.notFound()) {
        this.seo.apply({ title: 'Project Not Found', path });
      }
    });
  }
}
