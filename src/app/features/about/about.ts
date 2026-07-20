import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, trackById, AboutSubtitlePart, accentVar } from '../../core';
import {
  Badge,
  Breadcrumb,
  GlassCard,
  QuoteCard,
  StatsCard,
  Reveal,
  Footer,
  ResponsiveImage,
} from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import { WorkingImageName } from '../../core/constants/working-images';

interface SheetFrame {
  readonly name: WorkingImageName;
  readonly index: string;
  readonly caption: string;
  readonly alt: string;
}

/**
 * Contact-sheet frames. Deliberately capped at three and rendered small: these
 * sources top out at 1600px, so a full-bleed treatment would upscale them into
 * visible softness. At this size they render sharp even on a 2x display.
 */
const SHEET: readonly SheetFrame[] = [
  {
    name: 'about-portrait',
    index: '01',
    caption: 'At the desk',
    alt: 'Rabin seated at his desk in front of two monitors, facing the camera',
  },
  {
    name: 'about-coffee-shop',
    index: '02',
    caption: 'Remote days',
    alt: 'Rabin working on a laptop at a window table in a coffee shop',
  },
  {
    name: 'about-monitors',
    index: '03',
    caption: 'Build, solve, repeat',
    alt: 'Rabin writing code late at night, lit by a desk lamp and two monitors',
  },
];

/** About page — data-driven from about/profile/stats/services. */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Icon,
    Badge,
    Breadcrumb,
    GlassCard,
    QuoteCard,
    StatsCard,
    Reveal,
    Footer,
    ResponsiveImage,
  ],
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

  protected readonly sheet = SHEET;

  protected readonly trackById = trackById;

  /**
   * Resolve a subtitle phrase colour (null → inherit foreground). Subtitle parts
   * are body text, so purple/green route to the contrast-safe link tokens (raw
   * brand accents fall below 4.5:1 on the light surface).
   */
  protected partColor(part: AboutSubtitlePart): string | null {
    if (!part.accent || part.accent === 'default') return null;
    if (part.accent === 'purple') return 'var(--color-link-accent)';
    if (part.accent === 'green') return 'var(--color-link-success)';
    if (part.accent === 'blue') return 'var(--color-link-blue)';
    return accentVar(part.accent);
  }
}
