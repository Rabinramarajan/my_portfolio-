import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Button } from '../../shared/components/button/button';
import { PROFILE } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { Seo } from '../../core/services/seo';

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

  protected readonly profile = this.store.profile;
  protected readonly experience = this.store.experience;
  protected readonly skills = this.store.skills;
  protected readonly education = computed(() => this.profile().education);
  protected readonly certifications = computed(() => this.profile().certifications);
  protected readonly updated = computed(() => new Date(this.profile().resumeUpdated));

  constructor() {
    this.seo.apply({
      title: `Résumé — ${PROFILE.name}`,
      description: `Experience, skills and background for ${PROFILE.name}, ${PROFILE.role}.`,
      path: '/resume',
      type: 'profile',
    });
  }

  protected print(): void {
    window.print();
  }
}
