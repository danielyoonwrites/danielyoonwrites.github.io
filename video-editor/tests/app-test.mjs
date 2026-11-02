// Checks for the video editor (build step 3: one clip with a look), in Chromium: a phone 360 pixels
// wide with touch, 180 wide (a phone with its zoom at 200%), and a computer 1280 wide.
// Written November 2, 2026. Run from the repository folder: node video-editor/tests/app-test.mjs
// It serves the repository on http://127.0.0.1:8768 (python3), so that port must be free, and makes
// made-up test videos with ffmpeg (tests/test-videos.mjs; never the owner's videos).
// Needs Playwright with Chromium and ffmpeg (both installed in Claude's cloud sessions).
// Screenshots go to a temporary folder, printed at the end. Success ends with "... passed, 0 failed".
//
// The test browser isn't the phone: it has no video chip (so it's slower), it makes AAC sound only
// with the add-on, and it can't share (sharing is stood in for below). The owner's phone checks the rest.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import {
  VIDEOS, haveFfmpeg, makeTestVideos, makeChart, makeClock, frameColor, soundFacts, PATCHES, patchColor, probe,
  thumbnail, likeness, average, colorfulness, mp4Boxes, contrast,
} from './test-videos.mjs';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  playwright = require('/opt/node-tools/node_modules/playwright');   // where Claude's cloud sessions keep it
}
const { chromium } = playwright;

const APP = 'http://127.0.0.1:8768/video-editor/';
const SHOTS = path.join(os.tmpdir(), 'video-editor-app-shots') + path.sep;
mkdirSync(SHOTS, { recursive: true });
const repository = fileURLToPath(new URL('../../', import.meta.url));

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

if (!haveFfmpeg()) {
  console.log('ffmpeg is needed to make the test videos.');
  process.exit(1);
}
const videos = makeTestVideos();
const chart = makeChart();
const clock = makeClock();

// ---------- Serve the repository, like GitHub Pages does ----------
const webServer = spawn('python3', ['-m', 'http.server', '8768', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
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
  console.log('The local web server did not start. Is port 8768 free? (fuser -k 8768/tcp frees it)');
  process.exit(1);
}

// ---------- Helpers ----------
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
const visible = (page, id) => page.isVisible('#' + id);
const text = async (page, selector) => (await page.locator(selector).innerText()).replace(/\s+/g, ' ').trim();
async function choose(page, file) {
  await page.setInputFiles('#pick', file);
  await page.waitForSelector('#look-screen:not([hidden]), #start-problem:not([hidden])', { timeout: 30000 });
}
async function makeVideo(page) {
  await page.click('#make');
  await page.waitForSelector('#done-screen:not([hidden]), #look-problem:not([hidden])', { timeout: 240000 });
}
async function download(page, name) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('#save')]);
  const where = VIDEOS + name;
  await file.saveAs(where);
  return { where, suggested: file.suggestedFilename() };
}
async function setSlider(page, id, value) {
  await page.fill('#' + id, String(value));
  await page.dispatchEvent('#' + id, 'input');
}
const previewFilter = (page) => page.evaluate(() => document.getElementById('preview').style.filter);
const chosenFilter = (page) => page.evaluate(() => document.querySelector('#chips .chip[aria-checked="true"]').dataset.filter);
const screenShown = (page) => page.evaluate(() => [...document.querySelectorAll('.screen')].filter((s) => !s.hidden).map((s) => s.id).join(','));

