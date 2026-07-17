/** Project completion metric. */
export interface ProjectMetric {
  readonly id: string;
  readonly total: number;
  readonly completed: number;
  readonly inProgress: number;
  readonly archived: number;
}

/** Experience timeline entry. */
export interface ExperienceMetric {
  readonly id: string;
  readonly totalYears: number;
  readonly startYear: number;
  readonly endYear?: number;
  readonly milestones: readonly {
    readonly year: number;
    readonly event: string;
  }[];
}

/** GitHub statistics. */
export interface GitHubMetrics {
  readonly id: string;
  readonly totalCommits: number;
  readonly repositoriesContributed: number;
  readonly pullRequests: number;
  readonly issues: number;
  readonly followers: number;
  readonly yearlyCommits: readonly {
    readonly year: number;
    readonly commits: number;
  }[];
}

/** Technology proficiency entry. */
export interface TechnologyMetric {
  readonly id: string;
  readonly name: string;
  readonly proficiency: number;
  readonly yearsUsed: number;
  readonly projects: number;
  readonly category: 'Language' | 'Framework' | 'Tool' | 'Platform';
}

/** Portfolio visitor analytics. */
export interface VisitorMetrics {
  readonly id: string;
  readonly totalVisitors: number;
  readonly uniqueVisitors: number;
  readonly sessions: number;
  readonly pageViews: number;
  readonly bounceRate: number;
  readonly monthlyData: readonly {
    readonly month: string;
    readonly visitors: number;
    readonly sessions: number;
  }[];
}

/** Geographic visitor data. */
export interface GeographicMetric {
  readonly id: string;
  readonly country: string;
  readonly visitors: number;
  readonly percentage: number;
  readonly countryCode: string;
}

/** Project popularity metric. */
export interface ProjectViewMetric {
  readonly id: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly views: number;
  readonly clicks: number;
  readonly avgTimeSpent: number;
  readonly clickThroughRate: number;
  readonly bounceRate: number;
}

/** Session duration metric. */
export interface SessionMetrics {
  readonly id: string;
  readonly averageSessionDuration: number;
  readonly medianSessionDuration: number;
  readonly minSessionDuration: number;
  readonly maxSessionDuration: number;
  readonly sessionDistribution: readonly {
    readonly range: string;
    readonly percentage: number;
    readonly count: number;
  }[];
}

/** Resume download analytics. */
export interface ResumeMetrics {
  readonly id: string;
  readonly totalDownloads: number;
  readonly frontendDownloads: number;
  readonly fullStackDownloads: number;
  readonly freelanceDownloads: number;
  readonly monthlyDownloads: readonly {
    readonly month: string;
    readonly downloads: number;
  }[];
}

/** Complete analytics configuration. */
export interface AnalyticsDashboardConfig {
  readonly projects: ProjectMetric;
  readonly experience: ExperienceMetric;
  readonly github: GitHubMetrics;
  readonly technologies: readonly TechnologyMetric[];
  readonly visitors: VisitorMetrics;
  readonly geography: readonly GeographicMetric[];
  readonly projectViews: ProjectViewMetric;
  readonly sessions: SessionMetrics;
  readonly resumeDownloads: ResumeMetrics;
  readonly lastUpdated: string;
}
