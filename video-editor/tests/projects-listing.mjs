// Checks the video editor's entry on the website's Projects page (projects.html), in Chromium, on phones
// 320 and 360 pixels wide. Written November 3, 2026 (pull request 138), saved at the handoff.
// Run from the repository folder after changing the entry's line or its "How I built it" note:
//   node video-editor/tests/projects-listing.mjs
// It serves the repository on http://127.0.0.1:8794 (python3), so that port must be free. The site's own
// fonts come from Google Fonts, so the line breaks match the real page only when they load (it prints
// whether they did). Screenshots go to a temporary folder, printed at the end.
// Success ends with "20 passed, 0 failed".
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright'); // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

const repository = fileURLToPath(new URL('../../', import.meta.url));
const SHOTS = path.join(os.tmpdir(), 'video-editor-projects-shots') + path.sep;
mkdirSync(SHOTS, { recursive: true });
const PORT = 8794;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 800));

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

const browser = await chromium.launch();
for (const width of [320, 360]) {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  await page.goto(`http://127.0.0.1:${PORT}/projects.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => document.fonts.check('18px "Libre Baskerville"'));
  console.log(`(${width} wide) the site's font loaded: ${fonts}`);

  const entry = page.locator('.post-list .post', { has: page.locator('h2', { hasText: 'Video editor' }) });
  check(`${width}: the video editor is in the list, once`, (await entry.count()) === 1);
  const excerpt = await entry.locator('.post-excerpt').evaluate((el) => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return { cut: el.scrollHeight > el.clientHeight + 1, lines: Math.round(el.getBoundingClientRect().height / lineHeight) };
  });
  check(`${width}: its line shows whole (project lines stop after 3 lines)`, !excerpt.cut, JSON.stringify(excerpt));
  console.log(`(${width} wide) the line takes ${excerpt.lines} lines`);
  // Its small lines: "What I set out to learn" (since pull request 142) and the one about phones
  const smallLines = await entry.locator('.post-date').allTextContents();
  check(`${width}: its gray line says it's made for an Android phone in Chrome`,
    smallLines.some((line) => /Android phone in Chrome/.test(line)), JSON.stringify(smallLines));
  check(`${width}: nothing wider than the screen`, await page.evaluate((w) => document.documentElement.scrollWidth <= w, width));
  const links = await entry.locator('a').evaluateAll((all) => all.map((a) => a.getAttribute('href')));
  check(`${width}: both links go to the video editor`, links.length === 2 && links.every((h) => h === 'video-editor/'), JSON.stringify(links));
  await entry.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}${width}-1-list.png` });

  const note = page.locator('details.fold', { has: page.locator('summary', { hasText: 'Video editor' }) });
  check(`${width}: its "How I built it" note is closed at first`, !(await note.evaluate((d) => d.open)));
  await note.locator('summary').click();
  const parts = await note.locator('p em').allTextContents();
  check(`${width}: the note opens with its four parts`, await note.evaluate((d) => d.open) &&
    JSON.stringify(parts) === JSON.stringify(['What I wanted:', 'The problem:', 'What I decided:', 'The trade-off:']), JSON.stringify(parts));
  const korean = await note.locator('.korean').evaluateAll((all) => all.map((k) => [getComputedStyle(k).fontFamily, getComputedStyle(k).fontWeight, k.lang]));
  check(`${width}: its Korean words use Nanum Myeongjo ExtraBold (the Moon jar rule)`,
    korean.every((k) => k[0].includes('Nanum Myeongjo') && k[1] === '800' && k[2] === 'ko'), JSON.stringify(korean));
  await note.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}${width}-2-note.png` });
  check(`${width}: no page errors`, problems.length === 0, problems.join('; '));

  await entry.locator('a.read-link').click();
  await page.waitForLoadState('domcontentloaded');
  check(`${width}: "Open the video editor" opens the app`, page.url().endsWith('/video-editor/') &&
    (await page.locator('#start-title').textContent()) === 'Make a short video look its best', page.url());
  await context.close();
}
await browser.close();
server.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
