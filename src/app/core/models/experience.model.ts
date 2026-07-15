import type { AccentColor, IconName } from '../types/common.types';

export type EmploymentType = 'Full Time' | 'Freelance' | 'Contract' | 'Internship';

/** Timeline experience entry (Experience & Resume pages). */
export interface Experience {
  readonly id: string;
  readonly role: string;
  readonly company: string;
  readonly employmentType: EmploymentType;
  readonly startYear: string;
  readonly endYear: string;
  readonly location?: string;
  readonly description: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
  readonly achievements: readonly string[];
  readonly featured?: boolean;
}

/** A skill-evolution node ("Angular 2020", "Flutter 2023"). */
export interface SkillEvolutionPoint {
  readonly id: string;
  readonly label: string;
  readonly year: string;
  /** Brand logo asset path. */
  readonly logo: string;
  readonly accent?: AccentColor;
}

/** A labelled proficiency row for "Experience Highlights". */
export interface HighlightMetric {
  readonly label: string;
  readonly value: number;
}

/** experience.json payload. */
export interface ExperienceConfig {
  readonly timeline: readonly Experience[];
  readonly highlights: readonly HighlightMetric[];
  readonly evolution?: readonly SkillEvolutionPoint[];
  readonly quote?: { readonly text: string; readonly author: string };
}
