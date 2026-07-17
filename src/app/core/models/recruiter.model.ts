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

/** Recruiter mode configuration. */
export interface RecruiterConfig {
  readonly interviews: readonly InterviewQuestion[];
  readonly availability: readonly AvailabilitySlot[];
  readonly salaryPreferences: readonly SalaryPreference[];
  readonly hireMeWizard: HireMeWizard;
  readonly atsResumeUrl?: string;
  readonly meetingSchedulerUrl?: string;
}
