/** Technology adoption milestone. */
export interface TechAdoption {
  readonly id: string;
  readonly technology: string;
  readonly dateAdopted: string;
  readonly category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'tools' | 'architecture';
  readonly initialProficiency: 'beginner' | 'intermediate' | 'advanced';
  readonly currentProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  readonly keyProjects: string[];
  readonly evolution: string;
}

/** Technology evolution timeline configuration. */
export interface TechEvolutionConfig {
  readonly adoptions: TechAdoption[];
}
