import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Picture Component
 * Automatically serves AVIF images with PNG/JPG fallback
 * Handles responsive images with srcset
 *
 * Usage:
 * <app-picture [src]="imagePath" [alt]="altText" />
 */
@Component({
  selector: 'app-picture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <picture>
      @if (avifPath) {
        <source [srcset]="avifPath" type="image/avif" />
      }
      @if (webpPath) {
        <source [srcset]="webpPath" type="image/webp" />
      }
      <img
        [src]="src"
        [alt]="alt"
        [width]="width"
        [height]="height"
        [loading]="loading"
        [decoding]="decoding"
        class="picture-img"
      />
    </picture>
  `,
  styles: [`
    picture {
      display: contents;
    }

    .picture-img {
      width: 100%;
      height: auto;
      display: block;
    }
  `]
})
export class PictureComponent {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() decoding: 'auto' | 'async' | 'sync' = 'async';

  get avifPath(): string | null {
    if (!this.src) return null;
    // Replace .png or .jpg/.jpeg with .avif
    if (this.src.endsWith('.png')) {
      return this.src.replace(/\.png$/i, '.avif');
    }
    if (this.src.endsWith('.jpg') || this.src.endsWith('.jpeg')) {
      return this.src.replace(/\.(jpg|jpeg)$/i, '.avif');
    }
    return null;
  }

  get webpPath(): string | null {
    if (!this.src) return null;
    // Replace .png or .jpg/.jpeg with .webp
    if (this.src.endsWith('.png')) {
      return this.src.replace(/\.png$/i, '.webp');
    }
    if (this.src.endsWith('.jpg') || this.src.endsWith('.jpeg')) {
      return this.src.replace(/\.(jpg|jpeg)$/i, '.webp');
    }
    return null;
  }
}
