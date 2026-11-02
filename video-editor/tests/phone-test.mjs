// Checks for the video editor's phone test (build step 2), in Chromium: a phone 360 pixels wide
// with touch, and a computer 1280 wide.
// Written November 2, 2026. Run from the repository folder: node video-editor/tests/phone-test.mjs
// It serves the repository on http://127.0.0.1:8767 (python3), so that port must be free, and makes
// made-up test videos with ffmpeg (color bars and a tone; never the owner's videos).
// Needs Playwright with Chromium and ffmpeg (both installed in Claude's cloud sessions).
// Screenshots go to a temporary folder, printed at the end. Success ends with "... passed, 0 failed".
//
// The test browser isn't the phone: it has no video chip (so it's slower), it can't make AAC
// sound without the add-on, it can't read HEVC, and it can't share. The checks below allow for
// that; only the owner's phone can answer those questions (see PROGRESS.md).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

const PAGE = 'http://127.0.0.1:8767/video-editor/phone-test.html';
const SHOTS = path.join(os.tmpdir(), 'video-editor-shots') + path.sep;
const VIDEOS = path.join(os.tmpdir(), 'video-editor-test-videos') + path.sep;
mkdirSync(SHOTS, { recursive: true });
mkdirSync(VIDEOS, { recursive: true });
const repository = fileURLToPath(new URL('../../', import.meta.url));

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

// ---------- Made-up test videos ----------
if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.log('ffmpeg is needed to make the test videos.');
  process.exit(1);
}
function ffmpeg(args) {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
  if (run.status !== 0) throw new Error('ffmpeg failed: ' + run.stderr.toString());
}
function makeVideo(name, { size, seconds, tone = 440, codec = 'libx264', sound = true }) {
  const file = VIDEOS + name;
  if (existsSync(file)) return file;
  const args = ['-f', 'lavfi', '-i', `testsrc2=size=${size}:rate=30:duration=${seconds}`];
  if (sound) args.push('-f', 'lavfi', '-i', `sine=frequency=${tone}:sample_rate=48000:duration=${seconds}`, '-ac', '2', '-c:a', 'aac');
  args.push('-c:v', codec, '-pix_fmt', 'yuv420p', '-preset', codec === 'libx265' ? 'ultrafast' : 'veryfast');
  if (codec === 'libx265') args.push('-tag:v', 'hvc1');
  ffmpeg([...args, file]);
  return file;
}
// A phone-style video: stored sideways with a "turn it" note, and a location saved in it
const sideways = VIDEOS + 'tall-turned.mp4';
if (!existsSync(sideways)) {
  const wide = makeVideo('wide-for-turning.mp4', { size: '1920x1080', seconds: 8 });
  ffmpeg(['-display_rotation', '90', '-i', wide, '-c', 'copy', '-metadata', 'location=+34.0522-118.2437/', sideways]);
}
const tall = makeVideo('tall.mp4', { size: '1080x1920', seconds: 8, tone: 330 });
const short = makeVideo('short.mp4', { size: '720x1280', seconds: 3, tone: 550 });
const silent = makeVideo('silent.mp4', { size: '720x1280', seconds: 6, sound: false });
const bigger = makeVideo('bigger.mp4', { size: '2560x1440', seconds: 6, tone: 660 });
const hevc = makeVideo('hevc.mp4', { size: '1280x720', seconds: 4, codec: 'libx265', tone: 220 });

