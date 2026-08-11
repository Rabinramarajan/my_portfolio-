import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PortfolioStore } from '../../../../../core/services/portfolio-store';
import type { AboutStoryKeyword } from '../../../../../core/models/portfolio.models';

type StorySegment =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'keyword'; readonly id: string; readonly word: string };

@Component({
  selector: 'app-about-story',
  standalone: true,
  template: `
    <article class="about-story">
      <h3 class="about-story__eyebrow">{{ about().storyEyebrow }}</h3>

      <div class="about-story__content">
        @for (paragraph of paragraphs(); track $index) {
          <p class="about-story__p">
            @for (segment of paragraph; track $index) {
              @if (segment.type === 'text') {
                {{ segment.value }}
              } @else {
                <span
                  class="about-story__kw"
                  [class.about-story__kw--active]="activeKeyword() === segment.id"
                  (mouseenter)="activeKeyword.set(segment.id)"
                  (mouseleave)="activeKeyword.set(null)"
                  >{{ segment.word }}</span
                >
              }
            }
          </p>
        }
      </div>
    </article>
  `,
  styles: [`
    .about-story {
      max-width: 640px;
    }

    .about-story__eyebrow {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-text-faint);
      margin-block-end: var(--space-4);
    }

    .about-story__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .about-story__p {
      font-family: var(--font-sans);
      font-size: clamp(1.05rem, 1.3vw, 1.2rem);
      line-height: 1.7;
      color: var(--color-text-muted);
      margin: 0;
    }

    .about-story__kw {
      color: var(--color-text);
      font-weight: 500;
      cursor: pointer;
      position: relative;
      padding-inline: 0.15em;
      transition: color 0.3s ease, background 0.3s ease;
      border-bottom: 1px dotted var(--color-accent);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--color-accent);
        opacity: 0;
        z-index: -1;
        transition: opacity 0.3s ease;
        border-radius: 2px;
      }

      &:hover,
      &--active {
        color: var(--color-accent-contrast);
        border-bottom-color: transparent;

        &::after {
          opacity: 1;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutStory {
  private readonly store = inject(PortfolioStore);
  protected readonly about = this.store.about;
  protected readonly activeKeyword = signal<string | null>(null);

  protected readonly paragraphs = computed(() =>
    this.about().story.map((paragraph) => this.parse(paragraph.text, paragraph.keywords ?? [])),
  );

  private parse(text: string, keywords: readonly AboutStoryKeyword[]): readonly StorySegment[] {
    const segments: StorySegment[] = [];
    const byId = new Map(keywords.map((keyword) => [keyword.id, keyword]));
    const placeholder = /\{([^}]+)\}/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = placeholder.exec(text)) !== null) {
      if (match.index > last) segments.push({ type: 'text', value: text.slice(last, match.index) });
      const keyword = byId.get(match[1]);
      segments.push(
        keyword
          ? { type: 'keyword', id: keyword.id, word: keyword.word }
          : { type: 'text', value: match[0] },
      );
      last = placeholder.lastIndex;
    }
    if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });
    return segments;
  }
}
