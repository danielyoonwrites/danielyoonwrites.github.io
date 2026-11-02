// Saved checks for Photo Filters, in Chromium (the engine Chrome is built on):
// a phone 360 pixels wide with touch, a computer 1280 wide with a mouse, and 180 wide for a phone
// with its zoom at 200%. Safari isn't tested here (WebKit isn't installed in Claude's cloud
// sessions): Dan's MacBook test is the check for Safari.
// Build step 2 (November 2, 2026): choose a photo and see it right side up, with its size.
//
// Run from the repository folder: node photo-filters/tests/app-test.mjs
// It serves the repository on http://127.0.0.1:8767 (python3), so that port must be free.
// Needs Playwright with Chromium (installed in Claude's cloud sessions). Screenshots go to a
// temporary folder, printed at the end. Success ends with "... passed, 0 failed".
// The test photos are made up here (a sky, a sun, a hill and the word TOP), never anyone's photos.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
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

const PORT = 8767;
const APP = `http://127.0.0.1:${PORT}/photo-filters/`;
const SHOTS = path.join(os.tmpdir(), 'photo-filters-shots') + path.sep;
mkdirSync(SHOTS, { recursive: true });

// Serve the repository folder, like GitHub Pages does, and wait until it answers
const repository = fileURLToPath(new URL('../../', import.meta.url));
const webServer = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
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
  console.log(`The local web server did not start. Is port ${PORT} free? (fuser -k ${PORT}/tcp frees it)`);
  process.exit(1);
}

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

// Page errors, and console errors other than a missing file (the server has no favicon)
function watchErrors(page, errors) {
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text());
  });
}

// Every address the page asks for. A photo must never leave the device, so only this site's own
// files (and pictures made on the device, "blob:") are allowed.
function watchRequests(page, requests) {
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
}
const onlyOwnFiles = (requests) => requests.every((r) =>
  (r.url.startsWith(`http://127.0.0.1:${PORT}/`) || r.url.startsWith('blob:') || r.url.startsWith('data:')) && r.method === 'GET');

