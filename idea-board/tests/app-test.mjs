// Checks for Idea board (build steps 2 and 3: boards of notes, saved on this device, that settle
// onto the board's dots), in Chromium:
// a phone 360 pixels wide with touch, a computer 1280 wide with a mouse, and 180 wide for a phone
// with its zoom at 200%.
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

// A note's corner settles on a spot every 64 board pixels (every second dot), at every zoom
// (SETTLE_GAP in app.js)
const onSpot = (value) => value % 64 === 0;   // (-0 counts as 0)
// How far apart the dots are on the screen at a zoom (the same rule as drawDots() in app.js)
function dotGapOnScreen(zoom) {
  let gap = 32 * zoom;
  while (gap < 16) gap *= 2;
  while (gap > 64) gap /= 2;
  return gap;
}

// How solid the dots' canvas is at a place on the board (page pixels from the board's top-left
// corner): 0 where no dot is drawn. Read straight from the canvas, even under a note.
async function dotAt(page, x, y) {
  return page.evaluate(([atX, atY]) => {
    const canvas = document.getElementById('dots');
    const sharp = canvas.width / canvas.clientWidth;
    return canvas.getContext('2d').getImageData(Math.floor(atX * sharp), Math.floor(atY * sharp), 1, 1).data[3];
  }, [x, y]);
}

// Whether the dots sit exactly on the spots, measured at a note's top-left corner: a dot right there,
// none half a gap away, and the next dot a whole gap away
async function cornerToDot(page, note, zoom) {
  const noteBox = await note.boundingBox();
  const boardBox = await page.locator('#board').boundingBox();
  const x = noteBox.x - boardBox.x;
  const y = noteBox.y - boardBox.y;
  const gap = dotGapOnScreen(zoom);
  return { at: await dotAt(page, x, y), halfway: await dotAt(page, x + gap / 2, y), next: await dotAt(page, x + gap, y), gap };
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

// ----- For the photo checks -----

// A made-up test photo, drawn in the page: a sky, a sun, a hill and the word TOP. With an
// orientation, it also gets the hidden details a phone's camera adds (see withPhoneDetails).
async function testPhoto(page, width, height, orientation = 0) {
  const dataUrl = await page.evaluate(([w, h]) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#9CC3E0');
    sky.addColorStop(1, '#F3E7C9');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#E8B04B';
    g.beginPath();
    g.arc(w * 0.75, h * 0.3, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#5E7F5A';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.7);
    g.quadraticCurveTo(w * 0.35, h * 0.45, w * 0.7, h * 0.72);
    g.quadraticCurveTo(w * 0.85, h * 0.8, w, h * 0.68);
    g.lineTo(w, h);
    g.fill();
    g.fillStyle = '#1D1B18';
    g.font = `${Math.round(h * 0.08)}px sans-serif`;
    g.fillText('TOP', w * 0.05, h * 0.12);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [width, height]);
  const jpeg = Buffer.from(dataUrl.split(',')[1], 'base64');
  return orientation ? withPhoneDetails(jpeg, orientation) : jpeg;
}

// Adds the hidden details a phone's camera puts in a JPEG (its "Exif" part): which way to turn
// the picture (orientation 6: a quarter turn to the right), and where it was taken (GPS, made up
// here: 12 degrees 34 minutes 56 seconds north). The saved copy must leave all of it out.
function withPhoneDetails(jpeg, orientation) {
  const tiff = Buffer.alloc(92);
  tiff.write('II', 0, 'latin1');   // numbers stored smallest byte first
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);         // the first list starts at 8
  tiff.writeUInt16LE(2, 8);         // first list: 2 details
  tiff.writeUInt16LE(0x0112, 10); tiff.writeUInt16LE(3, 12); tiff.writeUInt32LE(1, 14); tiff.writeUInt16LE(orientation, 18);
  tiff.writeUInt16LE(0x8825, 22); tiff.writeUInt16LE(4, 24); tiff.writeUInt32LE(1, 26); tiff.writeUInt32LE(38, 30);
  tiff.writeUInt32LE(0, 34);        // no more lists
  tiff.writeUInt16LE(2, 38);        // the location list: 2 details
  tiff.writeUInt16LE(0x0001, 40); tiff.writeUInt16LE(2, 42); tiff.writeUInt32LE(2, 44); tiff.write('N\0', 48, 'latin1');
  tiff.writeUInt16LE(0x0002, 52); tiff.writeUInt16LE(5, 54); tiff.writeUInt32LE(3, 56); tiff.writeUInt32LE(68, 60);
  tiff.writeUInt32LE(0, 64);
  [12, 1, 34, 1, 56, 1].forEach((number, i) => tiff.writeUInt32LE(number, 68 + i * 4));
  const name = Buffer.from('Exif\0\0', 'latin1');
  const marker = Buffer.alloc(4);
  marker.writeUInt16BE(0xFFE1, 0);
  marker.writeUInt16BE(2 + name.length + tiff.length, 2);
  const after = jpeg.readUInt16BE(2) === 0xFFE0 ? 4 + jpeg.readUInt16BE(4) : 2;   // after the JFIF part, if any
  return Buffer.concat([jpeg.subarray(0, after), marker, name, tiff, jpeg.subarray(after)]);
}

// The photo files saved on this device, read straight from the browser
async function savedPhotoFiles(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('idea-board-photos', 1);
    request.onsuccess = () => {
      const get = request.result.transaction('photos', 'readonly').objectStore('photos').getAll();
      get.onsuccess = async () => {
        const files = [];
        for (const file of get.result) {
          const bytes = new Uint8Array(await file.blob.arrayBuffer());
          const text = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
          files.push({ id: file.id, width: file.width, height: file.height, made: file.made, type: file.blob.type,
            size: file.blob.size, jpeg: bytes[0] === 0xFF && bytes[1] === 0xD8, details: text.includes('Exif') });
        }
        request.result.close();
        resolve(files);
      };
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }));
}

