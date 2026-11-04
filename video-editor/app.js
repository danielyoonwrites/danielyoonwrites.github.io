'use strict';

/*
  Video editor (build steps 3 to 5 in SPEC.md): one clip, trimmed, at a speed, with a look and better sound.

  1. Start: choose a video from the phone.
  2. Edit: a look (filter), the lighting, the sound, trim and speed, shown and heard on the video as it plays.
  3. Making the video: a new MP4 file, frame by frame, with the look drawn into every frame, and the
     sound at the same speed, with the same sound changes.
  4. Your video: it plays, the page checks it against Instagram's, TikTok's and YouTube Shorts'
     upload rules, and you can save it or share it.

  Nothing leaves the phone. Mediabunny (lib/mediabunny.min.js, loaded before this file) reads and
  writes the video files; its guide is at https://mediabunny.dev
*/

const MB = window.Mediabunny;

// ---------- Settings ----------

// The looks: Korean styles (the owner's choice "a", November 2, 2026), plus Original and Black and
// white. "css" is a CSS filter: the same words work on the playing video (the preview) and on the
// canvas each frame is drawn on (the new video), so what you see is what you get. "url(#look-...)"
// points to an SVG filter near the top of index.html, where each look's numbers are.
const FILTERS = [
  { id: 'none', name: 'Original', ko: '원본', css: '' },
  { id: 'milky', name: 'Milky', ko: '우유빛', css: 'url(#look-milky)' },
  { id: 'peach', name: 'Peach', ko: '복숭아', css: 'url(#look-peach)' },
  { id: 'glow', name: 'Soft glow', ko: '뽀샤시', css: 'url(#look-glow)' },
  { id: 'cafe', name: 'Café', ko: '카페', css: 'url(#look-cafe)' },
  { id: 'clear', name: 'Clear', ko: '맑음', css: 'url(#look-clear)' },
  { id: 'film', name: 'Film', ko: '필름', css: 'url(#look-film)' },
  { id: 'bw', name: 'Black and white', ko: '흑백', css: 'grayscale(1)' },
];

// The speeds. The sound speeds up or slows down with the picture, like a tape, so faster sounds
// higher (the owner's choice "b", November 2, 2026: "just have it match the speed, keep it simple").
const SPEEDS = [
  { value: 0.5, name: '0.5×', words: 'half speed' },
  { value: 1, name: '1×', words: 'normal' },
  { value: 1.5, name: '1.5×', words: 'faster' },
  { value: 2, name: '2×', words: 'double speed' },
];
const SHORTEST_TRIM = 0.5; // seconds: the trimmed clip is never shorter than this

// Better sound (the owner's choice "B", November 3, 2026): three switches and the volume. The steps
// themselves are in buildSoundSteps(), under "Better sound."
const SOUND_SWITCHES = ['rumble', 'voice', 'even']; // Cut rumble, Clearer voice, Even out the volume
const SOUND_DEFAULTS = { rumble: false, voice: false, even: false, volume: 100 }; // volume: 0 to 200 (%)

// What every new video is made like, so it fits Instagram's, TikTok's and YouTube Shorts' upload
// rules (the rules and their sources are in SPEC.md, "Made for Instagram, TikTok and YouTube Shorts").
const OUTPUT = {
  longSide: 1920,          // pixels, at most (Reels, TikToks and Shorts are 1080 by 1920)
  minFps: 24,              // frames a second: all three take 23 to 60
  maxFps: 60,
  sampleRate: 48000,       // AAC sound at 48 kHz, stereo, 128 kbps (Instagram's upload rules)
  channels: 2,
  audioBitrate: 128000,
  bitrate30: 8000000,      // the picture's data rate for 1080 by 1920 at 30 frames a second;
  bitrate60: 10000000,     //   at 60, a bit more. Smaller videos get less. A 3-minute video stays under 300 MB.
  // For the check after a video is made
  maxSeconds: 180,         // over 3 minutes: not a YouTube Short, and Instagram won't recommend it to new people
  minSeconds: 3,           // Instagram's upload rules start at 3 seconds
  maxBytes: 300000000,     // Instagram's upload rules: 300 MB at most
  maxWidth: 1920,          // Instagram: at most 1920 pixels wide
  minSide: 360,            // TikTok: each side 360 to 4096 pixels
  maxSide: 4096,
  maxBitrate: 25000000,    // Instagram: 25 Mbps at most
};

const ADDON_URL = 'lib/mediabunny-aac-encoder.min.js?v=1.65.0'; // AAC sound, only if Chrome can't make it

// What the app knows so far
const state = {
  file: null,          // the video you chose (it's only read, never changed)
  facts: null,         // its length, size, frames a second, and whether it has sound
  trimStart: 0,        // where the clip starts and ends, in seconds of your video
  trimEnd: 0,
  speed: 1,            // 0.5, 1, 1.5 or 2
  tab: 'filter',       // the open tab on the Edit screen (Filter, the first tab, when a video opens)
  filter: 'none',      // the look
  brightness: 0,       // -50 to 50
  contrast: 0,         // -50 to 50
  sound: { ...SOUND_DEFAULTS }, // the three sound switches and the volume
  previewUrl: null,    // your video, as a link the page can play
  resultUrl: null,     // the new video, as a link the page can play and save
  resultFile: null,    // the new video, as a file for sharing
  making: false,       // a video is being made
  stopAsked: false,
};

const el = (id) => document.getElementById(id);

// ---------- Small helpers ----------

// 75.4 → "1:15"
function formatTime(seconds) {
  const whole = Math.round(seconds);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

// 5509994 → "5.5 MB"
function formatSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  return Math.max(1, Math.round(bytes / 1e3)) + ' KB';
}

