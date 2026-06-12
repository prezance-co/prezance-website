// Generate 800×500 thumbnail screenshots for each carousel template.
// Loads each template's index.html directly off the Vite dev server (clean shot,
// no preview chrome), waits for render, and writes public/templates/<slug>/thumb.jpg.
import { chromium } from 'playwright';
import { mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = 'http://localhost:5174';

// slug → /template/:slug preview route. The actual content lives at
// /templates/<slug>/index.html, which we screenshot directly for a clean frame.
const SLUGS = [
  'bistro', 'steakhouse', 'barista',
  'medilab', 'medicio', 'klinik',
  'law', 'lawyer', 'lawfirm',
  'waso', 'tween',
  'app-1', 'app-2',
  'saas-verdana', 'saas-rawblock',
];

const results = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 800, height: 500 } });

for (const slug of SLUGS) {
  const page = await ctx.newPage();
  const url = `${BASE}/templates/${slug}/index.html`;
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    if (!resp || !resp.ok()) throw new Error(`HTTP ${resp ? resp.status() : 'no response'}`);
    await page.waitForTimeout(2000); // let the page render (fonts, hero, anims)
    const outDir = join(ROOT, 'public', 'templates', slug);
    await mkdir(outDir, { recursive: true });
    const outPath = join(outDir, 'thumb.jpg');
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 82 });
    await access(outPath);
    results.push({ slug, ok: true, path: `templates/${slug}/thumb.jpg` });
    console.log(`✓ ${slug}`);
  } catch (err) {
    results.push({ slug, ok: false, error: String(err.message || err) });
    console.log(`✗ ${slug} — ${err.message || err}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log('\nSUMMARY ' + JSON.stringify(results));
