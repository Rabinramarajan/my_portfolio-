import { Component, inject, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';

interface ContentBlock {
  type: 'p' | 'h2' | 'ul' | 'code';
  text?: string;
  items?: string[];
  lang?: string;
  code?: string;
}

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly pds = inject(PortfolioDataService);

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly article = computed(() => {
    const slug = this.params().get('slug');
    return (this.pds.blog()?.articles ?? []).find((a: any) => a.slug === slug) ?? null;
  });

  // Structured-block content (legacy articles authored inline in JSON)
  protected readonly blocks = computed<ContentBlock[]>(
    () => this.article()?.content ?? []
  );

  // Markdown-backed content (fetched lazily from /blog/<slug>.md)
  protected readonly markdownHtml = signal<SafeHtml | null>(null);
  protected readonly markdownLoading = signal(false);
  protected readonly markdownError = signal(false);

  protected readonly related = computed(() => {
    const current = this.article();
    return (this.pds.blog()?.articles ?? [])
      .filter((a: any) => a.slug !== current?.slug)
      .slice(0, 2);
  });

  constructor() {
    // Load & render markdown whenever the resolved article changes.
    effect(() => {
      const file = this.article()?.markdownFile as string | undefined;
      this.markdownHtml.set(null);
      this.markdownError.set(false);
      if (!file) return;

      this.markdownLoading.set(true);
      this.http.get(file, { responseType: 'text' }).subscribe({
        next: (raw) => {
          const body = this.stripFrontMatter(raw);
          const html = marked.parse(body, { async: false, gfm: true }) as string;
          this.markdownHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
          this.markdownLoading.set(false);
        },
        error: () => {
          this.markdownError.set(true);
          this.markdownLoading.set(false);
        },
      });
    });
  }

  private stripFrontMatter(src: string): string {
    if (!src.startsWith('---')) return src;
    const close = src.indexOf('\n---', 3);
    if (close === -1) return src;
    const afterFence = src.indexOf('\n', close + 1);
    return afterFence === -1 ? '' : src.slice(afterFence + 1);
  }
}
