import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';

import { Button } from '../../../../shared/components/button/button';
import { LoaderService } from '../../../../core/services/loader';
import { Motion } from '../../../../core/services/motion';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { WebglField } from '../../../../shared/components/webgl-field/webgl-field';
import { asyncTeardown } from '../../../../shared/utils/async-teardown';
import { HeroBackground } from './components/hero-background';
import { HeroMetrics, type HeroMetric } from './components/hero-metrics';
import { HeroPortrait } from './components/hero-portrait';
import { HeroProgress } from './components/hero-progress';

type Gsap = typeof import('gsap').gsap;

/**
 * Hero — the entrance to the portfolio.
 *
 * Not "name, paragraph, two buttons": a staged editorial entry. The heading
 * renders fully on first paint (it is the LCP element and is never gated behind
 * JavaScript); once the initial-loader has handed over, GSAP plays a masked
 * line reveal. A ScrollTrigger scrub carries the section out — type drifting
 * up, grid receding, the exit compressing — as About takes over below.
 *
 * All motion is lazy, browser-only and skippable: `Motion` returns `null` for
 * reduced-motion users and the content is fully visible without GSAP.
 */
@Component({
  selector: 'app-hero',
  imports: [Button, WebglField, HeroBackground, HeroMetrics, HeroPortrait, HeroProgress],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly store = inject(PortfolioStore);
  private readonly loader = inject(LoaderService);
  private readonly motion = inject(Motion);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly teardown = asyncTeardown();

  protected readonly profile = this.store.profile;
  protected readonly media = this.store.media;

  /** Only verified numbers ride in the hero row — nothing is invented. */
  protected readonly heroMetrics = computed<readonly HeroMetric[]>(() =>
    this.profile()
      .stats.filter((stat) => HERO_METRIC_LABELS.includes(stat.label))
      .map((stat) => ({ value: stat.value, suffix: stat.suffix, label: stat.label })),
  );

  protected readonly availabilityLabel = computed(() => {
    switch (this.profile().availability) {
      case 'limited':
        return 'Accepting select projects';
      case 'booked':
        return 'Currently booked';
      default:
        return 'Available for select projects';
    }
  });

  protected readonly availabilityResponse = computed(() =>
    this.profile().availability === 'available'
      ? 'Usually responds within 1 business day'
      : this.profile().availabilityNote,
  );

  protected readonly focus = 'Angular · TypeScript · Product Engineering';

  constructor() {
    afterNextRender(() => void this.run());
  }

  private async run(): Promise<void> {
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;
    // Scroll restoration can land mid-page; the entrance must never yank content
    // the visitor is already reading. Content stays visible — we simply skip.
    if (window.scrollY > 160) return;

    this.setupScrub(gsap);
    await this.waitForLoader();
    if (this.teardown.destroyed) return;
    this.setupEntrance(gsap);
  }

  /**
   * The cinematic initial-loader covers the whole viewport until it wipes away.
   * Waiting for its completion means the hero reveal is seen instead of played
   * behind it. Nothing blocks on this: the copy is already painted, so a loader
   * that never finishes simply means no reveal.
   */
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

  /** Masked line reveal plus a quiet cascade of the supporting cast. */
  private setupEntrance(gsap: Gsap): void {
    const root = this.host.nativeElement;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero__line-inner',
        { yPercent: 118 },
        { yPercent: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' },
        0.08,
      )
        .fromTo('.hero__media', { y: 26, autoAlpha: 0.55 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.42)
        .fromTo(
          '.hero__status, .hero__status-note',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          0.3,
        )
        .fromTo('.hero__value', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 0.55)
        .fromTo('.hero__actions', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 0.62)
        .fromTo('.hero__meta', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.82)
        .fromTo('.hero__scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0.95)
        .fromTo('.hero__metrics-row', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.05)
        .fromTo('.hero__bridge', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 1.05);
    }, root);

    this.teardown.register(() => ctx.revert());
  }

  /**
   * Scroll choreography: as the hero leaves, typography creeps upward, the
   * portrait drifts, the engineering background recedes and the whole block
   * compresses gently into the About chapter. Subtle by design — the reader,
   * not the animation, is the point.
   */
  private setupScrub(gsap: Gsap): void {
    const root = this.host.nativeElement;

    const ctx = gsap.context(() => {
      gsap.timeline({
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
        .to('.hero__status, .hero__status-note', { y: -18 }, 0)
        .to('.hero__value, .hero__actions, .hero__meta', { y: -22 }, 0)
        .to('.hero__heading', { y: -44 }, 0)
        .to('.hero__media', { y: -34 }, 0)
        .to('app-hero-background', { opacity: 0.3 }, 0.06)
        .to('.hero__metrics-row', { y: -18 }, 0.05)
        .to('.hero__inner', { yPercent: -4 }, 0.55);
    }, root);

    this.teardown.register(() => ctx.revert());
  }
}

const HERO_METRIC_LABELS: readonly string[] = [
  'Years experience',
  'Users served',
  'UI components built',
];