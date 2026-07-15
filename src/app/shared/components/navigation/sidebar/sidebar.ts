import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AnimatedButton } from '../../buttons/animated-button/animated-button';
import { ThemeSwitcher } from '../../layout/theme-switcher/theme-switcher';
import { DataService, trackById } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

/**
 * Primary left navigation shell (inner pages). Fully data-driven:
 * profile header, nav items, socials, CV download and availability all
 * come from JSON via the Resource API.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, AnimatedButton, ThemeSwitcher],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: { class: 'block' },
})
export class Sidebar {
  private readonly data = inject(DataService);

  /** Show the bottom theme toggle (design varies per page). */
  readonly showThemeToggle = input(true);

  /** Emitted when a navigation link is activated (used to close the mobile drawer). */
  readonly navigate = output<void>();

  protected readonly profile = this.data.profile();
  protected readonly navigation = this.data.load('navigation');
  protected readonly socials = this.data.load('socials');

  protected readonly trackById = trackById;
}
