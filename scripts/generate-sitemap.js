const fs = require('fs');
const path = require('path');

// Dynamically extract the baseUrl from the Angular environment.ts file
const envFilePath = path.join(__dirname, '../src/environments/environment.ts');
const envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Use a Regular Expression to safely extract the baseUrl value
const baseUrlMatch = envFileContent.match(/baseUrl:\s*['"]([^'"]+)['"]/);
const BASE_URL = baseUrlMatch ? baseUrlMatch[1] : 'https://www.rabinr.in';

// Add any other routes you might have here. The # fragments aren't typically 
// included in standard XML sitemaps since Google sees them as singular pages, 
// but we'll register the root domain to be heavily prioritized.
const ROUTES = [
  '/',           // Application Root
];

function generateSitemap() {
  const date = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  ROUTES.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route === '/' ? '' : route}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  const publicDir = path.join(__dirname, '../public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);

  console.log(`✅ Automated Sitemap generated at: ${sitemapPath}`);
}

generateSitemap();
