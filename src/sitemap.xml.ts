const DOMAIN = 'https://rabinr.in';

// Core pages (always included)
const CORE_PAGES = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/hire-me', priority: 0.9, changefreq: 'monthly' },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' },
];

// Generate dynamic blog post URLs from data
const getBlogPosts = (): Array<{ url: string; priority: number; changefreq: string }> => {
  // This would typically fetch from your data service
  // For now, returning placeholder; in production, integrate with portfolio-data.service
  return [
    { url: '/blog/enterprise-angular-forms', priority: 0.7, changefreq: 'monthly' },
    { url: '/blog/dynamic-schema-driven-forms', priority: 0.7, changefreq: 'monthly' },
    { url: '/blog/enterprise-layout-systems', priority: 0.7, changefreq: 'monthly' },
  ];
};

// Generate dynamic project URLs
const getProjects = (): Array<{ url: string; priority: number; changefreq: string }> => {
  // Integrate with portfolio-data.service to fetch actual projects
  return [
    { url: '/projects/zellavora-ui', priority: 0.7, changefreq: 'monthly' },
  ];
};

export function generateSitemap(): string {
  const pages = [
    ...CORE_PAGES,
    ...getBlogPosts(),
    ...getProjects(),
  ];

  const urlEntries = pages
    .map(page => `
  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
