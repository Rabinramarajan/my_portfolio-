import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AnimatedButton } from '../../buttons/animated-button/animated-button';
import { ThemeSwitcher } from '../../layout/theme-switcher/theme-switcher';
import { DataService, trackById } from '../../../../core';

/** Floating top navigation used by the Home page. Data-driven from JSON. */
@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AnimatedButton, ThemeSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: { class: 'block' },
})
export class Navbar {
  private readonly data = inject(DataService);

  protected readonly profile = this.data.profile();
  protected readonly navigation = this.data.load('navigation');

  protected readonly trackById = trackById;
}
