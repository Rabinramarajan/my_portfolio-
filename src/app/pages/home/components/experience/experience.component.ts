import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

type JobType = 'Full Time' | 'Freelance' | 'Contract';

interface TimelineJob {
  role: string;
  company: string;
  type: JobType;
  startYear: string;
  endLabel: string;
  description: string;
  bullets: string[];
  iconPath: string;
  iconColor: string;
}

interface StatCard {
  number: string;
  label: string;
  icon: string;
}

interface Highlight {
  label: string;
  value: number;
}

interface EvolutionStep {
  name: string;
  year: string;
  color: string;
  path: string;
}

const ANGULAR_PATH =
  'M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z';
const IONIC_PATH =
  'M22.922 7.027l-.103-.23-.169.188c-.408.464-.928.82-1.505 1.036l-.159.061.066.155a9.745 9.745 0 0 1 .75 3.759c0 5.405-4.397 9.806-9.806 9.806-5.409 0-9.802-4.397-9.802-9.802 0-5.405 4.402-9.806 9.806-9.806 1.467 0 2.883.319 4.2.947l.155.075.066-.155a3.767 3.767 0 0 1 1.106-1.453l.197-.159-.225-.117A11.905 11.905 0 0 0 12.001.001c-6.619 0-12 5.381-12 12s5.381 12 12 12 12-5.381 12-12c0-1.73-.361-3.403-1.078-4.973zM12 6.53A5.476 5.476 0 0 0 6.53 12 5.476 5.476 0 0 0 12 17.47 5.476 5.476 0 0 0 17.47 12 5.479 5.479 0 0 0 12 6.53zm10.345-2.007a2.494 2.494 0 1 1-4.988 0 2.494 2.494 0 0 1 4.988 0z';
const TS_PATH =
  'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z';
const RXJS_PATH =
  'M7.402 2.343c-2.224.984-3.615 2.583-4.4 3.747-.852 1.268-1.184 2.319-1.184 2.328-.002.036.005-.017 0 .019-.246.7-.473 1.798-.473 1.807-.265 1.344-.142 2.593-.142 2.612l.029.246a9.58 9.58 0 0 1 .132-1.012c.019-.133.37-2.016 1.694-3.511.142-.218 1.675-2.233 4.495-2.233.606 0 1.24.094 1.874.283h.019c.038.01.87.313 1.173.464.284.142.786.36.795.36h.02c2.715 1.325 5.062 1.75 5.081 1.76.672.114 1.278.17 1.817.17 1.079 0 1.855-.236 2.262-.69.237-.26.307-.559.293-.814.019-.985-.785-2.044-1.467-2.754a10.868 10.868 0 0 0-1.542-1.344c-2.044-1.514-4.23-2.28-6.52-2.28-2.347.009-3.937.832-3.956.842z';
const FLUTTER_PATH =
  'M14.314 0L2.3 12l3.686 3.686L21.686 0h-7.372zm.066 11.406L7.906 17.88 14.379 24h7.372l-6.473-6.12 6.473-6.474h-7.371z';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [ScrollTriggerDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  protected readonly pds = inject(PortfolioDataService);

  // ── Header stat cards ──────────────────────────────────────
  stats: StatCard[] = [
    { number: '4+', label: 'Years Experience', icon: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z' },
    { number: '2', label: 'Companies Worked', icon: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 20h20M4 20V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12' },
    { number: '50+', label: 'Projects Delivered', icon: 'm9 9-3 3 3 3M15 9l3 3-3 3M13 5l-2 14' },
  ];

  // ── Filter tabs ────────────────────────────────────────────
  readonly filters: ('all' | JobType)[] = ['all', 'Full Time', 'Freelance', 'Contract'];
  readonly activeFilter = signal<'all' | JobType>('all');

  // ── Timeline jobs (enriched from real data) ────────────────
  readonly jobs = computed<TimelineJob[]>(() =>
    (this.pds.experience()?.jobs ?? []).map((j) => this.enrich(j))
  );

  readonly filteredJobs = computed<TimelineJob[]>(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.jobs() : this.jobs().filter((j) => j.type === f);
  });

  // ── Right rail: Experience Highlights (skill bars) ─────────
  highlights: Highlight[] = [
    { label: 'Frontend', value: 90 },
    { label: 'UI/UX', value: 80 },
    { label: 'Performance', value: 85 },
    { label: 'Leadership', value: 75 },
    { label: 'Problem Solving', value: 95 },
  ];

  // ── Right rail: Skills Evolution ───────────────────────────
  evolution: EvolutionStep[] = [
    { name: 'Angular', year: '2020', color: '#dd0031', path: ANGULAR_PATH },
    { name: 'Ionic', year: '2021', color: '#3880ff', path: IONIC_PATH },
    { name: 'TypeScript', year: '2021', color: '#3178c6', path: TS_PATH },
    { name: 'RxJS', year: '2022', color: '#b7178c', path: RXJS_PATH },
    { name: 'Flutter', year: '2023', color: '#02569b', path: FLUTTER_PATH },
  ];

  // ── Quote card ─────────────────────────────────────────────
  quote = 'The best way to predict the future is to create it.';
  get signatureName(): string {
    return this.pds.meta()?.name || 'Rabin R.';
  }

  setFilter(f: 'all' | JobType) {
    this.activeFilter.set(f);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Average of highlight values for the radial chart center label
  get overallScore(): number {
    return Math.round(this.highlights.reduce((s, h) => s + h.value, 0) / this.highlights.length);
  }

  private enrich(job: {
    role: string;
    company: string;
    duration: string;
    achievements?: string[];
  }): TimelineJob {
    const role = job.role.replace(/\s*\((Freelance|Contract)\)\s*/i, '').trim();
    const type: JobType = /freelance/i.test(job.role)
      ? 'Freelance'
      : /contract/i.test(job.role)
        ? 'Contract'
        : 'Full Time';

    const years = job.duration.match(/\d{4}/g) ?? [];
    const isPresent = /present/i.test(job.duration);
    const startYear = years[0] ?? '';
    const endLabel = isPresent ? 'Present' : (years[years.length - 1] ?? '');

    const achievements = job.achievements ?? [];
    const description = achievements[0] ?? '';
    const bullets = achievements.slice(1);

    const isIonic = /ionic/i.test(job.role);
    return {
      role,
      company: job.company,
      type,
      startYear,
      endLabel,
      description,
      bullets,
      iconPath: isIonic ? IONIC_PATH : ANGULAR_PATH,
      iconColor: isIonic ? '#3880ff' : '#dd0031',
    };
  }
}
