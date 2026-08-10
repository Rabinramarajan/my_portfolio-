/**
 * Builds landscape presentation images for mobile projects.
 *
 * Phone screenshots are tall portraits. Dropped straight into a landscape card
 * or a 16:9 case-study hero they either stretch the layout or get cropped to a
 * meaningless sliver — so instead we arrange the real screenshots on a dark
 * canvas at their true aspect ratio, which is how mobile work is normally shown.
 *
 * Nothing is invented: every phone in the output is an unmodified screenshot.
 *
 *   node tools/compose-mobile-shots.mjs
 */
import { chromium } from '@playwright/test';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname } from 'node:path';

const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

const COMPOSITES = [
  {
    out: 'public/media/vnpf_mobile/composite-thumb.png',
    width: 1200,
    height: 900,
    accent: '#b9a6ff',
    phoneHeight: 620,
    shots: [
      { src: '/media/vnpf_mobile/image2.png', y: 40, rotate: -4, z: 1, scale: 0.88 },
      { src: '/media/vnpf_mobile/image4.png', y: -10, rotate: 0, z: 3, scale: 1 },
      { src: '/media/vnpf_mobile/image5.png', y: 40, rotate: 4, z: 1, scale: 0.88 },
    ],
  },
  {
    out: 'public/media/vnpf_mobile/composite-hero.png',
    width: 1600,
    height: 1000,
    accent: '#b9a6ff',
    phoneHeight: 600,
    shots: [
      { src: '/media/vnpf_mobile/image1.png', y: 70, rotate: -6, z: 1, scale: 0.8 },
      { src: '/media/vnpf_mobile/image2.png', y: 20, rotate: -3, z: 2, scale: 0.9 },
      { src: '/media/vnpf_mobile/image4.png', y: -20, rotate: 0, z: 4, scale: 1 },
      { src: '/media/vnpf_mobile/image3.png', y: 20, rotate: 3, z: 2, scale: 0.9 },
      { src: '/media/vnpf_mobile/image5.png', y: 70, rotate: 6, z: 1, scale: 0.8 },
    ],
  },
];

const page = (c) => `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${c.width}px; height: ${c.height}px; overflow: hidden;
    background:
      radial-gradient(60% 60% at 50% 20%, ${c.accent}22, transparent 70%),
      radial-gradient(80% 80% at 50% 110%, ${c.accent}14, transparent 65%),
      linear-gradient(160deg, #16161b, #0a0a0c);
    display: grid; place-items: center;
  }
  .row { display: flex; align-items: center; justify-content: center; gap: ${c.width > 1300 ? 26 : 40}px; }
  .phone {
    height: ${c.phoneHeight}px; border-radius: 26px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    box-shadow: 0 40px 80px -24px rgba(0,0,0,.85), 0 0 0 1px rgba(0,0,0,.5);
    background: #000; flex: none;
  }
  .phone img { display: block; height: 100%; width: auto; }
  .grid { position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(255,255,255,.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,.045) 1px, transparent 1px);
    background-size: 90px 90px;
    mask-image: radial-gradient(70% 60% at 50% 45%, #000 10%, transparent 80%);
  }
</style></head><body>
  <div class="grid"></div>
  <div class="row">
    ${c.shots
      .map(
        (s) => `<div class="phone" style="
          transform: translateY(${s.y}px) rotate(${s.rotate}deg) scale(${s.scale});
          z-index: ${s.z};"><img src="${s.src}" /></div>`,
      )
      .join('')}
  </div>
</body></html>`;

// The composed HTML is served rather than injected with `setContent`: the page
// must have a real origin for the `<img src="/media/...">` references to load.
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/compose') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(page(COMPOSITES[Number(url.searchParams.get('i'))]));
  }
  const file = 'public' + decodeURIComponent(url.pathname);
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Content-Length': statSync(file).size,
  });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(4560, r));

const browser = await chromium.launch();
for (const [index, composite] of COMPOSITES.entries()) {
  const tab = await browser.newPage({
    viewport: { width: composite.width, height: composite.height },
    deviceScaleFactor: 1,
  });
  await tab.goto(`http://localhost:4560/compose?i=${index}`, { waitUntil: 'networkidle' });
  await tab.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
  await tab.screenshot({ path: composite.out });
  console.info(`${composite.out} — ${composite.width}x${composite.height}`);
  await tab.close();
}
await browser.close();
server.close();
