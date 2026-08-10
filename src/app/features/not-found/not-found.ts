import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Button } from '../../shared/components/button/button';
import { Seo } from '../../core/services/seo';
import { TextReveal } from '../../shared/components/text-reveal/text-reveal';

@Component({
  selector: 'app-not-found',
  imports: [Button, TextReveal],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly seo = inject(Seo);

  constructor() {
    this.seo.apply({
      title: 'Page not found',
      description: 'That page does not exist.',
      path: '/404',
    });
  }
}
