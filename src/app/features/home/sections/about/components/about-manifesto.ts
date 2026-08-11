import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PortfolioStore } from '../../../../../core/services/portfolio-store';

@Component({
  selector: 'app-about-manifesto',
  standalone: true,
  template: `
    <header class="about-manifesto">
      <div class="about-manifesto__eyebrow">
        <span class="about-manifesto__index">{{ about().sectionIndex }}</span>
        <span class="about-manifesto__slash">/</span>
        <span class="about-manifesto__label">{{ about().sectionLabel }}</span>
      </div>

      <h2 class="about-manifesto__heading">
        {{ about().manifestoHeading }}
      </h2>
    </header>
  `,
  styles: [`
    .about-manifesto {
      margin-block-end: var(--space-12);
    }

    .about-manifesto__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent);
      margin-block-end: var(--space-4);
    }

    .about-manifesto__heading {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 5.5vw, 5.25rem);
      font-weight: 500;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: var(--color-text);
      max-width: 22ch;
      text-wrap: balance;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutManifesto {
  private readonly store = inject(PortfolioStore);
  protected readonly about = this.store.about;
}
