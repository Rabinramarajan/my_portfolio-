/** Resolves in-page hash links to work from any route (e.g. /blog → /#about). */
export function resolveNavHref(href: string): string {
  if (!href) return '/';
  if (href.startsWith('#')) return `/${href}`;
  if (href.startsWith('/#')) return href;
  return href;
}

/** RouterLink commands for internal hash navigation. */
export function navRouterLink(href: string): string[] | null {
  if (href.startsWith('#')) return ['/'];
  if (href.startsWith('/#')) return ['/'];
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('.')) {
    const path = href.split('#')[0] || '/';
    return path === '/' ? ['/'] : [path];
  }
  return null;
}

export function navFragment(href: string): string | undefined {
  if (href.startsWith('#')) return href.slice(1);
  const hashIdx = href.indexOf('#');
  if (hashIdx >= 0) return href.slice(hashIdx + 1);
  return undefined;
}

export function isExternalHref(href: string): boolean {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  );
}

export function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    Architecture: '#7c3aed',
    Performance: '#f59e0b',
    Mobile: '#3880FF',
    Security: '#ef4444',
    Tutorial: '#10b981',
  };
  return map[cat] ?? '#64748b';
}
