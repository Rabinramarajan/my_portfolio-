import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/**
 * Reading-progress bar.
 *
 * Uses a passive scroll listener throttled to one read per animation frame —
 * cheap enough that pulling in ScrollTrigger for it would be the more expensive
 * option, and it works with animation disabled.
 */
@Component({
  selector: 'app-scroll-progress',
  templateUrl: './scroll-progress.html',
  styleUrl: './scroll-progress.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollProgress {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly progress = signal(0);

  constructor() {
    afterNextRender(() => this.track());
  }

  private track(): void {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      this.progress.set(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    });
  }
}
