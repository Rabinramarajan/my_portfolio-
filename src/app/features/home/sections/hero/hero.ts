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
import { HeroProgress } from './components/hero-progress';
import { HeroArchitecture } from './hero-architecture/hero-architecture';

const EXPO = EASE.expo;
const SPRING = EASE.spring;

type Gsap = typeof import('gsap').gsap;

@Component({
  selector: 'app-hero-section',
  imports: [
    RouterLink,
    CursorTarget,
    CursorInteractive,
    Magnetic,
    HeroProgress,
    HeroArchitecture,
  ],
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

  protected readonly experience = computed(() => {
    const years = this.profile().stats.find((stat) => stat.label === 'Years experience');
    return years
      ? `${years.value}${years.suffix} YEARS ENGINEERING DIGITAL PRODUCTS`
      : '4+ YEARS ENGINEERING DIGITAL PRODUCTS';
  });

  protected readonly scrollArc = computed(() => {
    const label = this.hero().scrollLabel;
    return `${label} · ${label}`;
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
    const lineFrom = masked ? { yPercent: 110, autoAlpha: 0 } : { y: 28, autoAlpha: 0 };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EXPO, duration: DURATION.base } });

      tl.fromTo('.hero__bg', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0)
        .fromTo(
          '.hero__grid',
          { autoAlpha: 0, scale: 1.05 },
          { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power3.out' },
          0.1,
        )
        .fromTo(
          '.hero__glow',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.6, ease: 'power2.out' },
          0.2,
        )
        .fromTo(
          '.hero__nav',
          { y: -20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8 },
          0.15,
        )
        .fromTo(
          '.hero__eyebrow',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          0.3,
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
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8 },
          0.7,
        )
        .fromTo(
          '.hero__cta-row',
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.85, ease: SPRING },
          0.85,
        )
        .fromTo(
          '.hero__tech-line',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75 },
          1.0,
        )
        .fromTo(
          'app-hero-architecture',
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power3.out' },
          0.6,
        )
        .fromTo(
          '.hero__scroll',
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8 },
          1.2,
        )
        .fromTo(
          '.hero__meta',
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          1.3,
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
        .to('.hero__scroll', { autoAlpha: 0 }, 0)
        .to('.hero__meta', { autoAlpha: 0 }, 0)
        .to('.hero__eyebrow, .hero__desc, .hero__cta-row, .hero__tech-line', { y: -24 }, 0)
        .to('.hero__heading', { y: -40 }, 0)
        .to('.hero__grid', { opacity: 0.15, scale: 1.02 }, 0)
        .to('.hero__glow', { opacity: 0.5 }, 0.1)
        .to('app-hero-architecture', { yPercent: -10, opacity: 0.7 }, 0.15);
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