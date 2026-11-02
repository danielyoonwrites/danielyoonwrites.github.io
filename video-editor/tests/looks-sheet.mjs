// Draws a made-up test scene through every look, in the real app page, and saves one comparison
// picture: a quick way to see the looks side by side after changing one.
// Written November 2, 2026. Run from the repository folder: node video-editor/tests/looks-sheet.mjs
// It serves the repository on http://127.0.0.1:8769 (python3), so that port must be free, and makes the
// test scene with tests/make-scene.py (Python with Pillow and numpy). It prints where the picture is.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
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
const repository = fileURLToPath(new URL('../../', import.meta.url));
const scene = path.join(os.tmpdir(), 'video-editor-scene.png');
const sheet = path.join(os.tmpdir(), 'video-editor-looks.png');
if (!existsSync(scene)) {
  const made = spawnSync('python3', [repository + 'video-editor/tests/make-scene.py', scene]);
  if (made.status !== 0) {
    console.log('The test scene could not be made: ' + made.stderr.toString());
    process.exit(1);
  }
}

const server = spawn('python3', ['-m', 'http.server', '8769', '--bind', '127.0.0.1'], { cwd: repository, stdio: 'ignore' });
process.on('exit', () => server.kill());
const APP = 'http://127.0.0.1:8769/video-editor/';
for (let i = 0; i < 50; i += 1) {
  const ok = await new Promise((resolve) => http.get(APP, (r) => { r.resume(); resolve(r.statusCode === 200); }).on('error', () => resolve(false)));
  if (ok) break;
  await new Promise((resolve) => setTimeout(resolve, 100));
}

const browser = await playwright.chromium.launch();
const page = await browser.newPage();
await page.goto(APP);
const picture = await page.evaluate(async (source) => {
  const image = new Image();
  image.src = source;
  await image.decode();
  const w = 270, h = 480, columns = 4, label = 40;
  const out = document.createElement('canvas');
  out.width = columns * w;
  out.height = Math.ceil(FILTERS.length / columns) * (h + label);
  const o = out.getContext('2d');
  o.fillStyle = '#121212';
  o.fillRect(0, 0, out.width, out.height);
  FILTERS.forEach((look, i) => {
    const one = document.createElement('canvas');
    one.width = w;
    one.height = h;
    const c = one.getContext('2d');
    setGlowFor(w);   // the glow, sized for this picture
    c.filter = look.css || 'none';
    c.drawImage(image, 0, 0, w, h);
    const x = (i % columns) * w, y = Math.floor(i / columns) * (h + label);
    o.drawImage(one, x, y);
    o.fillStyle = '#f2f2f2';
    o.font = '600 20px sans-serif';
    o.fillText(look.name + '  ' + look.ko, x + 10, y + h + 28);
  });
  return out.toDataURL('image/png');
}, 'data:image/png;base64,' + readFileSync(scene).toString('base64'));
writeFileSync(sheet, Buffer.from(picture.split(',')[1], 'base64'));
await browser.close();
server.kill();
console.log('The looks, side by side: ' + sheet);
