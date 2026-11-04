// Checks for the captions server (server/worker.js, build step 7a), with a stand-in for Cloudflare's
// AI: nothing real is called, and no real passcode is used. Written November 4, 2026.
// Run from the repository folder: node video-editor/tests/server-test.mjs
// Needs Node 22 or newer. Success ends with "... passed, 0 failed".
// The real AI (Whisper on the owner's Cloudflare account) is checked on his phone: SPEC.md,
// "AI captions, only for the owner," and PROGRESS.md.
import { copyFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';

// worker.js is copied to a temporary folder as a module (.mjs), so Node can load it
const here = (file) => fileURLToPath(new URL(file, import.meta.url));
const work = mkdtempSync(path.join(os.tmpdir(), 'video-editor-server-tests-'));
copyFileSync(here('../server/worker.js'), path.join(work, 'worker.mjs'));
const worker = (await import(pathToFileURL(path.join(work, 'worker.mjs')).href)).default;

let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

// Anything the server writes to a log is counted (it should write nothing)
const logged = [];
for (const kind of ['log', 'info', 'warn', 'error', 'debug']) {
  const original = console[kind].bind(console);
  console[kind] = (...words) => {
    if (words[0] === 'FAIL:' || String(words[0]).startsWith('Server')) return original(...words);
    logged.push(kind);
    return original(...words);
  };
}

const APP = 'https://danielyoonwrites.github.io';
const SERVER = 'https://video-editor-captions.danyoonsignup.workers.dev';
const PASSCODE = 'made up words for checks'; // a stand-in, never the owner's
const SOUND = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA='; // a tiny WAV, as base64

// The stand-in for Workers AI: it remembers what it was asked and answers like Whisper
function standInAI(answer = whisperLike(), problem = null) {
  return {
    calls: [],
    async run(model, input) {
      this.calls.push({ model, input });
      if (problem) throw new Error(problem);
      return typeof answer === 'function' ? answer(input) : answer;
    },
  };
}
function whisperLike() {
  return {
    transcription_info: { language: 'en', language_probability: 0.99, duration: 2.5049, duration_after_vad: 2.5 },
    text: ' Three things I wish I knew.',
    word_count: 6,
    segments: [{
      start: 0.0, end: 2.4, text: ' Three things I wish I knew.',
      words: [
        { word: ' Three', start: 0.004, end: 0.3333 }, { word: ' things', start: 0.3333, end: 0.71 },
        { word: ' I', start: 0.8, end: 0.9 }, { word: ' wish', start: 0.9, end: 1.2 },
        { word: ' I', start: 1.2, end: 1.3 }, { word: ' knew.', start: 1.3, end: 1.25 },
      ],
    }],
    vtt: 'WEBVTT',
  };
}
const setUp = (ai = standInAI()) => ({ CAPTIONS_PASSCODE: PASSCODE, AI: ai });

function ask({ method = 'POST', where = '/captions?language=en', origin = APP, passcode = PASSCODE,
  body = SOUND, headers = {} } = {}) {
  const sent = { ...headers };
  if (origin) sent.Origin = origin;
  if (passcode !== null) sent.Authorization = 'Bearer ' + encodeURIComponent(passcode);
  if (method === 'POST') sent['Content-Type'] = sent['Content-Type'] || 'text/plain';
  return new Request(SERVER + where, { method, headers: sent, body: method === 'POST' ? body : undefined });
}
async function answerOf(response) {
  const words = await response.text();
  try { return { status: response.status, data: JSON.parse(words), words, headers: response.headers }; }
  catch (error) { return { status: response.status, data: null, words, headers: response.headers }; }
}
const send = async (env, options) => answerOf(await worker.fetch(ask(options), env));

// ---------- S1. Opening the address in a browser ----------
{
  let page = await answerOf(await worker.fetch(new Request(SERVER + '/'), setUp()));
  check('S1 the address shows the server is running', page.status === 200 && page.words.includes('captions server is running'), page.words);
  check('S1 it says the passcode and the AI are set up', page.words.includes('passcode is set up') && page.words.includes('AI is connected'), page.words);
  check('S1 it never shows the passcode', !page.words.includes(PASSCODE));
  check('S1 it is never kept by a browser (no-store)', page.headers.get('cache-control') === 'no-store');
  page = await answerOf(await worker.fetch(new Request(SERVER + '/'), {}));
  check('S1 before the setup it says what is missing', page.words.includes('not set up yet') && page.words.includes('CAPTIONS_PASSCODE') && page.words.includes('not connected'), page.words);
}

// ---------- S2. Only the video editor's address ----------
{
  const ai = standInAI();
  let response = await worker.fetch(new Request(SERVER + '/captions', { method: 'OPTIONS', headers: { Origin: APP } }), setUp(ai));
  check('S2 the browser\'s first question from the app: yes (204)', response.status === 204);
  check('S2 ...for the app\'s address only', response.headers.get('access-control-allow-origin') === APP);
  check('S2 ...with the passcode header and POST allowed',
    /authorization/.test(response.headers.get('access-control-allow-headers')) && /POST/.test(response.headers.get('access-control-allow-methods')));
  response = await worker.fetch(new Request(SERVER + '/captions', { method: 'OPTIONS', headers: { Origin: 'https://example.com' } }), setUp(ai));
  check('S2 another website\'s first question: no (403)', response.status === 403 && !response.headers.get('access-control-allow-origin'));
  let answer = await send(setUp(ai), { origin: 'https://example.com' });
  check('S2 another website is refused (403)', answer.status === 403 && answer.data.error === 'not-allowed');
  answer = await send(setUp(ai), { origin: null });
  check('S2 a request from no website is refused too', answer.status === 403);
  answer = await send(setUp(ai), { origin: 'https://danielyoonwrites.github.io.example.com' });
  check('S2 a look-alike address is refused', answer.status === 403);
  answer = await send(setUp(ai), { where: '/other' });
  check('S2 any other address on the server: not found (404)', answer.status === 404);
  answer = await send(setUp(ai), { method: 'GET', where: '/captions' });
  check('S2 GET on /captions: not found (404)', answer.status === 404);
  check('S2 the AI was never asked', ai.calls.length === 0, String(ai.calls.length));
}

// ---------- S3. Before the setup in Cloudflare ----------
{
  let answer = await send({ AI: standInAI() });
  check('S3 without the passcode secret: "not set up" (503)', answer.status === 503 && answer.data.error === 'not-set-up'
    && answer.data.missing.join() === 'passcode', answer.words);
  answer = await send({ CAPTIONS_PASSCODE: PASSCODE });
  check('S3 without the AI: "not set up" (503), the AI is missing', answer.status === 503 && answer.data.missing.join() === 'ai', answer.words);
}

// ---------- S4. The passcode ----------
{
  const ai = standInAI();
  for (const [what, passcode, headers] of [
    ['a wrong passcode', 'made up words for check', {}],
    ['no passcode', null, {}],
    ['an empty passcode', '', {}],
    ['the passcode without "Bearer"', null, { Authorization: encodeURIComponent(PASSCODE) }],
    ['a broken one', null, { Authorization: 'Bearer %E0%A4%A' }],
  ]) {
    const answer = await send(setUp(ai), { passcode, headers });
    check(`S4 ${what}: refused (401)`, answer.status === 401 && answer.data.error === 'wrong-passcode', answer.words);
  }
  check('S4 the AI was never asked for a wrong passcode', ai.calls.length === 0);
  let answer = await send(setUp(ai), { passcode: '  Made UP words   for Checks ' });
  check('S4 capital letters and extra spaces don\'t matter', answer.status === 200, answer.words);
  const korean = '맑은 하늘 우유빛 복숭아';
  answer = await send({ CAPTIONS_PASSCODE: korean, AI: standInAI() }, { passcode: korean.normalize('NFD') });
  check('S4 a passcode in Korean works, however the keyboard wrote its letters', answer.status === 200, answer.words);
  const source = readFileSync(here('../server/worker.js'), 'utf8');
  check('S4 the passcode is compared scrambled (SHA-256), byte by byte', /SHA-256/.test(source) && /\^ b\[i\]/.test(source));
}

// ---------- S5. The sound and the language ----------
{
  let ai = standInAI();
  let answer = await send(setUp(ai));
  check('S5 the right passcode and some sound: words come back (200)', answer.status === 200 && Array.isArray(answer.data.words), answer.words);
  check('S5 the AI gets the Whisper model', ai.calls[0] && ai.calls[0].model === '@cf/openai/whisper-large-v3-turbo');
  check('S5 ...the sound exactly as sent, to transcribe, in English',
    ai.calls[0] && ai.calls[0].input.audio === SOUND && ai.calls[0].input.task === 'transcribe' && ai.calls[0].input.language === 'en',
    JSON.stringify(ai.calls[0] && { ...ai.calls[0].input, audio: ai.calls[0].input.audio.length }));
  check('S5 ...and nothing else (no passcode)', ai.calls[0] && Object.keys(ai.calls[0].input).sort().join() === 'audio,language,task');
  answer = await send(setUp(ai), { where: '/captions?language=ko' });
  check('S5 한국어: the AI is told Korean', answer.status === 200 && ai.calls.at(-1).input.language === 'ko');
  answer = await send(setUp(ai), { where: '/captions' });
  check('S5 no language given: English', answer.status === 200 && ai.calls.at(-1).input.language === 'en');
  const calls = ai.calls.length;
  answer = await send(setUp(ai), { where: '/captions?language=fr' });
  check('S5 another language: refused (400)', answer.status === 400 && answer.data.error === 'bad-language');
  answer = await send(setUp(ai), { body: '   ' });
  check('S5 no sound: refused (400)', answer.status === 400 && answer.data.error === 'no-sound');
  answer = await send(setUp(ai), { body: 'A'.repeat(700001) });
  check('S5 more than 700,000 letters of sound (about 16 seconds): too big (413)', answer.status === 413 && answer.data.error === 'too-big');
  answer = await send(setUp(ai), { headers: { 'Content-Length': '5000000' } });
  check('S5 a request that says it\'s too big is refused before it\'s read', answer.status === 413);
  answer = await send(setUp(ai), { body: 'A'.repeat(700000) });
  check('S5 exactly 700,000 letters: taken', answer.status === 200);
  check('S5 the AI was asked only for the requests that passed', ai.calls.length === calls + 1, `${ai.calls.length} ${calls}`);
}

// ---------- S6. What goes back to the app ----------
{
  let answer = await send(setUp());
  const words = answer.data.words;
  check('S6 every word, in order', words.map((w) => w.word).join(' ') === 'Three things I wish I knew.', JSON.stringify(words));
  check('S6 the spaces around each word are gone', words.every((w) => w.word === w.word.trim()));
  check('S6 times in hundredths of a second', words[0].start === 0 && words[0].end === 0.33 && words[1].start === 0.33, JSON.stringify(words.slice(0, 2)));
  check('S6 a word never ends before it starts', words.every((w) => w.end >= w.start) && words[5].end === 1.3, JSON.stringify(words[5]));
  check('S6 the piece\'s length in seconds', answer.data.seconds === 2.5, String(answer.data.seconds));
  check('S6 nothing else goes back (no text file, no other details)', Object.keys(answer.data).sort().join() === 'seconds,words');
  check('S6 the answer is for the app\'s address, and never kept (no-store)',
    answer.headers.get('access-control-allow-origin') === APP && answer.headers.get('cache-control') === 'no-store'
    && answer.headers.get('content-type') === 'application/json');

  answer = await send(setUp(standInAI({ text: ' Hello there friend', segments: [{ start: 1, end: 2.5, text: ' Hello there friend' }] })));
  check('S6 a stretch of speech without word times: its words share its time, marked "guessed"',
    JSON.stringify(answer.data.words) === JSON.stringify([
      { word: 'Hello', start: 1, end: 1.5, guessed: true }, { word: 'there', start: 1.5, end: 2, guessed: true },
      { word: 'friend', start: 2, end: 2.5, guessed: true }]), answer.words);
  answer = await send(setUp(standInAI({ text: ' 안녕하세요 여러분', transcription_info: { duration: 2 } })));
  check('S6 words but no stretches at all: they share the whole piece', answer.data.words.length === 2
    && answer.data.words[1].end === 2 && answer.data.words[0].word === '안녕하세요', answer.words);
  answer = await send(setUp(standInAI({ text: '', segments: [], transcription_info: { duration: 1 } })));
  check('S6 silence: no words, and no problem (200)', answer.status === 200 && answer.data.words.length === 0 && answer.data.seconds === 1, answer.words);
  answer = await send(setUp(standInAI({ text: ' Hi', segments: [null, { start: 0, end: 1, text: ' Hi', words: [null, { word: ' Hi', start: 0, end: 0.5 }] }] })));
  check('S6 an empty entry in what the AI sends is skipped, not a problem', answer.status === 200
    && JSON.stringify(answer.data.words) === JSON.stringify([{ word: 'Hi', start: 0, end: 0.5 }]), answer.words);
  answer = await send(setUp(standInAI({ text: '' })));
  check('S6 an answer with almost nothing in it: no words, no length', answer.status === 200 && answer.data.words.length === 0 && answer.data.seconds === null, answer.words);
}

// ---------- S7. When the AI doesn't answer ----------
{
  for (const [message, status, error] of [
    ['3036: You have used up your daily free allocation of 10,000 neurons. Please upgrade to Cloudflare\'s Workers Paid plan if you would like to continue usage.', 429, 'used-up'],
    ['You have used up your daily free allocation of 10,000 neurons (no number this time)', 429, 'used-up'],
    ['AiError: 3040: Capacity temporarily exceeded, please try again.', 503, 'busy'],
    ['Capacity temporarily exceeded, please try again (no number this time)', 503, 'busy'],
    ['3006: Request is too large', 413, 'too-big'],
    ['3007: Request timeout', 504, 'timeout'],
    ['3008: Request was aborted', 504, 'timeout'],
    ['5004: Invalid data type for base64 input: string', 400, 'bad-sound'],
    ['5007: No such model @cf/openai/whisper-large-v3-turbo or task', 502, 'ai-failed'],
    ['something went wrong', 502, 'ai-failed'],
  ]) {
    const answer = await send(setUp(standInAI(undefined, message)));
    check(`S7 "${message.slice(0, 32)}…": ${status} ${error}`, answer.status === status && answer.data.error === error, answer.words);
    check(`S7 ...and the AI's own words don't go back (${error})`, !answer.words.includes(message.slice(6, 30)));
  }
  let answer = await send(setUp(standInAI(undefined, '5007: No such model')));
  check('S7 an unknown problem sends back its number, for Claude', answer.data.code === 5007, answer.words);
  answer = await send(setUp(standInAI(undefined, 'something went wrong')));
  check('S7 ...or no number when there is none', answer.data.code === null, answer.words);
}

// ---------- S8. Nothing kept, nothing logged ----------
{
  check('S8 the server wrote nothing to the log', logged.length === 0, logged.join());
  const source = readFileSync(here('../server/worker.js'), 'utf8');
  check('S8 worker.js never uses console (so nothing reaches Cloudflare\'s logs)', !/console\./.test(source.replace(/^\s*\/\/.*$/gm, '')));
  check('S8 worker.js keeps nothing: no database, no storage', !/env\.(DB|KV)|caches\.|\.put\(/.test(source));
}

// ---------- S9. The settings, and the app's address for the server ----------
{
  const settings = readJsonc(here('../server/wrangler.jsonc'));
  check('S9 the Worker is named video-editor-captions', settings.name === 'video-editor-captions');
  check('S9 it runs worker.js', settings.main === 'worker.js');
  check('S9 the same date as Living in the Word\'s server', settings.compatibility_date === '2026-10-26');
  check('S9 one address: workers.dev on, version addresses off', settings.workers_dev === true && settings.preview_urls === false);
  check('S9 the AI is connected as AI (env.AI in worker.js)', settings.ai && settings.ai.binding === 'AI');
  check('S9 logs off', settings.observability && settings.observability.enabled === false);
  check('S9 no variables or secrets in the file', !('vars' in settings) && !/passcode/i.test(JSON.stringify(settings)));
  const address = `https://${settings.name}.danyoonsignup.workers.dev`;
  const app = readFileSync(here('../app.js'), 'utf8');
  check('S9 app.js sends to this Worker\'s address', app.includes(`'${address}'`), address);
  const page = readFileSync(here('../index.html'), 'utf8');
  const rule = (page.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  const connect = (rule.match(/connect-src ([^;]*)/) || [])[1] || '';
  check('S9 the page\'s safety rule lets it talk to this one server, and no other', connect.trim() === address, connect);
}

// ---------- How much of the server's own time the biggest piece takes (a note, not a check) ----------
// The stand-in AI writes what it's given as JSON, like sending it on. The middle of 41 tries is shown:
// now and then one try takes much longer, while memory is tidied up.
{
  const env = setUp(standInAI((input) => (JSON.stringify(input).length ? whisperLike() : null)));
  const big = 'A'.repeat(700000);
  const times = [];
  for (let i = 0; i < 41; i += 1) {
    const request = ask({ body: big });
    const started = performance.now();
    await worker.fetch(request, env);
    times.push(performance.now() - started);
  }
  times.sort((a, b) => a - b);
  console.log(`Server's own work for the biggest piece (700,000 letters, about 16 seconds of sound), on this computer: about ${times[20].toFixed(1)} ms`
    + ' in the middle of 41 tries (Cloudflare\'s free plan allows 10 ms a request).');
}

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

// wrangler.jsonc is JSON with comments: take out the comments (outside the quoted words), then read it
function readJsonc(file) {
  const text = readFileSync(file, 'utf8');
  let out = '';
  let inWords = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inWords) {
      out += c;
      if (c === '\\') { out += text[i + 1]; i += 1; } else if (c === '"') inWords = false;
    } else if (c === '"') { inWords = true; out += c; }
    else if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i += 1; out += '\n'; }
    else if (c === '/' && text[i + 1] === '*') { i = text.indexOf('*/', i + 2) + 1; }
    else out += c;
  }
  return JSON.parse(out);
}
