// Helpers for the video editor's saved checks: made-up test videos (color bars and a tone, made with
// ffmpeg; never the owner's videos), and ways to look inside the videos the app makes.
// Written November 2, 2026. Used by tests/app-test.mjs.
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

export const VIDEOS = path.join(os.tmpdir(), 'video-editor-test-videos') + path.sep;
mkdirSync(VIDEOS, { recursive: true });

function ffmpeg(args) {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
  if (run.status !== 0) throw new Error('ffmpeg failed: ' + run.stderr.toString());
}

export function haveFfmpeg() {
  return spawnSync('ffmpeg', ['-version']).status === 0;
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

// The test videos (made once, then kept in the temporary folder)
export function makeTestVideos() {
  // A phone-style video: stored sideways with a "turn it" note, and a location saved in it
  const sideways = VIDEOS + 'tall-turned.mp4';
  if (!existsSync(sideways)) {
    const wide = makeVideo('wide-for-turning.mp4', { size: '1920x1080', seconds: 8 });
    ffmpeg(['-display_rotation', '90', '-i', wide, '-c', 'copy', '-metadata', 'location=+34.0522-118.2437/', sideways]);
  }
  return {
    sideways,
    tall: makeVideo('tall.mp4', { size: '1080x1920', seconds: 8, tone: 330 }),
    short: makeVideo('short.mp4', { size: '720x1280', seconds: 3, tone: 550 }),
    silent: makeVideo('silent.mp4', { size: '720x1280', seconds: 6, sound: false }),
    wide: makeVideo('wide.mp4', { size: '1920x1080', seconds: 4, tone: 770 }),
    hevc: makeVideo('hevc.mp4', { size: '1280x720', seconds: 4, codec: 'libx265', tone: 220 }),
  };
}

// A color chart (made with ffmpeg): patches of black, grays, white, skin, sky, green, wood and red, on a
// beige wall, 540 by 960, 2 seconds, no sound. PATCHES gives each patch's place and color, for checking
// how each look changes them.
export const PATCHES = {
  black: { x: 20, y: 20, color: [16, 16, 16] },
  darkGray: { x: 195, y: 20, color: [64, 64, 64] },
  gray: { x: 370, y: 20, color: [128, 128, 128] },
  white: { x: 20, y: 200, color: [240, 240, 240] },
  skin: { x: 195, y: 200, color: [230, 180, 150] },
  sky: { x: 370, y: 200, color: [140, 185, 235] },
  green: { x: 20, y: 380, color: [60, 140, 70] },
  wood: { x: 195, y: 380, color: [160, 110, 70] },
  red: { x: 370, y: 380, color: [200, 60, 60] },
};
export const PATCH_SIZE = 150;
export function makeChart() {
  const file = VIDEOS + 'chart.mp4';
  if (existsSync(file)) return file;
  const hex = (c) => '0x' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const boxes = Object.values(PATCHES)
    .map((p) => `drawbox=x=${p.x}:y=${p.y}:w=${PATCH_SIZE}:h=${PATCH_SIZE}:color=${hex(p.color)}@1:t=fill`).join(',');
  ffmpeg(['-f', 'lavfi', '-i', 'color=c=0xD2C8BE:s=540x960:r=30:d=2', '-vf', boxes + ',format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-an', file]);
  return file;
}

// The average color of a patch's middle, from a video file (as ffmpeg shows it)
export function patchColor(file, patch, at = 0.5, width = 540) {
  const scale = width / 540;
  const inset = 30;
  const size = Math.round((PATCH_SIZE - 2 * inset) * scale);
  const run = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(at), '-i', file, '-vf',
    `crop=${size}:${size}:${Math.round((patch.x + inset) * scale)}:${Math.round((patch.y + inset) * scale)},scale=1:1:flags=area,format=rgb24`,
    '-frames:v', '1', '-f', 'rawvideo', '-']);
  return [...run.stdout];
}

// What ffprobe says about a file: its picture and sound
export function probe(file) {
  const run = spawnSync('ffprobe', ['-v', 'error', '-show_entries',
    'stream=codec_type,codec_name,profile,width,height,r_frame_rate,avg_frame_rate,bit_rate,sample_rate,channels,duration,pix_fmt:stream_side_data=rotation',
    '-of', 'json', file]);
  const streams = JSON.parse(run.stdout.toString()).streams;
  return {
    video: streams.find((s) => s.codec_type === 'video'),
    audio: streams.find((s) => s.codec_type === 'audio'),
  };
}

// A small gray picture of a frame, as it shows on screen (ffmpeg turns it upright), as numbers 0 to 255
// ("extra" can turn it first, for example 'transpose=1,')
export function thumbnail(file, at = 0, extra = '') {
  const run = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(at), '-i', file, '-vf', `${extra}scale=27:48,format=gray`,
    '-frames:v', '1', '-f', 'rawvideo', '-']);
  return [...run.stdout];
}

// How alike two pictures' shapes are, from -1 to 1 (1 = the same, even if one is brighter)
export function likeness(a, b) {
  const mean = (x) => x.reduce((s, v) => s + v, 0) / x.length;
  const ma = mean(a);
  const mb = mean(b);
  let top = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    top += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return top / Math.sqrt(da * db);
}

export const average = (values) => values.reduce((s, v) => s + v, 0) / values.length;

// The largest gap between red, green and blue in any pixel of a frame (0 = black and white)
export function colorfulness(file, at = 0) {
  const run = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(at), '-i', file, '-vf', 'scale=54:96,format=rgb24',
    '-frames:v', '1', '-f', 'rawvideo', '-']);
  let most = 0;
  for (let i = 0; i < run.stdout.length; i += 3) {
    const pixel = [run.stdout[i], run.stdout[i + 1], run.stdout[i + 2]];
    most = Math.max(most, Math.max(...pixel) - Math.min(...pixel));
  }
  return most;
}

// The top-level boxes of an MP4 file, in order, and what's inside "moov"
export function mp4Boxes(file) {
  const bytes = readFileSync(file);
  const order = [];
  let moov = null;
  let position = 0;
  while (position + 8 <= bytes.length) {
    let size = bytes.readUInt32BE(position);
    const type = bytes.toString('latin1', position + 4, position + 8);
    if (size === 1) size = Number(bytes.readBigUInt64BE(position + 8));
    if (size === 0) size = bytes.length - position;
    if (size < 8) break;
    order.push(type);
    if (type === 'moov') moov = bytes.subarray(position, position + size);
    position += size;
  }
  const count = (word) => {
    let n = 0;
    let at = moov ? moov.indexOf(word) : -1;
    while (at !== -1) { n += 1; at = moov.indexOf(word, at + 1); }
    return n;
  };
  return {
    order,
    location: moov ? (moov.includes(Buffer.from([0xa9, 0x78, 0x79, 0x7a])) || moov.includes('loci') || moov.includes('quicktime.location')) : null,
    editLists: count('elst'),
  };
}

// Contrast between two colors, the way WCAG 2.2 measures it
export function contrast(a, b) {
  const light = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [light(a), light(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
