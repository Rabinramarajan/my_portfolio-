import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
} from '@angular/core';

import { Motion } from '../../../core/services/motion';
import { asyncTeardown } from '../../utils/async-teardown';

/**
 * Word-by-word masked reveal.
 *
 * The text is split into words in the template (not by mutating the DOM after
 * render) so the server emits complete, selectable, screen-reader-correct text.
 * The animation only ever translates the inner spans inside their masks.
 */
@Component({
  selector: 'app-text-reveal',
  templateUrl: './text-reveal.html',
  styleUrl: './text-reveal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextReveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  readonly text = input.required<string>();
  /** Each entry becomes its own line, each line masked independently. */
  readonly lines = input<readonly string[]>();
  readonly delay = input(0);
  readonly stagger = input(0.035);
  readonly start = input('top 95%');

  protected readonly resolvedLines = computed(() => this.lines() ?? [this.text()]);
  protected readonly wordsPerLine = computed(() =>
    this.resolvedLines().map((line) => line.split(' ')),
  );

  constructor() {
    afterNextRender(() => void this.animate());
  }

  private async animate(): Promise<void> {
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return this.release();

    const words = this.host.nativeElement.querySelectorAll('.tr__inner');
    if (words.length === 0) return this.release();

    const tween = gsap.fromTo(
      words,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 0.7,
        delay: this.delay(),
        stagger: { each: this.stagger(), amount: 0.2 },
        ease: 'power3.out',
        scrollTrigger: {
          trigger: this.host.nativeElement,
          start: this.start(),
          once: true,
          fastScrollEnd: 800,
        },
      },
    );

    // The words are already parked below their masks by the `fromTo` above, so
    // the global pre-hide has done its job and can let go. See `Reveal`.
    this.release();

    this.teardown.register(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }

  /** Opts this element out of the `data-motion` pre-hide in `styles.scss`. */
  private release(): void {
    this.host.nativeElement.setAttribute('data-revealed', '');
  }
}
