import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { CursorTarget } from '../../directives/cursor-target';
import { Parallax } from '../../directives/parallax';
import type { PortfolioMedia } from '../../../core/models/portfolio.models';

/**
 * Responsive image with a clip-path reveal.
 *
 * Intrinsic `width`/`height` are always emitted and the aspect ratio is
 * reserved in CSS, so nothing here can shift layout — the reveal animates a
 * clip-path and a scale, both compositor-only.
 */
@Component({
  selector: 'app-media-image',
  imports: [Parallax, CursorTarget],
  templateUrl: './media-image.html',
  styleUrl: './media-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-loaded]': 'loaded()', '[class.is-failed]': 'failed()' },
})
export class MediaImage {
  readonly media = input.required<PortfolioMedia>();
  readonly priority = input(false);
  readonly rounded = input(true);
  readonly parallax = input(false);
  readonly sizes = input('(max-width: 768px) 100vw, 50vw');
  readonly cursorLabel = input<string>();

  protected readonly loaded = signal(false);
  protected readonly failed = signal(false);
  protected readonly ratio = computed(
    () => this.media().displayAspect ?? `${this.media().width} / ${this.media().height}`,
  );
  protected readonly contained = computed(() => this.media().fit === 'contain');

  protected onLoad(): void {
    this.loaded.set(true);
  }

  /** A missing asset degrades to a labelled placeholder rather than a broken icon. */
  protected onError(): void {
    this.failed.set(true);
    this.loaded.set(true);
  }
}
