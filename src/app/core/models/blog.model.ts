import type { IsoDate } from '../types/common.types';

/** Blog article summary (Blog page). */
export interface BlogPost {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly cover: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly author: string;
  readonly date: IsoDate;
  readonly readingMinutes: number;
  readonly featured?: boolean;
}

/** Sidebar category with an article count. */
export interface BlogCategory {
  readonly name: string;
  readonly count: number;
}

/** blogs.json payload. */
export interface BlogConfig {
  readonly categories: readonly BlogCategory[];
  readonly posts: readonly BlogPost[];
  readonly popularIds: readonly string[];
  readonly newsletter: {
    readonly heading: string;
    readonly caption: string;
    readonly placeholder: string;
  };
  readonly quote: { readonly text: string; readonly author: string };
}
