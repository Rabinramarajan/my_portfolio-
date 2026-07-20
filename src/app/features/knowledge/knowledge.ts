import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  DataService,
  KnowledgeCategory,
  KnowledgeCategoryMeta,
  KnowledgeEntry,
  accentVar,
  trackById,
} from '../../core';
import { GlassCard, PageLayout, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

type CategoryFilter = KnowledgeCategory | 'all';

/**
 * Knowledge Hub — a filterable, searchable library of tips, snippets, notes and
 * write-ups. Content is JSON-driven via {@link DataService}; this component only
 * owns the category filter and free-text search, both held as signals so the
 * derived, filtered list is a single {@link computed}.
 */
@Component({
  selector: 'app-knowledge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './knowledge.html',
  styleUrl: './knowledge.scss',
  host: { class: 'block' },
})
export class KnowledgePage {
  private readonly data = inject(DataService);
  private readonly knowledge = this.data.load('knowledge');

  protected readonly isLoading = this.knowledge.isLoading;

  protected readonly category = signal<CategoryFilter>('all');
  protected readonly query = signal('');

  protected readonly categories = computed<readonly KnowledgeCategoryMeta[]>(
    () => this.knowledge.value()?.categories ?? [],
  );

  private readonly entries = computed<readonly KnowledgeEntry[]>(() => {
    const list = [...(this.knowledge.value()?.entries ?? [])];
    return list.sort((a, b) => b.date.localeCompare(a.date));
  });

  protected readonly totalCount = computed(() => this.entries().length);

  /** Per-category entry counts, keyed by category slug. */
  private readonly counts = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const e of this.entries()) map[e.category] = (map[e.category] ?? 0) + 1;
    return map;
  });

  /** Author byline shown on the featured card. */
  protected readonly author = { name: 'Rabin R', avatar: 'assets/images/profile-avatar.webp' };

  /** True while the list is unfiltered (no category, no search). */
  protected readonly isBrowsing = computed(
    () => this.category() === 'all' && this.query().trim() === '',
  );

  /** The single hero article, only surfaced while browsing unfiltered. */
  protected readonly featured = computed<KnowledgeEntry | null>(() => {
    if (!this.isBrowsing()) return null;
    return this.entries().find((e) => e.featured) ?? this.entries()[0] ?? null;
  });

  protected readonly visible = computed<readonly KnowledgeEntry[]>(() => {
    const cat = this.category();
    const q = this.query().trim().toLowerCase();
    const hero = this.featured();
    return this.entries().filter((e) => {
      if (hero && e.id === hero.id) return false;
      if (cat !== 'all' && e.category !== cat) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  });

  protected readonly hasResults = computed(
    () => this.visible().length > 0 || this.featured() !== null,
  );

  /** e.g. "May 28, 2024" from an ISO date. */
  protected formatDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected readonly trackById = trackById;

  protected countFor(key: CategoryFilter): number {
    return key === 'all' ? this.totalCount() : (this.counts()[key] ?? 0);
  }

  protected metaFor(key: KnowledgeCategory): KnowledgeCategoryMeta | undefined {
    return this.categories().find((c) => c.key === key);
  }

  /** Resolved accent CSS colour for an entry (its own, else its category's). */
  protected accentFor(entry: KnowledgeEntry): string {
    const accent = entry.accent ?? this.metaFor(entry.category)?.accent ?? 'purple';
    return accentVar(accent);
  }

  /** Accent CSS colour for a category chip. */
  protected categoryAccent(meta: KnowledgeCategoryMeta): string {
    return accentVar(meta.accent);
  }

  protected setCategory(key: CategoryFilter): void {
    this.category.set(key);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
