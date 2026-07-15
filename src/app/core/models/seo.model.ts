/** Per-route SEO metadata. */
export interface SeoMeta {
  readonly title: string;
  readonly description: string;
  readonly keywords?: readonly string[];
  readonly image?: string;
}

/** seo.json payload — defaults + per-route overrides keyed by route id. */
export interface SeoConfig {
  readonly siteName: string;
  readonly baseUrl: string;
  readonly defaults: SeoMeta;
  readonly routes: Readonly<Record<string, Partial<SeoMeta>>>;
}
