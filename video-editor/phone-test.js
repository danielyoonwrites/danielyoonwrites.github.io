'use strict';

/*
  Phone test for the video editor (build step 2 in SPEC.md).

  1. It checks what Chrome on this phone can do.
  2. You choose a video; it says what kind of video it is and whether Chrome can read it.
  3. It makes a black-and-white copy of the first 5 seconds, as an MP4 file (H.264 picture, AAC sound),
     times it, checks that the copy plays and carries no hidden details like where it was filmed,
     and offers "Save to phone" and "Share."

  Nothing leaves the phone. Mediabunny (lib/mediabunny.min.js, loaded before this file) reads and
  writes the video files; its guide is at https://mediabunny.dev
*/

const MB = window.Mediabunny;

const COPY_SECONDS = 5;   // how much of the video the test copies
const LONG_SIDE = 1920;   // the copy's longest side, at most, in pixels (Reels are 1080 by 1920)
const ADDON_URL = 'lib/mediabunny-aac-encoder.min.js?v=1.65.0'; // AAC sound, only if Chrome can't make it

// What the test knows so far
const state = {
  file: null,         // the video you chose (it's only read, never changed)
  duration: 0,        // its length, in seconds
  width: 0,           // its width and height as it shows on screen (after any turn)
  height: 0,
  hasSound: false,
  location: null,     // true, false, or null when it couldn't be checked
  conversion: null,   // the copy being made, so "Stop" can stop it
  stopAsked: false,   // "Stop" was tapped (maybe before the copy had really started)
  copyUrl: null,      // the finished copy, as a link the page can play and save
};

const el = (id) => document.getElementById(id);

// ---------- Small helpers for the page ----------

// Fills in one line of a checklist: state is 'yes' (✓), 'no' (✗) or 'wait' (…)
function setCheck(id, result, note) {
  const line = el(id);
  line.classList.remove('yes', 'no');
  if (result === 'yes') line.classList.add('yes');
  if (result === 'no') line.classList.add('no');
  line.querySelector('.mark').textContent = result === 'yes' ? '✓' : result === 'no' ? '✗' : '…';
  if (note !== undefined) line.querySelector('.note').textContent = note;
}

// Fills in a line whose words change completely (the lines about your video and the copy)
function setLine(id, wordsId, result, words) {
  const line = el(id);
  line.classList.remove('yes', 'no');
  if (result === 'yes') line.classList.add('yes');
  if (result === 'no') line.classList.add('no');
  line.querySelector('.mark').textContent = result === 'yes' ? '✓' : result === 'no' ? '✗' : '…';
  el(wordsId).textContent = words;
}

// Shows a problem in plain words, with the technical details underneath for Claude
function showProblem(words, error) {
  const box = el('problem');
  box.textContent = words;
  if (error) {
    const details = document.createElement('span');
    details.className = 'details';
    details.textContent = 'Details: ' + (error.name || 'Error') + ': ' + (error.message || String(error));
    box.append(details);
  }
  box.hidden = false;
}

function hideProblem() {
  el('problem').hidden = true;
  el('problem').textContent = '';
}

// 75.4 → "1:15"
function formatTime(seconds) {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = String(whole % 60).padStart(2, '0');
  return minutes + ':' + rest;
}

// 5509994 → "5.5 MB"
function formatSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  return Math.max(1, Math.round(bytes / 1e3)) + ' KB';
}

// A wait, in words: 42 → "about 40 seconds", 150 → "about 3 minutes"
function formatWait(seconds) {
  if (seconds < 90) return 'about ' + Math.max(5, Math.round(seconds / 5) * 5) + ' seconds';
  return 'about ' + Math.round(seconds / 60) + ' minutes';
}

// Mediabunny's codec names, in the words people usually see
const CODEC_NAMES = {
  avc: 'H.264', hevc: 'HEVC (H.265)', vp8: 'VP8', vp9: 'VP9', av1: 'AV1', prores: 'ProRes',
  aac: 'AAC', opus: 'Opus', mp3: 'MP3', vorbis: 'Vorbis', flac: 'FLAC', ac3: 'AC-3', eac3: 'E-AC-3',
};
function codecName(codec) {
  return CODEC_NAMES[codec] || (codec ? String(codec).toUpperCase() : 'an unknown kind');
}

