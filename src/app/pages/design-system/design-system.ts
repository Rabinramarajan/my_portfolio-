import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SectionShellComponent,
  ButtonComponent,
  CardComponent,
  BadgeComponent,
  InputComponent,
  SkeletonComponent,
  TimelineItemComponent,
  StatTileComponent,
} from '../../shared/components';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    CommonModule,
    SectionShellComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    InputComponent,
    SkeletonComponent,
    TimelineItemComponent,
    StatTileComponent,
  ],
  template: `
    <main class="design-main">
      <app-section-shell
        label="DESIGN SYSTEM"
        title="Living Component Library"
        subtitle="Standardized, theme-aware, and production-ready components powering the portfolio."
      >
        <div class="components-grid">
          <!-- Buttons -->
          <div class="component-showcase">
            <h3>Buttons</h3>
            <div class="component-preview">
              <app-button label="Primary" variant="primary" />
              <app-button label="Outline" variant="outline" />
              <app-button label="Ghost" variant="ghost" />
              <app-button label="Icon" variant="icon" iconLeft="chevron-right" [label]="''" />
              <app-button label="Loading" [loading]="true" />
            </div>
            <pre><code>{{ buttonCode }}</code></pre>
          </div>

          <!-- Cards -->
          <div class="component-showcase">
            <h3>Cards</h3>
            <div class="component-preview">
              <app-card variant="surface" padding="var(--sp-4)">
                <strong>Surface Card</strong>
                <p>Default card with solid background</p>
              </app-card>
              <app-card variant="glass" padding="var(--sp-4)">
                <strong>Glass Card</strong>
                <p>Glassmorphism with backdrop blur</p>
              </app-card>
              <app-card variant="interactive" [interactive]="true" padding="var(--sp-4)">
                <strong>Interactive Card</strong>
                <p>Hover for feedback</p>
              </app-card>
            </div>
          </div>

          <!-- Badges -->
          <div class="component-showcase">
            <h3>Badges</h3>
            <div class="component-preview">
              <app-badge variant="default">Default</app-badge>
              <app-badge variant="success">Success</app-badge>
              <app-badge variant="warning">Warning</app-badge>
              <app-badge variant="error">Error</app-badge>
              <app-badge variant="accent" [dot]="true">Status</app-badge>
            </div>
          </div>

          <!-- Inputs -->
          <div class="component-showcase">
            <h3>Inputs</h3>
            <div class="component-preview">
              <app-input label="Text Input" placeholder="Enter text..." />
            </div>
          </div>

          <!-- Stat Tiles -->
          <div class="component-showcase">
            <h3>Stat Tiles</h3>
            <div class="component-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4);">
              <app-stat-tile value="50+" label="Users" />
              <app-stat-tile value="100%" label="Uptime" />
              <app-stat-tile value="2.5s" label="Load Time" />
            </div>
          </div>

          <!-- Timeline -->
          <div class="component-showcase">
            <h3>Timeline Items</h3>
            <div class="component-preview">
              <app-timeline-item title="Phase 1" date="Jan 2026" description="Initial design system" />
              <app-timeline-item title="Phase 2" date="Feb 2026" description="Component library" />
              <app-timeline-item title="Phase 3" date="Mar 2026" description="Production deployment" />
            </div>
          </div>

          <!-- Skeletons -->
          <div class="component-showcase">
            <h3>Skeleton Loaders</h3>
            <div class="component-preview">
              <app-skeleton shape="text" />
              <app-skeleton shape="text" />
              <app-skeleton shape="button" />
            </div>
          </div>
        </div>
      </app-section-shell>

      <!-- Features Grid -->
      <app-section-shell
        label="FEATURES"
        title="Built for Scale"
        subtitle="Every component is optimized for performance, accessibility, and theme consistency."
      >
        <div class="features-grid">
          <app-card variant="surface" padding="var(--sp-6)">
            <h4>Responsive</h4>
            <p>Mobile-first design with proper breakpoints and touch targets</p>
          </app-card>
          <app-card variant="surface" padding="var(--sp-6)">
            <h4>Accessible</h4>
            <p>WCAG 2.1 AA compliant with keyboard navigation and ARIA labels</p>
          </app-card>
          <app-card variant="surface" padding="var(--sp-6)">
            <h4>Theme-Aware</h4>
            <p>Automatic dark/light mode with CSS custom properties</p>
          </app-card>
          <app-card variant="surface" padding="var(--sp-6)">
            <h4>Performance</h4>
            <p>CSS-driven animations, zero JS overhead, lazy-loaded</p>
          </app-card>
        </div>
      </app-section-shell>
    </main>
  `,
  styles: [`
    .design-main {
      min-height: 100vh;
      background: var(--bg);
    }

    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--sp-8);
      margin-bottom: var(--sp-12);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--sp-6);
      }
    }

    .component-showcase {
      display: flex;
      flex-direction: column;
      padding: var(--sp-6);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      min-height: auto;

      h3 {
        margin: 0 0 var(--sp-4);
        padding-bottom: var(--sp-4);
        border-bottom: 1px solid var(--border);
        font-size: var(--text-lg);
        font-weight: var(--fw-semibold);
        color: var(--text);
      }

      .component-preview {
        padding: var(--sp-4);
        background: rgba(110 86 207 / 0.05);
        border-radius: var(--r-md);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
        min-height: 100px;
        flex-grow: 1;
      }

      pre {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        padding: var(--sp-3);
        overflow-x: auto;
        margin: 0;
        flex-shrink: 0;

        code {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
          display: block;
          white-space: pre;
        }
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--sp-6);

      h4 {
        margin: 0 0 var(--sp-2);
        font-size: var(--text-base);
        color: var(--accent);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: var(--lh-normal);
      }
    }
  `],
})
export class DesignSystemComponent {
  buttonCode = `<app-button
  label="Click me"
  variant="primary"
  size="md"
  [loading]="false"
/>`;
}