// ---------- A. The start screen, and the dark colors ----------
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  check('A1 the app opens on the start screen', (await screenShown(page)) === 'start-screen');
  check('A2 the title', (await text(page, '#start-title')) === 'Make a short video look its best');
  const button = await page.locator('#choose').boundingBox();
  check('A3 "Choose a video" is at least 48 by 48', button.width >= 48 && button.height >= 48, JSON.stringify(button));
  check('A4 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  check('A5 the page is dark', await page.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(18, 18, 18)');
  for (const [what, a, b, least] of [
    ['words', '#f2f2f2', '#121212', 4.5], ['small words', '#b8b8b8', '#121212', 4.5],
    ['words on the filter buttons', '#f2f2f2', '#1f1f1f', 4.5], ['small words on the filter buttons', '#b8b8b8', '#1f1f1f', 4.5],
    ['words on light buttons', '#121212', '#f2f2f2', 4.5], ['the Korean word on the chosen look', '#3d3d3d', '#f2f2f2', 4.5],
    ['✓', '#7bd88f', '#121212', 4.5], ['✗', '#ff9e8f', '#121212', 4.5],
    ['problem words', '#ffe1dc', '#3a1a17', 4.5], ['button edges', '#8a8a8a', '#121212', 3], ['the focus ring', '#ffd166', '#121212', 3],
  ]) {
    check(`A6 ${what}: contrast at least ${least} to 1`, contrast(a, b) >= least, contrast(a, b).toFixed(2));
  }
  await page.screenshot({ path: SHOTS + '1-start.png' });
  check('A no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- B. One video, a filter and the lighting, made and checked ----------
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  await choose(page, videos.sideways);
  check('B1 choosing a video opens "The look"', (await screenShown(page)) === 'look-screen');
  check('B2 the video plays, without sound at first', await page.evaluate(() => {
    const preview = document.getElementById('preview');
    return Boolean(preview.src) && preview.muted && !preview.paused;
  }));
  check('B3 "Trim" is open first', (await page.getAttribute('#tab-trim', 'aria-selected')) === 'true' && await visible(page, 'panel-trim'));
  await page.click('#tab-filter');
  check('B3b "Filter" opens, with "Original" chosen', await visible(page, 'panel-filter') && (await chosenFilter(page)) === 'none');
  const looks = await page.locator('#chips .chip').evaluateAll((all) => all.map((c) => [c.querySelector('.en').textContent, c.querySelector('.ko').textContent, c.querySelector('.ko').lang]));
  check('B4 eight looks, each with its Korean word', JSON.stringify(looks) === JSON.stringify([
    ['Original', '원본', 'ko'], ['Milky', '우유빛', 'ko'], ['Peach', '복숭아', 'ko'], ['Soft glow', '뽀샤시', 'ko'],
    ['Café', '카페', 'ko'], ['Clear', '맑음', 'ko'], ['Film', '필름', 'ko'], ['Black and white', '흑백', 'ko']]), JSON.stringify(looks));
  check('B4b every Korean look\'s SVG filter is on the page', await page.evaluate(() =>
    FILTERS.filter((f) => f.css.startsWith('url(')).every((f) => document.querySelector(f.css.slice(4, -1)) instanceof SVGFilterElement)));
  const chips = await page.locator('#chips .chip').evaluateAll((all) => all.map((c) => c.getBoundingClientRect()));
  check('B5 every filter button is at least 48 tall', chips.every((r) => r.height >= 48));
  const make = await page.locator('#make').boundingBox();
  check('B6 "Make the video" is on the screen without scrolling', make.y + make.height <= 740 && make.height >= 48, JSON.stringify(make));

  await page.click('.chip[data-filter="bw"]');
  check('B7 "Black and white" shows on the playing video', (await previewFilter(page)) === 'grayscale(1)' && (await chosenFilter(page)) === 'bw');
  await page.focus('.chip[data-filter="bw"]');
  await page.keyboard.press('ArrowLeft');
  check('B8 the arrow key moves to the look before', (await chosenFilter(page)) === 'film' && (await previewFilter(page)) === 'url("#look-film")');
  await page.keyboard.press('ArrowRight');
  check('B9 and back', (await chosenFilter(page)) === 'bw');
  await page.screenshot({ path: SHOTS + '2-look-filter.png' });

  await page.click('#tab-light');
  check('B10 "Lighting" shows the sliders', await visible(page, 'panel-light') && !(await visible(page, 'panel-filter')));
  await setSlider(page, 'brightness', 20);
  check('B11 brightness +20', (await text(page, '#brightness-value')) === '+20' && (await previewFilter(page)) === 'grayscale(1) brightness(1.2)');
  await setSlider(page, 'contrast', -10);
  check('B12 contrast −10', (await text(page, '#contrast-value')) === '−10' && (await previewFilter(page)) === 'grayscale(1) brightness(1.2) contrast(0.9)');
  await page.click('#reset-light');
  check('B13 "Reset the lighting"', (await text(page, '#brightness-value')) === '0' && (await text(page, '#contrast-value')) === '0' && (await previewFilter(page)) === 'grayscale(1)');
  await setSlider(page, 'brightness', 20);
  const slider = await page.locator('#brightness').boundingBox();
  check('B14 the sliders are at least 48 tall', slider.height >= 48, JSON.stringify(slider));
  check('B15 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  await page.screenshot({ path: SHOTS + '3-look-lighting.png' });

  await page.click('#make');
  await page.waitForSelector('#making-screen:not([hidden])');
  check('B16 "Making the video" shows, with a progress bar', await visible(page, 'bar'));
  await page.waitForFunction(() => document.getElementById('bar').value >= 25, null, { timeout: 120000 }).catch(() => {});
  await page.screenshot({ path: SHOTS + '4-making.png' });
  await page.waitForSelector('#done-screen:not([hidden]), #look-problem:not([hidden])', { timeout: 240000 });
  check('B17 "Your video" shows', (await screenShown(page)) === 'done-screen', await text(page, '#look-problem').catch(() => ''));
  const ready = await text(page, '#ready-line');
  check('B18 it meets all three platforms\' upload rules', ready === '✓ Meets the upload rules for Instagram, TikTok and YouTube Shorts', ready);
  check('B19 "What was checked" starts closed when all is well', !(await page.evaluate(() => document.getElementById('ready-details').open)));
  // (textContent, since the fold-out is closed and closed words have no innerText)
  const lines = await page.locator('#ready-list li').evaluateAll((all) => all.map((li) => ({ yes: li.className === 'yes', words: li.textContent })));
  check('B20 ten checks, all ✓', lines.length === 10 && lines.every((l) => l.yes), JSON.stringify(lines));
  check('B21 the checks name the shape, size, speed and length',
    ['Tall (9 by 16)', '1080 × 1920 pixels', '30 frames a second', '0:08 long'].every((w) => lines.some((l) => l.words.includes(w))), JSON.stringify(lines));
  const tech = await page.evaluate(() => document.getElementById('tech-line').textContent);
  check('B22 the line for Claude', /^For Claude: avc1\.64[0-9a-f]{4}, [\d.]+ Mbps, aac 48000 Hz 2 ch \d+ kbps, color .+, edit lists \d+, details first yes\.$/.test(tech), tech);
  const plays = await page.evaluate(() => new Promise((resolve) => {
    const result = document.getElementById('result');
    if (result.readyState >= 1) resolve(result.duration);
    else result.addEventListener('loadedmetadata', () => resolve(result.duration), { once: true });
  }));
  check('B23 the new video plays, 8 seconds long', Math.abs(plays - 8) < 0.2, String(plays));
  check('B24 nothing wider than the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  await page.screenshot({ path: SHOTS + '5-done.png' });
  await page.click('#ready-details summary');
  await page.locator('#ready-details').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '6-done-what-was-checked.png' });

  const { where, suggested } = await download(page, 'app-sideways.mp4');
  check('B25 the saved file is called video-(date)-(time).mp4', /^video-\d{4}-\d{2}-\d{2}-\d{4}\.mp4$/.test(suggested), suggested);
  const info = probe(where);
  check('B26 H.264 (High), 1080 by 1920, no "turn it" note', info.video.codec_name === 'h264' && info.video.profile === 'High' &&
    info.video.width === 1080 && info.video.height === 1920 && !(info.video.side_data_list || []).some((d) => d.rotation), JSON.stringify(info.video));
  check('B27 a steady 30 frames a second', info.video.r_frame_rate === '30/1' && info.video.avg_frame_rate === '30/1', `${info.video.r_frame_rate} ${info.video.avg_frame_rate}`);
  const videoMbps = Number(info.video.bit_rate) / 1e6;
  check('B28 the picture\'s data rate is about 8 Mbps (Instagram allows 25)', videoMbps > 5 && videoMbps < 11, videoMbps.toFixed(2));
  check('B29 AAC sound, 48 kHz, stereo, about 128 kbps', info.audio && info.audio.codec_name === 'aac' && info.audio.profile === 'LC' &&
    info.audio.sample_rate === '48000' && info.audio.channels === 2 && Math.abs(Number(info.audio.bit_rate) - 128000) < 15000, JSON.stringify(info.audio));
  check('B30 8 seconds long', Math.abs(parseFloat(info.video.duration) - 8) < 0.1, info.video.duration);
  const boxes = mp4Boxes(where);
  check('B31 the file\'s details come before the picture data', boxes.order.indexOf('moov') < boxes.order.indexOf('mdat'), boxes.order.join(','));
  check('B32 the original\'s location stays behind', mp4Boxes(videos.sideways).location === true && boxes.location === false);
  check('B33 the new video is black and white', colorfulness(where, 1) <= 6 && colorfulness(videos.sideways, 1) > 100, `${colorfulness(where, 1)}`);
  const original = thumbnail(videos.sideways, 1);
  const made = thumbnail(where, 1);
  const turnedWrong = thumbnail(videos.sideways, 1, 'transpose=1,');
  check('B34 the new video is upright, like the original on screen', likeness(original, made) > 0.9 && likeness(turnedWrong, made) < 0.6,
    `${likeness(original, made).toFixed(2)} vs ${likeness(turnedWrong, made).toFixed(2)}`);
  check('B35 brightness +20 makes it brighter than the original', average(made) > average(original) + 8, `${average(made).toFixed(1)} vs ${average(original).toFixed(1)}`);

  // The phone's Back button: "Your video" → "The look" (the look is kept) → start
  await page.goBack();
  await page.waitForSelector('#look-screen:not([hidden])');
  check('B36 Back goes from "Your video" to "The look", with the look kept', (await chosenFilter(page)) === 'bw' && (await text(page, '#brightness-value')) === '+20');
  check('B37 the preview plays again on "The look"', await page.evaluate(() => !document.getElementById('preview').paused));
  await page.goBack();
  await page.waitForSelector('#start-screen:not([hidden])');
  check('B38 Back again goes to the start', (await screenShown(page)) === 'start-screen');
  check('B39 the preview stops playing off its screen', await page.evaluate(() => document.getElementById('preview').paused));
  check('B no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- C. Stop, and the phone's Back button while making ----------
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  await choose(page, videos.tall);
  await page.click('#make');
  await page.waitForSelector('#making-screen:not([hidden])');
  await page.click('#stop');
  await page.waitForSelector('#look-screen:not([hidden])', { timeout: 30000 });
  check('C1 "Stop" goes back to "The look", saying so', (await text(page, '#look-problem')) === 'Stopped. Nothing was made.', await text(page, '#look-problem'));
  check('C2 the history is back on "The look"', await page.evaluate(() => history.state.screen === 'look'));
  await page.click('#make');
  await page.waitForSelector('#making-screen:not([hidden])');
  check('C3 making again hides the old note', !(await visible(page, 'look-problem')));
  await page.goBack();
  await page.waitForSelector('#look-screen:not([hidden])', { timeout: 30000 });
  await page.waitForSelector('#look-problem:not([hidden])', { timeout: 30000 });
  check('C4 the phone\'s Back button while making stops it too', (await text(page, '#look-problem')) === 'Stopped. Nothing was made.');
  await page.waitForTimeout(500);
  check('C5 it stays on "The look"', (await screenShown(page)) === 'look-screen');
  check('C no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- D. A silent video, a wide one, a video Chrome may not read, and "Start a new video" ----------
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  await choose(page, videos.silent);
  await makeVideo(page);
  check('D1 a silent video is made', (await screenShown(page)) === 'done-screen', await text(page, '#look-problem').catch(() => ''));
  const silentLines = await page.locator('#ready-list li').evaluateAll((all) => all.map((li) => li.className + ' ' + li.textContent));
  check('D2 it says "No sound (your video had none)" with ✓', silentLines.some((l) => l.startsWith('yes') && l.includes('No sound (your video had none)')), JSON.stringify(silentLines));
  check('D3 it still meets the rules', (await text(page, '#ready-line')).startsWith('✓ Meets'));
  check('D4 its file has no sound track', !probe((await download(page, 'app-silent.mp4')).where).audio);

  await page.click('#new-video');
  await page.waitForSelector('#start-screen:not([hidden])');
  check('D5 "Start a new video" goes to the start', await page.evaluate(() => history.state.screen === 'start'));

  await choose(page, videos.wide);
  await makeVideo(page);
  const wideReady = await text(page, '#ready-line');
  check('D6 a wide video: fine for Instagram and TikTok, not a YouTube Short', wideReady.startsWith('Fine for Instagram and TikTok, but it\'s wide'), wideReady);
  check('D7 "What was checked" opens by itself', await page.evaluate(() => document.getElementById('ready-details').open));
  const wideLines = await page.locator('#ready-list li.no').allInnerTexts();
  check('D8 only the shape is marked', wideLines.length === 1 && wideLines[0].includes('Wide: YouTube will count it as a regular video'), JSON.stringify(wideLines));
  await page.locator('#ready-line').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '7-done-wide.png' });

  await page.click('#new-video');
  await page.waitForSelector('#start-screen:not([hidden])');
  await page.setInputFiles('#pick', videos.hevc);
  await page.waitForSelector('#look-screen:not([hidden]), #start-problem:not([hidden])', { timeout: 30000 });
  if (await visible(page, 'start-problem')) {
    check('D9 an HEVC video Chrome can\'t read gets a plain message', (await text(page, '#start-problem')).startsWith('Chrome can\'t read this kind of picture: HEVC (H.265).'));
  } else {
    check('D9 an HEVC video Chrome can read opens "The look"', (await screenShown(page)) === 'look-screen');
  }
  check('D no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- E. The checks against the platforms' rules, one by one ----------
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  const good = {
    container: 'MP4', videoCodec: 'avc', audioCodec: 'aac', sampleRate: 48000, channels: 2, width: 1080, height: 1920,
    fps: 30, duration: 60, bytes: 60e6, videoBitrate: 8e6, detailsFirst: true, location: false, originalHadSound: true,
  };
  const failing = (facts) => page.evaluate((f) => checkReady(f).filter((line) => !line.ok).map((line) => line.words), facts);
  check('E1 a good video passes every check', (await failing(good)).length === 0);
  const cases = [
    ['E2 over 3 minutes', { duration: 200 }, 'over 3 minutes'],
    ['E3 under 3 seconds', { duration: 2 }, 'under 3 seconds'],
    ['E4 wider than 1920', { width: 2000, height: 1000 }, '2000 × 1000 pixels'],
    ['E5 120 frames a second', { fps: 120 }, '120 frames a second'],
    ['E6 over 300 MB', { bytes: 400e6 }, '400.0 MB'],
    ['E7 over 25 Mbps', { videoBitrate: 30e6 }, '30.0 Mbps'],
    ['E8 a location left in', { location: true }, 'location is still saved'],
    ['E9 details at the end of the file', { detailsFirst: false }, 'details come last'],
    ['E10 44.1 kHz sound', { sampleRate: 44100 }, '44.1 kHz'],
    ['E11 sound lost', { audioCodec: null }, 'No sound, though your video had sound'],
    ['E12 not H.264', { videoCodec: 'vp9' }, 'H.264'],
  ];
  for (const [what, change, words] of cases) {
    const result = await failing({ ...good, ...change });
    check(`${what} is caught`, result.length >= 1 && result.some((w) => w.includes(words)), JSON.stringify(result));
  }
  check('E13 a square video passes, with a note', (await failing({ ...good, width: 1080, height: 1080 })).length === 0);
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
  await page.goto(APP);
  await choose(page, videos.short);
  await makeVideo(page);
  check('F1 the Share button shows', await visible(page, 'share'));
  const save = await page.locator('#save').boundingBox();
  const share = await page.locator('#share').boundingBox();
  check('F2 Save and Share sit side by side, each at least 48 tall', Math.abs(save.y - share.y) < 2 && save.height >= 48 && share.height >= 48 && share.x > save.x,
    JSON.stringify({ save, share }));
  await page.click('#share');
  await page.waitForFunction(() => window.sharedFiles, null, { timeout: 5000 });
  const shared = await page.evaluate(() => window.sharedFiles);
  check('F3 Share sends one MP4 file', shared.length === 1 && /^video-\d{4}-\d{2}-\d{2}-\d{4}\.mp4$/.test(shared[0].name) && shared[0].type === 'video/mp4' && shared[0].size > 0,
    JSON.stringify(shared));
  await page.locator('#save').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + '8-save-and-share.png' });
  check('F no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- H. The Korean looks, in the saved file ----------
// Each look is made from the color chart; its patches must move the way the look says (lifted darks,
// warmer or cooler whites, and so on). For two looks, the playing video (the preview) is compared with
// the saved file too: what you see is what you get.
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  await choose(page, chart);
  await page.click('#tab-filter');
  const original = Object.fromEntries(Object.entries(PATCHES).map(([name, patch]) => [name, patchColor(chart, patch)]));
  const spread = (c) => Math.max(...c) - Math.min(...c); // how colorful
  const light = (c) => (c[0] + c[1] + c[2]) / 3;
  const sizes = await page.evaluate(() => {
    const preview = document.getElementById('preview');
    return { box: preview.clientWidth / preview.clientHeight, picture: preview.videoWidth / preview.videoHeight };
  });
  check('H1 the playing video has no black bars inside it', Math.abs(sizes.box - sizes.picture) < 0.02, JSON.stringify(sizes));

  const expectations = {
    milky: (c) => c.black[0] - original.black[0] >= 25 && light(c.white) >= 228 && spread(c.skin) < spread(original.skin) - 8 && light(c.gray) > light(original.gray) + 10,
    peach: (c) => (c.skin[0] - c.skin[2]) > (original.skin[0] - original.skin[2]) + 4 && c.white[0] >= c.white[2] + 8,
    glow: (c) => light(c.gray) > light(original.gray) + 15 && c.black[0] - original.black[0] >= 10,
    cafe: (c) => c.white[0] - c.white[2] >= 15 && c.black[0] - original.black[0] >= 10 && spread(c.sky) < spread(original.sky),
    clear: (c) => c.white[2] - c.white[0] >= 8 && c.black[1] >= c.black[0] && c.black[2] >= c.black[0],
    film: (c) => c.black[0] - original.black[0] >= 10 && c.black[1] >= c.black[0] && light(c.white) < 245 && c.white[0] >= c.white[2] + 15,
  };
  for (const id of ['milky', 'peach', 'glow', 'cafe', 'clear', 'film']) {
    await page.click(`.chip[data-filter="${id}"]`);
    check(`H2 ${id}: the playing video shows it`, (await previewFilter(page)) === `url("#look-${id}")`);
    let previewColors = null;
    if (id === 'milky' || id === 'peach') {
      await page.waitForTimeout(300);
      const shot = VIDEOS + `preview-${id}.png`;
      await page.locator('#preview').screenshot({ path: shot });
      const box = await page.locator('#preview').evaluate((v) => v.clientWidth);
      previewColors = Object.fromEntries(['black', 'gray', 'white', 'skin', 'sky'].map((name) => [name, patchColor(shot, PATCHES[name], 0, box * 2)]));
    }
    if (id === 'glow') {
      const glow = await page.evaluate(() => ({ blur: Number(document.querySelector('[data-glow]').getAttribute('stdDeviation')), width: document.getElementById('preview').getBoundingClientRect().width }));
      check('H3 the glow is sized for the preview', Math.abs(glow.blur - 0.012 * glow.width) < 0.05, JSON.stringify(glow));
      await page.click('#make');
      await page.waitForSelector('#making-screen:not([hidden])');
      const during = await page.waitForFunction(() => Number(document.querySelector('[data-glow]').getAttribute('stdDeviation')) > 5, null, { timeout: 10000 })
        .then(() => page.evaluate(() => Number(document.querySelector('[data-glow]').getAttribute('stdDeviation')))).catch(() => -1);
      check('H4 the glow is sized for the full picture while the video is made', Math.abs(during - 0.012 * 540) < 0.05, String(during));
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      const afterResize = await page.evaluate(() => Number(document.querySelector('[data-glow]').getAttribute('stdDeviation')));
      check('H4b a screen resize while making doesn\'t change the glow', Math.abs(afterResize - 0.012 * 540) < 0.05, String(afterResize));
      await page.waitForSelector('#done-screen:not([hidden]), #look-problem:not([hidden])', { timeout: 240000 });
    } else {
      await makeVideo(page);
    }
    check(`H5 ${id}: the video is made`, (await screenShown(page)) === 'done-screen', await text(page, '#look-problem').catch(() => ''));
    const { where } = await download(page, `look-${id}.mp4`);
    const made = Object.fromEntries(Object.entries(PATCHES).map(([name, patch]) => [name, patchColor(where, patch)]));
    check(`H6 ${id}: the saved file has the look`, expectations[id](made), JSON.stringify({ black: made.black, gray: made.gray, white: made.white, skin: made.skin, sky: made.sky }));
    if (previewColors) {
      const worst = Math.max(...Object.keys(previewColors).flatMap((name) => previewColors[name].map((v, i) => Math.abs(v - made[name][i]))));
      check(`H7 ${id}: the saved file looks like the preview (within 12 of 255)`, worst <= 12, `${worst} ` + JSON.stringify({ preview: previewColors, made }));
    }
    await page.goBack();
    await page.waitForSelector('#look-screen:not([hidden])');
  }
  const after = await page.evaluate(() => ({ blur: Number(document.querySelector('[data-glow]').getAttribute('stdDeviation')), width: document.getElementById('preview').getBoundingClientRect().width }));
  check('H8 back on "The look," the glow is sized for the preview again', Math.abs(after.blur - 0.012 * after.width) < 0.05, JSON.stringify(after));
  check('H no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- I. Trim and speed ----------
// The clock video brightens steadily, so a frame's color tells which moment it shows, and its 330 Hz
// tone tells the sound's speed: at 2× it's 660 Hz, at 0.5× 165 Hz (like a tape, Dan's choice "b").
{
  const { context, page } = await openPhone();
  await page.goto(APP);
  await choose(page, clock);
  const tabs = await page.locator('.tab').allInnerTexts();
  check('I1 four tabs: Trim, Speed, Filter, Lighting', JSON.stringify(tabs) === JSON.stringify(['Trim', 'Speed', 'Filter', 'Lighting']), JSON.stringify(tabs));
  check('I2 the whole clip at first', (await text(page, '#trim-length')) === 'Your clip: 8.0 seconds' &&
    (await text(page, '#trim-start-value')) === '0:00.0' && (await text(page, '#trim-end-value')) === '0:08.0');
  const startHere = await page.locator('#start-here').boundingBox();
  check('I2b "Start here" and "End here" are at least 48 tall', startHere.height >= 48, JSON.stringify(startHere));

  await page.evaluate(() => { const v = document.getElementById('preview'); v.pause(); v.currentTime = 2; });
  await page.waitForTimeout(300);
  await page.click('#start-here');
  check('I3 "Start here" sets the start to where the video is', (await text(page, '#trim-start-value')) === '0:02.0');
  await page.fill('#trim-end', '6');
  await page.dispatchEvent('#trim-end', 'input');
  check('I4 the End slider sets the end', (await text(page, '#trim-end-value')) === '0:06.0' && (await text(page, '#trim-length')) === 'Your clip: 4.0 seconds');
  await page.evaluate(() => { document.getElementById('preview').currentTime = 7; });
  await page.waitForTimeout(400);
  check('I5 on the Trim tab the video can go past the end (to pick a new one)', await page.evaluate(() => document.getElementById('preview').currentTime) > 6.5);
  await page.evaluate(() => { const v = document.getElementById('preview'); v.currentTime = 0.4; });
  await page.waitForTimeout(300);
  await page.click('#end-here');
  check('I5b "End here" never goes before the start', (await text(page, '#trim-end-value')) === '0:02.5', await text(page, '#trim-end-value'));
  await page.fill('#trim-end', '6');
  await page.dispatchEvent('#trim-end', 'input');

  await page.evaluate(() => { document.getElementById('preview').currentTime = 7; });
  await page.click('#tab-speed');
  await page.waitForTimeout(400);
  const inside = await page.evaluate(() => document.getElementById('preview').currentTime);
  check('I6 on the other tabs it plays only the trimmed part', inside >= 1.9 && inside <= 6, String(inside));
  const speeds = await page.locator('#speeds .chip').evaluateAll((all) => all.map((c) => c.querySelector('.en').textContent + ' ' + c.querySelector('.sub').textContent));
  check('I7 four speeds, 1× first chosen', JSON.stringify(speeds) === JSON.stringify(['0.5× half speed', '1× normal', '1.5× faster', '2× double speed']) &&
    await page.evaluate(() => document.querySelector('#speeds .chip[aria-checked="true"]').dataset.speed) === '1', JSON.stringify(speeds));
  await page.click('#speeds .chip[data-speed="2"]');
  const rate = await page.evaluate(() => { const v = document.getElementById('preview'); return [v.playbackRate, v.preservesPitch]; });
  check('I8 2× plays the preview at 2×, with the sound\'s pitch going up too', rate[0] === 2 && rate[1] === false, JSON.stringify(rate));
  check('I9 the lengths say so', (await text(page, '#speed-length')) === 'The new video: 2.0 seconds long' &&
    (await text(page, '#trim-length')) === 'Your clip: 4.0 seconds (2.0 seconds at 2×)', await text(page, '#trim-length'));
  await page.screenshot({ path: SHOTS + '11-speed.png' });
  await page.click('#tab-trim');
  await page.screenshot({ path: SHOTS + '12-trim.png' });

  await makeVideo(page);
  check('I10 trim 2 to 6 at 2× is made', (await screenShown(page)) === 'done-screen', await text(page, '#look-problem').catch(() => ''));
  const lengthLine = await page.locator('#ready-list li').evaluateAll((all) => all.map((li) => li.textContent).find((t) => t.includes('long')));
  check('I11 the upload check sees the new length (2 seconds is too short for Instagram)', lengthLine && lengthLine.includes('0:02 long: under 3 seconds'), lengthLine);
  let saved = (await download(page, 'trim-speed-2x.mp4')).where;
  let info = probe(saved);
  check('I12 2 seconds long, a steady 30 frames a second', Math.abs(parseFloat(info.video.duration) - 2) < 0.05 &&
    info.video.r_frame_rate === '30/1' && info.video.avg_frame_rate === '30/1', JSON.stringify(info.video));
  const near = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))) <= 8;
  check('I13 its first frame is the moment the trim starts (2.0 s)', near(frameColor(saved, 0), frameColor(clock, 2)), `${frameColor(saved, 0)} vs ${frameColor(clock, 2)}`);
  check('I14 one second in, it shows 4.0 s of the original (2×)', near(frameColor(saved, 1), frameColor(clock, 4)), `${frameColor(saved, 1)} vs ${frameColor(clock, 4)}`);
  let sound = soundFacts(saved);
  check('I15 the sound is 2 seconds, twice as high (660 Hz)', Math.abs(sound.seconds - 2) < 0.06 && Math.abs(sound.hertz - 660) < 15, JSON.stringify(sound));

  await page.goBack();
  await page.waitForSelector('#look-screen:not([hidden])');
  check('I16 back on Edit, the trim and speed are kept', (await text(page, '#trim-start-value')) === '0:02.0' && (await text(page, '#trim-end-value')) === '0:06.0' &&
    await page.evaluate(() => document.querySelector('#speeds .chip[aria-checked="true"]').dataset.speed) === '2');

  await page.click('#reset-trim');
  check('I17 "Reset the trim"', (await text(page, '#trim-length')) === 'Your clip: 8.0 seconds (4.0 seconds at 2×)', await text(page, '#trim-length'));
  await page.fill('#trim-end', '2');
  await page.dispatchEvent('#trim-end', 'input');
  await page.click('#tab-speed');
  await page.click('#speeds .chip[data-speed="0.5"]');
  await makeVideo(page);
  saved = (await download(page, 'trim-speed-half.mp4')).where;
  info = probe(saved);
  check('I18 0 to 2 at 0.5× is 4 seconds long', Math.abs(parseFloat(info.video.duration) - 4) < 0.05, info.video.duration);
  check('I19 two seconds in, it shows 1.0 s of the original (0.5×)', near(frameColor(saved, 2), frameColor(clock, 1)), `${frameColor(saved, 2)} vs ${frameColor(clock, 1)}`);
  sound = soundFacts(saved);
  check('I20 the sound is 4 seconds, half as high (165 Hz)', Math.abs(sound.seconds - 4) < 0.06 && Math.abs(sound.hertz - 165) < 8, JSON.stringify(sound));

  await page.goBack();
  await page.waitForSelector('#look-screen:not([hidden])');
  await page.click('#tab-trim');
  await page.click('#reset-trim');
  await page.click('#tab-speed');
  await page.click('#speeds .chip[data-speed="1.5"]');
  await makeVideo(page);
  info = probe((await download(page, 'speed-1-5.mp4')).where);
  check('I21 the whole 8 seconds at 1.5× is 5.3 seconds long', Math.abs(parseFloat(info.video.duration) - 8 / 1.5) < 0.06, info.video.duration);

  await page.click('#new-video');
  await page.waitForSelector('#start-screen:not([hidden])');
  await choose(page, videos.short);
  check('I22 a new video starts with the whole clip at 1×', (await text(page, '#trim-length')) === 'Your clip: 3.0 seconds' &&
    await page.evaluate(() => document.querySelector('#speeds .chip[aria-checked="true"]').dataset.speed) === '1', await text(page, '#trim-length'));
  check('I no page errors', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}

