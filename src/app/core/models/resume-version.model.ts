import type { Experience } from './experience.model';
import type { Skill } from './skill.model';

/** Resume version with tailored content for specific roles. */
export interface ResumeVersionData {
  readonly id: string;
  readonly type: 'Frontend' | 'Full Stack' | 'Freelance';
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly featuredExperience: readonly Experience[];
  readonly relevantSkills: readonly Skill[];
  readonly downloadUrl: string;
}

/** resume-versions.json payload. */
export interface ResumeVersionsConfig {
  readonly versions: readonly ResumeVersionData[];
  readonly defaultVersion: 'Frontend' | 'Full Stack' | 'Freelance';
}
