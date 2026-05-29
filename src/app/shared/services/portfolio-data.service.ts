import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';

export interface PortfolioData {
  meta:         any;
  nav:          any;
  hero:         any;
  about:        any;
  experience:   any;
  skills:       any;
  projects:     any;
  achievements: any;
  education:    any;
  careerTimeline: any;
  resume:       any;
  linkedin:     any;
  contact:      any;
  footer:       any;
  testimonials: any;
  blog:         any;
  hireMe:       any;
  scheduling:   any;
}

@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly http = inject(HttpClient);

  /** Single cached HTTP request — shared across all subscribers */
  private readonly data$ = this.http
    .get<PortfolioData>('/portfolio-data.json')
    .pipe(shareReplay(1));

  /** Full data as a signal (undefined until loaded) */
  readonly data = toSignal(this.data$);

  /** Per-section computed signals for ergonomic access */
  readonly meta         = computed(() => this.data()?.meta);
  readonly nav          = computed(() => this.data()?.nav);
  readonly hero         = computed(() => this.data()?.hero);
  readonly about        = computed(() => this.data()?.about);
  readonly experience   = computed(() => this.data()?.experience);
  readonly skills       = computed(() => this.data()?.skills);
  readonly projects     = computed(() => this.data()?.projects);
  readonly achievements = computed(() => this.data()?.achievements);
  readonly education    = computed(() => this.data()?.education);
  readonly careerTimeline = computed(() => this.data()?.careerTimeline);
  readonly resume       = computed(() => this.data()?.resume);
  readonly linkedin     = computed(() => this.data()?.linkedin);
  readonly contact      = computed(() => this.data()?.contact);
  readonly footer       = computed(() => this.data()?.footer);
  readonly testimonials = computed(() => this.data()?.testimonials);
  readonly blog         = computed(() => this.data()?.blog);
  readonly hireMe       = computed(() => this.data()?.hireMe);
  readonly scheduling   = computed(() => this.data()?.scheduling);
}
