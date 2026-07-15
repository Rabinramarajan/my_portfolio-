import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Sidebar } from '../../navigation/sidebar/sidebar';
import { BackgroundGlow } from '../background-glow/background-glow';
import { DataService } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

/**
 * Inner-page application shell.
 * - Desktop (lg+): fixed sidebar + scrollable content.
 * - Mobile/tablet: top bar with a hamburger that opens the sidebar as a
 *   slide-in drawer with a backdrop.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, Icon, Sidebar, BackgroundGlow],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  host: { class: 'block' },
})
export class Shell {
  private readonly data = inject(DataService);

  protected readonly profile = this.data.profile();
  protected readonly menuOpen = signal(false);
}
