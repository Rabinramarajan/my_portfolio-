import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { DeviceCapability } from '../../../../core/services/device-capability';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';
import { VideoShowcase } from '../../../../shared/components/video-showcase/video-showcase';
import { Reveal } from '../../../../shared/directives/reveal';
import { Magnetic } from '../../../../shared/directives/magnetic';
import { ProcessVisual } from './process-visual/process-visual';


/**
 * Premium interactive timeline: IDEA â†’ STRATEGY â†’ DESIGN â†’ BUILD â†’ TEST â†’
 * LAUNCH â†’ GROW. A sticky visual on desktop reacts to whichever step is
 * scrolled to center-viewport; a progress line fills alongside it.
 *
 * Deliberately built on a plain passive scroll listener + geometry reads
 * rather than GSAP ScrollTrigger: this is the only interactivity the section
 * truly depends on, so it must not be able to silently no-op when GSAP fails
 * to load, is still resolving its dynamic import, or the visitor has
 * reduced-motion enabled (which disables every other GSAP-driven effect on
 * the site by design, but shouldn't disable step tracking here). All content
 * is authored visible-by-default so it reads fine without JS regardless.
 */
@Component({
  selector: 'app-process',
  imports: [SectionHeader, ProcessVisual, VideoShowcase, Reveal, Magnetic],
  templateUrl: './process.html',
  styleUrl: './process.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Process {
  private readonly store = inject(PortfolioStore);
  private readonly device = inject(DeviceCapability);

  protected readonly sections = this.store.sections;
  protected readonly uiCopy = this.store.uiCopy;
  protected readonly media = this.store.media;
  protected readonly steps = this.store.process;
  protected readonly activeStep = signal(0);
  protected readonly totalSteps = computed(() => this.steps().length);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly fill = viewChild<ElementRef<HTMLElement>>('fill');
  private readonly stepEls = viewChildren<ElementRef<HTMLElement>>('stepEl');

  constructor() {
    // Signal queries + `afterRenderEffect` mean the listeners are re-bound to
    // the *current* DOM whenever the queried elements change (list re-render,
    // dev-server HMR patching the template). The previous one-shot
    // `afterNextRender` wiring kept pointing at detached nodes after such a
    // swap, which silently froze the active step at 0.
    afterRenderEffect((onCleanup) => {
      const track = this.track()?.nativeElement;
      const fill = this.fill()?.nativeElement;
      const steps = this.stepEls().map((ref) => ref.nativeElement);
      if (!track || !fill || steps.length === 0) return;

      const cleanup = this.bind(track, fill, steps);
      onCleanup(cleanup);
    });
  }

  /** Scrolls the given step to the viewport center. Used by click + keyboard nav. */
  protected goTo(index: number): void {
    const el = this.stepEls()[index]?.nativeElement;
    if (!el) return;
    el.scrollIntoView({
      behavior: this.device.animationsEnabled() ? 'smooth' : 'auto',
      block: 'center',
    });
  }

  /**
   * Tracks the step nearest the vertical centre of the viewport and fills the
   * progress line, both from a single rAF-throttled scroll read.
   *
   * Geometry rather than `IntersectionObserver`: the active step is a pure
   * function of the current scroll position, so recomputing it on every frame
   * we already paint can never drift out of sync with the DOM the way a
   * long-lived observer bound to captured nodes can.
   */
  private bind(track: HTMLElement, fill: HTMLElement, steps: HTMLElement[]): () => void {
    let queued = false;

    const update = () => {
      queued = false;
      const viewportCenter = window.innerHeight / 2;

      const rect = track.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (viewportCenter - rect.top) / rect.height));
      fill.style.transform = `scaleY(${progress})`;

      // Steps are contiguous, so the centre line lands inside exactly one of
      // them while the track is on screen; above/below the track we clamp to
      // the first/last step so the sticky visual never shows a stale stage.
      let index = steps.length - 1;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].getBoundingClientRect().bottom >= viewportCenter) {
          index = i;
          break;
        }
      }
      this.activeStep.set(index);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }
}