// What ffprobe says about a file
function probe(file) {
  const run = spawnSync('ffprobe', ['-v', 'error', '-show_entries',
    'stream=codec_type,codec_name,width,height,duration:stream_side_data=rotation', '-of', 'json', file]);
  return JSON.parse(run.stdout.toString());
}
// A small gray picture of a video's first frame, as it shows on screen (ffmpeg turns it upright)
function thumbnail(file, filter = '') {
  const run = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `${filter}scale=27:48,format=gray`,
    '-frames:v', '1', '-f', 'rawvideo', '-']);
  return run.stdout;
}
const difference = (a, b) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0) / a.length;
// The largest gap between red, green and blue in any pixel of the first frame (0 = black and white)
function colorfulness(file) {
  const run = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'scale=54:96,format=rgb24',
    '-frames:v', '1', '-f', 'rawvideo', '-']);
  let most = 0;
  for (let i = 0; i < run.stdout.length; i += 3) {
    const pixel = [run.stdout[i], run.stdout[i + 1], run.stdout[i + 2]];
    most = Math.max(most, Math.max(...pixel) - Math.min(...pixel));
  }
  return most;
}
// Whether a location is saved in an MP4's "moov" box (the same test as the page's)
function savedLocation(file) {
  const bytes = readFileSync(file);
  let position = 0;
  while (position + 8 <= bytes.length) {
    let size = bytes.readUInt32BE(position);
    const type = bytes.toString('latin1', position + 4, position + 8);
    if (size === 1) size = Number(bytes.readBigUInt64BE(position + 8));
    if (size === 0) size = bytes.length - position;
    if (type === 'moov') {
      const moov = bytes.subarray(position, position + size);
      return moov.includes(Buffer.from([0xa9, 0x78, 0x79, 0x7a])) || moov.includes('loci') || moov.includes('quicktime.location');
    }
    if (size < 8) return null;
    position += size;
  }
  return null;
}

// ---------- The library files are the ones checked in lib/README.md ----------
const readme = readFileSync(repository + 'video-editor/lib/README.md', 'utf8');
for (const name of ['mediabunny.min.js', 'mediabunny-aac-encoder.min.js']) {
  const hash = createHash('sha256').update(readFileSync(repository + 'video-editor/lib/' + name)).digest('hex');
  check(`K ${name} matches the hash in lib/README.md`, readme.includes(hash), hash);
}

// ---------- Serve the repository, like GitHub Pages does ----------
const webServer = spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
process.on('exit', () => webServer.kill());
const answers = () => new Promise((resolve) => {
  http.get(PAGE, (response) => { response.resume(); resolve(response.statusCode === 200); }).on('error', () => resolve(false));
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

// ---------- Helpers for the page ----------
const browser = await chromium.launch();

async function openPhone(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    acceptDownloads: true, ...options,
  });
  const page = await context.newPage();
  page.problems = [];
  page.on('console', (message) => { if (message.type() === 'error') page.problems.push(message.text()); });
  page.on('pageerror', (error) => page.problems.push(error.message));
  return { context, page };
}
async function waitForChecks(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('section:first-of-type .mark')]
    .every((mark) => mark.textContent !== '…'), null, { timeout: 30000 });
}
async function choose(page, file) {
  // Clear the last answer first, so the wait below can't see an old one
  await page.evaluate(() => { document.querySelector('#check-read .mark').textContent = '…'; });
  await page.setInputFiles('#pick', file);
  await page.waitForFunction(() => document.querySelector('#check-read .mark').textContent !== '…', null, { timeout: 30000 });
}
async function makeCopy(page) {
  await page.click('#make');
  await page.waitForSelector('#result:not([hidden]), #problem:not([hidden])', { timeout: 180000 });
  if (await page.isVisible('#result')) {
    await page.waitForFunction(() => document.querySelector('#check-hidden .mark').textContent !== '…', null, { timeout: 30000 });
  }
}
async function download(page, name) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('#save')]);
  const where = VIDEOS + name;
  await file.saveAs(where);
  return { where, suggested: file.suggestedFilename() };
}
const text = async (page, selector) => (await page.locator(selector).innerText()).replace(/\s+/g, ' ').trim();

