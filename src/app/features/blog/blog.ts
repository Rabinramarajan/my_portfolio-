import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, BlogPost, trackById } from '../../core';
import {
  PageLayout,
  SearchInput,
  BlogCard,
  GlassCard,
  QuoteCard,
  AnimatedButton,
  Stagger,
} from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

const ALL = 'All Articles';
const SORTS = ['Most Recent', 'Oldest', 'Popular'] as const;
type SortOption = (typeof SORTS)[number];

/** Blog / Insights & Articles page. */
@Component({
  selector: 'app-blog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    Icon,
    PageLayout,
    SearchInput,
    BlogCard,
    GlassCard,
    QuoteCard,
    AnimatedButton,
    Stagger,
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  host: { class: 'block' },
})
export class BlogPage {
  private readonly data = inject(DataService);

  protected readonly blog = this.data.load('blogs');
  protected readonly profile = this.data.profile();

  protected readonly category = signal(ALL);
  protected readonly search = signal('');
  protected readonly sort = signal<SortOption>('Most Recent');
  protected readonly sortOptions = SORTS;

  protected readonly featured = computed(() =>
    (this.blog.value()?.posts ?? []).find((p) => p.featured),
  );

  protected readonly latest = computed<readonly BlogPost[]>(() => {
    const posts = (this.blog.value()?.posts ?? []).filter((p) => !p.featured);
    const cat = this.category();
    const term = this.search().trim().toLowerCase();
    const filtered = posts.filter(
      (p) => (cat === ALL || p.category === cat) && (term === '' || this.matchesTerm(p, term)),
    );
    return this.applySort([...filtered], this.sort(), this.blog.value()?.popularIds ?? []);
  });

  protected readonly popular = computed<readonly BlogPost[]>(() => {
    const ids = new Set(this.blog.value()?.popularIds ?? []);
    return (this.blog.value()?.posts ?? []).filter((p) => ids.has(p.id));
  });

  protected readonly trackById = trackById;

  protected setSort(value: string): void {
    this.sort.set(value as SortOption);
  }

  /** Match a search term against a post's title, excerpt and tags (all lowercased). */
  private matchesTerm(post: BlogPost, term: string): boolean {
    return (
      post.title.toLowerCase().includes(term) ||
      post.excerpt.toLowerCase().includes(term) ||
      post.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }

  private applySort(
    posts: BlogPost[],
    sort: SortOption,
    popularIds: readonly string[],
  ): BlogPost[] {
    switch (sort) {
      case 'Most Recent':
        return posts.sort((a, b) => b.date.localeCompare(a.date));
      case 'Oldest':
        return posts.sort((a, b) => a.date.localeCompare(b.date));
      case 'Popular': {
        // Rank by position in popularIds; posts not listed fall to the end.
        const rank = (id: string): number => {
          const i = popularIds.indexOf(id);
          return i === -1 ? Number.MAX_SAFE_INTEGER : i;
        };
        return posts.sort((a, b) => rank(a.id) - rank(b.id));
      }
    }
  }
}
