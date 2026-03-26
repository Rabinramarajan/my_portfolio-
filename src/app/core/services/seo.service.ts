import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private doc = inject(DOCUMENT);

  private readonly baseUrl = 'https://rabinramarajan.dev';
  private readonly defaultImage = `${this.baseUrl}/image/og-preview.png`;
  private readonly defaultKeywords = 'Angular Developer, Senior Angular Developer, Frontend Developer, Angular Performance Optimization, Angular Signals Developer, RxJS Developer, NgRx Developer, Enterprise Angular Developer, TypeScript Developer, Ionic Developer, Remote Angular Developer';

  updateMetadata(metadata: PageMetadata) {
    // ── Title (60 char target)
    this.titleService.setTitle(metadata.title);

    const desc = metadata.description;
    const img  = metadata.image || this.defaultImage;
    const url  = metadata.url ? `${this.baseUrl}/${metadata.url}` : this.baseUrl;
    const kw   = metadata.keywords || this.defaultKeywords;

    // ── Primary ──
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ name: 'keywords',    content: kw });
    this.meta.updateTag({ name: 'author',      content: 'Rabin Ramarajan' });

    // ── OpenGraph ──
    this.meta.updateTag({ property: 'og:title',       content: metadata.title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type',        content: 'website' });
    this.meta.updateTag({ property: 'og:image',       content: img });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:site_name',   content: 'Rabin Ramarajan — Angular Developer Portfolio' });

    // ── Twitter Card ──
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: metadata.title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: img });
    this.meta.updateTag({ name: 'twitter:site',        content: '@rabinramarajan' });
    this.meta.updateTag({ name: 'twitter:creator',     content: '@rabinramarajan' });

    // ── Canonical ──
    this.updateCanonical(url);
  }

  private updateCanonical(url: string) {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
