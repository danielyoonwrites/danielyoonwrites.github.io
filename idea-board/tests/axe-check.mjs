// An accessibility check of Idea board with axe-core, Deque's open-source checker (WCAG 2.0 to 2.2,
// levels A and AA, plus its best practices), on five screens: the list with no boards, a new board's
// name screen, a board with a note, the "Remove board" question, and the list with a board.
// Written November 2, 2026. Run from the repository folder:
//   node idea-board/tests/axe-check.mjs <path to axe.min.js>
// axe-core isn't part of the website: install it with npm in a scratch folder, never in the repository
// (for example: cd <scratch folder> && npm install axe-core@4.10.2, then pass
// <scratch folder>/node_modules/axe-core/axe.min.js). Needs Playwright with Chromium (installed in
// Claude's cloud sessions). It serves the repository on http://127.0.0.1:8767, so that port must be free.
// Success: "0 problems" on every screen. "To check by hand" lines are colors axe couldn't measure
// (words over the dots, or ink on paper, which is 15 to 1).
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const AXE = process.argv[2];
if (!AXE || !existsSync(AXE)) {
  console.log('Give the path to axe.min.js, for example: node idea-board/tests/axe-check.mjs /tmp/axe/node_modules/axe-core/axe.min.js');
  process.exit(1);
}

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright');   // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

const APP = 'http://127.0.0.1:8767/idea-board/';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const webServer = spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
process.on('exit', () => webServer.kill());
const answers = () => new Promise((resolve) => {
  http.get(APP, (response) => { response.resume(); resolve(response.statusCode === 200); }).on('error', () => resolve(false));
});
let serving = false;
for (let i = 0; i < 50 && !serving; i += 1) {
  serving = await answers();
  if (!serving) await new Promise((resolve) => setTimeout(resolve, 100));
}
if (!serving) {
  console.log('The local web server did not start. Is port 8767 free? (fuser -k 8767/tcp frees it)');
  process.exit(1);
}

const browser = await chromium.launch();
// bypassCSP lets the checker's script run; the app's own safety rule would otherwise block it
const context = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, bypassCSP: true });
const page = await context.newPage();
await page.addInitScript({ path: AXE });

let problems = 0;
async function check(label) {
  const result = await page.evaluate(() => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  }));
  problems += result.violations.length;
  console.log(`${label}: ${result.violations.length} problems, ${result.passes.length} rules passed`);
  for (const v of result.violations) console.log(`  PROBLEM ${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  for (const v of result.incomplete) console.log(`  to check by hand: ${v.id} -> ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(', ')}`);
}

await page.goto(APP);
await page.waitForSelector('#list-screen:not([hidden])');
await page.waitForTimeout(400);
await check('The list, no boards');
await page.click('#new-board');
await page.waitForSelector('#board-settings:not([hidden])');
await check('A new board\'s name screen');
await page.keyboard.type('Sermon series');
await page.click('#board-done');
await page.waitForSelector('#board-screen:not([hidden])');
await page.click('#add-note');
await page.keyboard.type('A note');
await page.click('#done');
await page.waitForTimeout(400);
await check('A board with a note');
await page.click('#edit-board');
await page.waitForSelector('#board-settings:not([hidden])');
await page.click('#remove-board');
await check('The "Remove board" question');
await page.click('#confirm-no');
await page.goBack();
await page.waitForTimeout(300);
await page.click('#to-boards');
await page.waitForSelector('#list-screen:not([hidden])');
await page.waitForTimeout(300);
await check('The list with a board');

await browser.close();
webServer.kill();
console.log(problems ? `${problems} problems in all` : '0 problems on every screen');
process.exit(problems ? 1 : 0);
