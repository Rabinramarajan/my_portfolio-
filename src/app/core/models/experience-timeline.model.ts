/** Experience timeline event with detailed metrics. */
export interface ExperienceEvent {
  readonly id: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly company: string;
  readonly role: string;
  readonly description: string;
  readonly keyAccomplishments: string[];
  readonly technologies: string[];
  readonly teamSize?: number;
  readonly impactMetrics?: Record<string, string>;
}

/** Experience timeline configuration. */
export interface ExperienceTimelineConfig {
  readonly events: ExperienceEvent[];
}
