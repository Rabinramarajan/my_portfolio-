import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { APP_META } from '../config';

/** Absolute origin used for canonical + og:url tags. */
const SITE_ORIGIN = 'https://www.rabinr.in';

/**
 * Applies document title + meta tags. Called by {@link AppTitleStrategy} on
 * each navigation. Content defaults live in seo.json; per-route overrides are
 * supplied via route `data`.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /** Update title + description/keywords/OG/Twitter + canonical for the active route. */
  apply(meta: {
    readonly title: string;
    readonly description?: string | undefined;
    readonly keywords?: readonly string[] | undefined;
    readonly image?: string | undefined;
    readonly path?: string | undefined;
  }): void {
    const fullTitle = `${meta.title} · ${APP_META.author}`;
    this.title.setTitle(fullTitle);

    // Description / keywords / image are set when supplied and removed when
    // omitted — otherwise a route without them would inherit the previous
    // page's tags, serving stale metadata to crawlers and social share cards.
    if (meta.description) {
      this.meta.updateTag({ name: 'description', content: meta.description });
      this.meta.updateTag({ property: 'og:description', content: meta.description });
      this.meta.updateTag({ name: 'twitter:description', content: meta.description });
    } else {
      this.meta.removeTag("name='description'");
      this.meta.removeTag("property='og:description'");
      this.meta.removeTag("name='twitter:description'");
    }
    if (meta.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: meta.keywords.join(', ') });
    } else {
      this.meta.removeTag("name='keywords'");
    }
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (meta.image) {
      this.meta.updateTag({ property: 'og:image', content: meta.image });
      this.meta.updateTag({ name: 'twitter:image', content: meta.image });
    } else {
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("name='twitter:image'");
    }

    if (meta.path !== undefined) {
      const url = `${SITE_ORIGIN}${meta.path === '/' ? '' : meta.path.split('?')[0]}` || SITE_ORIGIN;
      this.meta.updateTag({ property: 'og:url', content: url });
      this.setCanonical(url);
    }
  }

  /** Maintain a single <link rel="canonical"> reflecting the active route. */
  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
