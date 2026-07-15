import type { AccentColor, IconName, Percentage } from '../types/common.types';

/** A proficiency bar within a skill category. */
export interface Skill {
  readonly id: string;
  readonly name: string;
  /** Brand logo asset/URL. Omit when using a Lucide `icon` instead. */
  readonly logo?: string;
  /** Lucide icon name — fallback for concept skills without a brand logo. */
  readonly icon?: IconName;
  readonly level: Percentage;
  readonly accent?: AccentColor;
}

/** A category card of skills (Frontend, Mobile, Backend, ...). */
export interface SkillCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  /** Accent used for the card icon badge. */
  readonly accent?: AccentColor;
  readonly skills: readonly Skill[];
}

/** Circular-progress competency (UI/UX, Responsive, ...). */
export interface Competency {
  readonly id: string;
  readonly label: string;
  readonly value: Percentage;
  readonly accent: AccentColor;
}

/** Radar chart axis value. */
export interface RadarAxis {
  readonly axis: string;
  readonly value: Percentage;
}

/** "Currently Exploring" learning item. */
export interface LearningItem {
  readonly id: string;
  readonly name: string;
  /** Brand logo asset path. */
  readonly logo: string;
  readonly progress: Percentage;
  readonly accent?: AccentColor;
}

/** skills.json payload. */
export interface SkillsConfig {
  readonly categories: readonly SkillCategory[];
  readonly competencies: readonly Competency[];
  readonly radar: readonly RadarAxis[];
  readonly exploring: readonly LearningItem[];
  readonly learningScore: Percentage;
  readonly learningCard: { readonly heading: string; readonly text: string };
  readonly highlights: readonly { readonly value: string; readonly label: string; readonly icon: IconName }[];
  /** "What I value most" chips. */
  readonly values: readonly string[];
}
