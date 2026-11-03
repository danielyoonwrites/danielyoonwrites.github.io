// Checks for the app's owner's page (sign-up step S4), the invite email's messages and the
// sign-in screens, in Chromium at 320, 360 and 1280 wide, with the real server/worker.js
// answering (stand-ins for D1, Resend and the AI; see server-test.mjs). Written October 29,
// 2026. Run from the repository folder: node living-in-the-word/tests/app-test.mjs
// It serves the repository itself on http://127.0.0.1:8765 (python3), and a stand-in site for
// the offline helper's checks on 8766 (section SW), so both ports must be free. Needs Playwright with Chromium (installed in Claude's cloud sessions). Screenshots go
// to a temporary folder, printed at the end. Success ends with "... passed, 0 failed".
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { makeD1, freshWorker, makeEnv, call, signIn, ai } from './server-test.mjs';

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
process.on('exit', () => webServer.kill());   // even when a check stops the run early
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
const asked = [];   // each set of questions asked for, like "Philippians 2|personal"
let hold = null;    // { passage, waiting }: that passage's answer waits until released (section W)
let hang = null;    // a passage whose answer never comes, like a connection that hangs (section HANG)
const held = new Map();   // passage → a promise: more than one answer held back at once (section W9)
let textAsks = 0;   // requests for the Bible text (none while the ESV is on hold; section E)
let phoneIp = '203.0.113.9';   // the internet address the stand-in server sees for every phone

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
    headers['cf-connecting-ip'] = phoneIp;
    const init = { method: request.method(), headers };
    if (request.method() === 'POST') {
      init.body = request.postData();
      const sent = JSON.parse(init.body || '{}');
      if (sent.want === 'text') textAsks += 1;
      if (sent.passage && !sent.want) {
        asked.push(sent.passage + '|' + sent.method);
        if (hang && hang === sent.passage) return;   // never answered: only the app's own timer ends it
        if (hold && hold.passage === sent.passage) await hold.waiting;
        if (held.has(sent.passage)) await held.get(sent.passage);
      }
    }
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

// For sections W and Y: one more sign-in for the owner (the server sends 5 codes a day to one
// address), waiting until something happens, and holding one passage's answer back
const ownerKey3 = (await signIn(worker, env, 'owner@example.com', '198.51.100.60')).body.session;
const waitUntil = async (test) => { for (let i = 0; i < 60 && !test(); i += 1) await new Promise((r) => setTimeout(r, 100)); };
let release;
const holdAnswer = (passage) => { hold = { passage, waiting: new Promise((resolve) => { release = resolve; }) }; };

