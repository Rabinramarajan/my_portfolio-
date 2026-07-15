import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, trackById, AboutSubtitlePart, accentVar } from '../../core';
import { Badge, Breadcrumb, GlassCard, QuoteCard, StatsCard, Reveal, Footer } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';


/** About page — data-driven from about/profile/stats/services. */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Badge, Breadcrumb, GlassCard, QuoteCard, StatsCard, Reveal, Footer],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  host: { class: 'block' },
})
export class AboutPage {
  private readonly data = inject(DataService);

  protected readonly about = this.data.load('about');
  protected readonly profile = this.data.profile();
  protected readonly stats = this.data.load('stats');
  protected readonly services = this.data.load('services');

  protected readonly aboutStats = computed(() => this.stats.value()?.['about'] ?? []);

  protected readonly trackById = trackById;

  /** Resolve a subtitle phrase colour (null → inherit foreground). */
  protected partColor(part: AboutSubtitlePart): string | null {
    return !part.accent || part.accent === 'default' ? null : accentVar(part.accent);
  }
}
