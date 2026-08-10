const fs = require('fs');
const printMetrics = (file, type) => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const getScore = id => Math.round(data.categories[id]?.score * 100);
    const getMetric = id => data.audits[id]?.displayValue;
    const getNumeric = id => Math.round(data.audits[id]?.numericValue);
    console.log(`\n--- ${type} ---`);
    console.log(`Performance: ${getScore('performance')}`);
    console.log(`FCP: ${getMetric('first-contentful-paint')}`);
    console.log(`LCP: ${getMetric('largest-contentful-paint')}`);
    console.log(`TBT: ${getMetric('total-blocking-time')}`);
    console.log(`CLS: ${getMetric('cumulative-layout-shift')}`);
    console.log(`Speed Index: ${getMetric('speed-index')}`);
    console.log(`LCP Element: ${data.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || 'N/A'}`);
  } catch(e) {
    console.error(`Failed to read ${file}: ${e.message}`);
  }
};
printMetrics('lh-mobile-after.json', 'MOBILE (AFTER)');
printMetrics('lh-desktop-after.json', 'DESKTOP (AFTER)');
