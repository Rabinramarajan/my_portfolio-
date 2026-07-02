import { describe, it, expect } from 'vitest';
import { navRouterLink, navFragment, isExternalHref, resolveNavHref } from '../utils/nav.utils';

describe('nav.utils', () => {
  it('should resolve hash links for cross-route navigation', () => {
    expect(resolveNavHref('#contact')).toBe('/#contact');
    expect(resolveNavHref('/blog')).toBe('/blog');
  });

  it('should map hash links to home router commands', () => {
    expect(navRouterLink('#about')).toEqual(['/']);
    expect(navFragment('#about')).toBe('about');
    expect(navRouterLink('/blog')).toEqual(['/blog']);
  });

  it('should detect external hrefs', () => {
    expect(isExternalHref('https://github.com')).toBe(true);
    expect(isExternalHref('mailto:a@b.com')).toBe(true);
    expect(isExternalHref('#contact')).toBe(false);
    expect(isExternalHref('/blog')).toBe(false);
  });
});
