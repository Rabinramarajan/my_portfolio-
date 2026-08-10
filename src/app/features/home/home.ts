import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { About } from './sections/about/about';
import { MediaImage } from '../../shared/components/media-image/media-image';
import { Experience } from './sections/experience/experience';
import { Hero } from './sections/hero/hero';
import { Process } from './sections/process/process';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Seo } from '../../core/services/seo';
import { Services } from './sections/services/services';
import { Skills } from './sections/skills/skills';
import { Testimonials } from './sections/testimonials/testimonials';
import { WorkReel } from './sections/work-reel/work-reel';
import { homeSchema } from '../../core/services/structured-data';

@Component({
  selector: 'app-home',
  imports: [Hero, About, Services, WorkReel, Experience, Skills, Process, Testimonials, MediaImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly seo = inject(Seo);
  protected readonly media = inject(PortfolioStore).media;

  constructor() {
    this.seo.apply({
      title: `Rabin R | Angular Developer & Frontend Software Engineer`,
      description:
        'Rabin R is a Senior Angular Developer and Frontend Software Engineer with 4+ years building enterprise-grade web & mobile applications with Angular, TypeScript, RxJS, Ionic, and SSR.',
      path: '/',
      type: 'profile',
    });
    this.seo.setStructuredData(homeSchema());
  }
}
