import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';

import { Button } from '../../shared/components/button/button';
import { SITE_URL } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { Seo } from '../../core/services/seo';
import { breadcrumbSchema } from '../../core/services/structured-data';

/**
 * On-page résumé.
 *
 * The HTML version is the canonical one — crawlable, accessible, and printable
 * via the print stylesheet. The PDF is a download, not the source of truth.
 */
@Component({
  selector: 'app-resume',
  imports: [DatePipe, SectionHeader, Button],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resume {
  private readonly store = inject(PortfolioStore);
  private readonly seo = inject(Seo);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly profile = this.store.profile;
  protected readonly experience = this.store.experience;
  protected readonly skills = this.store.skills;
  protected readonly education = computed(() => this.profile().education);
  protected readonly certifications = computed(() => this.profile().certifications);
  protected readonly updated = computed(() => new Date(this.profile().resumeUpdated));

  constructor() {
    this.seo.apply({
      title: `Rabin R — Angular Developer Experience & Résumé`,
      description: `Experience, skills, and background for Rabin R — Senior Frontend Angular Developer specializing in Angular, TypeScript, RxJS, Ionic, and enterprise web application architecture.`,
      path: '/resume',
      type: 'profile',
    });
    this.seo.setStructuredData(
      breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Résumé', url: `${SITE_URL}/resume` },
      ]),
    );
  }

  protected print(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}
