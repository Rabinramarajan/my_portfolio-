import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CursorTarget } from '../../directives/cursor-target';
import { MediaImage } from '../media-image/media-image';
import { Reveal } from '../../directives/reveal';
import type { PortfolioProject } from '../../../core/models/portfolio.models';

/**
 * Project card used on the home reel and the work index.
 *
 * The whole card is one anchor — hover metadata and 3D tilt are decoration on
 * top of a single, obvious link target rather than a nest of clickable regions.
 */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, MediaImage, Reveal, CursorTarget],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<PortfolioProject>();
  /** Display index shown in the corner, e.g. "01". */
  readonly index = input<string>();
  readonly priority = input(false);
  readonly layout = input<'tall' | 'wide'>('tall');
  /**
   * Level for the card's title. Defaults to 3, which is right under a section
   * heading; the /work index passes 2 because there the page heading is the
   * `h1` directly above the grid.
   */
  readonly headingLevel = input<2 | 3>(3);
}
