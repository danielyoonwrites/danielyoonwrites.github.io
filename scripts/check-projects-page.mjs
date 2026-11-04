// Checks the website's Projects page (projects.html) on phones 320 and 360 pixels wide, in Chromium.
// Written November 4, 2026, when Dan put the projects in his order and each one got a second,
// small "What I set out to learn" line (pull request 142). Run it from the repository folder after
// changing any project's words:
//   node scripts/check-projects-page.mjs
// Only Claude's sessions run it (it needs Playwright's Chromium); the publish workflow doesn't.
// It serves the repository on http://127.0.0.1:8795 (python3), so that port must be free. Line
// breaks match the real page only when the site's own fonts load from Google Fonts (it prints
// whether they did). Success ends with "... passed, 0 failed".
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright'); // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

// The order Dan chose (November 4, 2026; root DECISIONS.md). Change it here when he changes it.
const ORDER = ['Video editor', 'Living in the Word', 'Idea board', 'Fewer spam calls', 'This website'];

const repository = fileURLToPath(new URL('../', import.meta.url));
const PORT = 8795;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 800));

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

const browser = await chromium.launch({
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined,
});
for (const width of [320, 360]) {
  const context = await browser.newContext({ viewport: { width, height: 740 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  await page.goto(`http://127.0.0.1:${PORT}/projects.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  console.log(`(${width} wide) the site's font loaded: ${await page.evaluate(() => document.fonts.check('18px "Libre Baskerville"'))}`);

  const projects = await page.evaluate(() => [...document.querySelectorAll('.post-list .post')].map((item) => {
    const line = item.querySelector('.post-excerpt');
    const learned = [...item.querySelectorAll('.post-date')].find((p) => p.textContent.startsWith('What I set out to learn:'));
    return {
      name: item.querySelector('h2').textContent.trim(),
      cut: !line || line.scrollHeight > line.clientHeight + 1,   // project lines stop after 3 lines
      learned: Boolean(learned),
      link: Boolean(item.querySelector('a.read-link')),
    };
  }));
  check(`${width}: the projects are in Dan's order`, JSON.stringify(projects.map((p) => p.name)) === JSON.stringify(ORDER), JSON.stringify(projects.map((p) => p.name)));
  for (const project of projects) {
    check(`${width}: ${project.name}: its line shows whole`, !project.cut);
    check(`${width}: ${project.name}: it has a "What I set out to learn" line`, project.learned);
    check(`${width}: ${project.name}: it has its "Open" or "See" link`, project.link);
  }
  const notes = await page.locator('details.fold summary').allTextContents();
  check(`${width}: the "How I built it" notes follow the same order`, JSON.stringify(notes.map((n) => n.trim())) === JSON.stringify(ORDER), JSON.stringify(notes));
  check(`${width}: nothing wider than the screen`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  check(`${width}: no page errors`, problems.length === 0, problems.join('; '));
  await context.close();
}
await browser.close();
server.kill();
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
