import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-manifesto',
  standalone: true,
  template: `
    <header class="about-manifesto">
      <div class="about-manifesto__eyebrow">
        <span class="about-manifesto__index">01</span>
        <span class="about-manifesto__slash">/</span>
        <span class="about-manifesto__label">ABOUT</span>
      </div>

      <h2 class="about-manifesto__heading">
        Where thoughtful interfaces meet serious engineering.
      </h2>
    </header>
  `,
  styles: [`
    .about-manifesto {
      margin-block-end: var(--space-12, 4.5rem);
    }

    .about-manifesto__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      font-family: var(--font-mono, monospace);
      font-size: var(--text-sm, 0.875rem);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent, #c9f24d);
      margin-block-end: var(--space-4, 1rem);
    }

    .about-manifesto__heading {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(2.5rem, 5.5vw, 5.25rem);
      font-weight: 500;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: var(--color-text, #fff);
      max-width: 22ch;
      text-wrap: balance;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutManifesto {}
