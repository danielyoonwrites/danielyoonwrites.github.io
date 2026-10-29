// Checks for the app's owner's page (sign-up step S4), the invite email's messages and the
// sign-in screens, in Chromium at 320, 360 and 1280 wide, with the real server/worker.js
// answering (stand-ins for D1, Resend and the AI; see server-test.mjs). Written October 29,
// 2026. Run from the repository folder: node living-in-the-word/tests/app-test.mjs
// It serves the repository itself on http://127.0.0.1:8765 (python3), so that port must be
// free. Needs Playwright with Chromium (installed in Claude's cloud sessions). Screenshots go
// to a temporary folder, printed at the end. Success ends with "... passed, 0 failed".
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { makeD1, freshWorker, makeEnv, call, signIn } from './server-test.mjs';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright');   // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

const APP = 'http://127.0.0.1:8765/living-in-the-word/';
const WORKER = 'https://living-in-the-word.danyoonsignup.workers.dev/';
const SHOTS = path.join(os.tmpdir(), 'living-in-the-word-shots') + path.sep;
mkdirSync(SHOTS, { recursive: true });

// Serve the repository folder, like GitHub Pages does, and wait until it answers
const repository = fileURLToPath(new URL('../../', import.meta.url));
const webServer = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
// (node:http, because server-test.mjs replaces fetch with its stand-ins)
const answers = () => new Promise((resolve) => {
  http.get(APP, (response) => { response.resume(); resolve(response.statusCode === 200); }).on('error', () => resolve(false));
});
let serving = false;
for (let i = 0; i < 50 && !serving; i += 1) {
  serving = await answers();
  if (!serving) await new Promise((resolve) => setTimeout(resolve, 100));
}
if (!serving) {
  console.log('The local web server did not start. Is port 8765 free? (fuser -k 8765/tcp frees it)');
  webServer.kill();
  process.exit(1);
}

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

const worker = await freshWorker();
const env = makeEnv(makeD1());
let offline = false;
let requests = 0;

const browser = await chromium.launch({
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined,
});

async function newPhone(width = 360, height = 740) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:8765' });
  await context.route(WORKER, async (route) => {
    if (offline) return route.abort('internetdisconnected');
    requests += 1;
    const request = route.request();
    const headers = Object.fromEntries(Object.entries(await request.allHeaders()).filter(([name]) => !name.startsWith(':')));
    headers['cf-connecting-ip'] = '203.0.113.9';
    const init = { method: request.method(), headers };
    if (request.method() === 'POST') init.body = request.postData();
    const response = await worker.fetch(new Request(WORKER, init), env);
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
  return { context, page, errors };
}

// Puts a sign-in on the phone (as if signed in earlier), then opens the app fresh
async function signedInAs(page, key, email, owner) {
  await page.goto(APP);
  await page.evaluate(([key, email, owner]) => {
    const saved = { version: 1, session: key, email };
    if (owner !== undefined) saved.owner = owner;
    localStorage.setItem('living-in-the-word', JSON.stringify(saved));
  }, [key, email, owner]);
  await page.goto(APP);
  await page.waitForLoadState('networkidle');
}

const visible = (page, selector) => page.locator(selector).isVisible();
const text = (page, selector) => page.locator(selector).innerText();
const active = (page) => page.evaluate(() => document.querySelector('.screen.active').id);
const saved = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('living-in-the-word') || '{}'));
async function noSideScroll(page, what) {
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('no sideways scroll: ' + what, wide <= 0, String(wide));
}

// ---- Sign in the owner and Sarah on the server (as if done on their phones earlier)
const ownerKey = (await signIn(worker, env, 'owner@example.com')).body.session;