// 62.47 → "1:02.5" (minutes, seconds and tenths)
function formatTenths(seconds) {
  const tenths = Math.round(seconds * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  return minutes + ':' + rest.toFixed(1).padStart(4, '0');
}

// A length in plain words: 4 → "4.0 seconds", 75.5 → "1:15.5"
function formatLength(seconds) {
  return seconds < 60 ? seconds.toFixed(1) + ' seconds' : formatTenths(seconds);
}

const roundTenth = (seconds) => Math.round(seconds * 10) / 10;

// -20 → "−20", 0 → "0", 15 → "+15"
function formatAmount(value) {
  if (value > 0) return '+' + value;
  if (value < 0) return '−' + Math.abs(value);
  return '0';
}

const CODEC_NAMES = {
  avc: 'H.264', hevc: 'HEVC (H.265)', vp8: 'VP8', vp9: 'VP9', av1: 'AV1', prores: 'ProRes',
  aac: 'AAC', opus: 'Opus', mp3: 'MP3', vorbis: 'Vorbis', flac: 'FLAC', ac3: 'AC-3', eac3: 'E-AC-3',
};
function codecName(codec) {
  return CODEC_NAMES[codec] || (codec ? String(codec).toUpperCase() : 'an unknown kind');
}

// The new video's size: the same shape, with its longest side at most OUTPUT.longSide.
// Video sizes must be even numbers.
function fitSize(width, height) {
  const scale = Math.min(1, OUTPUT.longSide / Math.max(width, height));
  const even = (n) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
}

// Frames a second for the new video: the original's, steady, between 24 and 60
// (phones often record about 30 or 60, a little unevenly)
function chooseFps(originalFps) {
  if (!originalFps || !Number.isFinite(originalFps)) return 30;
  return Math.min(OUTPUT.maxFps, Math.max(OUTPUT.minFps, Math.round(originalFps)));
}

// The picture's data rate: 8 Mbps for 1080 by 1920 at 30 frames a second, less for smaller videos
function chooseBitrate(size, fps) {
  const full = fps > 45 ? OUTPUT.bitrate60 : OUTPUT.bitrate30;
  const share = (size.width * size.height) / (1080 * 1920);
  return Math.max(1500000, Math.round(full * Math.min(1, share)));
}

// The look, as one CSS filter, for example "grayscale(1) brightness(1.2)"
function lookFilter() {
  const filter = FILTERS.find((f) => f.id === state.filter) || FILTERS[0];
  const parts = [filter.css];
  if (state.brightness) parts.push('brightness(' + (1 + state.brightness / 100) + ')');
  if (state.contrast) parts.push('contrast(' + (1 + state.contrast / 100) + ')');
  return parts.filter(Boolean).join(' ');
}

// The soft glow's blur is a share of the picture's width (data-glow in index.html), so the glow looks
// the same on the small preview and in the full-size video. This sets it for a picture that many pixels wide.
function setGlowFor(width) {
  for (const blur of document.querySelectorAll('[data-glow]')) {
    blur.setAttribute('stdDeviation', String(Math.max(0.5, Number(blur.dataset.glow) * width)));
  }
}
function fitGlowToPreview() {
  if (state.making) return; // while a video is being made, the glow stays sized for the full picture
  const width = el('preview').getBoundingClientRect().width;
  if (width) setGlowFor(width);
}

// Shows a problem in plain words, with the technical details underneath for Claude
function showProblem(where, words, error) {
  const box = el(where);
  box.textContent = words;
  if (error) {
    const details = document.createElement('span');
    details.className = 'details';
    details.textContent = 'Details: ' + (error.name || 'Error') + ': ' + (error.message || String(error));
    box.append(details);
  }
  box.hidden = false;
}
function hideProblem(where) {
  el(where).hidden = true;
  el(where).textContent = '';
}

// ---------- Inside an MP4 file ----------
// An MP4 file is a row of boxes. "moov" holds the file's details, "mdat" the picture and sound.
// Phones save where a video was filmed inside "moov", as a "©xyz" or "loci" box (or Apple's
// "com.apple.quicktime.location").

async function topBoxes(blob) {
  // The names and places of the top-level boxes, for example [{type: 'ftyp', ...}, {type: 'moov', ...}]
  const boxes = [];
  let position = 0;
  while (position + 8 <= blob.size && boxes.length < 50) {
    const head = new DataView(await blob.slice(position, position + 16).arrayBuffer());
    let size = head.getUint32(0);
    const type = String.fromCharCode(head.getUint8(4), head.getUint8(5), head.getUint8(6), head.getUint8(7));
    let headerSize = 8;
    if (size === 1 && head.byteLength >= 16) {
      size = Number(head.getBigUint64(8));
      headerSize = 16;
    } else if (size === 0) {
      size = blob.size - position; // the last box runs to the end of the file
    }
    if (size < headerSize) break; // not a box we understand
    boxes.push({ type, start: position, size });
    position += size;
  }
  return boxes;
}

function countBytes(bytes, pattern) {
  let count = 0;
  outer: for (let i = 0; i + pattern.length <= bytes.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) continue outer;
    }
    count += 1;
  }
  return count;
}
const asBytes = (word) => Array.from(word, (c) => c.charCodeAt(0));
const LOCATION_MARKS = [[0xa9, 0x78, 0x79, 0x7a] /* "©xyz" */, asBytes('loci'), asBytes('quicktime.location')];

