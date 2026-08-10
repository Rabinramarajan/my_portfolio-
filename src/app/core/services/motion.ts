import { DOCUMENT, Injectable, inject } from '@angular/core';

import { DeviceCapability } from './device-capability';

type Gsap = typeof import('gsap').gsap;

/**
 * How long GSAP gets to arrive before motion is abandoned for the session.
 *
 * Reveal targets are hidden by CSS from the first frame (see the `data-motion`
 * pre-hide in `styles.scss`), so a stalled chunk is no longer a missing
 * animation — it is a blank page. Past this point the content matters more than
 * the entrance, and the deadline latches: a late arrival must not be allowed to
 * hide elements the visitor is already reading.
 */
const LOAD_BUDGET_MS = 3000;

/**
 * Lazily loads GSAP + ScrollTrigger, once, in the browser only.
 *
 * GSAP is ~50kb and useless during SSR, so it is deliberately kept out of the
 * initial bundle behind a dynamic import. Callers await `load()` and get `null`
 * when animation is disabled — which makes "no motion" the easy path at every
 * call site rather than something each component has to remember to check.
 */
@Injectable({ providedIn: 'root' })
export class Motion {
  private readonly device = inject(DeviceCapability);
  private readonly document = inject(DOCUMENT);
  private pending: Promise<Gsap | null> | null = null;
  /** Latched once motion has been given up on, so it is given up on for good. */
  private abandoned = false;

  async load(): Promise<Gsap | null> {
    if (this.abandoned || !this.device.animationsEnabled()) {
      return null;
    }
    this.pending ??= this.importGsap();
    return this.pending;
  }

  private async importGsap(): Promise<Gsap | null> {
    const gsap = await Promise.race([this.loadGsap(), this.budget()]);
    if (!gsap) {
      this.abandoned = true;
      return null;
    }
    return gsap;
  }

  private async loadGsap(): Promise<Gsap | null> {
    try {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: 'power3.out', duration: 0.8 });

      // Trigger positions are measured against the layout as it stands when each
      // trigger is created — before web fonts swap in and before images below the
      // fold have reserved their space. Both shift the page, which leaves later
      // triggers pointing at the wrong scroll offsets and sections that never
      // reveal. Re-measure once the page has actually settled.
      if (this.document.readyState !== 'complete') {
        this.document.defaultView?.addEventListener('load', () => ScrollTrigger.refresh(), {
          once: true,
        });
      }
      void this.document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return gsap;
    } catch {
      // A blocked or failed chunk must not take the content down with it.
      return null;
    }
  }

  private budget(): Promise<null> {
    return new Promise((resolve) =>
      this.document.defaultView?.setTimeout(() => resolve(null), LOAD_BUDGET_MS),
    );
  }


}