// "Add," then "Photo," then a photo from the file chooser; waits until it's on the board
async function addPhoto(page, file) {
  const before = await page.locator('.photo').count();
  await page.click('#add-note');
  await page.waitForSelector('#editor:not([hidden])');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#add-photo')]);
  await chooser.setFiles({ name: 'test-photo.jpg', mimeType: 'image/jpeg', buffer: file });
  await page.waitForFunction((count) => document.querySelectorAll('.photo').length > count, before);
  await wait(700);   // saved, and the board glides to show it
}

// Waits until the board's first photo shows its picture
async function photoShows(page) {
  await page.waitForFunction(() => {
    const picture = document.querySelector('.photo img');
    return picture && picture.complete && picture.naturalWidth > 0;
  });
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

  // A6. Dragging a note with a finger moves it; when the finger lifts, it settles onto the nearest
  // spot (no more than half the space between spots from where the finger left it), and that's saved
  const lastNote = page.locator('.note').last();
  const before = await lastNote.boundingBox();
  await fingerDrag(page, { x: before.x + 60, y: before.y + 60 }, { x: before.x + 60 - 100, y: before.y + 60 + 150 });
  await wait(600);
  const after = await lastNote.boundingBox();
  const zoomA6 = await zoomNow(page);
  const halfA6 = 32 * zoomA6 + 1;
  check('A6 the note moved with the finger', Math.abs(after.x - (before.x - 100)) <= halfA6 && Math.abs(after.y - (before.y + 150)) <= halfA6, JSON.stringify({ before, after, zoomA6 }));
  check('A6 dragging did not open the note', !(await page.isVisible('#editor')));
  boards = await savedBoards(page);
  const movedItem = boards[0].items.find((item) => item.text === '<b>not bold</b>');
  check('A6 the new place is saved, on a spot', movedItem && movedItem.y > 0 && onSpot(movedItem.x) && onSpot(movedItem.y), JSON.stringify(movedItem));

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
  await wait(250);   // it glides onto the nearest spot
  const moved = await note.boundingBox();
  const zoomB2 = await zoomNow(page);
  const halfB2 = 32 * zoomB2 + 1;
  check('B2 the mouse drags a note', Math.abs(moved.x - (box.x + 100)) <= halfB2 && Math.abs(moved.y - (box.y + 50)) <= halfB2, JSON.stringify({ box, moved, zoomB2 }));
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

  // Photos (build step 4): a new note's screen with "Photo," the size corner, and a photo's own screen
  await page.click('#add-note');
  await page.waitForSelector('#editor:not([hidden])');
  check('C2 a new note\'s screen buttons ("Photo" too) at least 48 by 48', (await page.isVisible('#add-photo')) && (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  await page.click('#done');
  await page.waitForSelector('#editor', { state: 'hidden' });
  await addPhoto(page, await testPhoto(page, 1200, 900));
  const cornerInk = await contrast(page, `(() => { ${formula}
    return ratio(getComputedStyle(document.querySelector('.photo .corner'), '::after').borderRightColor, getComputedStyle(document.body).backgroundColor);
  })()`);
  check('C1 the size corner at least 3 to 1 against the paper', cornerInk >= 3, String(cornerInk));
  const photoEdge = await contrast(page, `(() => { ${formula}
    return ratio(getComputedStyle(document.querySelector('.photo')).borderTopColor, getComputedStyle(document.body).backgroundColor);
  })()`);
  check('C1 a photo\'s edge at least 3 to 1 against the paper', photoEdge >= 3, String(photoEdge));
  const photoBox = await page.locator('.photo').boundingBox();
  await tap(page, { x: photoBox.x + photoBox.width / 2, y: photoBox.y + photoBox.height / 2 });
  await page.waitForSelector('#photo-view:not([hidden])');
  check('C2 a photo\'s own screen buttons at least 48 by 48', (await tooSmall()).length === 0, JSON.stringify(await tooSmall()));
  await page.goBack();
  await page.waitForSelector('#photo-view', { state: 'hidden' });
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

  // At 200% zoom, a new note's screen ("Remove," "Photo," "Done") and a photo's own screen fit too
  const offBar = async () => small.$$eval('.editor:not([hidden]) .bar button', (els) => els
    .filter((el) => el.getClientRects().length)
    .map((el) => ({ id: el.id, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.left < -0.5 || r.top < -0.5 || r.right > window.innerWidth + 0.5 || r.bottom > window.innerHeight + 0.5)
    .map(({ id }) => id));
  await small.click('#add-note');
  await small.waitForSelector('#editor:not([hidden])');
  check('C4 at 200% zoom, a new note\'s screen buttons are on the screen', (await small.isVisible('#add-photo')) && (await offBar()).length === 0, JSON.stringify(await offBar()));
  await small.screenshot({ path: SHOTS + 'c4-zoom-200-new-note.png' });
  const [chooser] = await Promise.all([small.waitForEvent('filechooser'), small.click('#add-photo')]);
  await chooser.setFiles({ name: 'test-photo.jpg', mimeType: 'image/jpeg', buffer: await testPhoto(small, 1200, 900) });
  await small.waitForSelector('.photo');
  await wait(700);
  const smallPhoto = await small.locator('.photo').boundingBox();
  await tap(small, { x: Math.max(smallPhoto.x, 0) + 20, y: Math.max(smallPhoto.y, 60) + 20 });
  await small.waitForSelector('#photo-view:not([hidden])');
  check('C4 at 200% zoom, a photo\'s own screen buttons are on the screen', (await offBar()).length === 0, JSON.stringify(await offBar()));
  await small.screenshot({ path: SHOTS + 'c4-zoom-200-photo.png' });
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

// ===== E. Lining up: a note settles onto the dots (Dan's idea, November 2, 2026) =====
// A note's top-left corner settles on a spot every 64 board pixels: every second dot at the normal
// zoom, every dot when zoomed out. The spots are the same at every zoom, so any two notes can line
// up exactly. New notes land on the spots too, and a note saved before stays put until it's moved.
{
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  await makeBoard(page, 'Lining up');

  // E1. New notes land on the dots; on a phone held upright the second goes straight below the first
  await addNote(page, 'First idea');
  await addNote(page, 'Second idea');
  await wait(600);
  let items = (await savedBoards(page))[0].items;
  check('E1 new notes land on the spots', items.length === 2 && items.every((item) => onSpot(item.x) && onSpot(item.y)), JSON.stringify(items));
  check('E1 the second is straight below the first', items[1].x === items[0].x && items[1].y === items[0].y + 256, JSON.stringify(items));

  // E2. Move the board a little (not a whole note's width), then add a note: it still goes in the
  // same rows and columns as the others (a whole number of 256-pixel steps from the first)
  await fingerDrag(page, { x: 330, y: 140 }, { x: 260, y: 200 });
  await wait(300);
  await addNote(page, 'Third idea');
  await wait(600);
  items = (await savedBoards(page))[0].items;
  const first = items.find((item) => item.text === 'First idea');
  const third = items.find((item) => item.text === 'Third idea');
  check('E2 a new note lines up with the notes already there', third && (third.x - first.x) % 256 === 0 && (third.y - first.y) % 256 === 0, JSON.stringify(items));

  // E3. Let go of a note: it glides onto the nearest spot, and its corner sits on a dot on the
  // screen. At the normal zoom the dots are 32 pixels apart, as before.
  const second = page.locator('.note', { hasText: 'Second idea' });
  const start = items.find((item) => item.text === 'Second idea');
  const box = await second.boundingBox();
  await fingerDrag(page, { x: box.x + 50, y: box.y + 50 }, { x: box.x + 50 + 40, y: box.y + 50 + 20 });
  await wait(600);
  items = (await savedBoards(page))[0].items;
  const settled = items.find((item) => item.text === 'Second idea');
  check('E3 moved 40 across and 20 down, it settles one spot across, at the same height', settled.x === start.x + 64 && settled.y === start.y, JSON.stringify({ start, settled }));
  const corner = await cornerToDot(page, second, await zoomNow(page));
  check('E3 its corner sits on a dot', corner.at > 150 && corner.halfway === 0, JSON.stringify(corner));
  check('E3 the dots look as before (32 pixels apart at the normal zoom)', corner.gap === 32 && corner.next > 150, JSON.stringify(corner));
  await page.screenshot({ path: SHOTS + 'e3-phone-lined-up.png' });

  // E4. A tap on a note near the top of the screen opens it with the cursor at the end of its words.
  // (The tap's own click arrives a moment later and lands on the typing box, where the words are.)
  await page.goBack();
  await page.waitForSelector('#list-screen:not([hidden])');
  await makeBoard(page, 'Near the top');
  await addNote(page, 'Near the top of the screen');
  const nearTop = page.locator('.note');
  const topBox = await nearTop.boundingBox();
  await fingerDrag(page, { x: 330, y: 600 }, { x: 330, y: 600 - (topBox.y - 70) });   // move the board up
  await wait(300);
  // After a fast move, Chrome takes the next tap as "stop sliding" and sends no click with it,
  // so tap an empty spot first, the way a finger would
  await tap(page, { x: 330, y: 600 });
  await wait(300);
  const movedUp = await nearTop.boundingBox();
  await tap(page, { x: movedUp.x + 20, y: movedUp.y + 20 });
  await page.waitForSelector('#editor:not([hidden])');
  await wait(100);
  await page.keyboard.type('!');
  await page.goBack();
  await page.waitForSelector('#editor', { state: 'hidden' });
  check('E4 the note was near the top of the screen', movedUp.y < 100, JSON.stringify(movedUp));
  check('E4 the typing goes at the end of the words', (await nearTop.textContent()) === 'Near the top of the screen!', await nearTop.textContent());

  // E5. With reduced motion turned on (a phone setting), it goes straight to its dot, without gliding
  const glideOf = () => page.locator('.note').first().evaluate((el) => {
    el.classList.add('settling');
    const duration = getComputedStyle(el).transitionDuration;
    el.classList.remove('settling');
    return duration;
  });
  const glideNormally = await glideOf();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const glideReduced = await glideOf();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check('E5 it glides for 0.15 seconds', glideNormally.split(', ').every((part) => part === '0.15s'), glideNormally);
  check('E5 with reduced motion it doesn\'t glide', glideReduced === '0s', glideReduced);

  // E6. A note saved before the dots lined things up stays where it was until it's moved
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('idea-board', 1);
    request.onsuccess = () => {
      const transaction = request.result.transaction('boards', 'readwrite');
      transaction.objectStore('boards').put({ id: 'off-the-dots', name: 'Saved before', version: 1, made: '2026-11-02T03:00:00.000Z', changed: '2026-11-02T03:00:00.000Z',
        items: [{ id: 'n1', type: 'note', x: 40, y: 50, text: 'Placed before the dots lined things up', made: '2026-11-02T03:00:00.000Z', changed: '2026-11-02T03:00:00.000Z' }] });
      transaction.oncomplete = () => { request.result.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  }));
  await openApp(page);
  await page.locator('.row', { hasText: 'Saved before' }).tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  await wait(600);
  let older = (await savedBoards(page)).find((record) => record.id === 'off-the-dots');
  check('E6 opening the board moves nothing', older.items[0].x === 40 && older.items[0].y === 50 && older.changed === '2026-11-02T03:00:00.000Z', JSON.stringify(older));
  const olderBox = await page.locator('.note').boundingBox();
  await fingerDrag(page, { x: olderBox.x + 40, y: olderBox.y + 40 }, { x: olderBox.x + 40 + 30, y: olderBox.y + 40 + 30 });
  await wait(600);
  older = (await savedBoards(page)).find((record) => record.id === 'off-the-dots');
  const zoomE6 = await zoomNow(page);
  check('E6 once moved, it settles onto a spot', onSpot(older.items[0].x) && onSpot(older.items[0].y), JSON.stringify({ item: older.items[0], zoomE6 }));

  check('E no page errors (phone)', errors.length === 0, errors.join('\n'));
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  await makeBoard(page, 'Lining up on a computer');
  await addNote(page, 'On the left');
  await addNote(page, 'On the right');
  await wait(600);
  let items = (await savedBoards(page))[0].items;

  // E7. On a wide screen the second new note goes to the right, level with the first
  check('E7 side by side and level', items.length === 2 && items[1].y === items[0].y && items[1].x === items[0].x + 256, JSON.stringify(items));

  // E8. Let go a little lower than its neighbor, and a note ends up level with it
  const right = page.locator('.note', { hasText: 'On the right' });
  async function mouseDrag(note, dx, dy) {
    const b = await note.boundingBox();
    await page.mouse.move(b.x + 40, b.y + 40);
    await page.mouse.down();
    await page.mouse.move(b.x + 40 + dx, b.y + 40 + dy, { steps: 8 });
    await page.mouse.up();
    await wait(600);
  }
  const level = items[0].y;
  await mouseDrag(right, 0, 120);
  items = (await savedBoards(page))[0].items;
  check('E8 dragged 120 pixels down, it settles two spots lower', items.find((item) => item.text === 'On the right').y === level + 128, JSON.stringify(items));
  await mouseDrag(right, 0, -118);
  items = (await savedBoards(page))[0].items;
  check('E8 let go 10 pixels lower than its neighbor, it ends up level with it', items.find((item) => item.text === 'On the right').y === level, JSON.stringify(items));
  await page.screenshot({ path: SHOTS + 'e8-computer-level.png' });

  // E9. Zoomed out (as on a phone showing several notes), the spots are exactly the dots that show,
  // 64 board pixels apart; a note settles onto one and still lines up with a note placed close in
  for (let i = 0; i < 4; i += 1) {
    await page.click('#zoom-out');
    await wait(300);
  }
  const zoomE9 = await zoomNow(page);
  const dotsE9 = dotGapOnScreen(zoomE9);
  check('E9 zoomed out, the dots that show are 64 board pixels apart', Math.abs(dotsE9 - 64 * zoomE9) < 0.01, JSON.stringify({ zoomE9, dotsE9 }));
  await mouseDrag(right, 23, 9);
  items = (await savedBoards(page))[0].items;
  const far = items.find((item) => item.text === 'On the right');
  check('E9 it settles onto a spot', onSpot(far.x) && onSpot(far.y), JSON.stringify(far));
  check('E9 let go a little low, it stays level with the note placed close in', far.y === level, JSON.stringify({ far, level }));
  const cornerFar = await cornerToDot(page, right, zoomE9);
  check('E9 its corner sits on a dot on the screen', cornerFar.at > 150 && cornerFar.halfway === 0 && cornerFar.next > 150, JSON.stringify(cornerFar));

  check('E no page errors (computer)', errors.length === 0, errors.join('\n'));
  await context.close();
}
{
  // E10. On a sharp computer screen (2 screen pixels to each page pixel), at a zoom like Dan's (0.58),
  // far from where the board starts, the dots are still drawn exactly on the spots. (Drawn as a
  // repeating background, they drifted a few pixels there: found on Dan's computer.)
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  await makeBoard(page, 'Far out');
  await addNote(page, 'Far from the start');
  await page.evaluate(() => {
    const item = board.items[0];
    item.x = 64 * 40;
    item.y = 64 * 30;
    render();
    view.zoom = 0.58;
    view.x = boardEl.clientWidth / 2 - item.x * view.zoom + 0.37;
    view.y = boardEl.clientHeight / 2 - item.y * view.zoom - 0.29;
    applyView();
  });
  const far = await cornerToDot(page, page.locator('.note'), 0.58);
  check('E10 far out on a sharp screen, a dot sits exactly at the corner', far.at > 150 && far.halfway === 0 && far.next > 150, JSON.stringify(far));
  await page.click('#show-all');
  await wait(400);
  const shown = await cornerToDot(page, page.locator('.note'), await zoomNow(page));
  check('E10 after "Show all" glides, the dots are on the spots again', shown.at > 150 && shown.halfway === 0, JSON.stringify(shown));
  check('E10 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== F. Photos (build step 4, November 2, 2026) =====
// Dan's choices: "Add," then "Photo" on the new note's screen ("A"); photos already on the phone,
// with "Take a photo" after build step 7 ("C"); a tap opens a photo on its own screen ("A"); a thin
// ink size corner, like a picture frame's ("A"). Shrunk to about 1600 pixels on the long side, as a
// JPEG without the hidden details. Saved in their own database, "idea-board-photos".
{
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  await makeBoard(page, 'Photos');
  const photosBoard = async () => (await savedBoards(page)).find((record) => record.name === 'Photos');

  // F1. "Add" opens a new note's screen with "Photo"; typing makes it a note, and "Photo" goes
  check('F1 the button says "Add"', (await page.textContent('#add-note')).trim() === 'Add');
  await page.click('#add-note');
  await page.waitForSelector('#editor:not([hidden])');
  check('F1 a new note\'s screen shows "Photo"', await page.isVisible('#add-photo'));
  await page.keyboard.type('A note first');
  check('F1 typing hides "Photo"', !(await page.isVisible('#add-photo')));
  await page.click('#done');
  await page.waitForSelector('#editor', { state: 'hidden' });
  await wait(350);
  const firstNote = await page.locator('.note').boundingBox();
  await tap(page, { x: firstNote.x + 30, y: firstNote.y + 30 });
  await page.waitForSelector('#editor:not([hidden])');
  check('F1 an existing note\'s screen has no "Photo"', !(await page.isVisible('#add-photo')));
  await page.click('#done');
  await page.waitForSelector('#editor', { state: 'hidden' });

  // F2. A photo from the phone: turned the right way up, shrunk to 1600 pixels on the long side,
  // saved as a JPEG without the hidden details (like where it was taken), in line with the note
  const chosen = await testPhoto(page, 2000, 1000, 6);   // a quarter turn: it shows 1000 wide, 2000 tall
  check('F2 the chosen test photo carries the hidden details', chosen.includes(Buffer.from('Exif')));
  await addPhoto(page, chosen);
  check('F2 the note\'s screen closed', !(await page.isVisible('#editor')));
  let items = (await photosBoard()).items;
  const note = items.find((item) => item.type === 'note');
  let photo = items.find((item) => item.type === 'photo');
  check('F2 the photo is saved on the board, as wide as a note', photo && photo.photoId && photo.width === 220 && photo.ratio === 2, JSON.stringify(items));
  check('F2 it lands on a spot, in line with the note', photo && onSpot(photo.x) && onSpot(photo.y)
    && (photo.x - note.x) % 256 === 0 && (photo.y - note.y) % 256 === 0, JSON.stringify(items));
  const files = await savedPhotoFiles(page);
  const file = files.find((each) => each.id === photo.photoId);
  check('F2 the photo file is a JPEG', file && file.jpeg && file.type === 'image/jpeg', JSON.stringify(files));
  check('F2 turned the right way up, and 1600 on the long side', file && file.width === 800 && file.height === 1600, JSON.stringify(file));
  check('F2 without the hidden details (no location)', file && !file.details, JSON.stringify(file));

  // F3. The picture shows on the board, at its own shape
  await photoShows(page);
  check('F3 the picture shows on the board', (await page.locator('.photo img').evaluate((img) => img.naturalWidth)) === 800);
  const onBoard = await page.locator('.photo').boundingBox();
  check('F3 it keeps its shape', Math.abs(onBoard.height / onBoard.width - 2) < 0.02, JSON.stringify(onBoard));
  check('F3 the empty-board words say what to add', (await page.textContent('#empty')).includes('a note or a photo'));

  // F4. The size corner: a finger-sized 48 by 48 on the screen, centered on the photo's corner
  await page.click('#show-all');
  await wait(400);
  const shown = await page.locator('.photo').boundingBox();
  const corner = await page.locator('.photo .corner').boundingBox();
  check('F4 the size corner is 48 by 48 on the screen', Math.abs(corner.width - 48) < 0.6 && Math.abs(corner.height - 48) < 0.6, JSON.stringify(corner));
  check('F4 it is centered on the photo\'s corner', Math.abs(corner.x + 24 - (shown.x + shown.width)) < 1
    && Math.abs(corner.y + 24 - (shown.y + shown.height)) < 1, JSON.stringify({ corner, shown }));

  // F5. Dragging the corner makes the photo bigger or smaller, keeping its shape; when the finger
  // lifts, the width settles in steps that line up with notes (64 at a time, less the gap)
  const zoomF5 = await zoomNow(page);
  await fingerDrag(page, { x: corner.x + 24, y: corner.y + 24 }, { x: corner.x + 24 + 70 * zoomF5, y: corner.y + 24 + 130 * zoomF5 });
  await wait(600);
  photo = (await photosBoard()).items.find((item) => item.type === 'photo');
  check('F5 dragged out, the photo grows one step, to 284', photo.width === 284, JSON.stringify(photo));
  const grown = await page.locator('.photo').evaluate((el) => [el.offsetWidth, el.offsetHeight]);
  check('F5 it keeps its shape', grown[0] === 284 && grown[1] === 568, JSON.stringify(grown));
  await page.click('#show-all');   // (the bigger photo's corner was under the bottom buttons)
  await wait(400);
  const zoomF5b = await zoomNow(page);
  const corner2 = await page.locator('.photo .corner').boundingBox();
  await fingerDrag(page, { x: corner2.x + 24, y: corner2.y + 24 }, { x: corner2.x + 24 - 60 * zoomF5b, y: corner2.y + 24 - 120 * zoomF5b });
  await wait(600);
  photo = (await photosBoard()).items.find((item) => item.type === 'photo');
  check('F5 dragged back in, it settles to a note\'s width, 220', photo.width === 220, JSON.stringify(photo));
  const widths = await page.evaluate(() => [100, 260, 476, 2000].map(settledWidth));
  check('F5 the sizes: never under 156, never over 988 (four notes), and 476 is two notes', JSON.stringify(widths) === '[156,284,476,988]', JSON.stringify(widths));

  // F6. A dragged photo settles onto a spot, like a note
  const box6 = await page.locator('.photo').boundingBox();
  await fingerDrag(page, { x: box6.x + box6.width / 2, y: box6.y + 30 }, { x: box6.x + box6.width / 2 + 25, y: box6.y + 40 });
  await wait(600);
  photo = (await photosBoard()).items.find((item) => item.type === 'photo');
  check('F6 a dragged photo settles onto a spot', onSpot(photo.x) && onSpot(photo.y), JSON.stringify(photo));

  // F7. Zoomed far out, the photo is small on the screen, and its size corner hides
  await pinch(page, 260, 60);
  await wait(300);
  const tiny = await page.locator('.photo').boundingBox();
  check('F7 zoomed far out, the size corner hides', tiny.width < 120 && !(await page.isVisible('.photo .corner')), String(tiny.width));
  await page.click('#show-all');
  await wait(400);
  check('F7 and it shows again close in', await page.isVisible('.photo .corner'));

  // F8. Close the page and open it again: the photo is still there, with its picture
  await wait(600);
  await page.reload();
  await page.waitForSelector('.row');
  check('F8 the list counts notes and photos', (await page.textContent('.row .row-count')) === '1 note and 1 photo', await page.textContent('.row .row-count'));
  await page.locator('.row').first().tap();
  await page.waitForSelector('#board-screen:not([hidden])');
  await photoShows(page);
  check('F8 the photo is still there, with its picture', (await page.locator('.photo').count()) === 1);

  // F9. A tap opens the photo on its own screen, big; "Done" and the phone's Back button close it
  const openIt = async () => {
    const box = await page.locator('.photo').boundingBox();
    await tap(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await page.waitForSelector('#photo-view:not([hidden])');
    await page.waitForFunction(() => document.getElementById('photo-big').naturalWidth > 0);
  };
  await openIt();
  const big = await page.locator('#photo-big').boundingBox();
  check('F9 the photo shows big on its own screen', big.height > 500, JSON.stringify(big));
  await page.screenshot({ path: SHOTS + 'f9-photo-on-its-own-screen.png' });
  await page.click('#photo-done');
  await page.waitForSelector('#photo-view', { state: 'hidden' });
  check('F9 "Done" goes back to the board', page.url().startsWith(APP) && (await page.isVisible('#board-screen')));
  await openIt();
  await page.goBack();
  await page.waitForSelector('#photo-view', { state: 'hidden' });
  check('F9 the phone\'s Back button goes back to the board', page.url().startsWith(APP) && (await page.isVisible('#board-screen')));

  // F10. "Remove," then "Photo removed. Undo" for 8 seconds; Undo brings it back
  await openIt();
  await page.click('#remove-photo');
  await page.waitForSelector('#photo-view', { state: 'hidden' });
  check('F10 "Remove" takes the photo off the board', (await page.locator('.photo').count()) === 0);
  check('F10 "Photo removed. Undo" shows', (await page.isVisible('#removed')) && (await page.textContent('#removed-words')) === 'Photo removed.');
  await page.click('#undo');
  await wait(600);
  photo = (await photosBoard()).items.find((item) => item.type === 'photo');
  check('F10 Undo brings it back, with its picture', (await page.locator('.photo').count()) === 1 && photo
    && (await savedPhotoFiles(page)).some((each) => each.id === photo.photoId));

  // F11. Removed for good once the Undo time is over: then its file goes too
  const removedId = photo.photoId;
  await openIt();
  await page.click('#remove-photo');
  await page.waitForSelector('#photo-view', { state: 'hidden' });
  await wait(8600);
  check('F11 after the Undo time, the photo file is gone', !(await savedPhotoFiles(page)).some((each) => each.id === removedId));
  check('F11 and the board no longer has the photo', !(await photosBoard()).items.some((item) => item.type === 'photo'));

  // F12. "Remove board" counts the photos; once its Undo time is over, its photo files go too
  await page.click('#to-boards');
  await page.waitForSelector('#list-screen:not([hidden])');
  await makeBoard(page, 'Trip');
  await addPhoto(page, await testPhoto(page, 1200, 900));
  const tripPhoto = (await savedBoards(page)).find((record) => record.name === 'Trip').items.find((item) => item.type === 'photo');
  check('F12 a wide photo keeps its shape too', tripPhoto && tripPhoto.ratio === 0.75 && tripPhoto.width === 220, JSON.stringify(tripPhoto));
  await page.click('#edit-board');
  await page.waitForSelector('#board-settings:not([hidden])');
  await page.click('#remove-board');
  check('F12 "Remove board" counts the photo', (await page.textContent('#confirm-words')) === 'Remove “Trip” and its 1 photo?', await page.textContent('#confirm-words'));
  await page.click('#confirm-yes');
  await page.waitForSelector('#list-screen:not([hidden])');
  await wait(8600);
  check('F12 after the Undo time, the board\'s photo files are gone', !(await savedPhotoFiles(page)).some((each) => each.id === tripPhoto.photoId));

  // F13. At the start, a photo file no board uses is tidied away once it's a day old; a newer one stays
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('idea-board-photos', 1);
    request.onsuccess = () => {
      const transaction = request.result.transaction('photos', 'readwrite');
      const store = transaction.objectStore('photos');
      const blob = new Blob(['not a real photo'], { type: 'image/jpeg' });
      store.put({ id: 'old-leftover', blob, width: 1, height: 1, made: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() });
      store.put({ id: 'new-leftover', blob, width: 1, height: 1, made: new Date().toISOString() });
      transaction.oncomplete = () => { request.result.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  }));
  await page.reload();
  await page.waitForSelector('#list-screen:not([hidden])');
  await wait(800);
  const leftovers = (await savedPhotoFiles(page)).map((each) => each.id);
  check('F13 a day-old leftover photo file is tidied away', !leftovers.includes('old-leftover'), JSON.stringify(leftovers));
  check('F13 a new one stays (another tab may be adding it)', leftovers.includes('new-leftover'), JSON.stringify(leftovers));

  check('F no page errors (phone)', errors.length === 0, errors.join('\n'));
  await context.close();
}
{
  // F14 to F16 on a computer, with a mouse
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  await makeBoard(page, 'Photos on a computer');

  // F14. The same "Add," then "Photo," opens the computer's file window
  await addPhoto(page, await testPhoto(page, 1600, 1200));
  await photoShows(page);
  check('F14 a photo added on a computer shows', (await page.locator('.photo').count()) === 1);

  // F15. The mouse drags the size corner
  const corner = await page.locator('.photo .corner').boundingBox();
  await page.mouse.move(corner.x + 24, corner.y + 24);
  await page.mouse.down();
  await page.mouse.move(corner.x + 24 + 100, corner.y + 24 + 75, { steps: 10 });
  await page.mouse.up();
  await wait(600);
  const photo = (await savedBoards(page))[0].items.find((item) => item.type === 'photo');
  check('F15 the mouse makes the photo bigger, in a step that lines up (348)', photo.width === 348, JSON.stringify(photo));
  await page.screenshot({ path: SHOTS + 'f15-computer-photo.png' });

  // F16. Tab to the photo, Enter opens it
  await page.focus('.photo');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#photo-view:not([hidden])');
  check('F16 Enter opens a photo', await page.isVisible('#photo-big'));
  await page.goBack();
  await page.waitForSelector('#photo-view', { state: 'hidden' });

  check('F no page errors (computer)', errors.length === 0, errors.join('\n'));
  await context.close();
}

await browser.close();
webServer.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
