import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

const THIS_TOTAL = 6;
const THIS_CHAPTERS = ['hero', 'about', 'services', 'work', 'experience', 'process'] as const;

/**
 * Chapter progress rail — the small `01 / 06` that traces the home page's
 * story. It watches six landmarks (hero, about, services, work, experience,
 * process) through a middle-band IntersectionObserver and only writes the
 * Angular signal when the active chapter actually changes — never on a per-frame
 * basis. Decorative: the page tells its story without it.
 */
@Component({
  selector: 'app-hero-progress',
  standalone: true,
  template: `
    <aside class="hero-progress" aria-hidden="true">
      <span class="hero-progress__count hero-progress__count--current">{{ active() }}</span>
      <span class="hero-progress__track">
        <span class="hero-progress__fill" [style.transform]="'scaleY(' + fill() + ')'"></span>
      </span>
      <span class="hero-progress__count">{{ total }}</span>
    </aside>
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: 50%;
        right: 0.75rem;
        transform: translateY(-50%);
        z-index: var(--z-sticky);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        pointer-events: none;
        font-variant-numeric: tabular-nums;
      }

      .hero-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .hero-progress__count {
        font-family: var(--font-mono);
        font-size: 0.56rem;
        letter-spacing: 0.14em;
        color: var(--color-text-faint);
      }

      .hero-progress__count--current {
        color: var(--color-accent);
      }

      .hero-progress__track {
        position: relative;
        display: block;
        width: 1px;
        height: 44px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .hero-progress__fill {
        display: block;
        position: absolute;
        inset: 0;
        height: 100%;
        background: var(--color-accent);
        transform-origin: top;
        will-change: transform;
      }

      @media (min-width: 768px) {
        :host {
          right: var(--gutter);
        }

        .hero-progress__track {
          height: 64px;
        }

        .hero-progress__count {
          font-size: 0.64rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroProgress {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly total = THIS_TOTAL;
  private readonly current = signal(0);
  protected readonly active = computed(() => (this.current() + 1).toString().padStart(2, '0'));
  protected readonly fill = computed(() => (this.current() + 1) / THIS_TOTAL);

  constructor() {
    afterNextRender(() => this.observe());
  }

  private observe(): void {
    const sections = THIS_CHAPTERS
      .map((id) => this.document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length !== THIS_TOTAL) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => sections.indexOf(entry.target as HTMLElement))
          .filter((index) => index !== -1);
        if (intersecting.length === 0) return;

        const next = Math.max(...intersecting);
        // Only touch the signal when the landmark actually changes.
        if (next !== this.current()) this.current.set(next);
      },
      // Only the middle band of the viewport counts as "current".
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}