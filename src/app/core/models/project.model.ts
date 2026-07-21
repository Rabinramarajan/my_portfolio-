import type { AccentColor, IconName } from '../types/common.types';

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
  /** Long-form case study powering `/projects/:slug` (falls back to `id`). */
  readonly detail?: ProjectDetail;
}

/** A labelled fact in the detail page's "Project Summary" sidebar card. */
export interface ProjectSummaryFact {
  readonly label: string;
  readonly value: string;
  readonly icon: IconName;
}

/** A headline number in the "Project Highlights" grid. */
export interface ProjectMetric {
  readonly value: string;
  readonly label: string;
  readonly icon: IconName;
}

/** One of the four capability tiles under "About the Project". */
export interface ProjectPillar {
  readonly title: string;
  readonly icon: IconName;
}

/** A named technology in the detail page's tech-stack strip. */
export interface ProjectTech {
  readonly name: string;
  /** Short badge text used when no brand logo is available, e.g. "TS". */
  readonly short: string;
  readonly accent: AccentColor;
}

/**
 * Long-form content for the `/projects/:slug` detail page.
 * Every field is optional — each section hides when its data is absent, so
 * projects without a written case study still render a valid (shorter) page.
 */
export interface ProjectDetail {
  /** Badge beside the page title, e.g. "Enterprise". */
  readonly tier?: string;
  /** Full narrative shown under "About the Project". */
  readonly overview?: string;
  readonly pillars?: readonly ProjectPillar[];
  readonly features?: readonly string[];
  readonly stack?: readonly ProjectTech[];
  readonly summary?: readonly ProjectSummaryFact[];
  readonly challenges?: readonly string[];
  readonly solutions?: readonly string[];
  readonly metrics?: readonly ProjectMetric[];
  /** Ids of related projects rendered in the sidebar. */
  readonly related?: readonly string[];
  /** Closing pull-quote in the footer band. */
  readonly quote?: string;
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
