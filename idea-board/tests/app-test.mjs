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

// Opens the app (on the list of boards) and waits until the list is shown
async function openApp(page) {
  await page.goto(APP);
  await page.waitForSelector('#list-screen:not([hidden])');
  await page.waitForFunction(() => !document.getElementById('no-boards').hidden || document.querySelectorAll('.row').length > 0);
}

// "New board," a name, "Done": the new board opens
async function makeBoard(page, name) {
  await page.click('#new-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.keyboard.type(name);
  await page.click('#board-done');
  await page.waitForSelector('#board-screen:not([hidden])');
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
  await openApp(page);
  check('A0 a new device starts with no boards', await page.isVisible('#no-boards'));
  await page.screenshot({ path: SHOTS + 'a0-phone-no-boards.png' });
  await makeBoard(page, 'Sermon ideas');

  // A1. An empty board says how to start, and is saved under its name
  check('A1 empty hint shows', await page.isVisible('#empty'));
  check('A1 saved status', (await page.textContent('#status')) === 'Saved on this device', await page.textContent('#status'));
  check('A1 the name shows at the top', (await page.textContent('#board-name')) === 'Sermon ideas');
  let boards = await savedBoards(page);
  check('A1 one board saved', boards.length === 1 && boards[0].name === 'Sermon ideas' && boards[0].items.length === 0, JSON.stringify(boards));
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
  check('A12 Back closes the note', page.url().startsWith(APP) && (await page.locator('.note').count()) === 4 && (await page.isVisible('#board-screen')));
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
  await page.waitForSelector('.row');
  check('A13 the app opens on the list, with the board and its notes counted',
    (await page.textContent('.row .row-name')) === 'Sermon ideas' && (await page.textContent('.row .row-count')) === '4 notes');
  await page.screenshot({ path: SHOTS + 'a13-phone-list.png' });
  await page.locator('.row').first().tap();
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
  await openApp(page);
  await makeBoard(page, 'Christmas planning');

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

// ===== C. Easy to see and read (the accessibility check, November 2, 2026) =====
// WCAG 2.2 (W3C): text contrast at least 4.5 to 1 (AA) and 7 to 1 (AAA, 1.4.3 and 1.4.6); the parts
// you need to see a control at least 3 to 1 (1.4.11); targets at least 24 by 24 (2.5.8).
// Android's guide: 48 by 48. Living in the Word's readability rule: no text under 13 pixels.
{
  // The WCAG contrast formula, run inside the page on the colors the browser really shows
  const contrast = (page, script) => page.evaluate(script);
  const formula = `
    const lum = (rgb) => {
      const [r, g, b] = rgb.match(/[\\d.]+/g).slice(0, 3).map(Number).map((v) => v / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  `;

  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await openApp(page);
  await makeBoard(page, 'Easy to see');
  await addNote(page, 'Easy to see and read');

  const numbers = await contrast(page, `(() => { ${formula}
    const css = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
    const paper = css('body', 'backgroundColor');
    return {
      words: ratio(css('.note', 'color'), css('.note', 'backgroundColor')),
      status: ratio(css('#status', 'color'), paper),
      edge: ratio(css('.note', 'borderTopColor'), paper),
      button: ratio(css('#add-note', 'color'), css('#add-note', 'backgroundColor')),
      undoLine: ratio(css('#undo', 'borderTopColor'), css('.removed', 'backgroundColor')),
    };
  })()`);
  check('C1 note words at least 7 to 1 (AAA)', numbers.words >= 7, JSON.stringify(numbers));
  check('C1 small grey words at least 4.5 to 1 (AA)', numbers.status >= 4.5, JSON.stringify(numbers));
  check('C1 note edges at least 3 to 1', numbers.edge >= 3, JSON.stringify(numbers));
  check('C1 button words at least 4.5 to 1', numbers.button >= 4.5, JSON.stringify(numbers));
  check('C1 the Undo button line at least 3 to 1', numbers.undoLine >= 3, JSON.stringify(numbers));

  // Buttons at least 48 by 48, on the board, on a note's screen, and with "Note removed. Undo"
  const tooSmall = async () => page.$$eval('button', (els) => els
    .filter((el) => el.getClientRects().length && getComputedStyle(el).display !== 'none')
    .map((el) => ({ id: el.id, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }))
    .filter((b) => b.w < 48 || b.h < 48));
  check('C2 board buttons at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.click('#remove-board');
  check('C2 name screen and "Remove board" buttons at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  const smallestOnNameScreen = await page.evaluate(() => Math.min(...[...document.querySelectorAll('#board-settings *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.getClientRects().length)
    .map((el) => parseFloat(getComputedStyle(el).fontSize))));
  check('C3 no words under 13 pixels on the name screen', smallestOnNameScreen >= 13, String(smallestOnNameScreen));
  await page.click('#confirm-no');
  await page.goBack();
  await page.waitForSelector('#board-settings', { state: 'hidden' });
  await page.click('#to-boards');
  await page.waitForSelector('#list-screen:not([hidden])');
  check('C2 list buttons at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  const listNumbers = await contrast(page, `(() => { ${formula}
    const css = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
    const paper = css('body', 'backgroundColor');
    return { name: ratio(css('.row-name', 'color'), paper), count: ratio(css('.row-count', 'color'), paper), small: ratio(css('#list-note', 'color'), paper) };
  })()`);
  check('C1 list words at least 4.5 to 1', listNumbers.name >= 7 && listNumbers.count >= 4.5 && listNumbers.small >= 4.5, JSON.stringify(listNumbers));
  await page.locator('.row').first().tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  const note = await page.locator('.note').first().boundingBox();
  await tap(page, { x: note.x + 20, y: note.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  check('C2 note screen buttons at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  await page.click('#remove-note');
  check('C2 the Undo button at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  await page.click('#undo');

  // No words smaller than 13 pixels (at the board's normal zoom)
  const smallest = await page.evaluate(() => Math.min(...[...document.querySelectorAll('body *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.getClientRects().length)
    .map((el) => parseFloat(getComputedStyle(el).fontSize))));
  check('C3 no words under 13 pixels', smallest >= 13, String(smallest));
  check('C3 note words are 21 pixels', (await page.locator('.note').first().evaluate((el) => getComputedStyle(el).fontSize)) === '21px');
  await context.close();

  // A phone with its zoom at 200% (360 pixels shown as 180): the buttons go onto two rows,
  // and "Note removed. Undo" sits above them, all on the screen
  const narrow = await browser.newContext({ viewport: { width: 180, height: 370 }, deviceScaleFactor: 4, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const small = await narrow.newPage();
  await openApp(small);
  const offScreen = async () => small.$$eval('.bottom button, .removed, .top button, .row', (els) => els
    .filter((el) => el.getClientRects().length)
    .map((el) => ({ id: el.id || el.className, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.left < -0.5 || r.right > window.innerWidth + 0.5 || r.bottom > window.innerHeight + 0.5)
    .map(({ id }) => id));
  check('C4 at 200% zoom, "New board" is on the screen', (await offScreen()).length === 0, JSON.stringify(await offScreen()));
  await makeBoard(small, 'A long board name for a small screen');
  await addNote(small, 'Big words');
  check('C4 at 200% zoom, every button is on the screen', (await offScreen()).length === 0, JSON.stringify(await offScreen()));
  await small.screenshot({ path: SHOTS + 'c4-zoom-200-board.png' });
  await small.screenshot({ path: SHOTS + 'c4-zoom-200.png' });
  const bigNote = await small.locator('.note').first().boundingBox();
  await tap(small, { x: Math.max(bigNote.x, 0) + 20, y: Math.max(bigNote.y, 60) + 20 });
  await small.waitForSelector('#editor:not([hidden])');
  await small.click('#remove-note');
  check('C4 at 200% zoom, "Note removed. Undo" and the buttons are on the screen', (await offScreen()).length === 0, JSON.stringify(await offScreen()));
  const overlapping = await small.evaluate(() => {
    const bar = document.getElementById('removed').getBoundingClientRect();
    return [...document.querySelectorAll('.tools button')].filter((b) => b.getClientRects().length)
      .some((b) => { const r = b.getBoundingClientRect(); return r.top < bar.bottom && bar.top < r.bottom && r.left < bar.right && bar.left < r.right; });
  });
  check('C4 "Note removed. Undo" doesn\'t cover the buttons', !overlapping);
  await small.screenshot({ path: SHOTS + 'c4-zoom-200-undo.png' });
  await narrow.close();
}

// ===== D. Several boards (build step 3) =====
{
  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  const rowNames = () => page.$$eval('.row-name', (els) => els.map((el) => el.textContent));

  // D1. Two boards; the one changed last is at the top
  await makeBoard(page, 'Sermon series');
  await page.click('#to-boards');
  await page.waitForSelector('#list-screen:not([hidden])');
  await makeBoard(page, 'Chapter two');
  await addNote(page, 'The opening line');
  await page.click('#to-boards');
  await page.waitForSelector('#list-screen:not([hidden])');
  check('D1 newest first', JSON.stringify(await rowNames()) === JSON.stringify(['Chapter two', 'Sermon series']), JSON.stringify(await rowNames()));
  check('D1 notes counted', JSON.stringify(await page.$$eval('.row-count', (els) => els.map((el) => el.textContent))) === JSON.stringify(['1 note', 'No notes yet']));
  await page.screenshot({ path: SHOTS + 'd1-phone-two-boards.png' });

  // D2. Each board keeps its own notes
  await page.locator('.row').nth(1).tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  check('D2 the other board has no notes', (await page.locator('.note').count()) === 0 && (await page.textContent('#board-name')) === 'Sermon series');

  // D3. Rename: "Edit," a new name, "Done"
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  check('D3 the name screen shows the name and no "Remove" question yet', (await page.inputValue('#board-name-input')) === 'Sermon series' && !(await page.isVisible('#confirm-remove')));
  await page.fill('#board-name-input', 'Psalms of ascent');
  await page.screenshot({ path: SHOTS + 'd3-phone-rename.png' });
  await page.click('#board-done');
  await page.waitForSelector('#board-settings', { state: 'hidden' });
  check('D3 the new name shows at the top', (await page.textContent('#board-name')) === 'Psalms of ascent');
  await wait(600);
  check('D3 the new name is saved', (await savedBoards(page)).some((b) => b.name === 'Psalms of ascent'));

  // D4. The phone's Back button: from a name screen to the board, from a board to the list
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.goBack();
  await page.waitForSelector('#board-settings', { state: 'hidden' });
  check('D4 Back from the name screen goes to the board', await page.isVisible('#board-screen'));
  await page.goBack();
  await page.waitForSelector('#list-screen:not([hidden])');
  check('D4 Back from a board goes to the list', page.url().startsWith(APP));
  await page.click('#new-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.keyboard.type('Never made');
  await page.goBack();
  await page.waitForSelector('#board-settings', { state: 'hidden' });
  check('D4 Back from "New board" makes no board', (await page.locator('.row').count()) === 2 && (await page.isVisible('#list-screen')));

  // D5. An empty name becomes "Untitled board"; names show as words, never as code
  await makeBoard(page, '');
  check('D5 an empty name becomes "Untitled board"', (await page.textContent('#board-name')) === 'Untitled board');
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.fill('#board-name-input', '<i>not italic</i>');
  await page.click('#board-done');
  await page.waitForSelector('#board-settings', { state: 'hidden' });
  check('D5 a typed name stays words at the top', (await page.textContent('#board-name')) === '<i>not italic</i>' && !(await page.innerHTML('#board-name')).includes('<i>'));
  await page.click('#to-boards');
  await page.waitForSelector('#list-screen:not([hidden])');
  check('D5 and in the list', (await rowNames()).includes('<i>not italic</i>'));

  // D6. Remove a board: it asks first, then "Board removed. Undo"
  await page.locator('.row', { hasText: 'Chapter two' }).tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.click('#remove-board');
  check('D6 it asks first, with the name and the notes', (await page.textContent('#confirm-words')) === 'Remove “Chapter two” and its 1 note?', await page.textContent('#confirm-words'));
  await page.screenshot({ path: SHOTS + 'd6-phone-remove.png' });
  await page.click('#confirm-no');
  check('D6 "Keep it" keeps it', !(await page.isVisible('#confirm-remove')) && (await page.isVisible('#board-settings')));
  await page.click('#remove-board');
  await page.click('#confirm-yes');
  await page.waitForSelector('#list-screen:not([hidden])');
  await wait(300);
  check('D6 the board is gone from the list', !(await rowNames()).includes('Chapter two'), JSON.stringify(await rowNames()));
  check('D6 "Board removed. Undo" shows', (await page.isVisible('#removed')) && (await page.textContent('#removed-words')) === 'Board removed.');
  check('D6 it is gone from this device', !(await savedBoards(page)).some((b) => b.name === 'Chapter two'));
  await page.screenshot({ path: SHOTS + 'd6-phone-removed.png' });
  await page.click('#undo');
  await wait(300);
  check('D6 Undo brings it back, with its note', (await rowNames()).includes('Chapter two') && (await savedBoards(page)).some((b) => b.name === 'Chapter two' && b.items.length === 1));
  check('D6 the app is still open after removing', page.url().startsWith(APP) && (await page.isVisible('#list-screen')));

  // D7. A board saved by build step 2 (one board, "My board") shows in the list and opens
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('idea-board', 1);
    request.onsuccess = () => {
      const transaction = request.result.transaction('boards', 'readwrite');
      transaction.objectStore('boards').put({ id: 'from-step-2', name: 'My board', version: 1, made: '2026-11-02T03:00:00.000Z', changed: '2026-11-02T03:00:00.000Z',
        items: [{ id: 'n1', type: 'note', x: 40, y: 40, text: 'Saved before the list of boards', made: '2026-11-02T03:00:00.000Z', changed: '2026-11-02T03:00:00.000Z' }] });
      transaction.oncomplete = () => { request.result.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  }));
  await openApp(page);
  check('D7 the older board shows in the list', (await rowNames()).includes('My board'));
  await page.locator('.row', { hasText: 'My board' }).tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  check('D7 and opens with its note', (await page.locator('.note').count()) === 1 && (await page.textContent('.note')) === 'Saved before the list of boards');
  const noteBox = await page.locator('.note').boundingBox();
  const boardBox = await page.locator('#board').boundingBox();
  check('D7 the first time, the board shows its notes', noteBox.y >= boardBox.y && noteBox.y + noteBox.height <= boardBox.y + boardBox.height, JSON.stringify({ noteBox, boardBox }));

  check('D no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

await browser.close();
webServer.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