// What's in the file's "moov" box: a location? edit lists? And does "moov" come before "mdat"?
async function fileDetails(blob) {
  const boxes = await topBoxes(blob);
  const moov = boxes.find((b) => b.type === 'moov');
  const mdat = boxes.find((b) => b.type === 'mdat');
  if (!moov) return { location: null, editLists: null, detailsFirst: false };
  const bytes = new Uint8Array(await blob.slice(moov.start, moov.start + moov.size).arrayBuffer());
  return {
    location: LOCATION_MARKS.some((mark) => countBytes(bytes, mark) > 0),
    editLists: countBytes(bytes, asBytes('elst')),
    detailsFirst: !mdat || moov.start < mdat.start,
  };
}

// ---------- Screens and the phone's Back button ----------
// Each step deeper adds a step to the browser's history, so the phone's Back button (<) goes back
// one screen at a time. Whenever the history moves, followHistory() shows what that step should show.

const SCREENS = ['start', 'look', 'making', 'done'];

function show(name) {
  for (const screen of SCREENS) el(screen + '-screen').hidden = screen !== name;
  if (name === 'look') {
    el('preview').play().catch(() => {});
    fitGlowToPreview();
  }
  else el('preview').pause();
  if (name !== 'done') el('result').pause();
  window.scrollTo(0, 0);
  const title = el(name + '-screen').querySelector('h1');
  if (title) title.focus({ preventScroll: true });
}

function goDeeper(name) {
  history.pushState({ screen: name }, '');
  show(name);
}

function followHistory() {
  let screen = (history.state && history.state.screen) || 'start';
  if (state.making && screen !== 'making') stopMaking();
  if (screen === 'making' && !state.making) screen = 'look';
  if (screen === 'done' && !state.resultUrl) screen = 'look';
  if (screen !== 'start' && !state.file) {
    // After a reload the chosen video is gone, so start again
    history.replaceState({ screen: 'start' }, '');
    screen = 'start';
  }
  show(screen);
}
window.addEventListener('popstate', followHistory);

// ---------- Screen 1: choose a video ----------

async function readVideo(file) {
  hideProblem('start-problem');
  el('reading').hidden = false;
  el('choose').disabled = true;
  const input = new MB.Input({ source: new MB.BlobSource(file), formats: MB.ALL_FORMATS });
  try {
    const video = await input.getPrimaryVideoTrack();
    if (!video) {
      showProblem('start-problem', 'This file has no picture in it. Choose a video instead.');
      return;
    }
    if (!(await video.canDecode())) {
      showProblem('start-problem', 'Chrome can\'t read this kind of picture: ' + codecName(await video.getCodec()) +
        '. Try another video, and tell Claude about this one.');
      return;
    }
    const audio = await input.getPrimaryAudioTrack();
    const stats = await video.computePacketStats(300);
    state.facts = {
      duration: await input.computeDuration(),
      width: await video.getDisplayWidth(),
      height: await video.getDisplayHeight(),
      fps: stats.averagePacketRate,
      hasSound: Boolean(audio && (await audio.canDecode())),
    };
    state.file = file;
    state.trimStart = 0;
    state.trimEnd = state.facts.duration;
    state.speed = 1;
    state.filter = 'none';
    state.brightness = 0;
    state.contrast = 0;
    state.sound = { ...SOUND_DEFAULTS };
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = URL.createObjectURL(file);
    el('preview').src = state.previewUrl;
    updateLook();
    updateTrimAndSpeed();
    updateSound();
    selectTab('filter');
    hideProblem('look-problem');
    goDeeper('look');
  } catch (error) {
    showProblem('start-problem', 'Chrome couldn\'t open this file as a video. Try another one.', error);
  } finally {
    input.dispose();
    el('reading').hidden = true;
    el('choose').disabled = false;
  }
}

// ---------- Screen 2: edit (a look, the lighting, the sound, trim and speed) ----------

// Trim and speed: the numbers on the screen, and the playing video's speed. The sound of the playing
// video changes pitch with the speed, like the new video will (preservesPitch off).
function updateTrimAndSpeed() {
  const duration = state.facts ? state.facts.duration : 0;
  const top = Math.floor(duration * 10) / 10; // the sliders move in tenths of a second
  for (const id of ['trim-start', 'trim-end']) el(id).max = String(top);
  el('trim-start').value = String(state.trimStart);
  el('trim-end').value = String(Math.min(state.trimEnd, top));
  el('trim-start-value').textContent = formatTenths(state.trimStart);
  el('trim-end-value').textContent = formatTenths(state.trimEnd);

  const kept = state.trimEnd - state.trimStart;
  const speed = SPEEDS.find((s) => s.value === state.speed) || SPEEDS[1];
  el('trim-length').textContent = 'Your clip: ' + formatLength(kept) +
    (state.speed === 1 ? '' : ' (' + formatLength(kept / state.speed) + ' at ' + speed.name + ')');
  el('speed-length').textContent = 'The new video: ' + formatLength(kept / state.speed) + ' long';
  for (const chip of el('speeds').children) {
    const chosen = Number(chip.dataset.speed) === state.speed;
    chip.setAttribute('aria-checked', String(chosen));
    chip.tabIndex = chosen ? 0 : -1;
  }
  const preview = el('preview');
  preview.preservesPitch = false;
  preview.defaultPlaybackRate = state.speed;
  preview.playbackRate = state.speed;
}

// The start and end of the trim, kept in order and at least SHORTEST_TRIM apart (or the whole video,
// if it's shorter than that). The end never goes past the end of the video.
function setTrimStart(seconds) {
  state.trimStart = Math.max(0, Math.min(roundTenth(seconds), state.trimEnd - SHORTEST_TRIM));
  updateTrimAndSpeed();
}
function setTrimEnd(seconds, toTheEnd) {
  const duration = state.facts.duration;
  const end = toTheEnd ? duration : Math.min(duration, roundTenth(seconds));
  state.trimEnd = Math.min(duration, Math.max(end, state.trimStart + SHORTEST_TRIM));
  updateTrimAndSpeed();
}

