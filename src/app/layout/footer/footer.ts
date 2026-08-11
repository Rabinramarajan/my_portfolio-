import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../shared/components/button/button';
import { CursorTarget } from '../../shared/directives/cursor-target';
import { LocalClock } from '../../core/services/local-clock.service';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Reveal } from '../../shared/directives/reveal';
import { TextReveal } from '../../shared/components/text-reveal/text-reveal';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Button, Reveal, TextReveal, CursorTarget],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private readonly store = inject(PortfolioStore);
  private readonly clock = inject(LocalClock);

  protected readonly profile = this.store.profile;
  protected readonly uiCopy = this.store.uiCopy;
  protected readonly year = this.clock.currentYear;
  protected readonly availabilityClass = computed(() => `is-${this.profile().availability}`);
}