// The copy's size: the same shape as the video, with its longest side at most LONG_SIDE.
// Video sizes must be even numbers.
function fitSize(width, height) {
  const scale = Math.min(1, LONG_SIDE / Math.max(width, height));
  const even = (n) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
}

// ---------- Hidden details: is a location saved in the file? ----------
// An MP4 file is a row of boxes. The "moov" box holds the file's details, and phones save
// where a video was filmed inside it, as a "©xyz" or "loci" box (or Apple's
// "com.apple.quicktime.location"). This looks for those words inside "moov" only, so the
// picture data itself can't cause a false alarm. Answers true, false, or null (couldn't tell).

async function findMoov(blob) {
  let position = 0;
  while (position + 8 <= blob.size) {
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
    if (size < headerSize) return null; // not a box we understand
    if (type === 'moov') return blob.slice(position, position + size);
    position += size;
  }
  return null;
}

function containsBytes(bytes, pattern) {
  outer: for (let i = 0; i + pattern.length <= bytes.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) continue outer;
    }
    return true;
  }
  return false;
}

const LOCATION_MARKS = [
  [0xa9, 0x78, 0x79, 0x7a], // "©xyz"
  Array.from('loci', (c) => c.charCodeAt(0)),
  Array.from('quicktime.location', (c) => c.charCodeAt(0)),
];

async function hasLocation(blob) {
  try {
    const moov = await findMoov(blob);
    if (!moov) return null;
    const bytes = new Uint8Array(await moov.arrayBuffer());
    return LOCATION_MARKS.some((mark) => containsBytes(bytes, mark));
  } catch (error) {
    return null;
  }
}

// ---------- Part 1: what Chrome on this phone can do ----------

