import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, AccentColor, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger, ResponsiveImage } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Skills & Technologies page — category card grid of tech tiles. */
@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger, ResponsiveImage],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  host: { class: 'block' },
})
export class SkillsPage {
  private readonly data = inject(DataService);

  protected readonly skills = this.data.load('skills');

  /** Accent token that drives the category icon-badge color (see skills.scss). */
  protected badgeAccent(accent: AccentColor = 'purple'): AccentColor {
    return accent;
  }

  protected readonly trackById = trackById;
}
