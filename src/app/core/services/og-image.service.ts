import { Injectable, isDevMode } from '@angular/core';

export interface OGImageOptions {
  title: string;
  description?: string;
  image?: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class OGImageService {
  private ogDomain = isDevMode() ? 'http://localhost:4200' : 'https://your-domain.com';

  setOpenGraphTags(options: OGImageOptions): void {
    if (typeof document === 'undefined') return;

    const tags = {
      'og:title': options.title,
      'og:description': options.description || '',
      'og:url': options.url,
      'og:image': options.image || this.generateDefaultOGImage(options.title),
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': options.title,
      'twitter:description': options.description || '',
      'twitter:image': options.image || this.generateDefaultOGImage(options.title),
    };

    Object.entries(tags).forEach(([property, content]) => {
      const meta =
        document.querySelector(`meta[property="${property}"]`) || document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      if (!meta.parentNode) {
        document.head.appendChild(meta);
      }
    });
  }

  private generateDefaultOGImage(title: string): string {
    const encodedTitle = encodeURIComponent(title);
    return `${this.ogDomain}/api/og?title=${encodedTitle}`;
  }
}
