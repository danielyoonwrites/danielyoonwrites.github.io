// Video editor: the small server for the owner's AI captions (a Cloudflare Worker).
//
// What it does: the video editor, only on the owner's phone and only after he types his passcode,
// sends a short piece of a video's sound. This server checks the passcode, passes the sound to
// Cloudflare's speech-to-text AI (Workers AI's Whisper), and sends back each word it heard, with
// the moment it starts and ends. That's all it does.
//
// What it keeps: nothing. It saves no sound, no words and no passcode, and it writes nothing to a
// log: the logs are off in wrangler.jsonc, and this file never uses console.log.
//
// Why a server: the website is public, so anything in the app could be copied. The passcode is NOT
// in this file. It's saved in Cloudflare's dashboard as a secret named CAPTIONS_PASSCODE.
//
// How it's updated: after each merge to main, Cloudflare deploys this file by itself (Workers
// Builds, which the owner connects once, with build step 7a), using the settings in wrangler.jsonc
// next to it.
//
// The whole plan: video-editor/SPEC.md, "AI captions, only for the owner."
// The saved checks: video-editor/tests/server-test.mjs (with a stand-in for the AI).


// ---------- Settings ----------

// The only website allowed to use this server: the video editor's own address
const APP_ADDRESS = 'https://danielyoonwrites.github.io';

// Cloudflare's Whisper model: it times each word and knows Korean (SPEC.md, "Cost and limits")
const MODEL = '@cf/openai/whisper-large-v3-turbo';

// The languages the app offers: English and Korean (한국어)
const LANGUAGES = ['en', 'ko'];

// The most sound one request may carry, in letters of base64 (the way the app writes the sound as
// text). 700,000 letters is about 16 seconds of the app's sound (one channel, 16,000 samples a
// second), so the app sends pieces of up to 15 seconds. Why a limit: on Cloudflare's free plan each
// request gets 10 thousandths of a second of the server's own work, and every letter costs a little
// of it (measured on Claude's computer, November 4, 2026: about 3.6 thousandths for 700,000 letters
// and 5 for a million, with now and then a jump of 10 or more while memory is tidied up).
const MOST_SOUND = 700000;


// ---------- Answering the app ----------

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin);
    const url = new URL(request.url);

    // The browser asks first whether it may send (a "preflight" check)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: origin === APP_ADDRESS ? 204 : 403, headers: cors });
    }

    // Opening the server's address in a browser shows whether it's running and set up
    if (request.method === 'GET' && url.pathname === '/') return statusPage(env);

    if (request.method !== 'POST' || url.pathname !== '/captions') return reply({ error: 'not-found' }, 404, cors);
    if (origin !== APP_ADDRESS) return reply({ error: 'not-allowed' }, 403, cors);

    // Without the passcode secret or the AI, nothing goes further
    const missing = [];
    if (!env.CAPTIONS_PASSCODE) missing.push('passcode');
    if (!env.AI) missing.push('ai');
    if (missing.length) return reply({ error: 'not-set-up', missing }, 503, cors);

    // The passcode, checked before anything else happens
    if (!(await samePasscode(passcodeFrom(request), env.CAPTIONS_PASSCODE))) {
      return reply({ error: 'wrong-passcode' }, 401, cors);
    }

    const language = url.searchParams.get('language') || 'en';
    if (!LANGUAGES.includes(language)) return reply({ error: 'bad-language' }, 400, cors);

    // The sound: base64 text, sent as it is to the AI (decoding it here would use up the
    // server's little time on the free plan)
    if (Number(request.headers.get('Content-Length')) > MOST_SOUND + 100) return reply({ error: 'too-big' }, 413, cors);
    const sound = (await request.text()).trim();
    if (!sound) return reply({ error: 'no-sound' }, 400, cors);
    if (sound.length > MOST_SOUND) return reply({ error: 'too-big' }, 413, cors);

    let answer;
    try {
      answer = await env.AI.run(MODEL, { audio: sound, task: 'transcribe', language });
    } catch (error) {
      const problem = aiProblem(error);
      return reply(problem.data, problem.status, cors);
    }
    return reply({ words: wordsFrom(answer), seconds: secondsFrom(answer) }, 200, cors);
  },
};


