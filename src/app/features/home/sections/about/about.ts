import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { VideoShowcase } from '../../../../shared/components/video-showcase/video-showcase';
import { AboutManifesto } from './components/about-manifesto';
import { AboutPortrait } from './components/about-portrait';
import { AboutSignature } from './components/about-signature';
import { AboutStats } from './components/about-stats';
import { AboutStory } from './components/about-story';
import { CareerTimeline } from './components/career-timeline';
import { EngineeringPrinciples } from './components/engineering-principles';
import { EngineeringStack } from './components/engineering-stack';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    Reveal,
    VideoShowcase,
    AboutSignature,
    AboutManifesto,
    AboutPortrait,
    AboutStory,
    EngineeringPrinciples,
    CareerTimeline,
    EngineeringStack,
    AboutStats,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly store = inject(PortfolioStore);
  protected readonly about = this.store.about;
  protected readonly profile = this.store.profile;
  protected readonly media = this.store.media;
}
