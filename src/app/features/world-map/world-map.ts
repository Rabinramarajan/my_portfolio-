import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import type { WorldMapConfig } from '../../core/models';

@Component({
  selector: 'app-world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger],
  templateUrl: './world-map.html',
  styleUrl: './world-map.scss',
  host: { class: 'block' },
})
export class WorldMapPage {
  private readonly dataService = inject(DataService);
  readonly worldMap = signal<WorldMapConfig | null>(null);

  constructor() {
    effect(() => {
      const resource = this.dataService.load('world-map');
      if (resource) {
        this.worldMap.set(resource as unknown as WorldMapConfig);
      }
    });
  }
}
