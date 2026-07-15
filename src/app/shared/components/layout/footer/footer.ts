import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '../../../../core';

/** Global footer — minimal copyright bar over brand watermark. Data-driven. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  host: { class: 'block' },
})
export class Footer {
  private readonly data = inject(DataService);

  protected readonly profile = this.data.profile();
  protected readonly footer = this.data.load('footer');

  /** Current year, so the copyright line never goes stale. */
  protected readonly year = new Date().getFullYear();
}
