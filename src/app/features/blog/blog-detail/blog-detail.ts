import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DataService, BlogPost, SeoService, trackById } from '../../../core';
import { GlassCard, Stagger } from '../../../shared';
import { CodeBlock } from '../../../shared/components/ui/code-block/code-block';
import { Icon } from '../../../shared/components/ui/icon/icon';

interface TocItem {
  readonly id: string;
  readonly label: string;
}

/** Blog article detail page — the full write-up for one post, keyed by route `:slug`. */
@Component({
  selector: 'app-blog-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, RouterLink, Icon, GlassCard, CodeBlock, Stagger],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
  host: { class: 'block' },
})
export class BlogDetailPage {
  /** Route param bound via withComponentInputBinding. */
  readonly slug = input.required<string>();

  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);
  private readonly blog = this.data.load('blogs');
  private readonly profileResource = this.data.profile();

  protected readonly author = computed(() => {
    const p = this.profileResource.value();
    return {
      name: p?.name ?? 'Rabin R.',
      role: p?.role ?? 'Frontend Developer',
      avatar: p?.avatar ?? 'assets/images/profile-avatar.webp',
      bio: 'I build scalable web applications with Angular and modern web technologies. Passionate about clean code, performance and great UX.',
    };
  });

  /** The current article. */
  protected readonly post = computed<BlogPost | null>(
    () => (this.blog.value()?.posts ?? []).find((p) => p.slug === this.slug()) ?? null,
  );

  /** Table of contents built from section headings. */
  protected readonly toc = computed<readonly TocItem[]>(() => {
    const p = this.post();
    if (!p?.body) return [];
    const items: TocItem[] = [];
    p.body.forEach((s, i) => {
      const label = s.heading ?? (i === 0 ? 'Introduction' : '');
      if (label) items.push({ id: this.sectionId(label, i), label });
    });
    return items;
  });

  /** Related posts from the same category. */
  protected readonly related = computed<readonly BlogPost[]>(() => {
    const current = this.post();
    if (!current) return [];
    const all = this.blog.value()?.posts ?? [];
    const sameCat = all.filter((p) => p.id !== current.id && p.category === current.category);
    const pool = sameCat.length ? sameCat : all.filter((p) => p.id !== current.id);
    return pool.slice(0, 4);
  });

  protected readonly notFound = computed(
    () => !this.blog.isLoading() && !!this.blog.value() && this.post() === null,
  );

  // ── Local, non-persisted UI state ───────────────────
  protected readonly bookmarked = signal(false);
  protected readonly liked = signal(false);
  protected readonly feedback = signal<'yes' | 'no' | null>(null);

  protected readonly trackById = trackById;

  protected toggleBookmark(): void {
    this.bookmarked.update((b) => !b);
  }

  protected toggleLike(): void {
    this.liked.update((l) => !l);
  }

  protected setFeedback(value: 'yes' | 'no'): void {
    this.feedback.set(value);
  }

  protected share(): void {
    if (typeof navigator === 'undefined') return;
    const url = typeof location !== 'undefined' ? location.href : '';
    const title = this.post()?.title ?? 'Blog';
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  protected copyLink(): void {
    if (typeof location === 'undefined') return;
    navigator.clipboard?.writeText(location.href).catch(() => {});
  }

  /** Deterministic anchor id for a section, e.g. "Why Signals?" → "sec-1-why-signals". */
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
      : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  protected formatDateShort(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  constructor() {
    effect(() => {
      const post = this.post();
      const path = `/blog/${this.slug()}`;
      if (post) {
        this.seo.apply({
          title: post.title,
          description: post.excerpt,
          keywords: [...post.tags],
          path,
        });
      } else if (this.notFound()) {
        this.seo.apply({ title: 'Article Not Found', path });
      }
    });
  }
}