// ---------- The passcode ----------
// The app sends it in the Authorization header, written with encodeURIComponent so any letter can
// travel there. Capital letters and extra spaces don't matter (a phone's keyboard may add a capital).

function passcodeFrom(request) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return '';
  try {
    return decodeURIComponent(header.slice('Bearer '.length));
  } catch (error) {
    return ''; // a broken one is just a wrong passcode
  }
}

function tidyPasscode(text) {
  return String(text).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Compares the two scrambled (SHA-256), every byte, so the time it takes says nothing about how
// close a wrong passcode came
async function samePasscode(given, real) {
  if (!given) return false;
  const [a, b] = await Promise.all([scramble(tidyPasscode(given)), scramble(tidyPasscode(real))]);
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a[i] ^ b[i];
  return difference === 0;
}

async function scramble(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}


// ---------- What the AI sends back ----------
// Whisper sends "segments" (stretches of speech), each with its words and their times in seconds.
// The app needs only the words: { word, start, end }. If a segment ever comes without word times,
// its words share the segment's time evenly, marked "guessed".

function wordsFrom(answer) {
  const words = [];
  const segments = answer && Array.isArray(answer.segments) ? answer.segments : [];
  for (const segment of segments) {
    if (!segment) continue;
    const timed = Array.isArray(segment.words) ? segment.words.filter(Boolean) : [];
    if (timed.length) {
      for (const one of timed) {
        const word = String(one.word || '').trim();
        const start = Number(one.start);
        const end = Number(one.end);
        if (word && Number.isFinite(start) && Number.isFinite(end)) {
          words.push({ word, start: round(start), end: round(Math.max(start, end)) });
        }
      }
    } else {
      spread(words, segment.text, Number(segment.start), Number(segment.end));
    }
  }
  // Words but no segments at all: they share the whole piece's time
  if (!words.length && answer && answer.text) spread(words, answer.text, 0, secondsFrom(answer));
  return words;
}

function spread(words, text, start, end) {
  const pieces = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!pieces.length || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
  const each = (end - start) / pieces.length;
  pieces.forEach((word, i) => {
    words.push({ word, start: round(start + i * each), end: round(start + (i + 1) * each), guessed: true });
  });
}

function secondsFrom(answer) {
  const seconds = Number(answer && answer.transcription_info && answer.transcription_info.duration);
  return Number.isFinite(seconds) ? round(seconds) : null;
}

const round = (seconds) => Math.round(seconds * 100) / 100;


// ---------- When the AI doesn't answer ----------
// Workers AI's errors carry a number (Cloudflare's list: workers-ai/platform/errors.mdx, read
// November 4, 2026). Only the number goes back to the app, never the message. The two that matter
// most are also known by their words, in case a message ever comes without its number.

function aiProblem(error) {
  const message = String((error && error.message) || error);
  const found = message.match(/\b(\d{4})\b/);
  const code = found ? Number(found[1]) : null;
  if (code === 3036 || /daily free allocation/i.test(message)) {
    return { status: 429, data: { error: 'used-up' } };                    // today's free allowance is used up
  }
  if (code === 3040 || /capacity temporarily exceeded/i.test(message)) {
    return { status: 503, data: { error: 'busy' } };                       // Cloudflare's AI is busy: try again
  }
  if (code === 3006) return { status: 413, data: { error: 'too-big' } };
  if (code === 3007 || code === 3008) return { status: 504, data: { error: 'timeout' } };
  if (code === 5004) return { status: 400, data: { error: 'bad-sound' } }; // the sound wasn't base64
  return { status: 502, data: { error: 'ai-failed', code } };
}


// ---------- Small helpers ----------

function statusPage(env) {
  const lines = [
    'The video editor\'s captions server is running.',
    env.CAPTIONS_PASSCODE
      ? 'Its passcode is set up.'
      : 'Its passcode is not set up yet: add the secret CAPTIONS_PASSCODE in Cloudflare.',
    env.AI ? 'Its AI is connected.' : 'Its AI is not connected (the "ai" setting in wrangler.jsonc).',
    'It only answers the video editor, with the owner\'s passcode.',
  ];
  return new Response(lines.join('\n') + '\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (origin === APP_ADDRESS) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function reply(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
