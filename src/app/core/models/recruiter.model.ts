/** Resume version for different specializations. */
export type ResumeVersion = 'Frontend' | 'Full Stack' | 'Freelance';

/** Interview question and answer entry. */
export interface InterviewQuestion {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: 'Technical' | 'Behavioral' | 'Domain' | 'Experience';
  readonly relatedSkills?: readonly string[];
}

/** Availability slot entry. */
export interface AvailabilitySlot {
  readonly id: string;
  readonly dayOfWeek:
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  readonly startTime: string;
  readonly endTime: string;
  readonly timezone: string;
}

/** Salary and contract preference. */
export interface SalaryPreference {
  readonly id: string;
  readonly employmentType: 'Full Time' | 'Contract' | 'Freelance' | 'Part Time';
  readonly currencyCode: string;
  readonly minSalary: number;
  readonly maxSalary?: number;
  readonly negotiable: boolean;
}

/** Hire me wizard data. */
export interface HireMeWizard {
  readonly projectTypes: readonly { readonly id: string; readonly label: string }[];
  readonly budgetRanges: readonly { readonly id: string; readonly label: string }[];
  readonly timelineOptions: readonly { readonly id: string; readonly label: string }[];
}

/** A single career highlight on the recruiter overview. */
export interface RecruiterHighlight {
  readonly role: string;
  readonly company: string;
  readonly period: string;
  readonly description: string;
}

/** A headline stat tile (e.g. "4+ Years Experience"). */
export interface RecruiterStat {
  readonly value: string;
  readonly label: string;
  readonly icon: string;
  /** Renders with an availability dot instead of an icon badge. */
  readonly available?: boolean;
}

/** An ideal-opportunity role type. */
export interface RecruiterOpportunity {
  readonly label: string;
  readonly icon: string;
}

/** Recruiter-facing snapshot shown at the top of the Recruiter page. */
export interface RecruiterOverview {
  readonly headline: string;
  readonly intro: string;
  readonly quickFacts: {
    readonly location: string;
    readonly experience: string;
    readonly notice: string;
  };
  readonly whyWorkWithMe: readonly string[];
  readonly stats: readonly RecruiterStat[];
  readonly coreSkills: readonly string[];
  readonly highlights: readonly RecruiterHighlight[];
  readonly bring: readonly string[];
  readonly opportunities: readonly RecruiterOpportunity[];
  readonly cta: { readonly title: string; readonly text: string };
}

/** Recruiter mode configuration. */
export interface RecruiterConfig {
  readonly overview?: RecruiterOverview;
  readonly interviews: readonly InterviewQuestion[];
  readonly availability: readonly AvailabilitySlot[];
  readonly salaryPreferences: readonly SalaryPreference[];
  readonly hireMeWizard: HireMeWizard;
  readonly atsResumeUrl?: string;
  readonly meetingSchedulerUrl?: string;
}
