'use strict';

/*
  Video editor (build step 3 in SPEC.md): one clip with a look.

  1. Start: choose a video from the phone.
  2. The look: a filter and the lighting, shown on the video as it plays.
  3. Making the video: a new MP4 file, frame by frame, with the look drawn into every frame.
  4. Your video: it plays, the page checks it against Instagram's, TikTok's and YouTube Shorts'
     upload rules, and you can save it or share it.

  Nothing leaves the phone. Mediabunny (lib/mediabunny.min.js, loaded before this file) reads and
  writes the video files; its guide is at https://mediabunny.dev
*/

const MB = window.Mediabunny;

// ---------- Settings ----------

// The filters. "css" is a CSS filter: the same words work on the playing video (the preview) and
// on the canvas each frame is drawn on (the new video), so what you see is what you get.
const FILTERS = [
  { id: 'none', name: 'None', css: '' },
  { id: 'bw', name: 'Black and white', css: 'grayscale(1)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.3) saturate(1.2)' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(1.4) contrast(1.08)' },
  { id: 'soft', name: 'Soft', css: 'contrast(0.88) saturate(0.85) brightness(1.04)' },
  { id: 'film', name: 'Old film', css: 'sepia(0.75) contrast(1.05)' },
];

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
  filter: 'none',      // the look
  brightness: 0,       // -50 to 50
  contrast: 0,         // -50 to 50
  previewUrl: null,    // your video, as a link the page can play
  resultUrl: null,     // the new video, as a link the page can play and save
  resultFile: null,    // the new video, as a file for sharing
  conversion: null,    // the video being made, so "Stop" can stop it
  making: false,
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
  if (name === 'look') el('preview').play().catch(() => {});
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
    state.filter = 'none';
    state.brightness = 0;
    state.contrast = 0;
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = URL.createObjectURL(file);
    el('preview').src = state.previewUrl;
    updateLook();
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

// ---------- Screen 2: the look ----------

function buildChips() {
  for (const filter of FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('role', 'radio');
    chip.dataset.filter = filter.id;
    chip.textContent = filter.name;
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

function selectTab(name) {
  for (const tab of ['filter', 'light']) {
    const chosen = tab === name;
    el('tab-' + tab).setAttribute('aria-selected', String(chosen));
    el('tab-' + tab).tabIndex = chosen ? 0 : -1;
    el('panel-' + tab).hidden = !chosen;
  }
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

// Why Mediabunny might leave out the picture or the sound, in plain words
const DROP_REASONS = {
  undecodable_source_codec: 'Chrome can\'t read it',
  no_encodable_target_codec: 'Chrome can\'t make it as MP4',
  unknown_source_codec: 'Chrome doesn\'t know what kind it is',
};

async function makeVideo() {
  hideProblem('look-problem');
  state.making = true;
  state.stopAsked = false;
  el('bar').value = 0;
  el('making-words').textContent = '0%';
  el('stop').disabled = false;
  goDeeper('making');

  const filter = lookFilter();
  const size = fitSize(state.facts.width, state.facts.height);
  const fps = chooseFps(state.facts.fps);
  const input = new MB.Input({ source: new MB.BlobSource(state.file), formats: MB.ALL_FORMATS });
  const output = new MB.Output({
    format: new MB.Mp4OutputFormat({ fastStart: 'in-memory' }), // the file's details at the front
    target: new MB.BufferTarget(),
  });

  // Keeps the screen from turning off while the video is made (if the phone allows it)
  let screenLock = null;
  try {
    if ('wakeLock' in navigator) screenLock = await navigator.wakeLock.request('screen');
  } catch (error) { /* the video still gets made */ }

  let canvas = null;
  try {
    // AAC sound: built into Chrome on the owner's phone (the phone test, November 2, 2026); the
    // add-on is only for a phone or browser without it
    if (state.facts.hasSound && !(await MB.canEncodeAudio('aac'))) await loadSoundAddon();

    const conversion = await MB.Conversion.init({
      input,
      output,
      tags: {},             // copy none of the original's tags, so hidden details stay behind
      showWarnings: false,  // the page explains problems itself
      video: {
        codec: 'avc',                       // H.264, the usual picture for MP4 files
        width: size.width,
        height: size.height,
        fit: 'fill',
        allowTransformationMetadata: false, // turn the picture upright now, instead of a "turn it" note in the file
        frameRate: fps,                     // a steady number of frames each second
        quality: new MB.Quality({ bitrate: chooseBitrate(size, fps), bitrateMode: 'variable' }),
        // Each frame is drawn onto a canvas with the look: the same CSS filter as the preview
        process: (sample) => {
          if (!canvas) canvas = new OffscreenCanvas(sample.displayWidth, sample.displayHeight);
          const context = canvas.getContext('2d');
          context.filter = filter || 'none';
          sample.draw(context, 0, 0);
          return canvas;
        },
      },
      audio: {
        codec: 'aac',              // AAC, the usual sound for MP4 files
        sampleRate: OUTPUT.sampleRate,
        numberOfChannels: OUTPUT.channels,
        forceTranscode: true,      // always make the sound fresh, so every video is the same kind
        quality: new MB.Quality({ bitrate: OUTPUT.audioBitrate }),
      },
    });
    state.conversion = conversion;
    if (state.stopAsked) {
      // "Stop" was tapped while the video was still being set up
      await conversion.cancel();
      throw new MB.ConversionCanceledError();
    }
    if (!conversion.isValid) {
      const why = conversion.discardedTracks
        .map((d) => (d.track.isVideoTrack() ? 'the picture: ' : 'the sound: ') + (DROP_REASONS[d.reason] || d.reason))
        .join('; ');
      throw new Error('Mediabunny couldn\'t set up the video (' + why + ').');
    }

    conversion.onProgress = (progress) => {
      const percent = Math.round(progress * 100);
      el('bar').value = percent;
      el('making-words').textContent = percent + '%';
    };
    await conversion.execute();

    const blob = new Blob([output.target.buffer], { type: 'video/mp4' });
    state.making = false;
    await showResult(blob);
  } catch (error) {
    const stopped = error instanceof MB.ConversionCanceledError || state.stopAsked;
    state.making = false;
    // Back to the look, with a note
    if (history.state && history.state.screen === 'making') history.back();
    else show('look');
    if (stopped) showProblem('look-problem', 'Stopped. Nothing was made.');
    else showProblem('look-problem', 'Making the video stopped with a problem. Send Claude a screenshot of this.', error);
  } finally {
    state.conversion = null;
    state.making = false;
    input.dispose();
    if (screenLock) screenLock.release().catch(() => {});
  }
}

function stopMaking() {
  state.stopAsked = true;
  el('stop').disabled = true;
  el('making-words').textContent = 'Stopping…';
  if (state.conversion) state.conversion.cancel();
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
updateLook();
el('choose').addEventListener('click', () => el('pick').click());
el('pick').addEventListener('change', () => {
  const file = el('pick').files[0];
  el('pick').value = ''; // so choosing the same video again still works
  if (file) readVideo(file);
});
el('look-back').addEventListener('click', () => history.back());
el('done-back').addEventListener('click', () => history.back());
el('tab-filter').addEventListener('click', () => selectTab('filter'));
el('tab-light').addEventListener('click', () => selectTab('light'));
el('chips').addEventListener('keydown', (event) => arrowKeys(event, [...el('chips').children], (chip) => {
  state.filter = chip.dataset.filter;
  updateLook();
}));
document.querySelector('.tabs').addEventListener('keydown', (event) => arrowKeys(event, [el('tab-filter'), el('tab-light')],
  (tab) => selectTab(tab.id === 'tab-filter' ? 'filter' : 'light')));
el('brightness').addEventListener('input', () => { state.brightness = Number(el('brightness').value); updateLook(); });
el('contrast').addEventListener('input', () => { state.contrast = Number(el('contrast').value); updateLook(); });
el('reset-light').addEventListener('click', () => { state.brightness = 0; state.contrast = 0; updateLook(); });
el('make').addEventListener('click', makeVideo);
el('stop').addEventListener('click', stopMaking);
el('share').addEventListener('click', share);
el('new-video').addEventListener('click', startOver);
history.replaceState({ screen: 'start' }, '');
followHistory();
