/** Skill node in the skills tree. */
export interface SkillNode {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'core' | 'frontend' | 'backend' | 'mobile' | 'devops' | 'soft-skills';
  readonly proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  readonly yearsOfExperience: number;
  readonly prerequisites?: string[];
  readonly relatedSkills?: string[];
  readonly projects?: string[];
  readonly level: number;
  readonly xp: number;
  readonly unlocked: boolean;
  readonly icon?: string;
}

/** Skill tree branch/category. */
export interface SkillBranch {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly skills: SkillNode[];
}

/** Skills tree configuration with game-style progression. */
export interface SkillsTreeConfig {
  readonly branches: SkillBranch[];
  readonly totalXp: number;
  readonly totalLevel: number;
}
