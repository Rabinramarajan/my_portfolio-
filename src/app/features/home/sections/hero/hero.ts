import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { LoaderService } from '../../../../core/services/loader';
import { Motion } from '../../../../core/services/motion';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { CursorInteractive } from '../../../../shared/directives/cursor-interactive';
import { CursorTarget } from '../../../../shared/directives/cursor-target';
import { Magnetic } from '../../../../shared/directives/magnetic';
import { asyncTeardown } from '../../../../shared/utils/async-teardown';
import { DURATION, EASE } from '../../../../core/services/motion-tokens';
import { DigitalCore } from './digital-core/digital-core';

const EXPO = EASE.expo;
const SPRING = EASE.spring;

type Gsap = typeof import('gsap').gsap;

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, CursorTarget, CursorInteractive, Magnetic, DigitalCore],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  private readonly store = inject(PortfolioStore);
  private readonly loader = inject(LoaderService);
  private readonly motion = inject(Motion);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly teardown = asyncTeardown();

  protected readonly profile = this.store.profile;
  protected readonly hero = this.store.hero;

  protected readonly mastRole = 'FRONTEND ENGINEERING';
  protected readonly heroCount = '01 / 07';

  /**
   * Editorial rhythm for the headline: the final line carries the accent period
   * and renders slightly wider, so the three lines never read as equal widths.
   */
  protected readonly headingLines = computed(() => {
    const lines = this.hero().headline;
    return lines.map((line, index) => ({
      text: index === lines.length - 1 ? line.replace(/\.$/, '') : line,
      hasPeriod: index === lines.length - 1 && line.endsWith('.'),
    }));
  });

  protected readonly experience = computed(() => {
    const years = this.profile().stats.find((stat) => stat.label === 'Years experience');
    return years ? `${years.value}${years.suffix} YEARS ENGINEERING DIGITAL PRODUCTS` : '4+ YEARS ENGINEERING DIGITAL PRODUCTS';
  });

  constructor() {
    afterNextRender(() => void this.run());
  }

  private async run(): Promise<void> {
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;
    if (window.scrollY > 160) return;

    this.setupScrub(gsap);
    await this.waitForLoader();
    if (this.teardown.destroyed) return;
    this.setupEntrance(gsap);
  }

  private waitForLoader(timeoutMs = 6000): Promise<void> {
    return new Promise((resolve) => {
      const started = performance.now();
      const poll = () => {
        if (
          this.teardown.destroyed ||
          this.loader.state() === 'complete' ||
          performance.now() - started > timeoutMs
        ) {
          resolve();
          return;
        }
        requestAnimationFrame(poll);
      };
      poll();
    });
  }

  private setupEntrance(gsap: Gsap): void {
    const root = this.host.nativeElement;
    const masked = window.matchMedia('(min-width: 1024px)').matches;
    const lineFrom = masked ? { yPercent: 110 } : { y: 30 };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EXPO, duration: DURATION.base } });

      tl.fromTo(
        '.hero__bg',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: 'power1.out' },
        0,
      )
        .fromTo(
          '.hero__mast',
          { y: -16, autoAlpha: 0, filter: 'blur(6px)' },
          { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7 },
          0.2,
        )
        .fromTo(
          '.hero__eyebrow',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          0.35,
        )
        .fromTo(
          '.hero__line-inner',
          lineFrom,
          {
            y: 0,
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.11,
            ease: masked ? SPRING : EXPO,
          },
          0.45,
        )
        .fromTo(
          '.hero__desc',
          { y: 18, autoAlpha: 0, filter: 'blur(4px)' },
          { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7 },
          0.65,
        )
        .fromTo(
          '.hero__cta-row',
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: SPRING },
          0.75,
        )
        .fromTo(
          '.hero__tech',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          0.9,
        )
        .fromTo(
          'app-digital-core',
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.25, ease: 'power3.out' },
          0.9,
        )
        .fromTo(
          '.hero__foot',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          1.1,
        )
        .fromTo(
          '.hero__identity',
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.0 },
          1.15,
        );
    }, root);

    this.teardown.register(() => ctx.revert());
  }

  private setupScrub(gsap: Gsap): void {
    const root = this.host.nativeElement;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
          defaults: { ease: 'none' },
        })
        .to('.hero__foot, .hero__identity', { autoAlpha: 0 }, 0)
        .to('.hero__eyebrow, .hero__desc, .hero__cta-row, .hero__tech', { y: -24 }, 0)
        .to('.hero__mast', { y: -16, autoAlpha: 0.4 }, 0)
        .to('.hero__heading', { y: -30 }, 0)
        .to('.hero__bg', { opacity: 0.3 }, 0.05)
        .to('app-digital-core', { y: -50, autoAlpha: 0.85 }, 0.08);
    }, root);

    this.teardown.register(() => ctx.revert());
  }

  protected scrollToNext(event: Event): void {
    const about = this.host.nativeElement.ownerDocument.getElementById('about');
    if (!about) return;
    event.preventDefault();
    about.scrollIntoView({ block: 'start' });
  }
}
