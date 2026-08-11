import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../shared/components/button/button';
import { Seo } from '../../core/services/seo';
import { TextReveal } from '../../shared/components/text-reveal/text-reveal';
import { SITE_SETTINGS } from '../../core/config/portfolio.content';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Button, TextReveal],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly seo = inject(Seo);

  constructor() {
    this.seo.apply({
      title: SITE_SETTINGS.seo.notFoundTitle,
      description: SITE_SETTINGS.seo.notFoundDescription,
      path: '/404',
      noIndex: true,
    });
  }
}
