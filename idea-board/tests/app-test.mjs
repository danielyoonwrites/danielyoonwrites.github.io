// Checks for Idea board (build step 2: one board of notes, saved on this device), in Chromium:
// a phone 360 pixels wide with touch, and a computer 1280 wide with a mouse.
// Written November 2, 2026. Run from the repository folder: node idea-board/tests/app-test.mjs
// It serves the repository on http://127.0.0.1:8766 (python3), so that port must be free.
// Needs Playwright with Chromium (installed in Claude's cloud sessions). Screenshots go to a
// temporary folder, printed at the end. Success ends with "... passed, 0 failed".
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright');   // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

const APP = 'http://127.0.0.1:8766/idea-board/';
const SHOTS = path.join(os.tmpdir(), 'idea-board-shots') + path.sep;
mkdirSync(SHOTS, { recursive: true });

// Serve the repository folder, like GitHub Pages does, and wait until it answers
const repository = fileURLToPath(new URL('../../', import.meta.url));
const webServer = spawn('python3', ['-m', 'http.server', '8766', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
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
  console.log('The local web server did not start. Is port 8766 free? (fuser -k 8766/tcp frees it)');
  process.exit(1);
}

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// What's saved in IndexedDB, read straight from the browser
async function savedBoards(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('idea-board', 1);
    request.onsuccess = () => {
      const get = request.result.transaction('boards', 'readonly').objectStore('boards').getAll();
      get.onsuccess = () => { request.result.close(); resolve(get.result); };
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }));
}

// The page's own errors, and anything the safety rule (Content-Security-Policy) blocked.
// Fonts that can't load in a test session aren't counted.
function watchErrors(page, errors) {
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/fonts\.(googleapis|gstatic)\.com/.test(text) || /Failed to load resource/.test(text)) return;
    errors.push(text);
  });
}

// Two fingers on the screen, through Chrome's own touch events (as on a real phone)
async function pinch(page, from, to) {
  const client = await page.context().newCDPSession(page);
  const center = { x: 180, y: 400 };
  const fingers = (gap) => [
    { x: center.x - gap / 2, y: center.y, id: 1 },
    { x: center.x + gap / 2, y: center.y, id: 2 },
  ];
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(from) });
  for (let i = 1; i <= 10; i += 1) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: fingers(from + (to - from) * i / 10) });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