// ---- W. The reading plan: the next reading's questions are written ahead, quietly
// (the owner's choice, October 31, 2026)
{
  const times = (passage) => asked.filter((item) => item === passage + '|personal').length;
  const writing = (page) => page.evaluate(() => document.getElementById('today').classList.contains('writing'));
  const startPlan = async (page, book) => {
    await page.click('[data-action="reading"]');
    await page.selectOption('#plan-book', book);
    await page.click('#plan-setup button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('.reading-check').hidden);
  };
  const { context, page, errors } = await newPhone();
  await signedInAs(page, ownerKey3, 'owner@example.com', true);

  // W1, W2. A plan: Philippians, 1 chapter a day. Chapter 1's questions, then chapter 2's,
  // quietly: nothing about chapter 2 shows on chapter 1's screen while it's written
  holdAnswer('Philippians 2');
  await startPlan(page, 'Philippians');
  check('W1: Philippians 1 opens with the AI questions', (await text(page, '.reading-name')) === 'Philippians 1' && (await page.locator('.reflect-list li').count()) === 3);
  await waitUntil(() => times('Philippians 2') > 0);
  check('W2: Philippians 2 asked for ahead', times('Philippians 2') === 1, JSON.stringify(asked));
  check('W2: quietly (no writing lines or message on Philippians 1)', !(await writing(page)) && !(await visible(page, '.reading-status')) && (await page.locator('.reflect-list li').count()) === 3);
  await page.screenshot({ path: SHOTS + 'w2-reading-while-the-next-is-written.png', fullPage: true });

  // W3. "Read the next one now" while chapter 2's are still being written: it says so, then shows them
  await page.click('[data-action="done-reading"]');
  check('W3: Done for today', (await active(page)) === 'reading-done');
  await page.click('[data-action="read-ahead"]');
  check('W3: Philippians 2 says it is being written', (await text(page, '.reading-name')) === 'Philippians 2' && (await writing(page)) && (await text(page, '.reading-status')) === 'Writing questions for Philippians 2. This can take up to a minute.');
  release();
  hold = null;
  await page.waitForFunction(() => !document.querySelector('.reading-check').hidden);
  check('W3: then its questions show', !(await writing(page)) && !(await visible(page, '.reading-status')) && (await page.locator('.reflect-list li').count()) === 3);
  check('W3: Philippians 2 asked for only once', times('Philippians 2') === 1, JSON.stringify(asked));

  // W4. Then chapter 3's, and only one reading ahead
  await page.waitForFunction(() => Boolean(JSON.parse(localStorage.getItem('living-in-the-word')).plan.questions['five-2']));
  await new Promise((r) => setTimeout(r, 300));
  check('W4: Philippians 3 written ahead and saved', times('Philippians 3') === 1, JSON.stringify(asked));
  check('W4: only one ahead (not Philippians 4)', times('Philippians 4') === 0, JSON.stringify(asked));

  // W5. The next day: chapter 3 opens with its questions ready, and chapter 4's are written ahead
  await page.click('[data-action="done-reading"]');
  await page.evaluate(() => {
    const all = JSON.parse(localStorage.getItem('living-in-the-word'));
    const d = new Date();
    d.setDate(d.getDate() - 1);
    all.plan.lastDone = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    localStorage.setItem('living-in-the-word', JSON.stringify(all));
  });
  await page.goto(APP);
  await page.waitForLoadState('networkidle');
  await page.click('[data-action="reading"]');
  check('W5: Philippians 3 opens with its questions, no wait', (await text(page, '.reading-name')) === 'Philippians 3' && !(await writing(page)) && (await visible(page, '.reading-check')));
  check('W5: Philippians 3 not asked for again', times('Philippians 3') === 1, JSON.stringify(asked));
  await page.screenshot({ path: SHOTS + 'w5-next-day-ready.png', fullPage: true });
  await waitUntil(() => times('Philippians 4') > 0);
  check('W5: Philippians 4 written ahead', times('Philippians 4') === 1, JSON.stringify(asked));

  // W6. The last reading: nothing past the end
  await page.click('[data-action="done-reading"]');
  await page.click('[data-action="read-ahead"]');
  await new Promise((r) => setTimeout(r, 500));
  check('W6: nothing asked for past the last reading', asked.filter((item) => item.startsWith('Philippians')).length === 4, JSON.stringify(asked));
  check('W: no errors', errors.length === 0, errors.join(' | '));
  await context.close();

  // W7. A phone that isn't signed in asks for nothing ahead
  {
    const before = asked.length;
    const { context, page } = await newPhone();
    await page.goto(APP);
    await page.click('[data-action="reading"]');
    await page.selectOption('#plan-book', 'Philippians');
    await page.click('#plan-setup button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
    check('W7: not signed in: nothing asked for', asked.length === before, JSON.stringify(asked.slice(before)));
    check('W7: "Questions for this reading" shows instead', await visible(page, '[data-action="reading-ai"]'));
    await context.close();
  }

  // W8. Ending the plan while the next reading is being written: that answer isn't kept
  {
    const { context, page, errors } = await newPhone();
    await signedInAs(page, ownerKey3, 'owner@example.com', true);
    page.on('dialog', (dialog) => dialog.accept());
    const before = times('Philippians 2');
    holdAnswer('Philippians 2');
    await startPlan(page, 'Philippians');
    await waitUntil(() => times('Philippians 2') > before);
    await page.click('[data-action="end-plan"]');
    await startPlan(page, 'Jude');
    release();
    hold = null;
    await new Promise((r) => setTimeout(r, 500));
    const plan = (await saved(page)).plan;
    check('W8: the new plan keeps only its own questions', plan.book === 'Jude' && Object.keys(plan.questions || {}).join() === 'five-0', JSON.stringify(plan));
    check('W8: no errors', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // W9, W10. Ending a plan while its first reading is written, then starting another
  // (AUDIT.md, item 6; November 3, 2026). Someone new, so the owner's daily limit doesn't
  // get in the way.
  {
    await call(worker, env, { action: 'invite', email: 'plans@example.com', name: 'Plans' }, { key: ownerKey3 });
    const plansKey = (await signIn(worker, env, 'plans@example.com', '198.51.100.64')).body.session;
    const { context, page, errors } = await newPhone();
    await signedInAs(page, plansKey, 'plans@example.com', false);
    page.on('dialog', (dialog) => dialog.accept());
    const begin = async (book) => {
      await page.click('[data-action="reading"]');
      await page.selectOption('#plan-book', book);
      await page.click('#plan-setup button[type="submit"]');
      await page.waitForFunction((name) => document.querySelector('.reading-name').textContent === name, book + ' 1');
    };
    let releaseOld;
    let releaseNew;
    held.set('Jonah 1', new Promise((resolve) => { releaseOld = resolve; }));
    held.set('Ruth 1', new Promise((resolve) => { releaseNew = resolve; }));

    // W9. Jonah 1 is being written when that plan ends; then a plan for Ruth starts
    await begin('Jonah');
    await waitUntil(() => times('Jonah 1') > 0);
    await page.click('[data-action="end-plan"]');
    await begin('Ruth');
    await waitUntil(() => times('Ruth 1') > 0);
    check('W9: Ruth 1 says it is being written', (await writing(page)) && (await text(page, '.reading-status')).startsWith('Writing questions for Ruth 1.'), await text(page, '.reading-status'));
    releaseOld();   // Jonah's answer arrives while Ruth's is still being written
    await new Promise((r) => setTimeout(r, 600));
    check('W9: the old plan\'s answer leaves Ruth 1\'s writing lines alone', (await writing(page)) && (await text(page, '.reading-status')).startsWith('Writing questions for Ruth 1.'), await text(page, '.reading-status'));
    await page.click('#today .back');
    await page.click('[data-action="reading"]');
    await new Promise((r) => setTimeout(r, 300));
    check('W9: opened again, Ruth 1 is not asked for twice', times('Ruth 1') === 1 && (await writing(page)), JSON.stringify(asked.filter((item) => item.startsWith('Ruth'))));
    releaseNew();
    await page.waitForFunction(() => !document.querySelector('.reading-check').hidden);
    check('W9: then Ruth 1\'s questions show', (await text(page, '.reading-name')) === 'Ruth 1' && (await page.locator('.reflect-list li').count()) === 3 && times('Ruth 1') === 1);
    held.clear();

    // W10. A reading that failed in one plan is asked for by itself in the next plan
    await page.click('[data-action="end-plan"]');
    ai.fail = { status: 500, body: { type: 'error', error: { type: 'api_error', message: 'Internal server error' } } };
    await begin('Esther');
    await page.waitForFunction(() => !document.getElementById('today').classList.contains('writing'));
    check('W10: Esther 1 failed, so "Questions for this reading" shows', await visible(page, '[data-action="reading-ai"]'));
    ai.fail = null;
    await page.click('[data-action="end-plan"]');
    const before = times('Esther 1');
    await begin('Esther');
    const cameBack = await page.waitForFunction(() => !document.querySelector('.reading-check').hidden, null, { timeout: 8000 }).then(() => true, () => false);
    check('W10: a new plan asks for its first reading by itself', cameBack && times('Esther 1') === before + 1, JSON.stringify(asked.filter((item) => item.startsWith('Esther'))));
    check('W9, W10: no errors', errors.length === 0, errors.join(' | '));
    await context.close();
  }
}

// ---- Y. Prepare for a Bible study: the next chapter's questions are written ahead, quietly
// (the owner's choice, October 31, 2026)
{
  const CHECK = 'Written by AI, which can make mistakes. Check what it says against your Bible, and change anything before you use it.';
  const times = (passage) => asked.filter((item) => item === passage + '|study').length;
  const writing = (page) => page.evaluate(() => document.getElementById('questions').classList.contains('writing'));
  const kept = async (page) => ((await saved(page)).ahead || {}).passage || '';
  const typePassage = async (page, typed) => {
    const now = await active(page);
    if (now === 'home') await page.click('[data-action="study"]');
    else if (now !== 'passage') await page.click('#questions .back');
    await page.fill('#passage-text', typed);
    await page.click('#passage button[type="submit"]');
  };
  const questionsShow = (page) => page.waitForFunction(() => document.querySelectorAll('.question-list textarea').length > 0
    && !document.getElementById('questions').classList.contains('writing'));

  const { context, page, errors } = await newPhone();
  await signedInAs(page, ownerKey3, 'owner@example.com', true);

  // Y1, Y2. Philippians 1, then Philippians 2's questions written ahead, quietly
  await typePassage(page, 'Philippians 1');
  await questionsShow(page);
  await waitUntil(() => times('Philippians 2') > 0);
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === 'Philippians 2');
  check('Y1: Philippians 1 shows its questions and the "check it" line', (await text(page, '.passage-name')) === 'Philippians 1'
    && (await page.locator('.question-list textarea').count()) === 3 && (await text(page, '.suggest-status')) === CHECK);
  check('Y2: Philippians 2 written ahead, once, and kept', times('Philippians 2') === 1 && (await kept(page)) === 'Philippians 2', JSON.stringify(asked));
  check('Y2: without ?test, no test line', !(await visible(page, '.test-cost')));

  // Y3. Philippians 2 (typed "phil 2") opens at once, without asking again; Philippians 3 is next
  await typePassage(page, 'phil 2');
  check('Y3: Philippians 2 opens at once', (await text(page, '.passage-name')) === 'Philippians 2' && !(await writing(page))
    && (await page.locator('.question-list textarea').count()) === 3 && (await text(page, '.suggest-status')) === CHECK);
  check('Y3: not asked for again', times('Philippians 2') === 1, JSON.stringify(asked));
  await page.screenshot({ path: SHOTS + 'y3-next-chapter-ready.png' });   // the phone's screen (the Save bar stays at its bottom)
  await waitUntil(() => times('Philippians 3') > 0);
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === 'Philippians 3');
  check('Y3: Philippians 3 written ahead next (the used set is gone)', times('Philippians 3') === 1 && (await kept(page)) === 'Philippians 3');

  // Y4, Y5. Some verses, or a book's last chapter: nothing is written ahead
  await typePassage(page, 'John 4:1-26');
  await questionsShow(page);
  await typePassage(page, 'Philippians 4');
  await questionsShow(page);
  await new Promise((r) => setTimeout(r, 500));
  check('Y4: nothing ahead after some verses', asked.filter((item) => item.startsWith('John')).join() === 'John 4:1-26|study', JSON.stringify(asked));
  check('Y5: nothing past a book\'s last chapter', times('Philippians 5') === 0 && (await kept(page)) === 'Philippians 3', JSON.stringify(asked));

  // Y6. The next chapter opened while it's still being written: it waits for that answer, not a second one
  holdAnswer('Romans 2');
  await typePassage(page, 'Romans 1');
  await questionsShow(page);
  await waitUntil(() => times('Romans 2') > 0);
  await typePassage(page, 'Romans 2');
  check('Y6: says it is writing Romans 2', (await writing(page)) && (await text(page, '.suggest-status')) === 'Writing questions for Romans 2. This can take up to a minute.');
  release();
  hold = null;
  await questionsShow(page);
  check('Y6: then its questions show, asked for only once', (await text(page, '.passage-name')) === 'Romans 2' && times('Romans 2') === 1
    && (await text(page, '.suggest-status')) === CHECK, JSON.stringify(asked));
  await waitUntil(() => times('Romans 3') > 0);
  check('Y6: then Romans 3 is written ahead', times('Romans 3') === 1, JSON.stringify(asked));
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === 'Romans 3');

  // Y7. One psalm: the next psalm ("Psalm 24"), replacing the set kept before
  await typePassage(page, 'Psalm 23');
  await questionsShow(page);
  await waitUntil(() => times('Psalm 24') > 0);
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === 'Psalm 24');
  check('Y7: Psalm 24 after Psalm 23, and only one set kept', times('Psalm 24') === 1 && (await kept(page)) === 'Psalm 24');
  check('Y: no errors', errors.length === 0, errors.join(' | '));
  await context.close();

  // Y8. A phone that isn't signed in asks for nothing ahead
  {
    const before = asked.length;
    const { context, page } = await newPhone();
    await page.goto(APP);
    await typePassage(page, 'Philippians 1');
    await new Promise((r) => setTimeout(r, 500));
    check('Y8: not signed in: nothing asked for', asked.length === before && !(await saved(page)).ahead, JSON.stringify(asked.slice(before)));
    await context.close();
  }

  // Y9. A chapter written ahead opens at once even while the AI is writing another passage's
  // questions, and that answer is then ignored (AUDIT.md, item 7; November 3, 2026). Someone
  // new, so the owner's daily limit doesn't get in the way.
  {
    await call(worker, env, { action: 'invite', email: 'ahead@example.com', name: 'Ahead' }, { key: ownerKey3 });
    const aheadKey = (await signIn(worker, env, 'ahead@example.com', '198.51.100.65')).body.session;
    const { context, page, errors } = await newPhone();
    await page.goto(APP + '?test');
    await page.evaluate((key) => localStorage.setItem('living-in-the-word', JSON.stringify({ version: 1, session: key, email: 'ahead@example.com' })), aheadKey);
    await page.goto(APP + '?test');
    await page.waitForLoadState('networkidle');

    await typePassage(page, 'Titus 1');
    await questionsShow(page);
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === 'Titus 2');
    let releaseOther;
    held.set('Hosea 1', new Promise((resolve) => { releaseOther = resolve; }));
    await typePassage(page, 'Hosea 1');
    await waitUntil(() => times('Hosea 1') > 0);
    check('Y9: Hosea 1 is being written', await writing(page));
    await typePassage(page, 'Titus 2');
    check('Y9: Titus 2 opens at once, written ahead', (await text(page, '.passage-name')) === 'Titus 2' && !(await writing(page))
      && (await page.locator('.question-list textarea').count()) === 3 && (await text(page, '.suggest-status')) === CHECK
      && (await text(page, '.test-cost')) === 'Written ahead, so no wait.', (await text(page, '.suggest-status')) + ' | ' + (await text(page, '.test-cost')));
    check('Y9: not asked for again', times('Titus 2') === 1, JSON.stringify(asked.filter((item) => item.startsWith('Titus'))));
    releaseOther();   // Hosea 1's answer comes after all
    held.clear();
    await new Promise((r) => setTimeout(r, 600));
    check('Y9: Hosea 1\'s answer leaves Titus 2 as it is', (await text(page, '.passage-name')) === 'Titus 2' && (await text(page, '.suggest-status')) === CHECK
      && (await page.evaluate(() => document.querySelector('[data-action="suggest"]').textContent)) === 'Write new questions', await text(page, '.suggest-status'));
    check('Y9: no errors', errors.length === 0, errors.join(' | '));
    await context.close();
  }
}

