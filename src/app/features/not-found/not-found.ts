import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../shared/components/button/button';
import { Seo } from '../../core/services/seo';
import { TextReveal } from '../../shared/components/text-reveal/text-reveal';

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
      title: 'Page Not Found — Rabin R',
      description: 'The page you are looking for does not exist. Browse Angular projects, experience, and more from Rabin R.',
      path: '/404',
      noIndex: true,
    });
  }
}