// ---------- G. A phone with its zoom at 200% (180 wide), and a computer (1280 wide) ----------
{
  const { context, page } = await openPhone({ viewport: { width: 180, height: 370 } });
  await page.goto(APP);
  check('G1 at 200% zoom, nothing wider than the screen', await page.evaluate(() => document.documentElement.scrollWidth <= 180));
  await choose(page, videos.short);
  check('G2 at 200% zoom, the look screen fits the width', await page.evaluate(() => document.documentElement.scrollWidth <= 180));
  const make = await page.locator('#make').boundingBox();
  check('G3 at 200% zoom, "Make the video" stays on the screen', make.x >= 0 && make.x + make.width <= 180 && make.y + make.height <= 370, JSON.stringify(make));
  await page.screenshot({ path: SHOTS + '9-zoom-200.png' });
  check('G no page errors (200% zoom)', page.problems.length === 0, page.problems.join('\n'));
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (message) => { if (message.type() === 'error') problems.push(message.text()); });
  page.on('pageerror', (error) => problems.push(error.message));
  await page.goto(APP);
  await page.keyboard.press('Tab');
  check('G4 the keyboard reaches "Choose a video"', await page.evaluate(() => document.activeElement.id === 'choose'));
  await page.setInputFiles('#pick', videos.short);
  await page.waitForSelector('#look-screen:not([hidden])');
  const panel = await page.locator('#panel-trim').boundingBox();
  check('G5 on a computer the controls sit in a readable column', panel.width <= 600, JSON.stringify(panel));
  check('G6 nothing wider than the window', await page.evaluate(() => document.documentElement.scrollWidth <= 1280));
  const makeButton = await page.locator('#make').boundingBox();
  check('G7 on a computer "Make the video" sits in the middle', Math.abs(makeButton.x + makeButton.width / 2 - 640) < 2, JSON.stringify(makeButton));
  check('G8 a screen\'s title shows no focus ring', await page.evaluate(() => getComputedStyle(document.getElementById('look-title')).outlineStyle === 'none'));
  await page.screenshot({ path: SHOTS + '10-computer.png' });
  check('G no page errors (computer)', problems.length === 0, problems.join('\n'));
  await context.close();
}

await browser.close();
webServer.kill();
console.log(`Screenshots: ${SHOTS}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