// ---- Z. The test link (?test) says how long the wait was, and the AI's part of it
// (the owner's choice, October 31, 2026: measure before changing anything). Someone new is
// invited for this, so the owner's daily limit from W and Y doesn't get in the way.
{
  await call(worker, env, { action: 'invite', email: 'timer@example.com', name: 'Timer' }, { key: ownerKey3 });
  const timerKey = (await signIn(worker, env, 'timer@example.com', '198.51.100.61')).body.session;
  const typePassage = async (page, typed) => {
    const now = await active(page);
    if (now === 'home') await page.click('[data-action="study"]');
    else if (now !== 'passage') await page.click('#questions .back');
    await page.fill('#passage-text', typed);
    await page.click('#passage button[type="submit"]');
  };
  const questionsShow = (page) => page.waitForFunction(() => document.querySelectorAll('.question-list textarea').length > 0
    && !document.getElementById('questions').classList.contains('writing'));
  const aheadIs = (page, passage) => page.waitForFunction((p) => (JSON.parse(localStorage.getItem('living-in-the-word')).ahead || {}).passage === p, passage);
  const line = (page) => text(page, '.test-cost');

  const { context, page, errors } = await newPhone();
  await page.goto(APP + '?test');
  await page.evaluate((key) => localStorage.setItem('living-in-the-word', JSON.stringify({ version: 1, session: key, email: 'timer@example.com' })), timerKey);
  await page.goto(APP + '?test');
  await page.waitForLoadState('networkidle');
  ai.delay = 1200;   // the stand-in AI takes 1.2 seconds

  // Z1. Mark 1: the cost, then "You waited ... seconds; the AI took ... of them."
  await typePassage(page, 'Mark 1');
  await questionsShow(page);
  const z1 = (await line(page)).match(/^Opus 5\.5\. 100 tokens in, 50 out\. About 0\.14 cents\. You waited (\d+\.\d) seconds; the AI took (\d+\.\d) of them\.$/);
  check('Z1: the test line shows the wait and the AI\'s part', Boolean(z1) && (await visible(page, '.test-cost')), await line(page));
  check('Z1: the AI took about 1.2 seconds, and the wait was at least that', Boolean(z1) && Number(z1[2]) >= 1.1 && Number(z1[2]) < 2.5 && Number(z1[1]) >= Number(z1[2]), z1 && z1.join(' '));
  await page.screenshot({ path: SHOTS + 'z1-test-line.png' });
  await noSideScroll(page, 'Z1 test line, 360 wide');

  // Z2. Mark 2 was written ahead: it opens at once, and the line says so
  await aheadIs(page, 'Mark 2');
  holdAnswer('Mark 3');   // Mark 3, written ahead next, waits until released (for Z3)
  await typePassage(page, 'Mark 2');
  check('Z2: written ahead: "no wait"', (await line(page)) === 'Written ahead, so no wait.' && (await visible(page, '.test-cost')), await line(page));

  // Z3. Mark 3 opened while it's still being written ahead: the line says that, with the AI's time
  await waitUntil(() => asked.includes('Mark 3|study'));
  await typePassage(page, 'Mark 3');
  await new Promise((r) => setTimeout(r, 300));
  release();
  hold = null;
  await questionsShow(page);
  check('Z3: already being written ahead', /^Opus 5\.5\. 100 tokens in, 50 out\. About 0\.14 cents\. You waited \d+\.\d seconds; it was already being written ahead \(the AI took \d+\.\d in all\)\.$/.test(await line(page)), await line(page));

  // Z4. A small phone (320 wide): no sideways scroll with the longest line
  await page.setViewportSize({ width: 320, height: 640 });
  await noSideScroll(page, 'Z3 test line, 320 wide');
  await page.evaluate(() => document.querySelector('.test-cost').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: SHOTS + 'z4-test-line-320.png' });
  ai.delay = 0;
  check('Z: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- E. While the ESV is on hold (ESV_TEXT off in app.js), nothing asks the server for the Bible
// text, so a wrong or old passcode counts once per open, not twice (AUDIT.md, item 3; November 2, 2026)
{
  check('E: no study or reading asked for the Bible text', textAsks === 0, String(textAsks));
  const wrongTries = () => env.DB.raw.prepare("SELECT COALESCE(SUM(count), 0) AS n FROM usage WHERE who LIKE 'wrong:%'").get().n;
  phoneIp = '203.0.113.60';   // a connection of its own, so earlier sections' tries don't count
  const before = wrongTries();
  const { context, page, errors } = await newPhone();
  await page.goto(APP);
  await page.evaluate(() => localStorage.setItem('living-in-the-word', JSON.stringify({ version: 1, passcode: 'an old passcode' })));
  await page.goto(APP);
  await page.waitForLoadState('networkidle');
  await page.click('[data-action="study"]');
  await page.fill('#passage-text', 'John 3');
  await page.click('#passage button[type="submit"]');
  await page.waitForFunction(() => document.getElementById('passcode').classList.contains('active'));
  await new Promise((r) => setTimeout(r, 500));   // time for a second request, if there were one
  check('E: an old passcode counts as one wrong try per open', wrongTries() === before + 1, before + ' then ' + wrongTries());
  check('E: and asks for the passcode', await visible(page, '#passcode .wrong-passcode'));
  await page.click('#passcode .back');
  check('E: the esv.org link still shows on the passage', await visible(page, '#questions .esv-only'), await active(page));
  check('E: no errors', errors.length === 0, errors.join(' | '));
  phoneIp = '203.0.113.9';
  await context.close();
}

// ---- BUSY. When Anthropic is busy for a moment (a rate limit, or overloaded), the app says so,
// not "This month's AI limit is reached"; this month's limit still says that (AUDIT.md, item 4;
// November 3, 2026). The stand-in AI answers with each problem (ai.fail in server-test.mjs).
{
  await call(worker, env, { action: 'invite', email: 'busy@example.com', name: 'Busy' }, { key: ownerKey3 });
  const busyKey = (await signIn(worker, env, 'busy@example.com', '198.51.100.62')).body.session;
  const { context, page, errors } = await newPhone();
  await page.goto(APP);
  await page.evaluate((key) => localStorage.setItem('living-in-the-word', JSON.stringify({ version: 1, session: key, email: 'busy@example.com' })), busyKey);
  await page.goto(APP);
  await page.waitForLoadState('networkidle');
  const askFor = async (typed) => {
    const now = await active(page);
    if (now === 'home') await page.click('[data-action="study"]');
    else if (now !== 'passage') await page.click('#questions .back');
    await page.fill('#passage-text', typed);
    await page.click('#passage button[type="submit"]');
    await page.waitForFunction(() => {
      const status = document.querySelector('.suggest-status').textContent;
      return !document.getElementById('questions').classList.contains('writing') && status !== '' && !status.startsWith('Writing');
    });
    return text(page, '.suggest-status');
  };
  const BUSY = 'The AI is busy right now, so these are general questions. Try again in a minute.';
  const MONTH = 'This month’s AI limit is reached, so these are general questions.';
  const problem = (type, message, details) => ({ type: 'error', error: details ? { type, message, details } : { type, message } });

  ai.fail = { status: 429, headers: { 'retry-after': '20' }, body: problem('rate_limit_error', 'A rate limit was exceeded (stand-in wording).') };
  const rateLimited = await askFor('Luke 1');
  check('BUSY: a rate limit says the AI is busy', rateLimited === BUSY, rateLimited);
  check('BUSY: with the general questions', (await page.locator('.question-list textarea').count()) > 0);
  await page.evaluate(() => document.querySelector('.suggest-status').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: SHOTS + 'busy-message.png' });

  ai.fail = { status: 529, body: problem('overloaded_error', 'Overloaded') };
  const overloaded = await askFor('Luke 2');
  check('BUSY: Anthropic overloaded says the AI is busy', overloaded === BUSY, overloaded);

  ai.fail = { status: 429, body: problem('rate_limit_error', 'You have reached your API usage limits: your organization has crossed its monthly API usage threshold, set based on your organization\'s API tier. You will regain access on 2026-09-01 at 00:00 UTC.', { error_code: 'enforced_spend_limit_reached' }) };
  const spendCap = await askFor('Luke 3');
  check('BUSY: the monthly spend cap still says this month\'s limit', spendCap === MONTH, spendCap);

  ai.fail = null;
  check('BUSY: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- HANG. A reading's questions give up after 2 minutes, like a study's, when the connection
// hangs (AUDIT.md, item 5; November 3, 2026). For this check only, the phone's 2-minute timer is
// shortened to 1.5 seconds, and the stand-in server never answers Ruth 1 (hang).
{
  await call(worker, env, { action: 'invite', email: 'hang@example.com', name: 'Hang' }, { key: ownerKey3 });
  const hangKey = (await signIn(worker, env, 'hang@example.com', '198.51.100.63')).body.session;
  const { context, page, errors } = await newPhone();
  await page.addInitScript(() => {
    const realSetTimeout = window.setTimeout;
    window.setTimeout = (fn, ms, ...rest) => realSetTimeout(fn, ms === 120000 ? 1500 : ms, ...rest);
  });
  await signedInAs(page, hangKey, 'hang@example.com', false);
  const earlier = asked.filter((item) => item === 'Ruth 1|personal').length;   // Ruth 1 asked for in other sections
  const times = () => asked.filter((item) => item === 'Ruth 1|personal').length - earlier;
  const writing = () => page.evaluate(() => document.getElementById('today').classList.contains('writing'));
  const OFFLINE = 'Couldn’t reach the AI helper, so these are general questions. Check your connection and try again.';

  hang = 'Ruth 1';
  await page.click('[data-action="reading"]');
  await page.selectOption('#plan-book', 'Ruth');
  await page.click('#plan-setup button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('.reading-name').textContent === 'Ruth 1');
  check('HANG: Ruth 1 says its questions are being written', (await writing()) && (await text(page, '.reading-status')).startsWith('Writing questions for Ruth 1.'), await text(page, '.reading-status'));
  const gaveUp = await page.waitForFunction(() => !document.getElementById('today').classList.contains('writing'), null, { timeout: 8000 }).then(() => true, () => false);
  check('HANG: it gives up instead of waiting forever', gaveUp && (await text(page, '.reading-status')) === OFFLINE, await text(page, '.reading-status'));
  check('HANG: with the general questions', (await page.locator('.reflect-list li').count()) > 0 && !(await visible(page, '.reading-check')));
  await page.evaluate(() => document.querySelector('.reading-status').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: SHOTS + 'hang-reading-gave-up.png' });

  // The connection works again: opening the reading again asks again, and the questions come
  hang = null;
  await page.click('#today .back');
  await page.click('[data-action="reading"]');
  const cameBack = await page.waitForFunction(() => !document.querySelector('.reading-check').hidden, null, { timeout: 8000 }).then(() => true, () => false);
  check('HANG: opened again, it asks again and the questions come', cameBack && times() === 2 && (await page.locator('.reflect-list li').count()) === 3, JSON.stringify([cameBack, times()]));
  check('HANG: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- NOSAVE. If this browser won't save (a private window, for example), "Start the plan" says
// so, the same way Save does, instead of silently doing nothing (AUDIT.md, item 9; November 3,
// 2026). For this check only, the phone's storage refuses every save, like a phone whose storage
// is full; realSetItem puts the owner's sign-in there first, as if the phone signed in earlier.
{
  const BLOCKED = 'This browser wouldn’t save it. In a private window, nothing can be kept.';
  const { context, page, errors } = await newPhone();
  await page.addInitScript(() => {
    const realSetItem = Storage.prototype.setItem;
    window.realSetItem = (key, value) => realSetItem.call(localStorage, key, value);
    Storage.prototype.setItem = () => { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError'); };
  });
  await page.goto(APP);
  await page.evaluate((key) => window.realSetItem('living-in-the-word', JSON.stringify({ version: 1, session: key, email: 'owner@example.com', owner: true })), ownerKey3);
  await page.goto(APP);
  await page.waitForLoadState('networkidle');
  const note = '#plan-setup .gentle-error';
  const noteText = async () => ((await page.locator(note).count()) ? page.locator(note).innerText() : '(no message on the page)');

  await page.click('[data-action="reading"]');
  check('NOSAVE: the plan setup opens, with no message yet', (await active(page)) === 'plan-setup' && !(await visible(page, note)), await active(page));
  await page.click('#plan-setup button[type="submit"]');
  check('NOSAVE: "Start the plan" says the browser wouldn\'t save it', (await visible(page, note)) && (await noteText()) === BLOCKED, await noteText());
  check('NOSAVE: and stays on the plan setup', (await active(page)) === 'plan-setup', await active(page));
  const box = (await page.locator(note).count()) ? await page.locator(note).boundingBox() : null;
  check('NOSAVE: the whole message is on the screen (360 by 740, within a pixel)', Boolean(box) && box.y >= 0 && box.y + box.height <= 741, JSON.stringify(box));
  await page.screenshot({ path: SHOTS + 'nosave-start-the-plan.png' });

  // Opened again, the message is gone until the next tap
  await page.click('#plan-setup .back');
  await page.click('[data-action="reading"]');
  check('NOSAVE: opened again, the message is gone', (await active(page)) === 'plan-setup' && !(await visible(page, note)));

  // Save under a study says the same words (a few verses, so nothing is written ahead)
  await page.click('#plan-setup .back');
  await page.click('[data-action="study"]');
  await page.fill('#passage-text', 'Philippians 1:1-11');
  await page.click('#passage button[type="submit"]');
  await page.waitForFunction(() => document.querySelectorAll('.question-list textarea').length > 0
    && !document.getElementById('questions').classList.contains('writing'));
  await page.click('[data-action="save"]');
  check('NOSAVE: Save says the same words', (await text(page, '.share-status')) === BLOCKED, await text(page, '.share-status'));
  check('NOSAVE: no errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// ---- SW. The offline helper (sw.js), which the checks above turn off. A small stand-in website
// on port 8766 serves two made-up versions of the app, ignores the ?v= part of an address the way
// GitHub Pages does, and can be slowed down or cut off. The new script doesn't fit the old page
// (it looks for something only the new page has), like the real updates in pull requests 73,
// 87 and 89. Found in the audit, November 2, 2026 (AUDIT.md, item 1).
{
  const SW_APP = 'http://127.0.0.1:8766/living-in-the-word/';
  const appFolder = fileURLToPath(new URL('../', import.meta.url));
  const page = (v, id) => '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Test</title>' +
    '<link rel="stylesheet" href="style.css?v=' + v + '"><script src="app.js?v=' + v + '" defer></script></head>' +
    '<body><p id="' + id + '">' + id + ' page</p></body></html>';
  const script = (id) => "document.getElementById('" + id + "').textContent = '" + id + " page, " + id + " script';\n" +
    "navigator.serviceWorker.register('sw.js');\n";
  const versions = {
    old: { '': page(1, 'old'), 'app.js': script('old'), 'style.css': 'p { color: #1D1B18; }' },
    new: { '': page(2, 'new'), 'app.js': script('new'), 'style.css': 'p { color: #1D1B18; }' },
  };
  const REAL = ['sw.js', 'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png'];
  const TYPES = { js: 'text/javascript', css: 'text/css', png: 'image/png', webmanifest: 'application/manifest+json' };
  const site = { version: 'old', down: false, slow: {} };   // slow: { 'app.js': { ms, fail } }; '' is the page
  const sockets = new Set();
  const server = http.createServer(async (request, response) => {
    if (site.down) { request.socket.destroy(); return; }
    const name = new URL(request.url, SW_APP).pathname.replace('/living-in-the-word/', '');   // ?v= ignored
    const slow = site.slow[name];
    if (slow) {
      await new Promise((r) => setTimeout(r, slow.ms));
      if (slow.fail) { request.socket.destroy(); return; }
    }
    const body = REAL.includes(name) ? readFileSync(path.join(appFolder, name)) : versions[site.version][name];
    if (body === undefined) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': TYPES[name.split('.').pop()] || 'text/html', 'cache-control': 'no-cache' });
    response.end(body);
  });
  server.on('connection', (socket) => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
  await new Promise((resolve) => server.listen(8766, '127.0.0.1', resolve));

  const swPhone = async () => {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 } });   // the helper allowed
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, errors };
  };
  const helped = (page) => page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
  });
  const scriptRan = (page, timeout = 10000) => page.waitForFunction(() => /script$/.test((document.querySelector('p') || {}).textContent || ''), null, { timeout }).catch(() => {});
  const shown = (page) => page.evaluate(() => (document.querySelector('p') || {}).textContent || '(nothing)').catch(() => '(no page)');
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  // SW1. Without reception, the copy opens, and its script runs
  {
    Object.assign(site, { version: 'old', down: false, slow: {} });
    const { context, page, errors } = await swPhone();
    await page.goto(SW_APP);
    await helped(page);
    await page.reload();   // a visit with the helper on: the exact versions are kept
    await pause(300);
    site.down = true;
    for (const socket of sockets) socket.destroy();
    await page.reload().catch(() => {});
    await scriptRan(page);
    check('SW1: without reception, the copy opens and its script runs', (await shown(page)) === 'old page, old script', await shown(page));
    check('SW1: no errors', errors.length === 0, errors.join(' | '));
    site.down = false;
    await context.close();
  }

  // SW2. Right after an update, with a slow page (over the 4 seconds): the old page shows from
  // the copy, with its own old script, not the new one (no button would work). Then the next
  // open shows the new version.
  {
    Object.assign(site, { version: 'old', down: false, slow: {} });
    const { context, page, errors } = await swPhone();
    await page.goto(SW_APP);
    await helped(page);
    await page.reload();
    await pause(300);
    site.version = 'new';
    site.slow[''] = { ms: 6000 };
    await page.reload({ timeout: 20000 });
    await scriptRan(page);
    check('SW2: slow page after an update: the old page with its own old script', (await shown(page)) === 'old page, old script', await shown(page));
    check('SW2: no errors (the new script never runs in the old page)', errors.length === 0, errors.join(' | '));
    await pause(6500);   // the new page arrives in the background
    site.slow = {};
    await page.reload();
    await scriptRan(page);
    check('SW2: the next open shows the new version', (await shown(page)) === 'new page, new script', await shown(page));
    await context.close();
  }

  // SW3. The second open after a first visit, on a connection that hangs and then drops: the
  // copy (of any version) is used, instead of a page whose script never comes
  {
    Object.assign(site, { version: 'new', down: false, slow: {} });
    const { context, page } = await swPhone();
    await page.goto(SW_APP);
    await helped(page);
    for (const name of ['', 'app.js', 'style.css']) site.slow[name] = { ms: 6000, fail: true };
    await page.reload({ timeout: 30000 }).catch(() => {});
    await scriptRan(page, 15000);
    check('SW3: a connection that hangs, then drops: the copy\'s script still runs', (await shown(page)) === 'new page, new script', await shown(page));
    site.slow = {};
    await context.close();
  }
  server.close();
  for (const socket of sockets) socket.destroy();
}

// ---- VERSIONS. The offline helper uses the phone's copy of app.js?v=36 or style.css?v=25 without
// asking the internet (since November 2, 2026), so a changed file needs a new ?v= number in
// index.html, or installed phones would never get it. When app.js or style.css changes: raise its
// ?v= number in index.html, then put the new number and the fingerprint this check prints in KNOWN.
{
  const KNOWN = {
    'app.js?v=43': '3c5381d4596eda5c',
    'style.css?v=25': 'a79e0238a9c905fd',
  };
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const file of ['app.js', 'style.css']) {
    const link = (html.match(new RegExp(file.replace('.', '\\.') + '\\?v=\\d+')) || [''])[0];
    const print = createHash('sha256').update(readFileSync(new URL('../' + file, import.meta.url))).digest('hex').slice(0, 16);
    check('VERSIONS: ' + file + ' has a new ?v= number for each change', KNOWN[link] === print,
      link + ' is now ' + print + (KNOWN[link] ? ', not ' + KNOWN[link] + ': the file changed, so raise its ?v= in index.html' : ': a new number, so put it and this fingerprint in KNOWN'));
  }
}

await browser.close();
webServer.kill();
console.log('Screenshots: ' + SHOTS);
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
