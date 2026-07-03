import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PortfolioDataService } from '../services/portfolio-data.service';

/**
 * Reusable "Download Resume" button.
 * Pulls the PDF path from the portfolio data service (meta.resumePdf) so the
 * link stays in sync with the rest of the site, and matches the indigo/violet
 * design system used elsewhere.
 */
@Component({
  selector: 'app-resume-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="pds.meta()?.resumePdf || '/rabin_resume.pdf'"
      download
      class="resume-download-btn"
      aria-label="Download Rabin R's resume as PDF">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span class="text">Download Resume</span>
    </a>
  `,
  styles: [`
    .resume-download-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      border: 1px solid rgba(139, 92, 246, 0.5);
      box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
    }
    .resume-download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(99, 102, 241, 0.5);
    }
    .resume-download-btn:active {
      transform: translateY(0);
    }
    .resume-download-btn svg {
      flex-shrink: 0;
    }
  `]
})
export class ResumeButtonComponent {
  protected readonly pds = inject(PortfolioDataService);
}
