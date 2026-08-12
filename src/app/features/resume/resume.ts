import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';

import { Button } from '../../shared/components/button/button';
import { SITE_SETTINGS, SITE_URL } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Reveal } from '../../shared/directives/reveal';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { Seo } from '../../core/services/seo';
import { breadcrumbSchema } from '../../core/services/structured-data';
import type { PortfolioSkill } from '../../core/models/portfolio.models';

/**
 * On-page résumé.
 *
 * The HTML version is the canonical one — crawlable, accessible, and printable
 * via the print stylesheet. The PDF is a download, not the source of truth.
 */
@Component({
  selector: 'app-resume',
  imports: [DatePipe, SectionHeader, Button, Reveal],
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
  protected readonly sections = this.store.sections;
  protected readonly uiCopy = this.store.uiCopy;
  protected readonly education = computed(() => this.profile().education);
  protected readonly certifications = computed(() => this.profile().certifications);
  protected readonly updated = computed(() => new Date(this.profile().resumeUpdated));

  protected itemList(items: readonly (string | PortfolioSkill)[]): string {
    return items.map((item) => (typeof item === 'string' ? item : item.name)).join(' · ');
  }

  constructor() {
    this.seo.apply({
      title: SITE_SETTINGS.seo.resumeTitle,
      description: SITE_SETTINGS.seo.resumeDescription,
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
