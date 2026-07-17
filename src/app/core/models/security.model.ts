/** Security best practice. */
export interface SecurityPractice {
  readonly id: string;
  readonly title: string;
  readonly category:
    'authentication' | 'data-protection' | 'code-quality' | 'infrastructure' | 'monitoring';
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly description: string;
  readonly implementation: string;
  readonly relatedTools?: string[];
  readonly status: 'implemented' | 'planned' | 'in-progress';
  readonly impact: string;
}

/** Security configuration. */
export interface SecurityConfig {
  readonly practices: SecurityPractice[];
}
