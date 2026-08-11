import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { ContentEnvelope } from '../models/portfolio.models';
import type { PortfolioContent, PortfolioRepository } from './portfolio.repository';

/**
 * Fetches portfolio content from the content API (`/api/content`). The site
 * ships static today, so nothing uses this yet — it exists so switching the
 * source is a one-line change (swap the injected repository) with no component
 * churn.
 */
@Injectable({ providedIn: 'root' })
export class HttpPortfolioRepository implements PortfolioRepository {
  readonly kind = 'http' as const;

  private readonly http = inject(HttpClient);

  load(): Promise<PortfolioContent> {
    return firstValueFrom(
      this.http.get<ContentEnvelope<PortfolioContent>>('/api/content'),
    ).then((envelope) => envelope.data);
  }
}
