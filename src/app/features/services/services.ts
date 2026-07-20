import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, AccentColor, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Services page — freelance offerings grid derived from real skill set. */
@Component({
  selector: 'app-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, PageLayout, GlassCard, Stagger],
  templateUrl: './services.html',
  styleUrl: './services.scss',
  host: { class: 'block' },
})
export class ServicesPage {
  private readonly data = inject(DataService);

  protected readonly offerings = this.data.load('offerings');

  protected accent(accent: AccentColor = 'purple'): AccentColor {
    return accent;
  }

  /** Two-digit, 1-based step label, e.g. 0 → "01". */
  protected stepNo(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected readonly trackById = trackById;
}
