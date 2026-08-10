import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { PROFILE, SITE_URL } from '../config/portfolio.content';

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
  /** Path only, e.g. `/work/atlas-design-system`. */
  readonly path: string;
  readonly image?: string;
  readonly type?: 'website' | 'article' | 'profile';
  readonly publishedYear?: number;
}

const DEFAULT_IMAGE = '/media/og/default.svg';

/**
 * Owns every head tag the site emits. Runs identically on server and client so
 * crawlers see the same metadata a browser does.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(data: SeoMetadata): void {
    const url = `${SITE_URL}${data.path === '/' ? '' : data.path}`;
    const image = `${SITE_URL}${data.image ?? DEFAULT_IMAGE}`;

    this.title.setTitle(data.title);
    this.setTags({
      description: data.description,
      author: PROFILE.name,
      'og:type': data.type ?? 'website',
      'og:site_name': `${PROFILE.name} — ${PROFILE.role}`,
      'og:title': data.title,
      'og:description': data.description,
      'og:url': url,
      'og:image': image,
      'og:image:alt': data.title,
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description,
      'twitter:image': image,
    });
    this.setCanonical(url);
  }

  /** Replaces the page-scoped JSON-LD block. One block per page keeps parsing unambiguous. */
  setStructuredData(schema: object): void {
    const id = 'ld-page';
    this.document.getElementById(id)?.remove();
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  private setTags(tags: Record<string, string>): void {
    for (const [key, content] of Object.entries(tags)) {
      const selector = key.startsWith('og:') ? `property="${key}"` : `name="${key}"`;
      this.meta.updateTag(
        key.startsWith('og:') ? { property: key, content } : { name: key, content },
        selector,
      );
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
