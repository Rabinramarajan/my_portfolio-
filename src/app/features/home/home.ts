import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, AccentColor, trackById, accentVar } from '../../core';
import { AnimatedButton, Footer, GlassCard, Reveal, ResponsiveImage } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Home landing page — sidebar hero layout, data-driven. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, AnimatedButton, Footer, GlassCard, Reveal, ResponsiveImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  host: { class: 'block' },
})
export class Home {
  private readonly data = inject(DataService);

  protected readonly profile = this.data.profile();
  protected readonly home = this.data.load('home');
  protected readonly stats = this.data.load('stats');
  protected readonly technologies = this.data.load('technologies');

  protected readonly homeStats = computed(() => this.stats.value()?.['home'] ?? []);
  protected readonly topTech = computed(() => this.technologies.value()?.top ?? []);

  /** Accent cycle for the "What I do" highlight cards. */
  protected readonly highlightAccents: readonly AccentColor[] = [
    'purple',
    'blue',
    'green',
    'orange',
  ];

  protected readonly trackById = trackById;

  protected accentColor(accent: AccentColor | undefined): string {
    return accentVar(accent);
  }
}
