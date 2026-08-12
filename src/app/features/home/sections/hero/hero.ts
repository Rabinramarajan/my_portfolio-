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
import { DURATION, EASE } from '../../../../core/services/motion-tokens';
import { HeroBackground } from './components/hero-background';
import { HeroMetrics, type HeroMetric } from './components/hero-metrics';
import { HeroPortrait } from './components/hero-portrait';
import { HeroProgress } from './components/hero-progress';

/** Eases pulled from the shared motion tokens so the hero matches every other
 *  reveal on the site instead of hand-tuning its own cubic-beziers. */
const EXPO = EASE.expo;
const SPRING = EASE.spring;

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
  protected readonly hero = this.store.hero;

  /** Only verified numbers ride in the hero row �?" nothing is invented. */
  protected readonly heroMetrics = computed<readonly HeroMetric[]>(() =>
    this.profile()
      .stats.filter((stat) => this.hero().metricsLabels.includes(stat.label))
      .map((stat) => ({ value: stat.value, suffix: stat.suffix, label: stat.label })),
  );

  protected readonly availabilityLabel = computed(
    () => this.hero().availabilityLabels[this.profile().availability],
  );

  protected readonly availabilityResponse = computed(() =>
    this.profile().availability === 'available'
      ? this.hero().availabilityResponse
      : this.profile().availabilityNote,
  );

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

  /** Premium entrance sequence: layered reveals with staggered typography and smooth motion. */
  private setupEntrance(gsap: Gsap): void {
    const root = this.host.nativeElement;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EXPO, duration: DURATION.base },
      });

      // Blur-to-sharp entrance for content elements
      tl.fromTo(
        '.hero__content',
        { filter: 'blur(10px)' },
        { filter: 'blur(0px)', duration: 0.9, ease: EXPO },
        0,
      )
        // Headline: staggered line reveals with refined easing
        .fromTo(
          '.hero__line-inner',
          { yPercent: 115, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: SPRING,
          },
          0.12,
        )
        // Supporting text: 120ms delay after heading starts
        .fromTo(
          '.hero__value',
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: EXPO },
          0.32,
        )
        // Status indicators: early reveal before buttons
        .fromTo(
          '.hero__status, .hero__status-note',
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.65, ease: EXPO },
          0.2,
        )
        // CTA buttons: soft spring-like upward slide
        .fromTo(
          '.hero__actions',
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            ease: SPRING,
          },
          0.42,
        )
        // Hero portrait: refined back-to-front layer reveal
        .fromTo(
          '.hero__media',
          { y: 32, autoAlpha: 0.4 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: EXPO,
          },
          0.15,
        )
        // Meta information: subtle delayed reveal
        .fromTo(
          '.hero__meta',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.65, ease: EXPO },
          0.65,
        )
        // Scroll indicator: gentle fade in
        .fromTo('.hero__scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.8)
        // Metrics row: layered entrance
        .fromTo(
          '.hero__metrics-row',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: EXPO },
          0.08,
        )
        // Bridge section: final reveal
        .fromTo(
          '.hero__bridge',
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: EXPO },
          0.85,
        );
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