/** Learning milestone entry. */
export interface LearningEntry {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly provider: string;
  readonly category: 'certification' | 'course' | 'workshop' | 'conference' | 'self-study';
  readonly description: string;
  readonly skillsLearned: string[];
  readonly certificateUrl?: string;
  readonly impact: 'high' | 'medium' | 'low';
}

/** Learning timeline configuration. */
export interface LearningTimelineConfig {
  readonly entries: LearningEntry[];
}