function buildSpeedChips() {
  for (const speed of SPEEDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('role', 'radio');
    chip.dataset.speed = String(speed.value);
    const name = document.createElement('span');
    name.className = 'en';
    name.textContent = speed.name;
    const words = document.createElement('span');
    words.className = 'sub';
    words.textContent = speed.words;
    chip.append(name, words);
    chip.addEventListener('click', () => {
      state.speed = speed.value;
      updateTrimAndSpeed();
    });
    el('speeds').append(chip);
  }
}

// On the Trim tab the video plays freely, so you can find new start and end points. On the other
// tabs it plays only the trimmed part, over and over, so you see the clip as it will be.
function keepPreviewInTrim() {
  const preview = el('preview');
  if (!state.facts || state.tab === 'trim') return;
  if (preview.currentTime >= state.trimEnd - 0.03 || preview.currentTime < state.trimStart - 0.3) {
    preview.currentTime = state.trimStart;
  }
}

function buildChips() {
  for (const filter of FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('role', 'radio');
    chip.dataset.filter = filter.id;
    // The English name, with the Korean word under it
    const name = document.createElement('span');
    name.className = 'en';
    name.textContent = filter.name;
    const korean = document.createElement('span');
    korean.className = 'ko';
    korean.lang = 'ko';
    korean.textContent = filter.ko;
    chip.append(name, korean);
    chip.addEventListener('click', () => {
      state.filter = filter.id;
      updateLook();
    });
    el('chips').append(chip);
  }
}

// Puts the look on the playing video, and marks the chosen filter and the slider numbers
function updateLook() {
  el('preview').style.filter = lookFilter() || 'none';
  for (const chip of el('chips').children) {
    const chosen = chip.dataset.filter === state.filter;
    chip.setAttribute('aria-checked', String(chosen));
    chip.tabIndex = chosen ? 0 : -1;
  }
  el('brightness').value = state.brightness;
  el('contrast').value = state.contrast;
  el('brightness-value').textContent = formatAmount(state.brightness);
  el('contrast-value').textContent = formatAmount(state.contrast);
}

// The Edit screen's tabs, in the owner's order (November 3, 2026). The arrow keys follow this order too.
const TABS = ['filter', 'light', 'sound', 'trim', 'speed'];
function selectTab(name) {
  state.tab = name;
  for (const tab of TABS) {
    const chosen = tab === name;
    el('tab-' + tab).setAttribute('aria-selected', String(chosen));
    el('tab-' + tab).tabIndex = chosen ? 0 : -1;
    el('panel-' + tab).hidden = !chosen;
  }
  keepPreviewInTrim();
}

// Arrow keys move between the filters, and between the tabs (the usual way for these controls)
function arrowKeys(event, items, choose) {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!(event.key in keys)) return;
  event.preventDefault();
  const now = items.indexOf(document.activeElement);
  const next = items[(now + keys[event.key] + items.length) % items.length];
  choose(next);
  next.focus();
}

// ---------- Better sound: three switches and the volume ----------
// The same steps go on the playing video's sound (while you edit) and on the new video's sound, so what
// you hear is what you get. Each step is one of Chrome's sound tools (Web Audio). The numbers were measured
// with test tones in Claude's test browser (November 3, 2026), and the saved checks test them (section J).

const LOOK_AHEAD = 0.006; // seconds: each compressor holds the sound back this long (the Web Audio spec)
const LIMIT = { threshold: -3, ratio: 20 }; // the safety limit: nothing louder than about -2.3 dB, so no clipping

// True when anything on the Sound tab isn't at its starting setting
function soundIsChanged(sound) {
  return sound.rumble || sound.voice || sound.even || sound.volume !== 100;
}

// How long the steps hold the sound back: LOOK_AHEAD for each compressor in buildSoundSteps()
function soundDelay(sound) {
  return (sound.even ? LOOK_AHEAD : 0) + (soundIsChanged(sound) ? LOOK_AHEAD : 0);
}

// Builds the steps in an audio context ("audio"): the playing video's, or the one that makes the new
// video's sound. Returns where the sound goes in and comes out, the steps, and the volume step.
// (Each compressor here holds the sound back LOOK_AHEAD; if you add or remove one, change soundDelay().)
function buildSoundSteps(audio, sound) {
  const steps = [];
  if (sound.rumble) {
    // Cut rumble: two high-pass filters at 80 Hz take out the deep sounds under a voice (wind, traffic,
    // bumps): 50 Hz drops by about 18 dB, and a voice (from about 150 Hz up) stays almost the same.
    // For this kind of filter Chrome takes Q in decibels (the Web Audio spec): -3.01 dB is the smooth
    // "Butterworth" shape; a plain 0.707 would make a small bump at 100 Hz.
    for (let i = 0; i < 2; i++) steps.push(new BiquadFilterNode(audio, { type: 'highpass', frequency: 80, Q: -3.01 }));
  }
  if (sound.voice) {
    // Clearer voice: a little less of the boomy middle (3 dB less around 300 Hz) and more of the part of
    // a voice that carries the words (4 dB more around 3,500 Hz)
    steps.push(new BiquadFilterNode(audio, { type: 'peaking', frequency: 300, Q: 1, gain: -3 }));
    steps.push(new BiquadFilterNode(audio, { type: 'peaking', frequency: 3500, Q: 0.9, gain: 4 }));
  }
  if (sound.even) {
    // Even out the volume: a compressor turns down whatever is louder than -30 dB, and then Chrome turns
    // everything up by itself (its "makeup gain"), so quiet words come up and loud moments go down.
    // A 30 dB gap between quiet and loud becomes about 18 dB (measured in a saved video).
    steps.push(new DynamicsCompressorNode(audio, { threshold: -30, knee: 10, ratio: 4, attack: 0.005, release: 0.25 }));
  }
  const volume = new GainNode(audio, { gain: sound.volume / 100 });
  steps.push(volume);
  if (soundIsChanged(sound)) {
    // The safety limit: a compressor that only acts on sound louder than -3 dB, so a louder volume or a
    // clearer voice never clips. Chrome turns its output up by itself, by 0.6 times its full-range
    // reduction (the Web Audio spec, "computing the makeup gain"): 1.71 dB here. The next step turns
    // that back down, so everything under -3 dB comes out just as it went in.
    steps.push(new DynamicsCompressorNode(audio, { threshold: LIMIT.threshold, knee: 0, ratio: LIMIT.ratio, attack: 0.001, release: 0.1 }));
    const makeup = -0.6 * LIMIT.threshold * (1 - 1 / LIMIT.ratio); // in dB
    steps.push(new GainNode(audio, { gain: 10 ** (-makeup / 20) }));
  }
  for (let i = 1; i < steps.length; i++) steps[i - 1].connect(steps[i]);
  return { input: steps[0], output: steps[steps.length - 1], steps, volume };
}

