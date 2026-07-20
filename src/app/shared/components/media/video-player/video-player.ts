import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type VideoProvider = 'youtube' | 'vimeo' | 'file';

/**
 * Lazy "facade" video player.
 *
 * Until the viewer clicks play, only a poster image and a play button are in
 * the DOM — no `<iframe>`, no `<video>`, no third-party script. YouTube's embed
 * alone pulls ~700KB and dozens of requests, so deferring it keeps that cost off
 * the initial load of every page that shows a clip.
 *
 * The real player is only created after a client-side click, so the heavy embed
 * never renders during prerendering. That also sidesteps the iframe-`[src]`
 * resource-URL sanitiser, which we satisfy once, on activation, via
 * `bypassSecurityTrustResourceUrl` for the known YouTube/Vimeo hosts.
 */
@Component({
  selector: 'app-video-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="vp">
      <div class="vp__frame" [style.aspect-ratio]="aspectRatio()">
        @if (activated()) {
          @if (provider() === 'file') {
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <video
              class="vp__media"
              [src]="src()"
              [poster]="poster()"
              controls
              autoplay
              playsinline
            ></video>
          } @else {
            <iframe
              class="vp__media"
              [src]="embedUrl()"
              [title]="title()"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          }
        } @else {
          <button
            type="button"
            class="vp__poster"
            (click)="activate()"
            [attr.aria-label]="'Play video: ' + title()"
          >
            @if (poster()) {
              <img class="vp__thumb" [src]="poster()" alt="" loading="lazy" decoding="async" />
            }
            <span class="vp__scrim"></span>
            <span class="vp__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            @if (duration()) {
              <span class="vp__duration">{{ duration() }}</span>
            }
          </button>
        }
      </div>
      @if (caption()) {
        <figcaption class="vp__caption">{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .vp {
      margin: 0;
    }
    .vp__frame {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: var(--radius-card, 1rem);
      border: 1px solid var(--color-border-subtle);
      background: var(--color-bg-elevated);
    }
    .vp__media,
    .vp__poster {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .vp__poster {
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      cursor: pointer;
      background: var(--color-bg-elevated);
    }
    .vp__thumb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .vp__scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgb(0 0 0 / 10%), rgb(0 0 0 / 45%));
      transition: background 0.2s ease;
    }
    .vp__poster:hover .vp__scrim {
      background: linear-gradient(180deg, rgb(0 0 0 / 20%), rgb(0 0 0 / 55%));
    }
    .vp__play {
      position: relative;
      display: grid;
      place-items: center;
      width: 4rem;
      height: 4rem;
      padding-left: 0.25rem;
      color: #fff;
      border-radius: 50%;
      background: color-mix(in srgb, var(--color-brand-purple) 82%, transparent);
      box-shadow: 0 8px 30px rgb(0 0 0 / 35%);
      transform: scale(1);
      transition:
        transform 0.2s ease,
        background 0.2s ease;
    }
    .vp__poster:hover .vp__play {
      transform: scale(1.08);
      background: var(--color-brand-purple);
    }
    .vp__poster:focus-visible {
      outline: 2px solid var(--color-brand-cyan);
      outline-offset: 3px;
    }
    .vp__duration {
      position: absolute;
      right: 0.625rem;
      bottom: 0.625rem;
      padding: 0.15rem 0.5rem;
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      color: #fff;
      background: rgb(0 0 0 / 70%);
      border-radius: var(--radius-pill, 999px);
    }
    .vp__caption {
      margin-top: 0.625rem;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--color-fg-muted);
      text-align: center;
    }
    @media (prefers-reduced-motion: reduce) {
      .vp__scrim,
      .vp__play {
        transition: none;
      }
    }
  `,
})
export class VideoPlayer {
  private readonly sanitizer = inject(DomSanitizer);

  /** Where the clip comes from. `file` plays a self-hosted `src` in a `<video>`. */
  readonly provider = input<VideoProvider>('youtube');

  /**
   * For `youtube`/`vimeo`, the bare video id (e.g. `dQw4w9WgXcQ`).
   * For `file`, the full URL/path to the media served with the app.
   */
  readonly src = input.required<string>();

  /** Poster/thumbnail shown before play. Strongly recommended for perf. */
  readonly poster = input('');

  /** Accessible title of the clip; also the iframe title. */
  readonly title = input('Video');

  /** Optional visible caption under the player. */
  readonly caption = input('');

  /** Optional badge, e.g. `2:14`. Purely cosmetic. */
  readonly duration = input('');

  /** CSS `aspect-ratio` for the frame. Defaults to 16:9. */
  readonly aspectRatio = input('16 / 9');

  protected readonly activated = signal(false);

  protected readonly embedUrl = computed<SafeResourceUrl>(() => {
    const id = encodeURIComponent(this.src());
    const url =
      this.provider() === 'vimeo'
        ? `https://player.vimeo.com/video/${id}?autoplay=1`
        : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected activate(): void {
    this.activated.set(true);
  }
}
