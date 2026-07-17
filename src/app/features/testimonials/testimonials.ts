import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Testimonials page — client and colleague testimonials. */
@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
  host: { class: 'block' },
})
export class TestimonialsPage {
  private readonly data = inject(DataService);

  protected readonly testimonials = this.data.load('testimonials');

  protected readonly trackById = trackById;
}
