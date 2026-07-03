import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioDataService } from '../services/portfolio-data.service';

/**
 * Skills visualization built entirely from the real skill categories in
 * portfolio-data.json. Deliberately shows NO self-assessed 1–5 proficiency
 * scores (those would be fabricated and recruiters distrust them). The only
 * quantitative bar shown is an honest breadth signal: how many skills sit in
 * each category, relative to the largest category.
 */
@Component({
  selector: 'app-skills-visualization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sv">
      <div class="sv-head">
        <span class="sv-label">{{ pds.skills()?.sectionLabel }}</span>
        <h2 class="sv-title">{{ pds.skills()?.title }}</h2>
      </div>

      <div class="sv-grid">
        @for (cat of categories(); track cat.name) {
          <div class="sv-card">
            <div class="sv-card-head">
              <span class="sv-cat-name">{{ cat.name }}</span>
              <span class="sv-count">{{ cat.count }} {{ cat.count === 1 ? 'skill' : 'skills' }}</span>
            </div>
            <div class="sv-bar" role="presentation">
              <div class="sv-bar-fill" [style.width.%]="cat.widthPct"></div>
            </div>
            <div class="sv-chips">
              @for (item of cat.items; track item) {
                <span class="sv-chip">{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .sv { max-width: 1100px; margin: 0 auto; padding: 64px 24px; }
    .sv-head { margin-bottom: 32px; }
    .sv-label {
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--accent-secondary);
    }
    .sv-title {
      font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800;
      letter-spacing: -0.02em; color: var(--text-primary); margin: 8px 0 0;
    }
    .sv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .sv-card {
      padding: 22px;
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      transition: transform var(--transition-base), border-color var(--transition-base);
    }
    .sv-card:hover { transform: translateY(-4px); border-color: var(--border-active); }
    .sv-card-head {
      display: flex; justify-content: space-between; align-items: baseline;
      gap: 12px; margin-bottom: 12px;
    }
    .sv-cat-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .sv-count { font-size: 0.78rem; color: var(--text-tertiary); white-space: nowrap; }
    .sv-bar {
      height: 6px; border-radius: var(--radius-full);
      background: rgba(99, 102, 241, 0.12); overflow: hidden; margin-bottom: 16px;
    }
    .sv-bar-fill {
      height: 100%; border-radius: var(--radius-full);
      background: var(--gradient-primary);
      transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sv-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .sv-chip {
      font-size: 0.78rem; padding: 4px 11px; border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color); color: var(--text-secondary);
    }
    @media (max-width: 600px) { .sv { padding: 48px 16px; } }
  `],
})
export class SkillsVisualizationComponent {
  protected readonly pds = inject(PortfolioDataService);

  protected readonly categories = computed(() => {
    const cats = (this.pds.skills()?.categories ?? []) as Array<{ name: string; items: string[] }>;
    const max = Math.max(1, ...cats.map((c) => c.items?.length ?? 0));
    return cats.map((c) => {
      const count = c.items?.length ?? 0;
      return {
        name: c.name,
        items: c.items ?? [],
        count,
        // Honest breadth signal: skills-in-category relative to largest category.
        widthPct: Math.round((count / max) * 100),
      };
    });
  });
}
