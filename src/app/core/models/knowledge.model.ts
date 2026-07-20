import type { AccentColor, IsoDate } from '../types/common.types';

/** Logical grouping for a knowledge entry — one per Knowledge Hub section. */
export type KnowledgeCategory =
  | 'angular-tips'
  | 'snippets'
  | 'interview'
  | 'patterns'
  | 'system-design'
  | 'architecture'
  | 'bug-diary'
  | 'journal';

/** Self-assessed depth of an entry, surfaced as a badge. */
export type KnowledgeDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** A fenced code sample inside an entry body. */
export interface KnowledgeCode {
  readonly language: string;
  readonly code: string;
}

/** One block of an entry's long-form body. */
export interface KnowledgeSection {
  readonly heading?: string;
  readonly paragraphs?: readonly string[];
  readonly code?: KnowledgeCode;
  /** Bulleted takeaways rendered as a list. */
  readonly bullets?: readonly string[];
}

/** A single Knowledge Hub entry (tip, snippet, note, article, diary page…). */
export interface KnowledgeEntry {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly category: KnowledgeCategory;
  /** One-line teaser shown on the card and in SEO description. */
  readonly summary: string;
  readonly tags: readonly string[];
  readonly date: IsoDate;
  readonly readingMinutes: number;
  readonly difficulty?: KnowledgeDifficulty;
  /** Card accent; defaults to the category's accent when omitted. */
  readonly accent?: AccentColor;
  readonly featured?: boolean;
  /** Long-form content shown on the detail page. */
  readonly body: readonly KnowledgeSection[];
}

/** Display metadata for a category (label, blurb, icon, accent, count). */
export interface KnowledgeCategoryMeta {
  readonly key: KnowledgeCategory;
  readonly label: string;
  readonly blurb: string;
  /** App icon registry name (see core/config/icons.data). */
  readonly icon: string;
  readonly accent: AccentColor;
}

/** knowledge.json payload. */
export interface KnowledgeConfig {
  readonly categories: readonly KnowledgeCategoryMeta[];
  readonly entries: readonly KnowledgeEntry[];
}
