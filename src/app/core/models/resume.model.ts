import type { AccentColor, IconName, Percentage } from '../types/common.types';
import type { Skill } from './skill.model';

/** Achievement row (Resume). */
export interface Achievement {
  readonly id: string;
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
  readonly accent?: AccentColor;
}

/** Language proficiency ring. */
export interface LanguageProficiency {
  readonly id: string;
  readonly name: string;
  readonly level: string;
  readonly value: Percentage;
  readonly accent?: AccentColor;
}

/** Interest chip. */
export interface Interest {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
}

/** A résumé work-history entry (lighter than the Experience timeline). */
export interface ResumeWork {
  readonly id: string;
  readonly period: string;
  readonly role: string;
  readonly company: string;
  readonly location: string;
  readonly description: string;
  readonly accent?: AccentColor;
}

/** A named group of skills shown in the resume document. */
export interface SkillGroup {
  readonly id: string;
  readonly category: string;
  readonly items: readonly string[];
}

/** A certification / course row. */
export interface ResumeCertification {
  readonly id: string;
  readonly title: string;
  readonly issuer: string;
}

/** A single "Projects Highlight" row in the resume document. */
export interface ProjectHighlight {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly description: string;
  readonly icon: IconName;
  readonly technologies: readonly string[];
}

/** resume.json payload. */
export interface ResumeConfig {
  readonly summary: string;
  readonly openToWork: { readonly title: string; readonly caption: string };
  readonly work: readonly ResumeWork[];
  readonly professionalSkills: readonly Skill[];
  readonly achievements: readonly Achievement[];
  readonly languages: readonly LanguageProficiency[];
  readonly interests: readonly Interest[];
  /** Document-preview data (redesigned Resume page). */
  readonly pageCount: number;
  readonly skillGroups: readonly SkillGroup[];
  readonly certifications: readonly ResumeCertification[];
  readonly projectHighlights: readonly ProjectHighlight[];
  readonly suggestions: readonly string[];
}
