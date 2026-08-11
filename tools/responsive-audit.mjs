import { chromium } from 'playwright';

const BASE = 'http://localhost:4300';

const VIEWPORTS = [
  320, 375, 390, 412, 430, 768, 820, 834, 1024, 1280, 1366, 1440, 1536, 1920, 2560,
];

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/work', name: 'work' },
  { path: '/contact', name: 'contact' },
  { path: '/resume', name: 'resume' },
  { path: '/work/fiji-immigration-external', name: 'case' },
];

const browser = await chromium.launch();
let failures = 0;

for (const { path, name } of PAGES) {
  for (const width of VIEWPORTS) {
    const height = Math.round(width >= 1280 ? 720 : width >= 768 ? 1024 : 844);
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Let the page hydrate + settle.
      await page.waitForTimeout(2500);

      // Scroll the whole page (home is long) so lazy content mounts and images load.
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += Math.max(400, window.innerHeight * 0.8);
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 90);
            else {
              window.scrollTo(0, 0);
              resolve();
            }
          };
          step();
        });
      });
      await page.waitForTimeout(1200);

      const report = await page.evaluate(() => {
        // Peel back the global safety net so we see the *real* overflow.
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        const htmlOverflow = htmlEl.style.overflowX;
        const bodyOverflow = bodyEl.style.overflowX;
        htmlEl.style.overflowX = 'visible';
        bodyEl.style.overflowX = 'visible';

        const docW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;

        htmlEl.style.overflowX = htmlOverflow;
        bodyEl.style.overflowX = bodyOverflow;
        const inner = window.innerWidth;
        const overflowers = [];
        const offenders = [];

        // Elements whose box extends past the viewport (that are actually visible).
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          const left = r.left;
          const right = r.right;
          if (right > inner + 1 || left < -1) {
            // Skip decorations with overflow hidden ancestors
            const cs = window.getComputedStyle(el);
            let p = el.parentElement;
            let clipped = false;
            let chain = 0;
            while (p && chain < 4) {
              if (window.getComputedStyle(p).overflowX === 'hidden' || window.getComputedStyle(p).overflow === 'hidden' || window.getComputedStyle(p).overflowX === 'clip') {
                clipped = true;
                break;
              }
              p = p.parentElement;
              chain++;
            }
            if (!clipped) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.getAttribute('class') || '').toString().slice(0, 60),
                id: el.id,
                left: Math.round(left),
                right: Math.round(right),
                w: Math.round(r.width),
                text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
              });
            }
          }
        });

        // Collect the widest offenders that are in normal flow (not position:fixed).
        document.querySelectorAll('body *').forEach((el) => {
          const cs = window.getComputedStyle(el);
          if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return;
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          if (r.right > docW - 1 || r.left < 0) {
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.getAttribute('class') || '').toString().slice(0, 60),
              id: el.id,
              left: Math.round(r.left),
              right: Math.round(r.right),
              w: Math.round(r.width),
              text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
            });
          }
        });

        // Also collect elements near edges that might be clipped by an overflow hidden ancestor.
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          if (r.left < 0 || r.right > inner) {
            const cs = window.getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') return;
            overflowers.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.getAttribute('class') || '').toString().slice(0, 60),
              id: el.id,
              left: Math.round(r.left),
              right: Math.round(r.right),
            });
          }
        });

        return {
          inner,
          docScrollW: docW,
          bodyScrollW: bodyW,
          overflow: docW > inner || bodyW > inner,
          overflowers: overflowers.slice(0, 25),
          offenders: offenders.slice(0, 15),
          scrollHeight: document.body.scrollHeight,
        };
      });

      const flag = report.overflow ? 'FAIL' : 'ok  ';
      if (report.overflow) {
        failures++;
        console.log(`\n[${flag}] ${name} @ ${width}px  doc=${report.docScrollW} body=${report.bodyScrollW} inner=${report.inner}`);
        for (const o of report.offenders) {
          console.log(`   OFFSET  <${o.tag}${o.cls ? '.' + o.cls.split(' ')[0] : ''}> L=${o.left} R=${o.right} W=${o.w} "${o.text}"`);
        }
      }

      // Save screenshots at key widths for the 4 main pages.
      if ([390, 768, 1024, 1440, 1920].includes(width) && ['home', 'contact', 'work', 'case'].includes(name)) {
        await page.screenshot({
          path: `C:/Users/suriy/AppData/Local/Temp/opencode/shots/${name}-${width}.png`,
          fullPage: false,
        });
      }
    } catch (e) {
      failures++;
      console.log(`[ERR ] ${name} @ ${width}px — ${e.message.slice(0, 120)}`);
    } finally {
      await context.close();
    }
  }
}

console.log(`\nDONE — ${failures} failures`);
await browser.close();
process.exit(failures ? 1 : 0);
