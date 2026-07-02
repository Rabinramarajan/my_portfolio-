import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { PortfolioData } from '../models/portfolio-data.models';

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

  private readonly loadResult$ = this.http.get<PortfolioData>('/portfolio-data.json').pipe(
    map(
      (data): LoadResult => ({
        state: 'ready',
        data,
        error: null,
      })
    ),
    catchError(() =>
      of({
        state: 'error' as LoadState,
        data: null,
        error: 'Unable to load portfolio content. Please refresh the page.',
      })
    ),
    shareReplay(1)
  );

  private readonly loadResult = toSignal(this.loadResult$, {
    initialValue: {
      state: 'loading',
      data: null,
      error: null,
    } satisfies LoadResult,
  });

<<<<<<< HEAD
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
=======
  readonly loading = computed(() => this.loadResult()?.state === 'loading');
  readonly error = computed(() => this.loadResult()?.error ?? null);
  readonly data = computed(() => this.loadResult()?.data ?? undefined);

  readonly meta = computed(() => this.data()?.meta);
  readonly nav = computed(() => this.data()?.nav);
  readonly hero = computed(() => this.data()?.hero);
  readonly about = computed(() => this.data()?.about);
  readonly experience = computed(() => this.data()?.experience);
  readonly skills = computed(() => this.data()?.skills);
  readonly projects = computed(() => this.data()?.projects);
  readonly resume = computed(() => this.data()?.resume);
  readonly linkedin = computed(() => this.data()?.linkedin);
  readonly contact = computed(() => this.data()?.contact);
  readonly footer = computed(() => this.data()?.footer);
>>>>>>> bf2886dea0813e0d3b55fa980763840a6d957cac
  readonly testimonials = computed(() => this.data()?.testimonials);
  readonly blog = computed(() => this.data()?.blog);
  readonly hireMe = computed(() => this.data()?.hireMe);
  readonly scheduling = computed(() => this.data()?.scheduling);

  getArticleBySlug(slug: string) {
    return this.blog()?.articles.find((a) => a.slug === slug);
  }
}
