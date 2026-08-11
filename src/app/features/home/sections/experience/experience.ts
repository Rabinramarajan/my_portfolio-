import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { Motion } from '../../../../core/services/motion';
import { MediaImage } from '../../../../shared/components/media-image/media-image';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';
import { asyncTeardown } from '../../../../shared/utils/async-teardown';

@Component({
  selector: 'app-experience',
  imports: [SectionHeader, MediaImage, Reveal],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  private readonly store = inject(PortfolioStore);
  protected readonly media = this.store.media;
  protected readonly sections = this.store.sections;
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();
  private readonly railRef = viewChild<ElementRef<HTMLElement>>('rail');

  protected readonly roles = this.store.experience;

  constructor() {
    afterNextRender(() => void this.drawRail());
  }

  /** The timeline rail draws itself as the section scrolls past. */
  private async drawRail(): Promise<void> {
    const gsap = await this.motion.load();
    const rail = this.railRef()?.nativeElement;
    if (!gsap || !rail || this.teardown.destroyed) return;

    const tween = gsap.fromTo(
      rail,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: rail.parentElement ?? rail,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.6,
        },
      },
    );

    this.teardown.register(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}