const PHONE = { viewport: { width: 360, height: 740 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const COMPUTER = { viewport: { width: 1280, height: 800 } };

async function openApp(page) {
  await page.goto(APP);
  await page.waitForSelector('#choose');
}

// Taps "Choose photo" and picks a file in the picker that opens
async function choose(page, file) {
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#choose')]);
  await chooser.setFiles(file);
}

// Waits for the photo to show, and gives back how long that took after choosing it
async function chooseAndWait(page, file) {
  const started = Date.now();
  await choose(page, file);
  await page.waitForSelector('#photo:not([hidden])');
  return Date.now() - started;
}

// ----- Made-up test photos -----

// The scene, drawn right side up in the page: a sky, a sun, a hill and the word TOP (top left).
// With turned = true, it's saved turned a quarter to the left, the way a phone's camera often
// saves a tall photo, with a rotation tag (6) saying "turn it a quarter to the right to show it".
async function testPhoto(page, width, height, turned = false) {
  const dataUrl = await page.evaluate(([w, h, turn]) => {
    const scene = document.createElement('canvas');
    scene.width = w;
    scene.height = h;
    const g = scene.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#9CC3E0');
    sky.addColorStop(1, '#F3E7C9');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#E8B04B';
    g.beginPath();
    g.arc(w * 0.72, h * 0.3, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#5E7F5A';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.72);
    g.quadraticCurveTo(w * 0.35, h * 0.5, w * 0.7, h * 0.74);
    g.quadraticCurveTo(w * 0.85, h * 0.82, w, h * 0.7);
    g.lineTo(w, h);
    g.fill();
    g.fillStyle = '#1D1B18';
    g.font = `bold ${Math.round(Math.min(w, h) * 0.12)}px sans-serif`;
    g.fillText('TOP', w * 0.06, Math.min(w, h) * 0.16);
    if (!turn) return scene.toDataURL('image/jpeg', 0.92);
    // Saved turned a quarter to the left: the scene's top becomes the saved picture's left side
    const saved = document.createElement('canvas');
    saved.width = h;
    saved.height = w;
    const s = saved.getContext('2d');
    s.translate(0, w);
    s.rotate(-Math.PI / 2);
    s.drawImage(scene, 0, 0);
    return saved.toDataURL('image/jpeg', 0.92);
  }, [width, height, turned]);
  const jpeg = Buffer.from(dataUrl.split(',')[1], 'base64');
  return turned ? withPhoneDetails(jpeg, 6) : jpeg;
}

// Adds the hidden details a phone's camera puts in a JPEG (its "Exif" part): which way to turn
// the picture (orientation 6: a quarter turn to the right), and where it was taken (GPS, made up
// here: 12 degrees 34 minutes 56 seconds north). The same as in idea-board/tests/app-test.mjs.
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

const asFile = (name, mimeType, buffer) => ({ name, mimeType, buffer });

// The color of one spot on the photo on the screen, from 0 to 1 across and down
async function colorAt(page, across, down) {
  return page.evaluate(([x, y]) => {
    const canvas = document.getElementById('preview');
    const [r, g, b] = canvas.getContext('2d').getImageData(
      Math.floor(x * (canvas.width - 1)), Math.floor(y * (canvas.height - 1)), 1, 1).data;
    return { r, g, b };
  }, [across, down]);
}
const isSky = (c) => c.b > c.r + 30 && c.b > c.g;          // light blue
const isHill = (c) => c.g > c.r + 15 && c.g > c.b + 15;    // green

// Contrast between two colors, the way WCAG measures it (1 to 21)
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}
const rgb = (text) => text.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

const browser = await chromium.launch();

// ===== A. The start screen, on a phone =====
{
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  check('A1 the page is called "Photo Filters"', (await page.title()) === 'Photo Filters' && (await page.textContent('h1')).trim() === 'Photo Filters');
  check('A2 the first words say the photo stays on this device', await page.isVisible('#intro')
    && (await page.textContent('#intro')).includes('It stays on this device'));
  const button = await page.locator('#choose').boundingBox();
  check('A3 "Choose photo" is at least 48 by 48', button && button.width >= 48 && button.height >= 48, JSON.stringify(button));
  check('A3 "Choose photo" is near the bottom, where a thumb reaches it', button && button.y > 740 / 2 && button.y + button.height <= 740, JSON.stringify(button));
  check('A3 the button says "Choose photo"', (await page.textContent('#choose')).trim() === 'Choose photo');
  const safety = await page.getAttribute('meta[http-equiv="Content-Security-Policy"]', 'content');
  check('A4 the safety rule lets the page use only its own files', safety.includes("default-src 'none'") && safety.includes("script-src 'self'") && !safety.includes('http'), safety);
  check('A4 search engines are asked not to list it', (await page.getAttribute('meta[name="robots"]', 'content')) === 'noindex');
  check('A4 nothing is shown yet: no photo, no message', await page.isHidden('#photo') && await page.isHidden('#message'));
  await page.screenshot({ path: SHOTS + 'phone-1-start.png' });
  check('A5 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== B. A tall photo saved turned, with a rotation tag and a made-up location, on a phone =====
{
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  watchErrors(page, errors);
  watchRequests(page, requests);
  await openApp(page);
  const tall = await testPhoto(page, 1000, 2000, true);   // saved 2000 wide and 1000 tall, tag 6
  await chooseAndWait(page, asFile('tall.jpg', 'image/jpeg', tall));
  check('B1 the size is the photo as you see it: 1,000 wide and 2,000 tall',
    (await page.textContent('#size')) === '1,000 × 2,000 pixels (2.0 MP)', await page.textContent('#size'));
  const canvasSize = await page.evaluate(() => [document.getElementById('preview').width, document.getElementById('preview').height]);
  check('B2 the copy on the screen is tall too (1000 by 2000: smaller than 1,080 wide, so not shrunk)',
    canvasSize[0] === 1000 && canvasSize[1] === 2000, JSON.stringify(canvasSize));
  const top = await colorAt(page, 0.5, 0.03);
  const bottom = await colorAt(page, 0.5, 0.97);
  check('B3 right side up: sky at the top', isSky(top), JSON.stringify(top));
  check('B3 right side up: the hill at the bottom', isHill(bottom), JSON.stringify(bottom));
  check('B4 the first words and the message are gone', await page.isHidden('#intro') && await page.isHidden('#message'));
  check('B5 the photo stayed on the device: only the page\'s own files were asked for',
    onlyOwnFiles(requests), JSON.stringify(requests.filter((r) => !r.url.startsWith(`http://127.0.0.1:${PORT}/`))));
  await page.screenshot({ path: SHOTS + 'phone-2-tall-photo.png' });
  check('B6 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== C. A 12 MP photo (4,000 by 3,000, the phone camera's usual size), on a phone =====
{
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  const wide = await testPhoto(page, 4000, 3000);
  const took = await chooseAndWait(page, asFile('wide.jpg', 'image/jpeg', wide));
  console.log(`  (a 12 MP photo showed ${took} ms after it was chosen, in Chromium here)`);
  check('C1 the size line', (await page.textContent('#size')) === '4,000 × 3,000 pixels (12.0 MP)', await page.textContent('#size'));
  const canvasSize = await page.evaluate(() => [document.getElementById('preview').width, document.getElementById('preview').height]);
  check('C2 the copy on the screen is 1,080 wide', canvasSize[0] === 1080 && canvasSize[1] === 810, JSON.stringify(canvasSize));
  check('C3 it shows within 8 seconds', took < 8000, `${took} ms`);
  const shown = await page.locator('#preview').boundingBox();
  const button = await page.locator('#choose').boundingBox();
  check('C4 the photo fits the screen, above the button', shown.x >= 0 && shown.x + shown.width <= 360 && shown.y + shown.height <= button.y,
    JSON.stringify({ shown, button }));
  check('C4 right side up: sky at the top, the hill at the bottom', isSky(await colorAt(page, 0.5, 0.03)) && isHill(await colorAt(page, 0.5, 0.97)));
  await page.screenshot({ path: SHOTS + 'phone-3-wide-12mp.png' });
  check('C5 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== D. Files that can't be opened, on a phone =====
{
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  const cannot = "This browser couldn't open that file. Please choose a JPEG photo.";
  await choose(page, asFile('notes.txt', 'text/plain', Buffer.from('Not a photo')));
  await page.waitForSelector('#message:not([hidden])');
  check('D1 a file that isn\'t a photo: a plain message', (await page.textContent('#message')) === cannot && await page.isHidden('#photo'));
  await choose(page, asFile('broken.jpg', 'image/jpeg', Buffer.from('Not a photo either')));
  await page.waitForFunction((words) => document.getElementById('message').textContent === words, cannot);
  check('D2 a broken JPEG: the same message', await page.isHidden('#photo'));
  await page.screenshot({ path: SHOTS + 'phone-4-cannot-open.png' });
  await chooseAndWait(page, asFile('tall.jpg', 'image/jpeg', await testPhoto(page, 1000, 2000, true)));
  check('D3 then a good photo shows, and the message goes', await page.isVisible('#photo') && await page.isHidden('#message'));
  check('D4 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== E. A computer, with a mouse =====
{
  const context = await browser.newContext(COMPUTER);
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await openApp(page);
  const button = await page.locator('#choose').boundingBox();
  check('E1 "Choose photo" is at least 48 high and no wider than 480', button.height >= 48 && button.width <= 480, JSON.stringify(button));
  await page.screenshot({ path: SHOTS + 'computer-1-start.png' });
  await chooseAndWait(page, asFile('tall.jpg', 'image/jpeg', await testPhoto(page, 1000, 2000, true)));
  const shown = await page.locator('#preview').boundingBox();
  const buttonNow = await page.locator('#choose').boundingBox();
  check('E2 the tall photo fits the window, above the button', shown.y >= 0 && shown.y + shown.height <= buttonNow.y, JSON.stringify({ shown, buttonNow }));
  check('E2 right side up', isSky(await colorAt(page, 0.5, 0.03)) && isHill(await colorAt(page, 0.5, 0.97)));
  await page.screenshot({ path: SHOTS + 'computer-2-tall-photo.png' });
  check('E3 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

// ===== F. Easy to see and read =====
{
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  await openApp(page);
  await chooseAndWait(page, asFile('tall.jpg', 'image/jpeg', await testPhoto(page, 1000, 2000, true)));
  await page.evaluate(() => {   // show a message too, to measure it
    const message = document.getElementById('message');
    message.textContent = 'A message';
    message.hidden = false;
  });
  const styles = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return { color: style.color, background: style.backgroundColor, size: parseFloat(style.fontSize) };
    };
    return { page: getComputedStyle(document.body).backgroundColor, h1: read('h1'), intro: read('#intro'),
      size: read('#size'), message: read('#message'), button: read('#choose') };
  });
  const pageColor = rgb(styles.page);
  for (const name of ['h1', 'intro', 'size', 'message']) {
    const ratio = contrast(rgb(styles[name].color), pageColor);
    check(`F1 ${name}: words at least 4.5 to 1 against the page`, ratio >= 4.5, ratio.toFixed(2));
  }
  const buttonRatio = contrast(rgb(styles.button.color), rgb(styles.button.background));
  check('F1 the button\'s words at least 4.5 to 1', buttonRatio >= 4.5, buttonRatio.toFixed(2));
  const buttonEdge = contrast(rgb(styles.button.background), pageColor);
  check('F1 the button stands out from the page, at least 3 to 1', buttonEdge >= 3, buttonEdge.toFixed(2));
  for (const name of ['h1', 'intro', 'size', 'message', 'button']) {
    check(`F2 ${name}: words at least 13 pixels`, styles[name].size >= 13, String(styles[name].size));
  }
  await context.close();

  // A phone with its zoom at 200% is like a screen 180 wide
  const zoomed = await browser.newContext({ ...PHONE, viewport: { width: 180, height: 370 } });
  const small = await zoomed.newPage();
  await openApp(small);
  const button = await small.locator('#choose').boundingBox();
  check('F3 at 200% zoom, "Choose photo" is all on the screen', button.x >= 0 && button.x + button.width <= 180 && button.y + button.height <= 370, JSON.stringify(button));
  check('F3 at 200% zoom, nothing runs off the side', (await small.evaluate(() => document.documentElement.scrollWidth)) <= 180);
  await small.screenshot({ path: SHOTS + 'phone-zoom-200.png' });
  await zoomed.close();
}

// ===== G. The test photo for Dan's MacBook check (tests/test-photos.html) =====
// tall-test-photo.jpg: made up, 3,000 by 4,000 as you see it, saved turned with rotation tag 6,
// with a made-up location (30 degrees north, 140 degrees west, in the North Pacific).
{
  const context = await browser.newContext(COMPUTER);
  const page = await context.newPage();
  const errors = [];
  watchErrors(page, errors);
  await page.goto(APP + 'tests/test-photos.html');
  const link = await page.evaluate(() => {
    const a = document.getElementById('download');
    return { href: a.getAttribute('href'), download: a.getAttribute('download'), words: a.textContent.trim() };
  });
  check('G1 the page has a "Download the test photo" link that downloads tall-test-photo.jpg',
    link.href === 'tall-test-photo.jpg' && link.download === 'tall-test-photo.jpg' && link.words === 'Download the test photo', JSON.stringify(link));
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#download')]);
  check('G1 clicking it downloads the file', download.suggestedFilename() === 'tall-test-photo.jpg', download.suggestedFilename());
  await page.screenshot({ path: SHOTS + 'computer-3-test-photo-page.png' });
  const photoFile = readFileSync(path.join(repository, 'photo-filters/tests/tall-test-photo.jpg'));
  check('G2 the test photo has the hidden details a camera adds (rotation and location)', photoFile.includes(Buffer.from('Exif\0\0', 'latin1')));
  await openApp(page);
  await chooseAndWait(page, asFile('tall-test-photo.jpg', 'image/jpeg', photoFile));
  check('G3 in the app it shows 3,000 wide and 4,000 tall', (await page.textContent('#size')) === '3,000 × 4,000 pixels (12.0 MP)', await page.textContent('#size'));
  check('G3 right side up', isSky(await colorAt(page, 0.5, 0.03)) && isHill(await colorAt(page, 0.5, 0.97)));
  await page.screenshot({ path: SHOTS + 'computer-4-test-photo-in-app.png' });
  check('G4 no page errors', errors.length === 0, errors.join('\n'));
  await context.close();
}

await browser.close();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