// Contrast between two colors, the way WCAG 2.2 measures it
function contrast(a, b) {
  const light = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [light(a), light(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ---------- A. The phone: what Chrome can do ----------
{
  const { context, page } = await openPhone();
  await page.goto(PAGE);
  await waitForChecks(page);
  check('A1 the video library loads', await page.evaluate(() => typeof window.Mediabunny === 'object'));
  check('A2 video tools: yes', (await text(page, '#check-tools')).endsWith('yes'));
  check('A3 H.264: yes', (await text(page, '#check-video')).endsWith('yes'));
  const sound = await text(page, '#check-sound');
  check('A4 AAC sound: yes, built in or with the add-on', /yes, (built in|with the add-on)/.test(sound), sound);
  check('A5 filters: yes', (await text(page, '#check-filter')).endsWith('yes'));
  check('A6 the share line is filled in', /: (yes|no)$/.test(await text(page, '#check-share')));
  check('A7 keep the screen on: yes', (await text(page, '#check-awake')).endsWith('yes'));
  check('A8 "This phone" is filled in', (await text(page, '#browser')).startsWith('This phone: '));
  check('A9 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  const button = await page.locator('#choose').boundingBox();
  check('A10 "Choose a video" is at least 48 by 48', button.width >= 48 && button.height >= 48, JSON.stringify(button));
  const smallest = await page.evaluate(() => Math.min(...[...document.querySelectorAll('body *')]
    .filter((node) => node.offsetParent && [...node.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()))
    .map((node) => parseFloat(getComputedStyle(node).fontSize))));
  check('A11 no words under 13 pixels', smallest >= 13, String(smallest));
  for (const [what, a, b] of [['words', '#1c1c1c', '#ffffff'], ['small words', '#4a4a4a', '#ffffff'],
    ['button words', '#ffffff', '#1f3a5f'], ['✓', '#1b6e20', '#ffffff'], ['✗', '#b3261e', '#ffffff'],
    ['problem words', '#5f1510', '#fdecea']]) {
    check(`A12 ${what} contrast at least 4.5 to 1`, contrast(a, b) >= 4.5, contrast(a, b).toFixed(2));
  }
  check('A13 the focus ring and button edges are at least 3 to 1 against the page', contrast('#b35c00', '#ffffff') >= 3 && contrast('#1f3a5f', '#ffffff') >= 3,
    contrast('#b35c00', '#ffffff').toFixed(2));
  await page.screenshot({ path: SHOTS + '1-what-chrome-can-do.png' });
  check('A no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- B. A sideways phone video with a location saved in it ----------
{
  const { context, page } = await openPhone();
  await page.goto(PAGE);
  await waitForChecks(page);
  await choose(page, sideways);
  const facts = await text(page, '#facts');
  check('B1 the video\'s facts', facts.startsWith('0:08 long · 1080 × 1920 · H.264 picture · AAC sound'), facts);
  check('B2 Chrome can read it', (await text(page, '#check-read')).includes('Chrome can read it'));
  // The page shows the button a moment after "Chrome can read it" (it looks for a saved location first),
  // so this waits for it, up to 10 seconds
  check('B3 the make button shows', await page.waitForSelector('#make', { state: 'visible', timeout: 10000 }).then(() => true, () => false));
  await page.locator('#info').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '2-your-video.png' });

  await page.click('#make');
  await page.waitForSelector('#working:not([hidden])');
  check('B4 the progress bar shows while it works', await page.isVisible('#bar'));
  check('B5 "Choose a video" waits while it works', await page.isDisabled('#choose'));
  await page.waitForFunction(() => document.querySelector('#bar').value >= 30, null, { timeout: 60000 }).catch(() => {});
  await page.locator('#working').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '3-making-the-copy.png' });
  await page.waitForSelector('#result:not([hidden])', { timeout: 180000 });
  await page.waitForFunction(() => document.querySelector('#check-hidden .mark').textContent !== '…', null, { timeout: 30000 });

  check('B6 no problem shown', !(await page.isVisible('#problem')), await text(page, '#problem').catch(() => ''));
  const time = await text(page, '#check-time');
  check('B7 it says how long it took', /Made 5 seconds of video in [\d.]+ seconds \([\d.]+ times (faster|slower) than playing it\)/.test(time), time);
  const plays = await text(page, '#check-plays');
  check('B8 it plays, tall, with AAC sound', plays.includes('It plays: 0:05 long, 1080 × 1920, with AAC sound') && plays.startsWith('✓'), plays);
  const hidden = await text(page, '#check-hidden');
  check('B9 the location stays behind', hidden.includes('Your video has a location saved in it; the copy doesn\'t'), hidden);
  check('B10 a rough guess for 3 minutes', /a 3-minute video would take about \d+ (seconds|minutes)/.test(await text(page, '#guess')));
  check('B11 the page moves to "The copy", at the top of the screen', await page.evaluate(() => document.activeElement.id === 'result-title' &&
    Math.abs(document.querySelector('#result').getBoundingClientRect().top) < 2));
  check('B12 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  const save = await page.locator('#save').boundingBox();
  check('B13 "Save to phone" is at least 48 tall', save.height >= 48, JSON.stringify(save));
  await page.screenshot({ path: SHOTS + '4-the-copy.png' });
  await page.screenshot({ path: SHOTS + '4-the-copy-whole-page.png', fullPage: true });

  const { where, suggested } = await download(page, 'copy-sideways.mp4');
  check('B14 the saved file is called video-editor-test.mp4', suggested === 'video-editor-test.mp4', suggested);
  const info = probe(where);
  const picture = info.streams.find((s) => s.codec_type === 'video');
  const audio = info.streams.find((s) => s.codec_type === 'audio');
  check('B15 the copy is H.264, 1080 by 1920', picture.codec_name === 'h264' && picture.width === 1080 && picture.height === 1920, JSON.stringify(picture));
  check('B16 the copy has no "turn it" note', !(picture.side_data_list || []).some((d) => d.rotation), JSON.stringify(picture.side_data_list));
  check('B17 the copy has AAC sound', audio && audio.codec_name === 'aac', JSON.stringify(audio));
  check('B18 the copy is 5 seconds long', Math.abs(parseFloat(picture.duration) - 5) < 0.1, picture.duration);
  const upright = difference(thumbnail(sideways), thumbnail(where));
  const wrongWay = difference(thumbnail(sideways, 'transpose=1,'), thumbnail(where));
  check('B19 the copy is upright, like the original on screen', upright < 15 && wrongWay > 40, `upright ${upright.toFixed(1)}, turned wrong ${wrongWay.toFixed(1)}`);
  check('B20 the copy is black and white', colorfulness(where) <= 6 && colorfulness(sideways) > 100, `${colorfulness(where)} vs ${colorfulness(sideways)}`);
  check('B21 the original has a location; the copy has none', savedLocation(sideways) === true && savedLocation(where) === false);
  check('B no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- C. A video shorter than 5 seconds, and one with no sound ----------
{
  const { context, page } = await openPhone();
  await page.goto(PAGE);
  await waitForChecks(page);
  await choose(page, short);
  await makeCopy(page);
  check('C1 a 3-second video makes a 3-second copy', (await text(page, '#check-time')).startsWith('✓ Made 3 seconds of video'), await text(page, '#check-time'));
  const shortInfo = probe((await download(page, 'copy-short.mp4')).where);
  check('C2 its file is 3 seconds long', Math.abs(parseFloat(shortInfo.streams.find((s) => s.codec_type === 'video').duration) - 3) < 0.1);
  const before = await text(page, '#check-hidden');
  check('C3 no location in either', before.includes('No location in the copy (none found in your video either)'), before);

  await choose(page, silent);
  check('C4 a silent video says "no sound"', (await text(page, '#facts')).includes('no sound'));
  await makeCopy(page);
  const plays = await text(page, '#check-plays');
  check('C5 its copy plays, with "no sound (your video had none)"', plays.startsWith('✓') && plays.includes('no sound (your video had none)'), plays);
  const silentInfo = probe((await download(page, 'copy-silent.mp4')).where);
  check('C6 its file has a picture and no sound', silentInfo.streams.length === 1 && silentInfo.streams[0].codec_type === 'video');
  check('C no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- D. A big video is made smaller (longest side 1920) ----------
{
  const { context, page } = await openPhone();
  await page.goto(PAGE);
  await waitForChecks(page);
  await choose(page, bigger);
  check('D1 the big video\'s facts', (await text(page, '#facts')).includes('2560 × 1440'));
  await makeCopy(page);
  const plays = await text(page, '#check-plays');
  check('D2 the copy is 1920 by 1080', plays.includes('1920 × 1080'), plays);
  const info = probe((await download(page, 'copy-bigger.mp4')).where).streams.find((s) => s.codec_type === 'video');
  check('D3 its file is 1920 by 1080', info.width === 1920 && info.height === 1080, JSON.stringify(info));
  check('D no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- E. A video Chrome may not read (HEVC), and "Stop" ----------
{
  const { context, page } = await openPhone();
  await page.goto(PAGE);
  await waitForChecks(page);
  await choose(page, hevc);
  const facts = await text(page, '#facts');
  check('E1 an HEVC video is named as HEVC', facts.includes('HEVC (H.265) picture'), facts);
  const read = await text(page, '#check-read');
  const readable = read.includes('Chrome can read it');
  check('E2 it either reads, or says plainly that it can\'t, and hides the make button',
    readable ? await page.isVisible('#make') : (read.includes('Chrome can\'t read this kind of picture: HEVC (H.265).') && !(await page.isVisible('#make'))), read);
  if (!readable) {
    await page.locator('#info').scrollIntoViewIfNeeded();
    await page.screenshot({ path: SHOTS + '5-a-video-chrome-cannot-read.png' });
  }

  await choose(page, tall);
  await page.click('#make');
  await page.waitForSelector('#working:not([hidden])');
  await page.click('#stop');
  await page.waitForSelector('#problem:not([hidden])', { timeout: 30000 });
  check('E3 "Stop" stops it', (await text(page, '#problem')) === 'Stopped. Nothing was made.', await text(page, '#problem'));
  check('E4 after stopping, you can make it again', await page.isVisible('#make') && !(await page.isDisabled('#choose')));
  check('E5 after stopping, no copy shows', !(await page.isVisible('#result')));
  await makeCopy(page);
  check('E6 making it again works', (await text(page, '#check-plays')).includes('It plays: 0:05 long, 1080 × 1920'));
  check('E no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- F. Share, on a phone that can share (the test browser can't, so it's stood in for) ----------
{
  const { context, page } = await openPhone();
  await context.addInitScript(() => {
    navigator.canShare = (data) => Boolean(data && data.files && data.files.length);
    navigator.share = async (data) => {
      window.sharedFiles = data.files.map((file) => ({ name: file.name, type: file.type, size: file.size }));
    };
  });
  await page.goto(PAGE);
  await waitForChecks(page);
  check('F1 the share line says yes on a phone that can share', (await text(page, '#check-share')).endsWith('yes'));
  await choose(page, short);
  await makeCopy(page);
  check('F2 the Share button shows', await page.isVisible('#share'));
  const save = await page.locator('#save').boundingBox();
  const share = await page.locator('#share').boundingBox();
  check('F3 Save and Share sit side by side, each at least 48 tall', Math.abs(save.y - share.y) < 2 && save.height >= 48 && share.height >= 48 && share.x > save.x,
    JSON.stringify({ save, share }));
  check('F4 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  await page.click('#share');
  await page.waitForFunction(() => window.sharedFiles, null, { timeout: 5000 });
  const shared = await page.evaluate(() => window.sharedFiles);
  check('F5 Share sends one MP4 file', shared.length === 1 && shared[0].name === 'video-editor-test.mp4' && shared[0].type === 'video/mp4' && shared[0].size > 0, JSON.stringify(shared));
  await page.locator('#copy').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '6-save-and-share.png' });
  check('F no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- G. A computer, 1280 wide ----------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (message) => { if (message.type() === 'error') problems.push(message.text()); });
  page.on('pageerror', (error) => problems.push(error.message));
  await page.goto(PAGE);
  await waitForChecks(page);
  const main = await page.locator('main').boundingBox();
  check('G1 the page sits in a readable column in the middle', main.width <= 600 && Math.abs(main.x - (1280 - main.width) / 2) < 2, JSON.stringify(main));
  check('G2 nothing wider than the window', await page.evaluate(() => document.documentElement.scrollWidth <= 1280));
  await page.keyboard.press('Tab');
  check('G3 the keyboard reaches "Choose a video"', await page.evaluate(() => document.activeElement.id === 'choose'));
  await page.screenshot({ path: SHOTS + '7-computer.png' });
  check('G no page errors', problems.length === 0, problems.join('\n'));
  await context.close();
}

await browser.close();
webServer.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