// The playing video's sound goes through the same steps, from the first change on the Sound tab (until
// then Chrome plays it directly, as before). Chrome lets a video's sound be sent through steps only once,
// and then always, so the steps are swapped as the settings change. The video's own sound button still
// turns it on and off.
let liveSound = null; // { audio, source, chain, shape }
function updateLiveSound() {
  if (!liveSound) {
    if (!soundIsChanged(state.sound)) return;
    const audio = new AudioContext();
    liveSound = { audio, source: audio.createMediaElementSource(el('preview')), chain: null, shape: '' };
  }
  const { audio } = liveSound;
  // Only the volume changed: just turn it, smoothly (no new steps, so no click while sliding)
  const shape = JSON.stringify([state.sound.rumble, state.sound.voice, state.sound.even, soundIsChanged(state.sound)]);
  if (liveSound.chain && shape === liveSound.shape) {
    liveSound.chain.volume.gain.setTargetAtTime(state.sound.volume / 100, audio.currentTime, 0.02);
  } else {
    liveSound.source.disconnect();
    if (liveSound.chain) for (const step of liveSound.chain.steps) step.disconnect();
    liveSound.chain = buildSoundSteps(audio, state.sound);
    liveSound.source.connect(liveSound.chain.input);
    liveSound.chain.output.connect(audio.destination);
    liveSound.shape = shape;
  }
  if (audio.state !== 'running') audio.resume().catch(() => {});
}

// Marks the switches and the volume on the Sound tab, and puts the settings on the playing video
function updateSound() {
  const hasSound = Boolean(state.facts && state.facts.hasSound);
  el('no-sound').hidden = hasSound;
  el('sound-controls').hidden = !hasSound;
  for (const id of SOUND_SWITCHES) el('sound-' + id).setAttribute('aria-checked', String(state.sound[id]));
  el('volume').value = state.sound.volume;
  el('volume-value').textContent = state.sound.volume === 0 ? 'Off' : state.sound.volume + '%';
  updateLiveSound();
}

// ---------- Screen 3: making the video ----------

let addonLoading = null;
function loadSoundAddon() {
  // Loads Mediabunny's AAC add-on once, then tells Mediabunny to use it
  if (!addonLoading) {
    addonLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = ADDON_URL;
      script.onload = () => {
        if (window.MediabunnyAacEncoder && window.MediabunnyAacEncoder.registerAacEncoder) {
          window.MediabunnyAacEncoder.registerAacEncoder();
          resolve();
        } else {
          reject(new Error('The AAC add-on loaded, but without its register function.'));
        }
      };
      script.onerror = () => reject(new Error('The AAC add-on didn\'t load.'));
      document.head.append(script);
    });
  }
  return addonLoading;
}

// Thrown when "Stop" is tapped, to stop making the video
class Stopped extends Error {}

// The sound from "start" to "end" in your video, played at the chosen speed (faster sounds higher, like a
// tape: the owner's choice "b"), through the Sound tab's steps. It comes out as 48 kHz stereo, ready for AAC.
async function soundAtSpeed(audioTrack, start, end, speed, sound) {
  // 1. Gather the original sound from start to end into one piece
  const sink = new MB.AudioBufferSink(audioTrack);
  let whole = null;
  for await (const { buffer, timestamp } of sink.buffers(start, end)) {
    if (state.stopAsked) throw new Stopped();
    if (!whole) {
      whole = new AudioBuffer({
        length: Math.max(1, Math.round((end - start) * buffer.sampleRate)),
        numberOfChannels: Math.min(2, buffer.numberOfChannels),
        sampleRate: buffer.sampleRate,
      });
    }
    const offset = Math.round((timestamp - start) * whole.sampleRate); // where this bit goes
    for (let channel = 0; channel < whole.numberOfChannels; channel++) {
      const from = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
      const skip = Math.max(0, -offset); // the part before "start" is left out
      const count = Math.min(from.length - skip, whole.length - (offset + skip));
      if (count > 0) whole.getChannelData(channel).set(from.subarray(skip, skip + count), offset + skip);
    }
  }
  // 2. Play it at the speed, faster than real time, through the sound steps, into a new 48 kHz stereo
  //    piece. The steps hold the sound back a few thousandths of a second (soundDelay()), so a little more is
  //    made, and the start is cut off again below, to keep the sound in line with the picture.
  const length = Math.max(1, Math.round(((end - start) / speed) * OUTPUT.sampleRate));
  const late = Math.round(soundDelay(sound) * OUTPUT.sampleRate); // how many samples late the steps make it
  const studio = new OfflineAudioContext({ numberOfChannels: OUTPUT.channels, length: length + late, sampleRate: OUTPUT.sampleRate });
  const steps = buildSoundSteps(studio, sound);
  if (whole) {
    const player = studio.createBufferSource();
    player.buffer = whole;
    player.playbackRate.value = speed; // like a tape: faster is higher
    player.connect(steps.input);
    player.start();
  }
  steps.output.connect(studio.destination);
  const made = await studio.startRendering();
  if (!late) return made;
  // 3. Cut off the late start
  const inLine = new AudioBuffer({ length, numberOfChannels: OUTPUT.channels, sampleRate: OUTPUT.sampleRate });
  for (let channel = 0; channel < OUTPUT.channels; channel++) {
    inLine.getChannelData(channel).set(made.getChannelData(channel).subarray(late, late + length));
  }
  return inLine;
}

