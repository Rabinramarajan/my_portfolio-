import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AnimatedButton, BackgroundGlow } from '../../shared';



/** 404 page. */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedButton, BackgroundGlow],
  template: `
    <app-background-glow />
    <main class="nf">
      <img
        src="assets/images/astronaut.png"
        alt=""
        class="nf__img"
        aria-hidden="true"
      />
      <p class="nf__code text-gradient-brand">404</p>
      <h1 class="nf__title">Lost in space</h1>
      <p class="nf__text">
        The page you're looking for drifted off into the void — it doesn't exist or has been moved.
      </p>
      <div class="nf__ctas">
        <app-animated-button
          variant="primary"
          icon="Home"
          iconPosition="left"
          label="Back to Home"
          routerLink="/"
        />
        <app-animated-button variant="outline" icon="Box" iconPosition="left" label="View Projects" routerLink="/projects" />
      </div>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .nf {
      position: relative;
      display: flex;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 0 1.5rem;
      text-align: center;
    }
    .nf__img {
      margin-bottom: 0.5rem;
      height: 10rem;
      width: auto;
      animation: float 4s ease-in-out infinite;
    }
    .nf__code {
      font-size: 4.5rem;
      line-height: 1;
      font-weight: 800;
      margin: 0;
    }
    .nf__title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-fg);
      margin: 0;
    }
    .nf__text {
      max-width: 28rem;
      color: var(--color-fg-muted);
      margin: 0;
    }
    .nf__ctas {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    @media (min-width: 768px) {
      .nf__img {
        height: 13rem;
      }
      .nf__code {
        font-size: 8rem;
      }
    }
  `,
  host: { class: 'block' },
})
export class NotFound {}