let addonLoading = null;
function loadAddon() {
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

function canShareFiles() {
  try {
    const sample = new File([new Uint8Array(8)], 'test.mp4', { type: 'video/mp4' });
    return Boolean(navigator.canShare && navigator.canShare({ files: [sample] }));
  } catch (error) {
    return false;
  }
}

async function describeBrowser() {
  // For example "Chrome 153 on Android 16, phone model SM-S948U". It's shown only on this screen.
  let words = navigator.userAgent;
  try {
    if (navigator.userAgentData) {
      const info = await navigator.userAgentData.getHighEntropyValues(['platformVersion', 'model']);
      const brands = navigator.userAgentData.brands || [];
      const chrome = brands.find((b) => b.brand === 'Google Chrome') || brands.find((b) => b.brand === 'Chromium');
      words = (chrome ? chrome.brand.replace('Google ', '') + ' ' + chrome.version : 'Chrome') +
        ' on ' + (navigator.userAgentData.platform || 'this device') +
        (info.platformVersion ? ' ' + info.platformVersion.split('.')[0] : '') +
        (info.model ? ', phone model ' + info.model : '');
    }
  } catch (error) {
    // keep the plain description
  }
  el('browser').textContent = 'This phone: ' + words + '.';
}

async function checkPhone() {
  describeBrowser();

  const hasTools = 'VideoEncoder' in window && 'AudioEncoder' in window && 'VideoDecoder' in window;
  setCheck('check-tools', hasTools ? 'yes' : 'no', hasTools ? 'yes' : 'no');

  if (!MB) {
    showProblem('The video library didn\'t load. Check your connection, then reload this page.');
    el('choose').disabled = true;
    return;
  }

  let videoOk = false;
  try {
    videoOk = hasTools && (await MB.canEncodeVideo('avc', { width: 1080, height: 1920 }));
  } catch (error) { /* stays false */ }
  setCheck('check-video', videoOk ? 'yes' : 'no', videoOk ? 'yes' : 'no');

  // AAC sound: built into Chrome, or else from the add-on
  let soundBuiltIn = false;
  try {
    soundBuiltIn = hasTools && (await MB.canEncodeAudio('aac'));
  } catch (error) { /* stays false */ }
  if (soundBuiltIn) {
    setCheck('check-sound', 'yes', 'yes, built in');
  } else {
    try {
      await loadAddon();
      const withAddon = await MB.canEncodeAudio('aac');
      setCheck('check-sound', withAddon ? 'yes' : 'no',
        withAddon ? 'yes, with the add-on (not built in)' : 'no, even with the add-on');
    } catch (error) {
      setCheck('check-sound', 'no', 'no (the add-on didn\'t load)');
    }
  }

  const filterOk = 'filter' in CanvasRenderingContext2D.prototype;
  setCheck('check-filter', filterOk ? 'yes' : 'no', filterOk ? 'yes' : 'no');

  const shareOk = canShareFiles();
  setCheck('check-share', shareOk ? 'yes' : 'no', shareOk ? 'yes' : 'no');

  const awakeOk = 'wakeLock' in navigator;
  setCheck('check-awake', awakeOk ? 'yes' : 'no', awakeOk ? 'yes' : 'no');

  if (!hasTools) {
    showProblem('Chrome on this phone doesn\'t have the video tools the app needs (WebCodecs).');
    el('choose').disabled = true;
  }
}

// ---------- Part 2: choose a video ----------

async function readVideo(file) {
  hideProblem();
  el('result').hidden = true;
  el('make').hidden = true;
  el('info').hidden = false;
  el('facts').textContent = 'Reading your video…';
  setLine('check-read', 'read-words', 'wait', 'Checking whether Chrome can read it');
  state.file = file;

  const input = new MB.Input({ source: new MB.BlobSource(file), formats: MB.ALL_FORMATS });
  try {
    const video = await input.getPrimaryVideoTrack();
    if (!video) {
      el('facts').textContent = 'This file has no picture in it.';
      setLine('check-read', 'read-words', 'no', 'Choose a video instead');
      return;
    }
    const audio = await input.getPrimaryAudioTrack();
    state.duration = await input.computeDuration();
    state.width = await video.getDisplayWidth();
    state.height = await video.getDisplayHeight();
    state.hasSound = Boolean(audio);
    const videoCodec = await video.getCodec();
    const audioCodec = audio ? await audio.getCodec() : null;

    // The video's facts, for example "0:42 long · 1080 × 1920 · H.264 picture · AAC sound · 52.3 MB"
    // (the file's name isn't shown: names can be personal)
    el('facts').textContent = [
      formatTime(state.duration) + ' long',
      state.width + ' × ' + state.height,
      codecName(videoCodec) + ' picture',
      audio ? codecName(audioCodec) + ' sound' : 'no sound',
      formatSize(file.size),
    ].join(' · ');

    const canReadPicture = await video.canDecode();
    const canReadSound = audio ? await audio.canDecode() : true;
    if (!canReadPicture) {
      setLine('check-read', 'read-words', 'no',
        'Chrome can\'t read this kind of picture: ' + codecName(videoCodec) + '. Try another video, and tell Claude about this one.');
      return;
    }
    if (!canReadSound) {
      setLine('check-read', 'read-words', 'no',
        'Chrome can read the picture but not the sound (' + codecName(audioCodec) + '). The copy will have no sound.');
    } else {
      setLine('check-read', 'read-words', 'yes', 'Chrome can read it');
    }
    state.location = await hasLocation(file);
    el('make').hidden = false;
  } catch (error) {
    el('facts').textContent = 'Chrome couldn\'t open this file as a video.';
    setLine('check-read', 'read-words', 'no', 'Try another video');
    showProblem('Chrome couldn\'t open this file as a video.', error);
  } finally {
    input.dispose();
  }
}

// ---------- Part 3: make the copy ----------

// Why Mediabunny might leave out the picture or the sound, in plain words
const DROP_REASONS = {
  undecodable_source_codec: 'Chrome can\'t read it',
  no_encodable_target_codec: 'Chrome can\'t make it as MP4',
  unknown_source_codec: 'Chrome doesn\'t know what kind it is',
};

async function makeCopy() {
  hideProblem();
  el('result').hidden = true;
  el('make').hidden = true;
  el('choose').disabled = true;
  el('working').hidden = false;
  el('bar').value = 0;
  el('stop').disabled = false;
  el('working-words').textContent = 'Making the copy… 0%';
  state.stopAsked = false;
  if (state.copyUrl) {
    URL.revokeObjectURL(state.copyUrl);
    state.copyUrl = null;
  }

  const seconds = Math.min(COPY_SECONDS, state.duration);
  const size = fitSize(state.width, state.height);
  const input = new MB.Input({ source: new MB.BlobSource(state.file), formats: MB.ALL_FORMATS });
  const output = new MB.Output({ format: new MB.Mp4OutputFormat(), target: new MB.BufferTarget() });

  // Keeps the screen from turning off while the copy is made (if the phone allows it)
  let screenLock = null;
  try {
    if ('wakeLock' in navigator) screenLock = await navigator.wakeLock.request('screen');
  } catch (error) { /* the copy still gets made */ }

  const started = performance.now();
  let canvas = null;
  try {
    const conversion = await MB.Conversion.init({
      input,
      output,
      trim: { start: 0, end: seconds },
      tags: {},             // copy none of the original's tags, so hidden details stay behind
      showWarnings: false,  // the page explains problems itself
      video: {
        codec: 'avc',                       // H.264, the usual picture for MP4 files
        width: size.width,
        height: size.height,
        fit: 'fill',
        allowTransformationMetadata: false, // turn the picture upright now, instead of a "turn it" note in the file
        quality: MB.QUALITY_HIGH,
        // Each frame is drawn onto a canvas with a black-and-white filter: the same way the app
        // will add filters, lighting and text later
        process: (sample) => {
          if (!canvas) {
            canvas = new OffscreenCanvas(sample.displayWidth, sample.displayHeight);
            canvas.getContext('2d').filter = 'grayscale(1)';
          }
          sample.draw(canvas.getContext('2d'), 0, 0);
          return canvas;
        },
      },
      audio: {
        codec: 'aac',          // AAC, the usual sound for MP4 files
        forceTranscode: true,  // make the sound fresh, to test that Chrome can
        quality: MB.QUALITY_HIGH,
      },
    });
    state.conversion = conversion;
    if (state.stopAsked) {
      // "Stop" was tapped while the copy was still being set up
      await conversion.cancel();
      throw new MB.ConversionCanceledError();
    }

    if (!conversion.isValid) {
      const why = conversion.discardedTracks
        .map((d) => (d.track.isVideoTrack() ? 'the picture: ' : 'the sound: ') + (DROP_REASONS[d.reason] || d.reason))
        .join('; ');
      throw new Error('Mediabunny couldn\'t set up the copy (' + why + ').');
    }
    const soundDropped = conversion.discardedTracks.find((d) => d.track.isAudioTrack());

    conversion.onProgress = (progress) => {
      const percent = Math.round(progress * 100);
      el('bar').value = percent;
      el('working-words').textContent = 'Making the copy… ' + percent + '%';
    };
    await conversion.execute();
    const took = (performance.now() - started) / 1000;

    const blob = new Blob([output.target.buffer], { type: 'video/mp4' });
    el('working').hidden = true;
    await showResult(blob, seconds, took, soundDropped);
  } catch (error) {
    el('working').hidden = true;
    if (error instanceof MB.ConversionCanceledError || state.stopAsked) {
      showProblem('Stopped. Nothing was made.');
    } else {
      showProblem('Making the copy stopped with a problem. Send Claude a screenshot of this.', error);
    }
    el('make').hidden = false;
  } finally {
    state.conversion = null;
    el('choose').disabled = false;
    input.dispose();
    if (screenLock) screenLock.release().catch(() => {});
  }
}

async function showResult(blob, seconds, took, soundDropped) {
  el('result').hidden = false;
  el('make').hidden = false;

  // How long it took, and a rough guess for a 3-minute video
  const faster = seconds / took;
  setLine('check-time', 'time-words', 'yes',
    'Made ' + Math.round(seconds * 10) / 10 + ' seconds of video in ' + took.toFixed(1) + ' seconds (' +
    (faster >= 1 ? faster.toFixed(1) + ' times faster than playing it)' : (1 / faster).toFixed(1) + ' times slower than playing it)'));
  el('guess').textContent = 'At this speed, a 3-minute video would take ' + formatWait((180 / seconds) * took) +
    ' (a rough guess). The copy is ' + formatSize(blob.size) + '.';

  // Does it play? The page reads the copy back and loads it into the player
  state.copyUrl = URL.createObjectURL(blob);
  const player = el('copy');
  setLine('check-plays', 'plays-words', 'wait', 'Checking that it plays');
  const loaded = await new Promise((resolve) => {
    const done = (ok) => {
      player.removeEventListener('loadedmetadata', onLoad);
      player.removeEventListener('error', onError);
      resolve(ok);
    };
    const onLoad = () => done(true);
    const onError = () => done(false);
    player.addEventListener('loadedmetadata', onLoad);
    player.addEventListener('error', onError);
    setTimeout(() => done(false), 15000);
    player.src = state.copyUrl;
  });
  let soundWords = 'no sound';
  try {
    const check = new MB.Input({ source: new MB.BlobSource(blob), formats: MB.ALL_FORMATS });
    const audio = await check.getPrimaryAudioTrack();
    if (audio) soundWords = codecName(await audio.getCodec()) + ' sound';
    check.dispose();
  } catch (error) { /* keep "no sound" */ }
  if (!state.hasSound) soundWords += ' (your video had none)';
  else if (soundDropped) soundWords += ' (' + (DROP_REASONS[soundDropped.reason] || soundDropped.reason) + ')';
  const soundOk = !state.hasSound || (!soundDropped && soundWords.startsWith('AAC'));
  if (loaded) {
    setLine('check-plays', 'plays-words', soundOk ? 'yes' : 'no',
      'It plays: ' + formatTime(player.duration) + ' long, ' + player.videoWidth + ' × ' + player.videoHeight + ', with ' + soundWords);
  } else {
    setLine('check-plays', 'plays-words', 'no', 'Chrome couldn\'t play the copy');
  }

  // Hidden details: a location in the original, and none in the copy
  const copyLocation = await hasLocation(blob);
  if (copyLocation === true) {
    setLine('check-hidden', 'hidden-words', 'no', 'The copy still has a location saved in it');
  } else if (copyLocation === null) {
    setLine('check-hidden', 'hidden-words', 'no', 'Couldn\'t check the copy for a location');
  } else if (state.location === true) {
    setLine('check-hidden', 'hidden-words', 'yes', 'Your video has a location saved in it; the copy doesn\'t');
  } else {
    setLine('check-hidden', 'hidden-words', 'yes', 'No location in the copy (none found in your video either)');
  }

  // Save to phone, and Share
  el('save').href = state.copyUrl;
  const file = new File([blob], 'video-editor-test.mp4', { type: 'video/mp4' });
  el('share').hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
  el('share').onclick = () => {
    navigator.share({ files: [file], title: 'Video editor test' }).catch((error) => {
      if (error.name !== 'AbortError') showProblem('Sharing didn\'t work.', error);
    });
  };
  // Bring "The copy" to the top of the screen, and move the keyboard and screen readers there too
  el('result-title').focus({ preventScroll: true });
  el('result').scrollIntoView({ block: 'start' });
}

// ---------- Start ----------

el('choose').addEventListener('click', () => el('pick').click());
el('pick').addEventListener('change', () => {
  const file = el('pick').files[0];
  if (file) readVideo(file);
  el('pick').value = ''; // so choosing the same video again still works
});
el('make').addEventListener('click', makeCopy);
el('stop').addEventListener('click', () => {
  state.stopAsked = true;
  el('stop').disabled = true;
  el('working-words').textContent = 'Stopping…';
  if (state.conversion) state.conversion.cancel();
});

checkPhone();
