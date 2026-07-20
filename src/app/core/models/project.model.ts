import type { IconName } from '../types/common.types';

export type ProjectCategory =
  'Web Applications' | 'Mobile Apps' | 'Dashboard' | 'E-Commerce' | 'UI/UX';

/** Lifecycle stage of a project — drives the two-column layout. */
export type ProjectStatus = 'finished' | 'upcoming';

/** Portfolio project card (Projects page). */
export interface Project {
  readonly id: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly categoryLabel: string;
  readonly description: string;
  readonly image: string | readonly string[];
  readonly technologies: readonly string[];
  readonly featured: boolean;
  /** `finished` (completed) or `upcoming` (in progress). */
  readonly status: ProjectStatus;
  /** Completion percentage for `upcoming` projects (0–100). */
  readonly progress?: number;
  /** Human estimate for `upcoming` projects, e.g. "Q3 2024". */
  readonly estimatedDate?: string;
  readonly liveUrl?: string;
  readonly codeUrl?: string;
  readonly caseStudyUrl?: string;
  readonly createdAt: string;
}

/** A single step in the "Project Process" strip. */
export interface ProcessStep {
  readonly order: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}

/** projects.json payload. */
export interface ProjectsConfig {
  readonly categories: readonly string[];
  readonly items: readonly Project[];
  readonly process: readonly ProcessStep[];
}