async function makeVideo() {
  hideProblem('look-problem');
  state.making = true;
  state.stopAsked = false;
  el('bar').value = 0;
  el('making-words').textContent = 'Getting ready…';
  el('stop').disabled = false;
  goDeeper('making');

  const filter = lookFilter();
  const size = fitSize(state.facts.width, state.facts.height);
  const fps = chooseFps(state.facts.fps);
  const start = state.trimStart;
  const end = state.trimEnd;
  const speed = state.speed;
  const frameCount = Math.max(1, Math.round(((end - start) / speed) * fps)); // frames in the new video

  const input = new MB.Input({ source: new MB.BlobSource(state.file), formats: MB.ALL_FORMATS });
  // A new MP4 file, with its details at the front. Nothing from the original's tags is copied, so
  // hidden details like where it was filmed stay behind.
  const output = new MB.Output({
    format: new MB.Mp4OutputFormat({ fastStart: 'in-memory' }),
    target: new MB.BufferTarget(),
  });

  // Keeps the screen from turning off while the video is made (if the phone allows it)
  let screenLock = null;
  try {
    if ('wakeLock' in navigator) screenLock = await navigator.wakeLock.request('screen');
  } catch (error) { /* the video still gets made */ }

  setGlowFor(size.width); // the glow, sized for the full-size picture
  let started = false;
  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = state.facts.hasSound ? await input.getPrimaryAudioTrack() : null;

    // The picture: each new frame is drawn on this canvas with the look (the same CSS filter as the
    // preview), then added to the new file as H.264. A normal canvas, not an OffscreenCanvas: only a
    // normal one can use the SVG looks.
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    context.filter = filter || 'none';
    const pictures = new MB.CanvasSource(canvas, {
      codec: 'avc',
      quality: new MB.Quality({ bitrate: chooseBitrate(size, fps), bitrateMode: 'variable' }),
    });
    output.addVideoTrack(pictures, { frameRate: fps });

    // The sound: AAC, built into Chrome on the owner's phone (the phone test, November 2, 2026); the
    // add-on is only for a phone or browser without it
    let sound = null;
    if (audioTrack) {
      if (!(await MB.canEncodeAudio('aac'))) await loadSoundAddon();
      sound = new MB.AudioBufferSource({ codec: 'aac', quality: new MB.Quality({ bitrate: OUTPUT.audioBitrate }) });
      output.addAudioTrack(sound);
    }

    await output.start();
    started = true;
    if (state.stopAsked) throw new Stopped();

    if (sound) {
      el('making-words').textContent = 'Getting the sound ready…';
      await sound.add(await soundAtSpeed(audioTrack, start, end, speed, state.sound));
      sound.close();
    }

    // The frames: the new video has "fps" frames each second, and each one shows the moment in your
    // video that the trim and the speed point to. Mediabunny turns the video upright and makes it
    // the new size on the way (CanvasSink).
    const frames = new MB.CanvasSink(videoTrack, { width: size.width, height: size.height, fit: 'fill', poolSize: 2 });
    const moments = Array.from({ length: frameCount }, (_, k) => start + (k / fps) * speed);
    let made = 0;
    for await (const frame of frames.canvasesAtTimestamps(moments)) {
      if (state.stopAsked) throw new Stopped();
      if (frame) context.drawImage(frame.canvas, 0, 0, size.width, size.height);
      await pictures.add(made / fps, 1 / fps);
      made += 1;
      const percent = Math.round((made / frameCount) * 100);
      el('bar').value = percent;
      el('making-words').textContent = percent + '%';
    }
    pictures.close();
    await output.finalize();

    const blob = new Blob([output.target.buffer], { type: 'video/mp4' });
    state.making = false;
    await showResult(blob);
  } catch (error) {
    const stopped = error instanceof Stopped || state.stopAsked;
    state.making = false;
    if (started) await output.cancel().catch(() => {});
    // Back to Edit, with a note
    if (history.state && history.state.screen === 'making') history.back();
    else show('look');
    if (stopped) showProblem('look-problem', 'Stopped. Nothing was made.');
    else showProblem('look-problem', 'Making the video stopped with a problem. Send Claude a screenshot of this.', error);
  } finally {
    state.making = false;
    input.dispose();
    fitGlowToPreview(); // the glow, sized for the preview again
    if (screenLock) screenLock.release().catch(() => {});
  }
}

function stopMaking() {
  state.stopAsked = true;
  el('stop').disabled = true;
  el('making-words').textContent = 'Stopping…';
}

