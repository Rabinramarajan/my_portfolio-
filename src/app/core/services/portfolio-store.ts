import { Injectable, computed, signal } from '@angular/core';

import {
  EXPERIENCE,
  PROCESS,
  PROFILE,
  PROJECTS,
  SERVICES,
  SITE_MEDIA,
  SKILLS,
  TESTIMONIALS,
} from '../config/portfolio.content';
import type { PortfolioProject } from '../models/portfolio.models';

/**
 * Read model for all portfolio content.
 *
 * Content is currently static, so it is seeded into signals at construction.
 * Swapping to an API means replacing the seed with `resource()` here — every
 * consumer reads signals and needs no change.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  readonly profile = signal(PROFILE);
  readonly projects = signal(PROJECTS);
  readonly services = signal(SERVICES);
  readonly experience = signal(EXPERIENCE);
  readonly skills = signal(SKILLS);
  readonly process = signal(PROCESS);
  readonly testimonials = signal(TESTIMONIALS);
  /** Section photography and ambient footage. */
  readonly media = signal(SITE_MEDIA);

  readonly featuredProjects = computed(() => this.projects().filter((p) => p.featured));
  readonly hasTestimonials = computed(() => this.testimonials().length > 0);

  bySlug(slug: string): PortfolioProject | undefined {
    return this.projects().find((project) => project.slug === slug);
  }

  /** Next project in publication order, wrapping around — powers the case-study footer. */
  nextProject(slug: string): PortfolioProject | undefined {
    const all = this.projects();
    const index = all.findIndex((project) => project.slug === slug);
    return index === -1 ? undefined : all[(index + 1) % all.length];
  }
}
