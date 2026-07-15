import { inject, Injectable } from '@angular/core';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';

import { SeoService } from './seo.service';

/** Route `data` shape consumed for SEO. */
interface RouteSeoData {
  readonly description?: string;
  readonly keywords?: readonly string[];
}

/**
 * Custom TitleStrategy that funnels the resolved route title + `data` into
 * {@link SeoService}, keeping title and meta tags in sync on every navigation.
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? 'Portfolio';
    const data = this.deepestData(snapshot) as RouteSeoData;
    this.seo.apply({
      title,
      description: data.description,
      keywords: data.keywords,
      path: snapshot.url,
    });
  }

  private deepestData(snapshot: RouterStateSnapshot): Record<string, unknown> {
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data;
  }
}
