import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { PortfolioData } from '../models/portfolio-data.models';

type LoadState = 'loading' | 'ready' | 'error';

interface LoadResult {
  state: LoadState;
  data: PortfolioData | null;
  error: string | null;
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
  readonly testimonials = computed(() => this.data()?.testimonials);
  readonly blog = computed(() => this.data()?.blog);
  readonly hireMe = computed(() => this.data()?.hireMe);
  readonly scheduling = computed(() => this.data()?.scheduling);

  getArticleBySlug(slug: string) {
    return this.blog()?.articles.find((a) => a.slug === slug);
  }
}
