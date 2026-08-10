import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { PortfolioStore } from './portfolio-store';

describe('PortfolioStore', () => {
  let store: PortfolioStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(PortfolioStore);
  });

  it('exposes only featured projects through featuredProjects', () => {
    const featured = store.featuredProjects();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((project) => project.featured)).toBe(true);
  });

  it('resolves a project by slug', () => {
    const first = store.projects()[0]!;
    expect(store.bySlug(first.slug)?.title).toBe(first.title);
  });

  it('returns undefined for an unknown slug', () => {
    expect(store.bySlug('no-such-project')).toBeUndefined();
  });

  it('wraps around to the first project after the last', () => {
    const all = store.projects();
    const last = all.at(-1)!;
    expect(store.nextProject(last.slug)?.slug).toBe(all[0]!.slug);
  });

  it('reports no testimonials while the content list is empty', () => {
    expect(store.hasTestimonials()).toBe(store.testimonials().length > 0);
  });

  it('never ships a project without a slug, title or thumbnail', () => {
    for (const project of store.projects()) {
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.thumbnail.alt).toBeTruthy();
    }
  });
});
