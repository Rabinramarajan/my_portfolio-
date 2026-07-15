import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative, non-interactive ambient gradient blobs rendered behind content.
 * Purely presentational — hidden from assistive tech.
 */
@Component({
  selector: 'app-background-glow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg" aria-hidden="true">
      <div
        class="bg__blob bg__blob--1"
        style="background: radial-gradient(circle, var(--color-brand-purple), transparent 70%)"
      ></div>
      <div
        class="bg__blob bg__blob--2"
        style="background: radial-gradient(circle, var(--color-brand-blue), transparent 70%)"
      ></div>
      <div
        class="bg__blob bg__blob--3"
        style="background: radial-gradient(circle, var(--color-brand-violet), transparent 70%)"
      ></div>
    </div>
  `,
  styles: `
    .bg {
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: -10;
      overflow: hidden;
    }
    .bg__blob {
      position: absolute;
      border-radius: 9999px;
    }
    .bg__blob--1 {
      top: -10rem;
      left: -8rem;
      height: 24rem;
      width: 24rem;
      opacity: 0.2;
      filter: blur(120px);
    }
    .bg__blob--2 {
      top: 33.333%;
      right: -10rem;
      height: 28rem;
      width: 28rem;
      opacity: 0.15;
      filter: blur(140px);
    }
    .bg__blob--3 {
      bottom: -10rem;
      left: 25%;
      height: 20rem;
      width: 20rem;
      opacity: 0.1;
      filter: blur(120px);
    }
  `,
})
export class BackgroundGlow {}
