/** Education timeline entry (Resume page). */
export interface Education {
  readonly id: string;
  readonly year: string;
  readonly degree: string;
  readonly institution: string;
  readonly score: string;
}

/** education.json payload. */
export interface EducationConfig {
  readonly items: readonly Education[];
}