// One finger dragging, through Chrome's own touch events
async function fingerDrag(page, start, end) {
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
  for (let i = 1; i <= 10; i += 1) {
    const x = start.x + (end.x - start.x) * i / 10;
    const y = start.y + (end.y - start.y) * i / 10;
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function tap(page, where) {
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...where, id: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function zoomNow(page) {
  return page.evaluate(() => {
    const match = document.getElementById('world').style.transform.match(/scale\(([\d.]+)\)/);
    return match ? Number(match[1]) : NaN;
  });
}

async function addNote(page, words) {
  await page.click('#add-note');
  await page.waitForSelector('#editor:not([hidden])');
  await page.keyboard.type(words);
  await page.click('#done');
  await page.waitForSelector('#editor', { state: 'hidden' });
  await wait(350);   // the board may glide to show the new note
}

const browser = await chromium.launch();


// ===== A. On a phone =====
{
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await page.goto(APP);
  await page.waitForFunction(() => document.getElementById('status').textContent.length > 0);

  // A1. An empty board says how to start, and is saved as "My board"
  check('A1 empty hint shows', await page.isVisible('#empty'));
  check('A1 saved status', (await page.textContent('#status')) === 'Saved on this device', await page.textContent('#status'));
  let boards = await savedBoards(page);
  check('A1 one board saved', boards.length === 1 && boards[0].name === 'My board' && boards[0].items.length === 0, JSON.stringify(boards));
  check('A1 the − and + buttons are hidden on a phone', !(await page.isVisible('#zoom-in')) && !(await page.isVisible('#zoom-out')));
  await page.screenshot({ path: SHOTS + 'a1-phone-empty.png' });

  // A2. "Add a note" opens the note on its own screen, with the keyboard
  await page.click('#add-note');
  check('A2 note screen opens', await page.isVisible('#editor'));
  check('A2 typing box has the focus', await page.evaluate(() => document.activeElement.id === 'note-text'));
  await page.keyboard.type('Sermon series idea: the Psalms of ascent, one a week');
  await page.screenshot({ path: SHOTS + 'a2-phone-typing.png' });
  await wait(600);
  boards = await savedBoards(page);
  check('A2 the words are saved while typing', boards[0].items.length === 1 && boards[0].items[0].text.startsWith('Sermon series'), JSON.stringify(boards[0].items));
  await page.click('#done');
  check('A2 Done goes back to the board', !(await page.isVisible('#editor')) && (await page.locator('.note').count()) === 1);
  check('A2 the hint is gone', !(await page.isVisible('#empty')));

  // A3. Two more notes; each new one is placed so it doesn't hide the last
  await addNote(page, 'Call about the retreat on Thursday');
  await addNote(page, 'Story: a short line that opens chapter two');
  check('A3 three notes', (await page.locator('.note').count()) === 3);
  const outlines = await page.$$eval('.note', (els) => els.map((el) => ({ left: el.offsetLeft, top: el.offsetTop, right: el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight })));
  const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  check('A3 no note covers another', !outlines.some((a, i) => outlines.some((b, j) => i < j && overlap(a, b))), JSON.stringify(outlines));
  const newest = await page.locator('.note').last().boundingBox();
  const boardArea = await page.locator('#board').boundingBox();
  check('A3 the newest note is on the screen', newest.y >= boardArea.y && newest.y + newest.height <= boardArea.y + boardArea.height, JSON.stringify({ newest, boardArea }));
  await page.screenshot({ path: SHOTS + 'a3-phone-three-notes.png' });

  // A4. An empty note isn't kept
  await page.click('#add-note');
  await page.click('#done');
  check('A4 an empty note is not added', (await page.locator('.note').count()) === 3);

  // A5. Words are shown as words, never as code
  await addNote(page, '<b>not bold</b>');
  const shown = await page.locator('.note').last().evaluate((el) => ({ text: el.textContent, html: el.innerHTML }));
  check('A5 typed code shows as plain words', shown.text === '<b>not bold</b>' && !shown.html.includes('<b>'), JSON.stringify(shown));

  // A6. Dragging a note with a finger moves it, and the move is saved
  const lastNote = page.locator('.note').last();
  const before = await lastNote.boundingBox();
  await fingerDrag(page, { x: before.x + 60, y: before.y + 60 }, { x: before.x + 60 - 100, y: before.y + 60 + 150 });
  await wait(600);
  const after = await lastNote.boundingBox();
  check('A6 the note moved with the finger', Math.abs(after.x - (before.x - 100)) < 3 && Math.abs(after.y - (before.y + 150)) < 3, JSON.stringify({ before, after }));
  check('A6 dragging did not open the note', !(await page.isVisible('#editor')));
  boards = await savedBoards(page);
  const movedItem = boards[0].items.find((item) => item.text === '<b>not bold</b>');
  check('A6 the new place is saved', movedItem && movedItem.y > 0, JSON.stringify(movedItem));

  // A7. A finger on an empty spot moves the board, not a note
  const worldBefore = await page.evaluate(() => document.getElementById('world').style.transform);
  const placesBefore = await page.$$eval('.note', (els) => els.map((el) => el.style.left + ',' + el.style.top).join(' '));
  await fingerDrag(page, { x: 330, y: 140 }, { x: 250, y: 140 });
  const worldAfter = await page.evaluate(() => document.getElementById('world').style.transform);
  const placesAfter = await page.$$eval('.note', (els) => els.map((el) => el.style.left + ',' + el.style.top).join(' '));
  check('A7 the board moved', worldBefore !== worldAfter, worldBefore + ' / ' + worldAfter);
  check('A7 the notes kept their places on the board', placesBefore === placesAfter, placesBefore + ' / ' + placesAfter);

  // A8. Two fingers pinch to zoom out, and spread to zoom in
  const zoomStart = await zoomNow(page);
  await pinch(page, 200, 100);
  const zoomedOut = await zoomNow(page);
  check('A8 pinching zooms out', zoomedOut < zoomStart * 0.7, zoomStart + ' to ' + zoomedOut);
  await pinch(page, 100, 160);
  const zoomedIn = await zoomNow(page);
  check('A8 spreading zooms back in', zoomedIn > zoomedOut * 1.3, zoomedOut + ' to ' + zoomedIn);

  // A9. "Show all" fits every note on the screen
  await page.click('#show-all');
  await wait(350);   // it glides for a quarter of a second
  const boxes = await page.$$eval('.note', (els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  const boardBox = await page.locator('#board').boundingBox();
  check('A9 every note is on the screen', boxes.every((b) => b.left >= boardBox.x - 1 && b.right <= boardBox.x + boardBox.width + 1 && b.top >= boardBox.y - 1 && b.bottom <= boardBox.y + boardBox.height + 1), JSON.stringify(boxes));
  await page.screenshot({ path: SHOTS + 'a9-phone-board.png' });

  // A10. Tapping a note opens it with its words; a change is saved
  const first = await page.locator('.note').first().boundingBox();
  await tap(page, { x: first.x + 20, y: first.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  check('A10 the note opens with its words', (await page.inputValue('#note-text')).startsWith('Sermon series'));
  await page.keyboard.type(' (start in January)');
  await page.click('#done');
  check('A10 the change shows on the board', (await page.locator('.note').first().textContent()).endsWith('(start in January)'));

  // A11. Remove, then Undo
  const second = await page.locator('.note').nth(1).boundingBox();
  await tap(page, { x: second.x + 20, y: second.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  await page.click('#remove-note');
  check('A11 the note is removed', (await page.locator('.note').count()) === 3);
  check('A11 "Note removed. Undo" shows', await page.isVisible('#removed'));
  await page.screenshot({ path: SHOTS + 'a11-phone-removed.png' });
  await page.click('#undo');
  check('A11 Undo brings it back', (await page.locator('.note').count()) === 4 && !(await page.isVisible('#removed')));

  // A12. The phone's Back button closes an open note and keeps the words, without leaving the app
  const third = await page.locator('.note').nth(2).boundingBox();
  await tap(page, { x: third.x + 20, y: third.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  await page.keyboard.type(' (draft)');
  await page.goBack();
  await page.waitForSelector('#editor', { state: 'hidden' });
  check('A12 Back closes the note', page.url().startsWith(APP) && (await page.locator('.note').count()) === 4);
  check('A12 the words typed before Back are kept', (await page.locator('.note').nth(2).textContent()).endsWith('(draft)'));
  // ...and Done doesn't take the page back a step too far
  await tap(page, { x: third.x + 20, y: third.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  await page.click('#done');
  await wait(300);
  check('A12 after Done, still in the app', page.url().startsWith(APP) && (await page.locator('.note').count()) === 4);

  // A13. Close the page and open it again: everything is still there, where it was
  await wait(600);
  const zoomBeforeReload = await zoomNow(page);
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('.note').length > 0);
  check('A13 the notes are still there', (await page.locator('.note').count()) === 4);
  check('A13 the zoom is kept', Math.abs((await zoomNow(page)) - zoomBeforeReload) < 0.001);
  check('A13 the words are kept', (await page.locator('.note').first().textContent()).endsWith('(start in January)'));

  check('A no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}


// ===== B. On a computer =====
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await page.goto(APP);
  await page.waitForFunction(() => document.getElementById('status').textContent.length > 0);

  check('B1 the − and + buttons show on a computer', (await page.isVisible('#zoom-in')) && (await page.isVisible('#zoom-out')));
  await addNote(page, 'Books to read this winter');
  await addNote(page, 'Ideas for the Christmas Eve service');
  await addNote(page, 'Photos for the newsletter go here later');

  // B2. A click opens a note; dragging with the mouse moves it
  // (the newest note, which sits on top of the others)
  const note = page.locator('.note').last();
  const box = await note.boundingBox();
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 140, box.y + 90, { steps: 8 });
  await page.mouse.up();
  const moved = await note.boundingBox();
  check('B2 the mouse drags a note', Math.abs(moved.x - (box.x + 100)) < 3 && Math.abs(moved.y - (box.y + 50)) < 3, JSON.stringify({ box, moved }));
  check('B2 dragging did not open it', !(await page.isVisible('#editor')));
  await note.click();
  check('B2 a click opens it', await page.isVisible('#editor'));
  await page.click('#done');

  // B3. The mouse wheel and the − and + buttons zoom
  const zoom1 = await zoomNow(page);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 300);
  await wait(100);
  const zoom2 = await zoomNow(page);
  check('B3 the wheel zooms out', zoom2 < zoom1, zoom1 + ' to ' + zoom2);
  await page.click('#zoom-in');
  check('B3 + zooms in', (await zoomNow(page)) > zoom2);
  await page.click('#zoom-out');
  check('B3 − zooms out', Math.abs((await zoomNow(page)) - zoom2) < 0.001);

  // B4. Dragging an empty spot moves the board
  const t1 = await page.evaluate(() => document.getElementById('world').style.transform);
  await page.mouse.move(1100, 150);
  await page.mouse.down();
  await page.mouse.move(1000, 250, { steps: 5 });
  await page.mouse.up();
  const t2 = await page.evaluate(() => document.getElementById('world').style.transform);
  check('B4 the board moves', t1 !== t2, t1 + ' / ' + t2);

  // B5. Tab reaches a note and Enter opens it
  await page.click('#show-all');
  await wait(350);
  await page.locator('.note').nth(1).focus();
  await page.keyboard.press('Enter');
  check('B5 Enter opens a note', await page.isVisible('#editor'));
  await page.keyboard.press('Escape');
  await page.click('#done');
  await page.screenshot({ path: SHOTS + 'b-computer-board.png' });

  check('B no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

await browser.close();
webServer.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
