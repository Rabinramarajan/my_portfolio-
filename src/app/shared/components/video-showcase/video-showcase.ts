import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { DeviceCapability } from '../../../core/services/device-capability';
import type { PortfolioVideo } from '../../../core/models/portfolio.models';

/**
 * Autoplaying showcase video that only ever downloads what it needs.
 *
 * The `<source>` elements are withheld until the video scrolls near the
 * viewport, so off-screen videos cost exactly one poster image. Playback is
 * tied to intersection, so a video that scrolls away stops decoding frames.
 */
@Component({
  selector: 'app-video-showcase',
  templateUrl: './video-showcase.html',
  styleUrl: './video-showcase.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoShowcase {
  private readonly device = inject(DeviceCapability);
  private readonly destroyRef = inject(DestroyRef);
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('el');

  readonly video = input.required<PortfolioVideo>();
  readonly rounded = input(true);
  readonly autoplay = input(true);
  readonly loop = input(true);
  /** Shows a mute/play control. Off for purely decorative background loops. */
  readonly controls = input(false);

  protected readonly activated = signal(false);
  protected readonly playing = signal(false);
  protected readonly failed = signal(false);
  protected readonly ratio = computed(() => `${this.video().width} / ${this.video().height}`);
  /** Save-data and reduced-motion users get the poster and nothing else. */
  protected readonly posterOnly = computed(() => !this.device.animationsEnabled());

  constructor() {
    afterNextRender(() => this.observe());
  }

  private observe(): void {
    const element = this.videoRef()?.nativeElement;
    if (!element || this.posterOnly()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.activated.set(true);
          if (this.autoplay()) void this.play();
        } else if (this.playing()) {
          element.pause();
          this.playing.set(false);
        }
      },
      { rootMargin: '200px 0px', threshold: 0.15 },
    );

    observer.observe(element);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  protected async toggle(): Promise<void> {
    const element = this.videoRef()?.nativeElement;
    if (!element) return;
    this.activated.set(true);
    if (this.playing()) {
      element.pause();
      this.playing.set(false);
    } else {
      await this.play();
    }
  }

  private async play(): Promise<void> {
    const element = this.videoRef()?.nativeElement;
    if (!element) return;
    try {
      // Sources are added by the template after `activated`; give the element a
      // tick to pick them up before asking it to play.
      element.load();
      await element.play();
      this.playing.set(true);
    } catch {
      // Autoplay refusal is expected on some platforms — the poster stands in.
      this.playing.set(false);
    }
  }

  protected onError(): void {
    this.failed.set(true);
  }
}
