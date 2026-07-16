import { DOCUMENT, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';

import { WORKING_IMAGES, WorkingImageName } from '../../../../core/constants/working-images';

const BASE = 'assets/images/working';

/**
 * Renders a working photo as a `<picture>` with a WebP srcset and JPEG fallback.
 *
 * Widths come from the generated manifest, so the srcset never advertises a file
 * that was not produced for that source.
 */
@Component({
  selector: 'app-responsive-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './responsive-image.html',
  styleUrl: './responsive-image.scss',
  host: { class: 'block' },
})
export class ResponsiveImage implements OnInit {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly name = input.required<WorkingImageName>();

  /** Empty string marks the image decorative; it then gets aria-hidden. */
  readonly alt = input.required<string>();

  /** `sizes` attribute — how wide the image renders at each breakpoint. */
  readonly sizes = input('100vw');

  /**
   * Loads immediately instead of lazily. Set for anything above the fold —
   * lazy-loading an in-viewport image delays it by a round trip.
   */
  readonly eager = input(false, { transform: booleanAttr });

  /**
   * `fetchpriority="high"`. Reserve this for the LCP element itself: marking
   * several images high is self-defeating, as they then contend with each other.
   * Implies eager.
   */
  readonly priority = input(false, { transform: booleanAttr });

  protected readonly meta = computed(() => WORKING_IMAGES[this.name()]);

  protected readonly webpSrcset = computed(() =>
    this.meta()
      .widths.map((w) => `${BASE}/${this.name()}-${w}.webp ${w}w`)
      .join(', '),
  );

  protected readonly fallbackSrc = computed(() => `${BASE}/${this.name()}.jpg`);

  protected readonly decorative = computed(() => this.alt().trim() === '');

  protected readonly loading = computed(() => (this.priority() || this.eager() ? 'eager' : 'lazy'));

  /**
   * Preloads a `priority` image from `<head>`.
   *
   * Even marked fetchpriority=high, the request cannot start until the parser
   * reaches the `<img>` in the body. A preload hint starts it as the document
   * head is read, which is worth ~200ms of LCP on a phone connection. This is
   * what NgOptimizedImage does for its own priority images.
   *
   * Server-only and intentionally so: each route is prerendered separately, so
   * the hint is written into the HTML of the page that actually renders the
   * image, rather than into every page from the shared index.html. On the
   * client the image is already in the DOM, so a preload would be redundant.
   */
  ngOnInit(): void {
    if (!this.priority() || !isPlatformServer(this.platformId)) return;

    const link = this.doc.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'image');
    link.setAttribute('type', 'image/webp');
    link.setAttribute('imagesrcset', this.webpSrcset());
    link.setAttribute('imagesizes', this.sizes());
    link.setAttribute('fetchpriority', 'high');
    this.doc.head.appendChild(link);
  }
}

function booleanAttr(value: boolean | string): boolean {
  return value !== false && value !== 'false';
}
