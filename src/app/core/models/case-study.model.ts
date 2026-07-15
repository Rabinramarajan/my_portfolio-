import type { IconName } from '../types/common.types';

/** A single quantified or qualitative outcome. */
export interface CaseStudyMetric {
  readonly value: string;
  readonly label: string;
  readonly icon?: IconName;
}

/** A named section of narrative content (problem, solution, etc.). */
export interface CaseStudyBlock {
  readonly heading: string;
  /** One or more paragraphs. */
  readonly paragraphs: readonly string[];
}

/** Full case-study detail, keyed by the matching project id. */
export interface CaseStudy {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  readonly categoryLabel: string;
  /** e.g. "Frontend Engineer". */
  readonly role: string;
  /** e.g. "2024". */
  readonly year: string;
  readonly technologies: readonly string[];
  readonly images: readonly string[];
  readonly liveUrl?: string;
  readonly codeUrl?: string;
  /** Narrative sections rendered in order (problem, solution, architecture…). */
  readonly blocks: readonly CaseStudyBlock[];
  /** Key highlights / feature list. */
  readonly highlights: readonly string[];
  /** Real, user-supplied results. Section hidden when empty. */
  readonly metrics: readonly CaseStudyMetric[];
}

/** case-studies.json payload. */
export interface CaseStudiesConfig {
  readonly items: readonly CaseStudy[];
}
