import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Button } from '../../../../shared/components/button/button';
import { CursorTarget } from '../../../../shared/directives/cursor-target';
import { MediaImage } from '../../../../shared/components/media-image/media-image';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';

@Component({
  selector: 'app-services',
  imports: [SectionHeader, Button, MediaImage, Reveal, CursorTarget],
  templateUrl: './services.html',
  styleUrl: './services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  private readonly store = inject(PortfolioStore);
  protected readonly media = this.store.media;

  protected readonly services = this.store.services;
  /** Index of the row currently expanded; only one is open at a time. */
  protected readonly openIndex = signal<string | null>(null);

  protected toggle(index: string): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
