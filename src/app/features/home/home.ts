import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { About } from './sections/about/about';
import { Experience } from './sections/experience/experience';
import { HeroSectionComponent } from './sections/hero/hero';
import { HeroTicker } from './sections/hero/components/hero-ticker';
import { Process } from './sections/process/process';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Seo } from '../../core/services/seo';
import { Services } from './sections/services/services';
import { Ecosystem } from './sections/ecosystem/ecosystem';
import { Testimonials } from './sections/testimonials/testimonials';
import { WorkReel } from './sections/work-reel/work-reel';
import { SITE_SETTINGS } from '../../core/config/portfolio.content';
import { homeSchema } from '../../core/services/structured-data';

@Component({
  selector: 'app-home',
  imports: [HeroSectionComponent, HeroTicker, About, Services, WorkReel, Experience, Ecosystem, Process, Testimonials],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly seo = inject(Seo);
  protected readonly media = inject(PortfolioStore).media;

  constructor() {
    this.seo.apply({
      title: SITE_SETTINGS.seo.homeTitle,
      description: SITE_SETTINGS.seo.homeDescription,
      path: '/',
      type: 'profile',
    });
    this.seo.setStructuredData(homeSchema());
  }
}
