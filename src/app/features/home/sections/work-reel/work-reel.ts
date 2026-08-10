import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Button } from '../../../../shared/components/button/button';
import { MediaImage } from '../../../../shared/components/media-image/media-image';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { ProjectCard } from '../../../../shared/components/project-card/project-card';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';

@Component({
  selector: 'app-work-reel',
  imports: [SectionHeader, ProjectCard, Button, MediaImage, Reveal],
  templateUrl: './work-reel.html',
  styleUrl: './work-reel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkReel {
  private readonly store = inject(PortfolioStore);
  protected readonly media = this.store.media;
  protected readonly projects = this.store.featuredProjects;

  protected label(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
