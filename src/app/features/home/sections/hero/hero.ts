import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { Button } from '../../../../shared/components/button/button';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { TextReveal } from '../../../../shared/components/text-reveal/text-reveal';
import { WebglField } from '../../../../shared/components/webgl-field/webgl-field';

@Component({
  selector: 'app-hero',
  imports: [Button, TextReveal, Reveal, WebglField],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly store = inject(PortfolioStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly profile = this.store.profile;
  protected readonly localTime = signal('');
  protected readonly availabilityClass = computed(() => `is-${this.profile().availability}`);

  constructor() {
    // Local time is a browser-only detail: rendering it on the server would
    // hydrate to a mismatched value within the minute.
    afterNextRender(() => {
      const tick = () => this.localTime.set(this.formatTime());
      tick();
      const timer = setInterval(tick, 30_000);
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  private formatTime(): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.profile().timezone,
    }).format(new Date());
  }
}
