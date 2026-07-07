import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-shell">
      <div class="section-header">
        @if (label) {
          <span class="section-label">{{ label }}</span>
        }
        @if (title) {
          <h2 class="section-title">{{ title }}</h2>
        }
        @if (subtitle) {
          <p class="section-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="section-content">
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    .section-shell {
      padding: var(--sp-12) var(--sp-6);

      @media (max-width: 768px) {
        padding: var(--sp-8) var(--sp-4);
      }

      .section-header {
        margin-bottom: var(--sp-8);
        max-width: 600px;

        .section-label {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--sp-2);
        }

        .section-title {
          margin: 0 0 var(--sp-2);
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: var(--fw-semibold);
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: var(--lh-tight);
        }

        .section-subtitle {
          margin: 0;
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
        }
      }

      .section-content {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
      }
    }
  `],
})
export class SectionShellComponent {
  @Input() label: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
