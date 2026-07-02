import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';

describe('app.routes', () => {
  it('should define home route', () => {
    expect(routes.find((r) => r.path === '')?.component).toBeTruthy();
  });

  it('should lazy-load hire-me and blog routes', () => {
    const hireMe = routes.find((r) => r.path === 'hire-me');
    const blog = routes.find((r) => r.path === 'blog');
    const article = routes.find((r) => r.path === 'blog/:slug');
    expect(hireMe?.loadComponent).toBeTruthy();
    expect(blog?.loadComponent).toBeTruthy();
    expect(article?.loadComponent).toBeTruthy();
  });

  it('should redirect unknown paths to home', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard?.redirectTo).toBe('');
  });
});
