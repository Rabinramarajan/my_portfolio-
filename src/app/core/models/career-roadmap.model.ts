/** Career milestone with impact and technologies. */
export interface CareerMilestone {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly impact: string;
  readonly technologies?: string[];
  readonly type: 'promotion' | 'achievement' | 'learning' | 'transition';
}

/** Career roadmap configuration. */
export interface CareerRoadmapConfig {
  readonly milestones: CareerMilestone[];
}
