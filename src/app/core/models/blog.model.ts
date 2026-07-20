import type { IsoDate } from '../types/common.types';

/** A fenced code block inside an article section. */
export interface BlogCodeBlock {
  readonly filename?: string;
  readonly language?: string;
  readonly code: string;
}

/** A tip / callout box inside an article section. */
export interface BlogCallout {
  readonly icon?: string;
  readonly text: string;
}

/** A single content section inside a blog article body. */
export interface BlogSection {
  readonly heading?: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly code?: BlogCodeBlock;
  readonly callout?: BlogCallout;
}

/** A takeaway block rendered at the end of the article. */
export interface BlogTakeaway {
  readonly icon?: string;
  readonly title: string;
  readonly text: string;
}

/** Blog article summary (Blog page). */
export interface BlogPost {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly titleIcon?: string;
  readonly excerpt: string;
  readonly cover: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly author: string;
  readonly date: IsoDate;
  readonly updatedDate?: IsoDate;
  readonly readingMinutes: number;
  readonly likes?: number;
  readonly featured?: boolean;
  /** Full article body — only present for articles with detail content. */
  readonly body?: readonly BlogSection[];
  /** Closing takeaway block. */
  readonly takeaway?: BlogTakeaway;
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
