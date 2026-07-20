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

import {
  DataService,
  KnowledgeCategoryMeta,
  KnowledgeEntry,
  SeoService,
  accentVar,
} from '../../../core';
import { GlassCard, Stagger } from '../../../shared';
import { CodeBlock } from '../../../shared/components/ui/code-block/code-block';
import { Icon } from '../../../shared/components/ui/icon/icon';

interface TocItem {
  readonly id: string;
  readonly label: string;
}

/** Knowledge Hub detail — the full write-up for one entry, keyed by route `:slug`. */
@Component({
  selector: 'app-knowledge-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, GlassCard, CodeBlock, Stagger],
  templateUrl: './knowledge-detail.html',
  styleUrl: './knowledge-detail.scss',
  host: { class: 'block' },
})
export class KnowledgeDetailPage {
  /** Route param bound via withComponentInputBinding. */
  readonly slug = input.required<string>();

  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);
  private readonly knowledge = this.data.load('knowledge');
  private readonly profileResource = this.data.load('profile');

  protected readonly author = computed(() => {
    const p = this.profileResource.value();
    return { name: p?.name ?? 'Rabin R', avatar: p?.avatar ?? 'assets/images/profile-avatar.webp' };
  });

  /** All entries, newest first — drives related + prev/next. */
  private readonly entries = computed<readonly KnowledgeEntry[]>(() => {
    const list = [...(this.knowledge.value()?.entries ?? [])];
    return list.sort((a, b) => b.date.localeCompare(a.date));
  });

  protected readonly entry = computed<KnowledgeEntry | null>(
    () => this.entries().find((e) => e.slug === this.slug()) ?? null,
  );

  protected readonly meta = computed<KnowledgeCategoryMeta | null>(() => {
    const entry = this.entry();
    const cfg = this.knowledge.value();
    if (!entry || !cfg) return null;
    return cfg.categories.find((c) => c.key === entry.category) ?? null;
  });

  protected readonly accent = computed(() =>
    accentVar(this.entry()?.accent ?? this.meta()?.accent ?? 'purple'),
  );

  /** Table of contents built from section headings (plus a leading Introduction). */
  protected readonly toc = computed<readonly TocItem[]>(() => {
    const e = this.entry();
    if (!e) return [];
    const items: TocItem[] = [];
    e.body.forEach((s, i) => {
      const label = s.heading ?? (i === 0 ? 'Introduction' : '');
      if (label) items.push({ id: this.sectionId(label, i), label });
    });
    return items;
  });

  protected readonly related = computed<readonly KnowledgeEntry[]>(() => {
    const e = this.entry();
    if (!e) return [];
    const sameCat = this.entries().filter((x) => x.id !== e.id && x.category === e.category);
    const pool = sameCat.length ? sameCat : this.entries().filter((x) => x.id !== e.id);
    return pool.slice(0, 4);
  });

  private readonly index = computed(() => this.entries().findIndex((e) => e.slug === this.slug()));
  protected readonly prev = computed<KnowledgeEntry | null>(() => {
    const i = this.index();
    return i > 0 ? this.entries()[i - 1] : null;
  });
  protected readonly next = computed<KnowledgeEntry | null>(() => {
    const i = this.index();
    const list = this.entries();
    return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  });

  protected readonly notFound = computed(
    () => !this.knowledge.isLoading() && !!this.knowledge.value() && this.entry() === null,
  );

  // ── Local, non-persisted UI state ───────────────────
  protected readonly bookmarked = signal(false);
  protected readonly rating = signal(0);
  protected readonly rated = signal(false);

  protected toggleBookmark(): void {
    this.bookmarked.update((b) => !b);
  }

  protected rate(stars: number): void {
    this.rating.set(stars);
    this.rated.set(true);
  }

  protected share(): void {
    if (typeof navigator === 'undefined') return;
    const url = typeof location !== 'undefined' ? location.href : '';
    const title = this.entry()?.title ?? 'Knowledge Hub';
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  protected metaFor(entry: KnowledgeEntry): KnowledgeCategoryMeta | null {
    return this.knowledge.value()?.categories.find((c) => c.key === entry.category) ?? null;
  }

  protected accentFor(entry: KnowledgeEntry): string {
    return accentVar(entry.accent ?? this.metaFor(entry)?.accent ?? 'purple');
  }

  protected iconFor(entry: KnowledgeEntry): string {
    return this.metaFor(entry)?.icon ?? 'BookOpen';
  }

  /** Deterministic anchor id for a section, e.g. "Core Concepts" → "sec-2-core-concepts". */
  protected sectionId(label: string, index: number): string {
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `sec-${index}-${slug}`;
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  constructor() {
    // The `knowledge/:slug` route carries only a generic title; refresh the SEO
    // tags from the loaded entry, mirroring the case-study detail page.
    effect(() => {
      const entry = this.entry();
      const path = `/knowledge/${this.slug()}`;
      if (entry) {
        this.seo.apply({
          title: entry.title,
          description: entry.summary,
          keywords: entry.tags,
          path,
        });
      } else if (this.notFound()) {
        this.seo.apply({ title: 'Note Not Found', path });
      }
    });
  }
}