// ---------- Screen 4: your video ----------

// The checks against Instagram's, TikTok's and YouTube Shorts' upload rules.
// "facts" describes the new video; each line is ✓ (ok: true) or ✗ (ok: false), in plain words that
// say what's wrong when it's ✗.
function checkReady(facts) {
  const lines = [];
  const add = (ok, yesWords, noWords) => lines.push({ ok, words: ok ? yesWords : (noWords || yesWords) });

  add(facts.container === 'MP4' && facts.videoCodec === 'avc', 'An MP4 file with an H.264 picture',
    'Not an MP4 file with an H.264 picture, which all three expect');

  if (facts.audioCodec) {
    const sound = codecName(facts.audioCodec) + ' sound, ' + facts.sampleRate / 1000 + ' kHz, ' + (facts.channels === 2 ? 'stereo' : 'mono');
    add(facts.audioCodec === 'aac' && facts.sampleRate === OUTPUT.sampleRate && facts.channels <= 2, sound,
      sound + ': the rules ask for AAC sound at 48 kHz');
  } else {
    add(!facts.originalHadSound, 'No sound (your video had none)', 'No sound, though your video had sound');
  }

  const ratio = facts.width / facts.height;
  if (Math.abs(ratio - 9 / 16) < 0.02) add(true, 'Tall (9 by 16): the best shape for all three');
  else if (ratio < 1.02) add(true, (ratio > 0.98 ? 'Square' : 'Taller than wide') + ': works, though tall (9 by 16) fills the screen best');
  else add(false, 'Wide: YouTube will count it as a regular video, not a Short. Tall (9 by 16) is best for all three');

  const pixels = facts.width + ' × ' + facts.height + ' pixels';
  add(facts.width <= OUTPUT.maxWidth && Math.min(facts.width, facts.height) >= OUTPUT.minSide &&
    Math.max(facts.width, facts.height) <= OUTPUT.maxSide, pixels,
    pixels + ': outside the sizes they take (Instagram: up to 1920 wide; TikTok: 360 to 4096 on each side)');

  const frames = Math.round(facts.fps) + ' frames a second';
  add(facts.fps >= 23 && facts.fps <= 60.5, frames, frames + ': they take 23 to 60');

  if (facts.duration > OUTPUT.maxSeconds + 0.5) {
    add(false, formatTime(facts.duration) + ' long: over 3 minutes, so YouTube won\'t count it as a Short, and Instagram won\'t recommend it to new people');
  } else if (facts.duration < OUTPUT.minSeconds) {
    add(false, formatTime(facts.duration) + ' long: under 3 seconds, too short for Instagram\'s upload rules');
  } else {
    add(true, formatTime(facts.duration) + ' long (3 minutes or less)');
  }

  add(facts.bytes <= OUTPUT.maxBytes, formatSize(facts.bytes) + ' (Instagram\'s limit is 300 MB)',
    formatSize(facts.bytes) + ': over Instagram\'s limit of 300 MB');
  const rate = 'Picture data rate ' + (facts.videoBitrate / 1e6).toFixed(1) + ' Mbps';
  add(facts.videoBitrate <= OUTPUT.maxBitrate, rate + ' (Instagram\'s limit is 25)', rate + ': over Instagram\'s limit of 25');
  add(facts.detailsFirst === true, 'The file\'s details come first, so it can start playing right away',
    'The file\'s details come last, which Instagram\'s and YouTube\'s upload rules ask to avoid');
  add(facts.location === false, 'No hidden location', 'A location is still saved in the file');
  return lines;
}

// Reads the new video back and gathers the facts checkReady() needs
async function inspect(blob) {
  const input = new MB.Input({ source: new MB.BlobSource(blob), formats: MB.ALL_FORMATS });
  try {
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    const videoStats = await video.computePacketStats(2000);
    const config = await video.getDecoderConfig();
    const details = await fileDetails(blob);
    return {
      container: (await input.getFormat()).name,
      videoCodec: await video.getCodec(),
      codecString: await video.getCodecParameterString(),
      width: await video.getDisplayWidth(),
      height: await video.getDisplayHeight(),
      fps: videoStats.averagePacketRate,
      videoBitrate: videoStats.averageBitrate,
      color: config && config.colorSpace ? config.colorSpace : null,
      audioCodec: audio ? await audio.getCodec() : null,
      sampleRate: audio ? await audio.getSampleRate() : null,
      channels: audio ? await audio.getNumberOfChannels() : null,
      audioBitrate: audio ? (await audio.computePacketStats(2000)).averageBitrate : null,
      duration: await input.computeDuration(),
      bytes: blob.size,
      originalHadSound: state.facts.hasSound,
      ...details,
    };
  } finally {
    input.dispose();
  }
}

