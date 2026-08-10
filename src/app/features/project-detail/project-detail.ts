import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Button } from '../../shared/components/button/button';
import { MediaImage } from '../../shared/components/media-image/media-image';
import { PROFILE } from '../../core/config/portfolio.content';
import { PortfolioStore } from '../../core/services/portfolio-store';
import { Reveal } from '../../shared/directives/reveal';
import { Seo } from '../../core/services/seo';
import { TextReveal } from '../../shared/components/text-reveal/text-reveal';
import { VideoShowcase } from '../../shared/components/video-showcase/video-showcase';
import { projectSchema } from '../../core/services/structured-data';

/**
 * Case study page.
 *
 * `slug` arrives through `withComponentInputBinding()`, so the route parameter
 * is just an input — no ActivatedRoute subscription, and the derived project is
 * a plain computed.
 */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Button, MediaImage, VideoShowcase, TextReveal, Reveal],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  private readonly store = inject(PortfolioStore);
  private readonly seo = inject(Seo);
  private readonly router = inject(Router);

  readonly slug = input.required<string>();

  protected readonly project = computed(() => this.store.bySlug(this.slug()));
  protected readonly next = computed(() => this.store.nextProject(this.slug()));

  constructor() {
    effect(() => {
      const project = this.project();
      if (!project) {
        // An unknown slug is a 404, not an empty page — prerendering only ever
        // emits real slugs, so this is the hand-typed-URL path.
        void this.router.navigate(['/not-found'], { skipLocationChange: true });
        return;
      }

      this.seo.apply({
        title: `${project.title} — ${project.category} case study | ${PROFILE.name}`,
        description: project.summary,
        path: `/work/${project.slug}`,
        image: project.hero.src,
        type: 'article',
        publishedYear: project.year,
      });
      this.seo.setStructuredData(projectSchema(project));
    });
  }
}