// ---- A. A phone that isn't signed in: no "Invite people"
{
  const { context, page, errors } = await newPhone();
  await page.goto(APP);
  check('A: signed out shows Sign in', await visible(page, '[data-action="sign-in"]'));
  check('A: signed out hides Invite people', !(await visible(page, '[data-action="people"]')));
  check('A: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- B to P. The owner, signed in before this change (no owner flag yet)
{
  const { context, page, errors } = await newPhone();
  await signedInAs(page, ownerKey, 'owner@example.com', undefined);
  check('B: Invite people shows for the owner', await visible(page, '[data-action="people"]'));
  const order = await page.evaluate(() => [...document.querySelectorAll('.account > *')].filter((el) => !el.hidden).map((el) => el.textContent.trim()));
  check('B: order is Signed in as, Invite people, Sign out', JSON.stringify(order) === JSON.stringify(['Signed in as owner@example.com.', 'Invite people', 'Sign out']), JSON.stringify(order));
  await page.screenshot({ path: SHOTS + '1-start-screen.png', fullPage: true });

  // C. The list, empty
  await page.click('[data-action="people"]');
  check('C: people screen', await active(page) === 'people');
  await page.waitForSelector('.no-people:not([hidden])');
  check('C: empty list message', (await text(page, '.no-people')) === 'No one invited yet.');
  const limitNotes = async () => page.locator('.people-limits .note').allInnerTexts();
  check('C: limits heading', (await text(page, '.people-limits .label')).toLowerCase() === 'daily ai limits', await text(page, '.people-limits .label'));
  check('C: why there are limits', (await limitNotes())[0] === 'To keep the AI’s cost safe, each person can write up to 20 sets of questions a day, and everyone together up to 60. A set is one Bible study, one reading-plan day, or one tap of “Write new questions.” The counts start over at midnight Pacific time.', JSON.stringify(await limitNotes()));
  check('C: today, none used', (await limitNotes())[1] === 'Today you’ve used 0 of your 20. Everyone together has used 0 of 60, counting phones that use the passcode.', JSON.stringify(await limitNotes()));
  check('C: Loading… cleared', !(await visible(page, '.people-status')));
  check('C: owner remembered', (await saved(page)).owner === true);
  check('C: heading has focus', await page.evaluate(() => document.activeElement.textContent === 'Invite people'));
  await page.screenshot({ path: SHOTS + '2-empty-list.png', fullPage: true });

  // D. The invite screen
  await page.click('[data-action="invite"]');
  check('D: invite screen', await active(page) === 'invite');
  check('D: cursor in the email box', await page.evaluate(() => document.activeElement.id === 'invite-email'));
  await page.screenshot({ path: SHOTS + '3-invite-screen.png', fullPage: true });

  // E, F, G. Gentle messages
  await page.click('#invite [type="submit"]');
  check('E: empty address', (await text(page, '#invite .gentle-error')) === 'Type their email address first.');
  await page.fill('#invite-email', 'sarah at example');
  await page.click('#invite [type="submit"]');
  check('F: bad address', (await text(page, '#invite .gentle-error')).startsWith('That doesn’t look like an email address'));
  await page.fill('#invite-email', 'Owner@Example.com');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#invite .gentle-error').textContent.startsWith('That’s your own'));
  check('G: own address', (await text(page, '#invite .gentle-error')) === 'That’s your own address. You can always sign in.');

  // H, I. Invite Sarah with a name
  await page.fill('#invite-email', ' Sarah@Example.com ');
  await page.fill('#invite-name', 'Sarah Kim');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active'));
  check('H: back on the list', await active(page) === 'people');
  check('H: message', (await text(page, '.people-status')) === 'Invited Sarah Kim, and emailed them the app’s link and how to sign in.', await text(page, '.people-status'));
  const firstRow = await page.locator('.people-list li').first().innerText();
  check('H: row', /Sarah Kim\s+sarah@example\.com\s+Used 0 of 20 today\s+Turn off/i.test(firstRow), JSON.stringify(firstRow));
  await page.screenshot({ path: SHOTS + '3b-after-invite.png' });
  check('I: boxes emptied', await page.evaluate(() => !document.getElementById('invite-email').value && !document.getElementById('invite-name').value));

  // J. Without a name
  await page.click('[data-action="invite"]');
  check('J: the old message is gone on the invite screen', !(await visible(page, '#invite .gentle-error')));
  await page.fill('#invite-email', 'james.park@example.com');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active'));
  check('J: message without a name', (await text(page, '.people-status')) === 'Invited james.park@example.com, and emailed them the app’s link and how to sign in.', await text(page, '.people-status'));
  const jamesRow = page.locator('.people-list li', { hasText: 'james.park@example.com' });
  check('J: one line for the address', (await jamesRow.locator('.person-text').count()) === 1 && (await jamesRow.locator('.person-name').innerText()) === 'james.park@example.com');

  // K. A name that looks like code stays plain text
  await page.click('[data-action="invite"]');
  await page.fill('#invite-email', 'grace@example.com');
  await page.fill('#invite-name', 'Grace <img src=x onerror="window.hacked=1">');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active'));
  check('K: no image made from a name', await page.evaluate(() => !document.querySelector('.people-list img') && !window.hacked));
  check('K: shown as typed', (await page.locator('.people-list .person-name', { hasText: 'Grace' }).innerText()) === 'Grace <img src=x onerror="window.hacked=1">');
  // Change Grace's name back to something plain for the screenshots (inviting again keeps one row)
  await page.click('[data-action="invite"]');
  await page.fill('#invite-email', 'grace@example.com');
  await page.fill('#invite-name', 'Grace Lee');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active'));
  check('K: inviting again keeps one row', (await page.locator('.people-list li').count()) === 3);

  // W. Use today: Sarah writes questions twice, the owner once; then the list again
  const sarahKey = (await signIn(worker, env, 'sarah@example.com', '198.51.100.20')).body.session;
  await call(worker, env, { passage: 'John 15', method: 'study' }, { key: sarahKey });
  await call(worker, env, { passage: 'Romans 14', method: 'study' }, { key: sarahKey });
  await call(worker, env, { passage: 'Psalm 23', method: 'study' }, { key: ownerKey });
  await page.click('.screen.active [data-action="back"]');
  check('P: Back goes to the start screen', await active(page) === 'home');
  await page.click('[data-action="people"]');
  await page.waitForFunction(() => document.querySelectorAll('.people-list li').length === 3 && !document.querySelector('.people-status').textContent);
  check('W: Sarah used 2', /Used 2 of 20 today/.test(await page.locator('.people-list li', { hasText: 'Sarah Kim' }).innerText()));
  check('W: today line', (await limitNotes())[1] === 'Today you’ve used 1 of your 20. Everyone together has used 3 of 60, counting phones that use the passcode.', JSON.stringify(await limitNotes()));
  const names = await page.locator('.people-list .person-name').allInnerTexts();
  check('W: by name', JSON.stringify(names) === JSON.stringify(['Grace Lee', 'james.park@example.com', 'Sarah Kim']), JSON.stringify(names));
  await page.screenshot({ path: SHOTS + '4-list.png', fullPage: true });
  await noSideScroll(page, 'list at 360');

  // M. Turn off, then "Cancel": nothing changes, nothing is sent
  let dialogText = '';
  page.once('dialog', async (dialog) => { dialogText = dialog.message(); await dialog.dismiss(); });
  const before = requests;
  await page.locator('.people-list li', { hasText: 'Sarah Kim' }).locator('button').click();
  await page.waitForTimeout(200);
  check('M: the question', dialogText === 'Turn off Sarah Kim? They’ll be signed out, and can’t sign in until you turn them back on.', dialogText);
  check('M: cancel sends nothing', requests === before);
  check('M: still on', /Turn off/i.test(await page.locator('.people-list li', { hasText: 'Sarah Kim' }).innerText()));

  // L. Turn off, then OK
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.people-list li', { hasText: 'Sarah Kim' }).locator('button').click();
  await page.waitForFunction(() => /turned off/.test(document.querySelector('.people-status').textContent));
  check('L: message', (await text(page, '.people-status')) === 'Sarah Kim is turned off.');
  const lastRow = page.locator('.people-list li', { hasText: 'Sarah Kim' });
  check('L: stays in its place', JSON.stringify(await page.locator('.people-list .person-name').allInnerTexts()) === JSON.stringify(['Grace Lee', 'james.park@example.com', 'Sarah Kim']));
  check('L: turned off', /Sarah Kim[\s\S]*Turned off[\s\S]*Turn on/i.test(await lastRow.innerText()), await lastRow.innerText());
  check('L: grey', await lastRow.evaluate((li) => li.classList.contains('is-off')));
  check('L: the button names the person', (await lastRow.locator('button').getAttribute('aria-label')) === 'Turn on Sarah Kim');
  const sarahNow = await call(worker, env, { passage: 'John 3', method: 'study' }, { key: sarahKey });
  check('L: Sarah is signed out', sarahNow.body.error === 'signed-out');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: SHOTS + '5-turned-off.png', fullPage: true });

  // N. Turn on
  await lastRow.locator('button').click();
  await page.waitForFunction(() => /can sign in again/.test(document.querySelector('.people-status').textContent));
  check('N: message', (await text(page, '.people-status')) === 'Sarah Kim can sign in again.');
  check('N: back on', /Turn off/i.test(await page.locator('.people-list li', { hasText: 'Sarah Kim' }).innerText()));

  // O. Send the app's link (no share menu in this browser, so it's copied)
  const hasShare = await page.evaluate(() => Boolean(navigator.share));
  await page.click('[data-action="send-link"]');
  if (!hasShare) {
    await page.waitForFunction(() => /Copied/.test(document.querySelector('.people-status').textContent));
    check('O: copied message', (await text(page, '.people-status')) === 'Copied the app’s link. Paste it into a message to them.');
    check('O: the link', (await page.evaluate(() => navigator.clipboard.readText())) === APP);
  } else {
    console.log('(This browser has a share menu; the copy fallback was not tested here.)');
  }

  // O2. The invite email can't be sent (the stand-in Resend refuses this address): still invited
  await page.click('[data-action="invite"]');
  check('O2: the invite screen says an email goes out', (await text(page, '#invite .sign-in-text')) === 'They’ll get an email with the app’s link, and can sign in with this address right away.');
  await page.fill('#invite-email', 'fail@example.com');
  await page.click('#invite [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active'));
  check('O2: message', (await text(page, '.people-status')) === 'Invited fail@example.com, but the email couldn’t be sent. Tap “Send the app’s link” to send it yourself.', await text(page, '.people-status'));
  check('O2: in the list anyway', (await page.locator('.people-list .person-name', { hasText: 'fail@example.com' }).count()) === 1);
  check('O2: the list screen\'s hint', (await text(page, '#people .hint')) === 'Inviting emails them the app’s link and how to sign in. You can also send the link yourself, in KakaoTalk or a text.');

  // P. Back and the back gesture
  await page.click('[data-action="invite"]');
  await page.goBack();
  await page.waitForTimeout(300);
  check('P: back gesture from invite goes to the list', await active(page) === 'people');
  await page.goBack();
  await page.waitForTimeout(300);
  check('P: back gesture from the list goes to the start screen', await active(page) === 'home');

  // X. Sign out forgets the owner flag
  await page.click('[data-action="sign-out"]');
  check('X: owner forgotten', (await saved(page)).owner === undefined && !(await visible(page, '[data-action="people"]')));
  check('B-X: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- Q, R. Sarah's phone
{
  const sarahKey = (await signIn(worker, env, 'sarah@example.com', '198.51.100.30')).body.session;
  const { context, page, errors } = await newPhone();
  await signedInAs(page, sarahKey, 'sarah@example.com', false);
  check('R: not the owner: no Invite people', !(await visible(page, '[data-action="people"]')));
  // Q. If her phone didn't know (signed in before), the server says no, and the button goes
  await signedInAs(page, sarahKey, 'sarah@example.com', undefined);
  check('Q: unknown shows the button', await visible(page, '[data-action="people"]'));
  await page.click('[data-action="people"]');
  await page.waitForFunction(() => /owner/.test(document.querySelector('.people-status').textContent));
  check('Q: message', (await text(page, '.people-status')) === 'Only the app’s owner can open this page.');
  check('Q: no list shown', (await page.locator('.people-list li').count()) === 0 && !(await visible(page, '.people-limits')));
  check('Q: remembered as not the owner', (await saved(page)).owner === false);
  await page.click('.screen.active [data-action="back"]');
  check('Q: button gone', !(await visible(page, '[data-action="people"]')));
  check('Q-R: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- S, T. The owner's sign-in ran out: sign in again, then back to the list
{
  const { context, page, errors } = await newPhone();
  const oldKey = (await signIn(worker, env, 'owner@example.com', '198.51.100.40')).body.session;
  await signedInAs(page, oldKey, 'owner@example.com', true);
  await call(worker, env, { action: 'sign-out' }, { key: oldKey });   // as if it ran out
  await page.click('[data-action="people"]');
  await page.waitForFunction(() => document.querySelector('#sign-in').classList.contains('active'));
  check('S: sign-in screen', await active(page) === 'sign-in');
  check('S: says signed out', /You’ve been signed out/.test(await text(page, '#sign-in .sign-in-message')));
  check('S: address filled in', (await page.inputValue('#sign-in-email')) === 'owner@example.com');
  // T. Sign in with a code (taken from the stand-in email)
  const { mail } = await import('./server-test.mjs');
  const count = mail.length;
  await page.click('#sign-in [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#sign-in-code').classList.contains('active'));
  check('T: a code was emailed', mail.length === count + 1);
  await page.fill('#sign-in-code-text', mail[mail.length - 1].subject.slice(0, 6));
  await page.click('#sign-in-code [type="submit"]');
  await page.waitForFunction(() => document.querySelector('#people').classList.contains('active') && document.querySelectorAll('.people-list li').length > 0);
  check('T: back on the list after signing in', await active(page) === 'people');
  check('T: owner remembered from sign-in', (await saved(page)).owner === true);
  await page.click('.screen.active [data-action="back"]');
  check('T: Back still goes to the start screen', await active(page) === 'home');

  // U. No connection
  offline = true;
  await page.click('[data-action="people"]');
  await page.waitForFunction(() => /connection/.test(document.querySelector('.people-status').textContent));
  check('U: offline message', (await text(page, '.people-status')) === 'Couldn’t reach the server. Check your connection and try again.');
  offline = false;
  const realErrors = errors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(e));
  check('S-U: no errors', realErrors.length === 0, realErrors.join(' | '));
  await context.close();
}

// ---- V. Narrow and wide screens, with a long name and address
{
  // (the first owner key was signed out in step X, so sign in again)
  const ownerKey2 = (await signIn(worker, env, 'owner@example.com', '198.51.100.50')).body.session;
  await call(worker, env, { action: 'invite', email: 'a.very.long.email.address.for.testing@example-church-group.org', name: 'Christopher Alexander Montgomery-Whitfield' }, { key: ownerKey2 });
  for (const [width, height] of [[320, 640], [1280, 900]]) {
    const { context, page } = await newPhone(width, height);
    await signedInAs(page, ownerKey2, 'owner@example.com', true);
    await noSideScroll(page, 'start ' + width);
    await page.click('[data-action="people"]');
    await page.waitForFunction(() => document.querySelectorAll('.people-list li').length >= 4);
    await noSideScroll(page, 'list ' + width);
    await page.screenshot({ path: SHOTS + 'list-' + width + '.png', fullPage: true });
    await page.click('[data-action="invite"]');
    await noSideScroll(page, 'invite ' + width);
    await context.close();
  }
}

await browser.close();
webServer.kill();
console.log('Screenshots: ' + SHOTS);
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