async function showResult(blob) {
  if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
  state.resultUrl = URL.createObjectURL(blob);
  const now = new Date();
  const two = (n) => String(n).padStart(2, '0');
  const name = 'video-' + now.getFullYear() + '-' + two(now.getMonth() + 1) + '-' + two(now.getDate()) + '-' +
    two(now.getHours()) + two(now.getMinutes()) + '.mp4'; // for example video-2026-11-02-0913.mp4
  state.resultFile = new File([blob], name, { type: 'video/mp4' });

  const facts = await inspect(blob);
  const lines = checkReady(facts);
  const allGood = lines.every((line) => line.ok);
  const onlyWide = !allGood && lines.filter((line) => !line.ok).every((line) => line.words.startsWith('Wide'));

  const ready = el('ready-line');
  ready.className = 'ready ' + (allGood ? 'yes' : 'no');
  ready.textContent = allGood ? '✓ Meets the upload rules for Instagram, TikTok and YouTube Shorts'
    : onlyWide ? 'Fine for Instagram and TikTok, but it\'s wide, so YouTube will count it as a regular video, not a Short'
      : '✗ Not quite ready: see "What was checked"';

  const list = el('ready-list');
  list.textContent = '';
  for (const line of lines) {
    const item = document.createElement('li');
    item.className = line.ok ? 'yes' : 'no';
    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = line.ok ? '✓' : '✗';
    const words = document.createElement('span');
    words.textContent = line.words;
    item.append(mark, words);
    list.append(item);
  }
  el('ready-details').open = !allGood;

  // The technical details, for Claude
  const color = facts.color ? [facts.color.primaries, facts.color.transfer, facts.color.matrix,
    facts.color.fullRange ? 'full range' : 'limited range'].join(' ') : 'no color tags';
  el('tech-line').textContent = 'For Claude: ' + facts.codecString + ', ' + (facts.videoBitrate / 1e6).toFixed(1) + ' Mbps, ' +
    (facts.audioCodec ? facts.audioCodec + ' ' + facts.sampleRate + ' Hz ' + facts.channels + ' ch ' +
      Math.round(facts.audioBitrate / 1000) + ' kbps' : 'no sound') + ', color ' + color +
    ', edit lists ' + facts.editLists + ', details first ' + (facts.detailsFirst ? 'yes' : 'no') + '.';

  el('result').src = state.resultUrl;
  el('save').href = state.resultUrl;
  el('save').download = name;
  el('share').hidden = !(navigator.canShare && navigator.canShare({ files: [state.resultFile] }));
  history.replaceState({ screen: 'done' }, '');
  show('done');
}

function share() {
  hideProblem('done-problem');
  navigator.share({ files: [state.resultFile], title: 'Video' }).catch((error) => {
    if (error.name !== 'AbortError') showProblem('done-problem', 'Sharing didn\'t work. Try "Save to phone" instead.', error);
  });
}

// "Start a new video": back to the start screen, ready for another video
function startOver() {
  el('preview').removeAttribute('src');
  el('result').removeAttribute('src');
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
  Object.assign(state, { file: null, facts: null, previewUrl: null, resultUrl: null, resultFile: null });
  history.go(-2); // from "Your video" past "The look" to the start
}

// ---------- Start ----------

if (!MB) {
  showProblem('start-problem', 'The video library didn\'t load. Check your connection, then reload this page.');
  el('choose').disabled = true;
} else if (!('VideoEncoder' in window)) {
  showProblem('start-problem', 'Chrome on this phone doesn\'t have the video tools this app needs (WebCodecs).');
  el('choose').disabled = true;
}

buildChips();
buildSpeedChips();
updateLook();
el('choose').addEventListener('click', () => el('pick').click());
el('pick').addEventListener('change', () => {
  const file = el('pick').files[0];
  el('pick').value = ''; // so choosing the same video again still works
  if (file) readVideo(file);
});
el('look-back').addEventListener('click', () => history.back());
el('done-back').addEventListener('click', () => history.back());
for (const tab of TABS) el('tab-' + tab).addEventListener('click', () => selectTab(tab));
el('start-here').addEventListener('click', () => setTrimStart(el('preview').currentTime));
el('end-here').addEventListener('click', () => setTrimEnd(el('preview').currentTime));
el('trim-start').addEventListener('input', () => {
  setTrimStart(Number(el('trim-start').value));
  el('preview').currentTime = state.trimStart; // show where it starts
});
el('trim-end').addEventListener('input', () => {
  const slider = el('trim-end');
  setTrimEnd(Number(slider.value), slider.value === slider.max); // all the way right means the very end
  el('preview').currentTime = Math.max(state.trimStart, state.trimEnd - 1); // show the last second
});
el('reset-trim').addEventListener('click', () => {
  state.trimStart = 0;
  state.trimEnd = state.facts.duration;
  updateTrimAndSpeed();
});
el('preview').addEventListener('timeupdate', keepPreviewInTrim);
el('speeds').addEventListener('keydown', (event) => arrowKeys(event, [...el('speeds').children], (chip) => {
  state.speed = Number(chip.dataset.speed);
  updateTrimAndSpeed();
}));
el('chips').addEventListener('keydown', (event) => arrowKeys(event, [...el('chips').children], (chip) => {
  state.filter = chip.dataset.filter;
  updateLook();
}));
document.querySelector('.tabs').addEventListener('keydown', (event) => arrowKeys(event, TABS.map((t) => el('tab-' + t)),
  (tab) => selectTab(tab.id.replace('tab-', ''))));
el('brightness').addEventListener('input', () => { state.brightness = Number(el('brightness').value); updateLook(); });
el('contrast').addEventListener('input', () => { state.contrast = Number(el('contrast').value); updateLook(); });
el('reset-light').addEventListener('click', () => { state.brightness = 0; state.contrast = 0; updateLook(); });
for (const id of SOUND_SWITCHES) {
  el('sound-' + id).addEventListener('click', () => { state.sound[id] = !state.sound[id]; updateSound(); });
}
el('volume').addEventListener('input', () => { state.sound.volume = Number(el('volume').value); updateSound(); });
el('reset-sound').addEventListener('click', () => { state.sound = { ...SOUND_DEFAULTS }; updateSound(); });
el('make').addEventListener('click', makeVideo);
el('preview').addEventListener('loadedmetadata', fitGlowToPreview);
window.addEventListener('resize', fitGlowToPreview);
el('stop').addEventListener('click', stopMaking);
el('share').addEventListener('click', share);
el('new-video').addEventListener('click', startOver);
history.replaceState({ screen: 'start' }, '');
followHistory();
