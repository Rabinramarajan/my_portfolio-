import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Icon } from '../../ui/icon/icon';
import { ThemeService } from '../../../../core';

export type ThemeSwitcherVariant = 'switch' | 'icon';

/**
 * Theme toggle bound to {@link ThemeService}. Two presentations:
 * - `switch`: labelled row with a track toggle (sidebar).
 * - `icon`: compact icon button (navbar).
 */
@Component({
  selector: 'app-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
  host: { class: 'inline-flex' },
})
export class ThemeSwitcher {
  protected readonly theme = inject(ThemeService);

  readonly variant = input<ThemeSwitcherVariant>('switch');
  readonly label = input('Dark Mode');
}
