import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PortfolioDataService } from '../services/portfolio-data.service';
import { UiButtonDirective } from '../ui';

/**
 * Reusable "Download Resume" button.
 * Pulls the PDF path from the portfolio data service (meta.resumePdf) so the
 * link stays in sync with the rest of the site, and uses the design-system
 * button primitive (uiButton) for consistent styling.
 */
@Component({
  selector: 'app-resume-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButtonDirective],
  template: `
    <a
      uiButton
      [href]="pds.meta()?.resumePdf || '/rabin_resume.pdf'"
      download
      aria-label="Download Rabin R's resume as PDF">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span class="text">Download Resume</span>
    </a>
  `,
})
export class ResumeButtonComponent {
  protected readonly pds = inject(PortfolioDataService);
}
