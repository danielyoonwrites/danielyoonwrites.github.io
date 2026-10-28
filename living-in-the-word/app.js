// Living in the Word: shows one screen at a time. It writes 3 to 5 questions for a Bible
// passage with the AI helper (they stay only while the page is open), and keeps a
// daily reading plan (saved on this phone).
// Only the passage name is sent to the app's own small server (the AI helper, see
// AI-PLAN.md), and to sign in, the email address you type (see "Signing in" below).
// See SPEC.md for the plan.


// ---------- General questions ----------
// Shown when the AI helper can't answer. The same order the AI follows (see server/worker.js):
// what it says, what it shows about God, our hearts, one response, prayer. Edit the wording here.
const GENERAL_QUESTIONS = [
  'What stands out to you in this passage?',
  'What does this passage show about God?',
  'How does it speak to what we love, trust or hope in?',
  'What is one way you will respond to it this week?',
  'What can we pray about together from this passage?',
];


// ---------- What's being worked on (only while the page is open) ----------
let passage = '';        // the passage typed, like "John 4:1-26"
let questions = [];      // the questions on screen, with any edits
let leaderNote = '';     // the AI's commentary for the leader, if it wrote one
let questionsFor = '';   // the passage those questions belong to
let edited = false;      // true once the leader changes, removes or adds a question
let history = [];        // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];


// ---------- Screens ----------

function show(id) {
  const now = screens.find((screen) => screen.classList.contains('active'));
  if (now && now.id !== id) history.push(now.id);
  if (id === 'home') {
    updatePlanStatus();   // the start screen always shows where the plan is,
    updateAccount();      // and who's signed in
  }
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  window.scrollTo(0, 0);

  // Screens for typing put the cursor in the box; the others move to the heading
  const screen = document.getElementById(id);
  screen.querySelectorAll('.gentle-error').forEach((note) => { note.hidden = true; });
  const typing = ['passage', 'passcode', 'sign-in', 'sign-in-code'].includes(id);
  const target = typing ? screen.querySelector('input') : screen.querySelector('h1, h2');
  if (target) target.focus({ preventScroll: true });
}

function goBack() {
  const previous = history.pop();
  if (!previous) return;
  show(previous);
  history.pop();   // show() just added the screen we left; going Back shouldn't come back to it
}

// Fills every element matching the selector with the same words
function fill(selector, text) {
  document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
}


// ---------- The questions screen ----------

// Draws the list of questions, each in its own box you can type in
function showQuestions() {
  const list = document.querySelector('.question-list');
  list.textContent = '';

  questions.forEach((question, index) => {
    const item = document.createElement('li');

    const box = document.createElement('textarea');
    box.value = question;
    box.rows = 1;
    box.setAttribute('aria-label', 'Question ' + (index + 1));
    box.addEventListener('input', () => {
      questions[index] = box.value;
      edited = true;
      fitHeight(box);
      updateSaveButton();
    });
    item.append(box);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'quiet remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove question ' + (index + 1));
    remove.addEventListener('click', () => {
      questions.splice(index, 1);
      edited = true;
      showQuestions();
    });
    item.append(remove);

    list.append(item);
  });

  document.querySelector('.no-questions').hidden = questions.length > 0 || asking;
  list.querySelectorAll('textarea').forEach(fitHeight);

  // The AI's commentary for the leader, if it wrote one (a fold-out; see closeLeaderNote)
  document.querySelector('.leader-note').hidden = !leaderNote;
  fill('.leader-note-text', leaderNote);
  updateSaveButton();
}

// Makes a question's box as tall as its words, so nothing hides inside it
function fitHeight(box) {
  box.style.height = 'auto';
  box.style.height = box.scrollHeight + 2 + 'px';   // + 2 for the thin top and bottom lines
}

// Turning the phone sideways changes the width, so the boxes measure again
window.addEventListener('resize', () => {
  document.querySelectorAll('.question-list textarea').forEach(fitHeight);
});

// The commentary for the leader starts closed for each new set of questions
function closeLeaderNote() {
  document.querySelector('#questions .leader-note').open = false;
}

// The general questions, when the AI helper can't answer
function useGeneralQuestions() {
  questions = GENERAL_QUESTIONS.slice();
  leaderNote = '';
  edited = false;
  showQuestions();
}


// ---------- Which passage? ----------

document.querySelector('#passage form').addEventListener('submit', (event) => {
  event.preventDefault();
  const box = document.getElementById('passage-text');
  const text = box.value.trim().replace(/\s+/g, ' ');
  if (!text) {
    document.querySelector('#passage .gentle-error').hidden = false;
    box.focus();
    return;
  }
  startStudy(text);
});

// Opens the questions for a passage, typed in the box or chosen from the Bible
function startStudy(text) {
  setShareStatus('');

  // The passage already on screen (even typed as "john 15"): back to its questions as they are
  if (questionsFor && samePassage(text, questionsFor)) {
    show('questions');
    showQuestions();   // after the screen shows, so each box can measure its words
    // Ask the AI only if there are no questions yet and it isn't already writing them
    if (!questions.length && !(asking && samePassage(askingFor, passage))) writeQuestions();
    return;
  }

  // A saved passage opens its saved questions, without asking the AI
  const study = findStudy(text);
  if (study) {
    openStudy(study);
    return;
  }

  // A new passage starts fresh
  showNotFound(false);
  passage = text;
  fill('.passage-name', passage);
  questions = [];
  leaderNote = '';
  closeLeaderNote();
  edited = false;
  questionsFor = passage;
  setStatus('');
  document.querySelector('.test-cost').hidden = true;
  showPassageText('questions', passage);
  show('questions');
  showQuestions();
  // Ask the AI, unless it's already writing for this same passage (Back, then the button again)
  if (!(asking && samePassage(askingFor, passage))) writeQuestions();
}

// Asks the AI helper for questions (signing in first, if this phone isn't signed in
// and doesn't have the passcode)
function writeQuestions() {
  if (!SERVER_URL) {
    useGeneralQuestions();
    return;
  }
  if (!canAsk()) {
    if (!questions.length) useGeneralQuestions();   // what's there if the leader goes Back
    startSignIn(requestSuggestions);
    return;
  }
  requestSuggestions();
}


// ---------- Buttons ----------

const actions = {
  back: goBack,

  // The start screen's two buttons
  study() {
    show('passage');
  },
  reading() {
    if (readSaved().plan) showToday();
    else showSetup();
  },
  home: goHome,
  saved: showSavedList,

  // Saves this study's questions on this phone, or saves the changes to them
  save() {
    const ready = readyQuestions();
    if (!ready.length) {
      setShareStatus('Add a question first.');
      return;
    }
    const saved = readSaved();
    const others = (saved.studies || []).filter((study) => !samePassage(study.passage, passage));
    saved.studies = [{ passage, questions: ready, note: leaderNote, saved: today() }, ...others];
    if (!writeSaved(saved)) {
      setShareStatus('This browser wouldn’t save it. In a private window, nothing can be kept.');
      return;
    }
    edited = false;   // nothing unsaved now, so writing new questions won't lose anything
    setShareStatus('Saved on this phone. Find it under Saved studies on the start screen.');
    updateSaveButton();
  },

  // Takes this study off the saved list (its questions stay on screen until you leave)
  unsave() {
    if (!window.confirm('Remove ' + passage + ' from your saved studies?')) return;
    const saved = readSaved();
    saved.studies = (saved.studies || []).filter((study) => !samePassage(study.passage, passage));
    writeSaved(saved);
    setShareStatus('Removed from saved studies.');
    updateSaveButton();
  },

  // Adds an empty question at the end, with the cursor in it
  add() {
    questions.push('');
    edited = true;
    showQuestions();
    const boxes = document.querySelectorAll('.question-list textarea');
    boxes[boxes.length - 1].focus();
  },

  // Sends the study through the phone's share menu, for example to a KakaoTalk group chat
  async share() {
    setShareStatus('');
    const text = studyText();
    if (!text) return;
    try {
      await navigator.share({ text });
      setShareStatus('');
    } catch (error) {
      // Closing the share menu without choosing an app isn't a problem
      if (error.name !== 'AbortError') setShareStatus('Sharing didn’t work here. Try Copy instead.');
    }
  },

  // Copies the study, to paste anywhere
  async copy() {
    const text = studyText();
    if (!text) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (error) {
      copied = copyTheOldWay(text);
    }
    const box = document.querySelector('.share-text');
    box.hidden = copied;
    if (copied) {
      setShareStatus('Copied. Paste it into your group chat.');
    } else {
      // Some apps' built-in browsers block copying: show the text to select by hand
      box.value = text;
      fitHeight(box);
      setShareStatus('Copying didn’t work here. Press and hold the text below to select it.');
    }
  },

  // "Write new questions": asks the AI helper again (asks first if the leader changed anything)
  suggest() {
    if (asking) return;
    if (edited && !window.confirm('Replace these questions with new ones? Your changes will be lost.')) return;
    writeQuestions();
  },
};

// ---------- Share and Copy ----------

// The study as plain text: the passage, then the numbered questions.
// The note for the leader is never included. Empty questions are left out.
function studyText() {
  const ready = questions.map((question) => question.trim()).filter(Boolean);
  if (!ready.length) {
    setShareStatus('Add a question first.');
    return '';
  }
  return passage + '\n\n' + ready.map((question, index) => (index + 1) + '. ' + question).join('\n\n');
}

function setShareStatus(text) {
  const status = document.querySelector('.share-status');
  status.textContent = text;
  status.hidden = !text;
  if (!text) document.querySelector('.share-text').hidden = true;
}

// For browsers without the newer copy feature
function copyTheOldWay(text) {
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.style.position = 'fixed';
  box.style.opacity = '0';
  document.body.append(box);
  box.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }
  box.remove();
  return copied;
}

// Phones that can't share (and most computers) get Copy only
if (!navigator.share) {
  document.querySelector('[data-action="share"]').hidden = true;
  document.querySelector('.share-pair').classList.add('single');
}



// ---------- The AI helper ----------

// The AI helper's address: the Cloudflare Worker (see AI-PLAN.md), set up October 26, 2026.
// Set it back to '' to turn the AI helper off in the app. If the address ever changes,
// change it in the Content-Security-Policy line in index.html too, or the browser blocks it.
const SERVER_URL = 'https://living-in-the-word.danyoonsignup.workers.dev/';

// The passcode, or the sign-in, is saved on this phone only, under the app's own name in the
// browser's storage. A phone that's signed in sends its session key (see "Signing in")
// instead of the passcode; signing in replaces the passcode on that phone.
const STORAGE_KEY = 'living-in-the-word';
let passcode = readSaved().passcode || '';
let session = readSaved().session || '';     // this phone's session key, once signed in
let signedInAs = readSaved().email || '';    // the email address it's signed in with
let asking = false;   // true while waiting for the AI
let latestRequest = 0;   // counts requests, so only the newest one changes the screen
let askingFor = '';      // the passage the AI is writing for, while asking

// The test link (the address with ?test) shows what each answer cost
const testMode = new URLSearchParams(window.location.search).has('test');

// True if this phone can ask the AI helper: it's signed in, or it has the passcode
function canAsk() {
  return Boolean(session || passcode);
}

// Sends a message to the AI helper, with this phone's session key if it's signed in
// (in a header, never in the address), or else with the passcode
function askServer(message, signal) {
  const headers = { 'content-type': 'application/json' };
  if (session) headers.authorization = 'Bearer ' + session;
  else message = { ...message, passcode };
  return fetch(SERVER_URL, { method: 'POST', headers, body: JSON.stringify(message), signal });
}

// What's saved on this phone, as one piece of JSON:
//   { version: 1, passcode: '...', session: '...', email: '...', studies: [ ... ], plan: { ... } }
//   (studies are described in "Saved studies", the plan in the reading plan part)
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === 1) return tidySaved(saved);
  } catch (error) {
    // Nothing saved yet, or this browser won't let the app save
  }
  return { version: 1 };
}

// Keeps only what's in the shape the app expects, so a damaged entry (from a bug, or
// another page of the website) is skipped instead of stopping the app from working
function tidySaved(saved) {
  const clean = { version: 1 };
  const text = (value) => (typeof value === 'string' ? value : '');
  const onlyText = (list) => list.filter((item) => typeof item === 'string');
  if (typeof saved.passcode === 'string') clean.passcode = saved.passcode;
  if (typeof saved.session === 'string') clean.session = saved.session;
  if (typeof saved.email === 'string') clean.email = saved.email;
  if (Array.isArray(saved.studies)) {
    clean.studies = saved.studies
      .filter((study) => study && typeof study.passage === 'string' && Array.isArray(study.questions))
      .map((study) => ({ passage: study.passage, questions: onlyText(study.questions), note: text(study.note), saved: text(study.saved) }));
  }
  const plan = saved.plan;
  if (plan && typeof plan.book === 'string' && typeof plan.start === 'string'
      && Number.isInteger(plan.perDay) && plan.perDay > 0 && Number.isInteger(plan.done) && plan.done >= 0) {
    clean.plan = { ...plan, questions: {} };
    Object.entries(plan.questions && typeof plan.questions === 'object' ? plan.questions : {}).forEach(([key, entry]) => {
      if (entry && Array.isArray(entry.questions)) {
        clean.plan.questions[key] = { questions: onlyText(entry.questions), note: text(entry.note) };
      }
    });
  }
  return clean;
}

// Returns false if this browser won't save (a private window, for example)
function writeSaved(saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch (error) {
    // This browser won't save; things are kept until the page closes
    return false;
  }
}

function savePasscode(code) {
  passcode = code;
  const saved = readSaved();
  if (code) saved.passcode = code;
  else delete saved.passcode;
  writeSaved(saved);
}

// The passcode screen: from "Have a passcode?" on the sign-in screen, or when a saved
// passcode stops working (wrong: true, then: what to do once a new one is typed)
function askPasscode(wrong, then) {
  if (then) rememberSignInFrom(then);
  document.getElementById('passcode-text').value = '';
  show('passcode');
  document.querySelector('#passcode .wrong-passcode').hidden = !wrong;
}

document.querySelector('#passcode form').addEventListener('submit', (event) => {
  event.preventDefault();
  const code = document.getElementById('passcode-text').value.trim();
  if (!code) {
    document.querySelector('#passcode .wrong-passcode').hidden = true;
    document.querySelector('#passcode .empty-passcode').hidden = false;
    return;
  }
  savePasscode(code);
  finishSignIn();   // back to where it was asked for, and on with what was asked
});

function setStatus(text) {
  const status = document.querySelector('.suggest-status');
  status.textContent = text;
  status.hidden = !text;
}

// Kind words for each problem the AI helper can report
const PROBLEMS = {
  'limit-reached': 'This month’s AI limit is reached, so these are general questions.',
  'daily-limit': 'Today’s AI limit is reached, so these are general questions. It starts again tomorrow.',
  'too-many-tries': 'Too many wrong passcodes were tried from this internet connection today, so these are general questions. Try again tomorrow.',
  'not-set-up': 'The AI helper isn’t fully set up yet, so these are general questions.',
  'too-long': 'This passage was too long for the AI to answer, so these are general questions. Try a shorter passage.',
  declined: 'The AI couldn’t write questions for this one, so these are general questions.',
  offline: 'Couldn’t reach the AI helper, so these are general questions. Check your connection and try again.',
  other: 'The AI helper couldn’t answer just now, so these are general questions. Try again in a moment.',
};

// While the AI writes, the screen shows five quiet placeholder lines instead of the
// questions, so it never looks blank (style.css, "writing")
function showWriting(screenId, on) {
  document.getElementById(screenId).classList.toggle('writing', on);
}

// A passage that isn't recognized shows only the message and "Change the passage"
// (style.css, "not-found")
function showNotFound(on) {
  document.getElementById('questions').classList.toggle('not-found', on);
}

async function requestSuggestions() {
  showNotFound(false);
  asking = true;
  askingFor = passage;
  const thisRequest = ++latestRequest;
  const button = document.querySelector('[data-action="suggest"]');
  button.disabled = true;
  button.textContent = 'Writing questions…';
  setStatus('Writing questions for ' + passage + '. This can take up to a minute.');
  document.querySelector('.test-cost').hidden = true;
  showWriting('questions', true);
  showQuestions();

  // Remember what was asked, in case the leader moves on while waiting
  const forPassage = passage;

  let result = null;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 120000);   // give up after 2 minutes
  try {
    const response = await askServer({ passage: forPassage, method: 'study' }, stop.signal);
    result = await response.json();
  } catch (error) {
    result = { error: 'offline' };
  }
  clearTimeout(timer);

  // A newer request started while waiting (a new passage was typed): it changes the screen instead
  if (thisRequest !== latestRequest) return;

  asking = false;
  button.disabled = false;
  button.textContent = 'Write new questions';
  showWriting('questions', false);

  // The leader typed a new passage while waiting: these questions don't belong anymore
  if (questionsFor !== forPassage) {
    setStatus('');
    return;
  }

  if (result.error === 'wrong-passcode') {
    savePasscode('');
    setStatus('');
    if (!questions.length) useGeneralQuestions();
    askPasscode(true, requestSuggestions);
    return;
  }
  // This phone's sign-in ran out (after about 90 days) or was turned off: sign in again
  if (result.error === 'signed-out') {
    forgetSignIn();
    setStatus('');
    if (!questions.length) useGeneralQuestions();
    startSignIn(requestSuggestions, true);
    return;
  }
  if (!result.error && !result.knownPassage) {
    setStatus('The AI didn’t recognize that passage. Go back and check it, like “John 4:1-26.”');
    showQuestions();
    showNotFound(true);
    return;
  }
  if (result.error || !Array.isArray(result.questions) || !result.questions.length) {
    // Keep questions already on screen; otherwise show the general ones
    if (!questions.length) useGeneralQuestions();
    else showQuestions();
    setStatus(PROBLEMS[result.error] || PROBLEMS.other);
    return;
  }

  questions = result.questions;
  leaderNote = result.leaderNote || '';
  closeLeaderNote();
  edited = false;
  setStatus('Written for this passage. Read each one, and change anything before you use it.');
  showQuestions();

  if (testMode) {
    const cost = document.querySelector('.test-cost');
    cost.textContent = result.inputTokens.toLocaleString() + ' tokens in, ' +
      result.outputTokens.toLocaleString() + ' out. About ' +
      (result.cost * 100).toFixed(2) + ' cents.';
    cost.hidden = false;
  }
}



// ---------- Signing in ----------
// Sign-up step S3 (see SIGNUP-PLAN.md): type your email address, get a 6-digit code by
// email, and type it here. Only the owner and the people he invites can sign in. The server
// checks, and answers the same way for any address, so nobody can find out who's invited.
// A phone that's signed in has its own daily limit and stays signed in for about 90 days.
// While sign-ups are being built, a phone can still use the passcode instead.

let signInFrom = null;        // the screen (and its Back history) to return to after signing in
let afterSignIn = () => {};   // then what to do, like writing the questions that were asked for
let codeSentTo = '';          // the address the code was sent to

// Kind words for each problem with signing in
const SIGN_IN_PROBLEMS = {
  'bad-email': 'That doesn’t look like an email address. Check it and try again.',
  'too-many-codes': 'Too many codes were asked for today. Try again tomorrow.',
  'not-set-up': 'Signing in by email isn’t set up yet.',
  'email-failed': 'The email couldn’t be sent just now. Try again in a minute.',
  'code-expired': 'That code has run out. Tap “Send a new code” to get another.',
  'too-many-tries': 'Too many wrong codes were tried from this internet connection today. Try again tomorrow.',
  // An older copy of the server (before sign-ins) answers this to everything about signing in
  'wrong-passcode': 'Signing in by email isn’t set up yet.',
  offline: 'Couldn’t reach the AI helper. Check your connection and try again.',
  other: 'Something went wrong. Try again in a moment.',
};

// Remembers where signing in was asked for, so it can come back there
function rememberSignInFrom(then) {
  const now = screens.find((screen) => screen.classList.contains('active'));
  signInFrom = { screen: now ? now.id : 'home', history: history.slice() };
  afterSignIn = then;
}

// Opens the sign-in screen. again: true when this phone's sign-in ran out
function startSignIn(then, again = false) {
  rememberSignInFrom(then);
  document.getElementById('sign-in-email').value = codeSentTo || signedInAs;
  show('sign-in');
  if (again) signInMessage('sign-in', 'You’ve been signed out. Sign in again to keep using the AI helper.');
}

// A gentle message on a sign-in screen ('' hides it)
function signInMessage(screenId, text) {
  const note = document.querySelector('#' + screenId + ' .sign-in-message');
  note.textContent = text;
  note.hidden = !text;
}

// Back to the screen where signing in was asked for, then on with what was asked
function finishSignIn() {
  const from = signInFrom || { screen: 'home', history: [] };
  const then = afterSignIn;
  signInFrom = null;
  afterSignIn = () => {};
  show(from.screen);
  history = from.history;
  then();
  retryPassageText();   // the passage text waits for signing in too
}

// Keeps the sign-in on this phone. It replaces the passcode, which this phone no longer needs.
function keepSignIn(key, email) {
  session = key;
  signedInAs = email;
  passcode = '';
  const saved = readSaved();
  delete saved.passcode;
  saved.session = key;
  saved.email = email;
  writeSaved(saved);
}

// Forgets the sign-in on this phone. Saved studies and the reading plan stay.
function forgetSignIn() {
  if (!codeSentTo) codeSentTo = signedInAs;   // to fill in the address next time
  session = '';
  signedInAs = '';
  const saved = readSaved();
  delete saved.session;
  delete saved.email;
  writeSaved(saved);
}

// The start screen's last line: who's signed in on this phone, with Sign out, or Sign in.
// message replaces it for now, like "Signed out."
function updateAccount(message = '') {
  const status = document.querySelector('.account-status');
  status.textContent = message || (session ? 'Signed in as ' + signedInAs + '.' : '');
  status.hidden = !status.textContent;
  document.querySelector('[data-action="sign-in"]').hidden = Boolean(session) || !SERVER_URL;
  document.querySelector('[data-action="sign-out"]').hidden = !session;
}

// Sends a sign-in message to the server (never with the session key or the passcode)
async function signInRequest(message) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (error) {
    return { error: 'offline' };
  }
}

// Asks the server to email a code. Returns true if it's on its way.
async function sendCode(email, screenId, button) {
  const words = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending…';
  const result = await signInRequest({ action: 'send-code', email });
  button.disabled = false;
  button.textContent = words;
  if (!result.sent) {
    // On the test link, the email service's own reason too, like an address that isn't verified yet
    const detail = testMode && result.detail ? ' (Resend: ' + result.detail + ')' : '';
    signInMessage(screenId, (SIGN_IN_PROBLEMS[result.error] || SIGN_IN_PROBLEMS.other) + detail);
    return false;
  }
  codeSentTo = email;
  fill('.code-sent-to', email);
  return true;
}

// The first sign-in screen: the email address
document.querySelector('#sign-in form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('sign-in-email').value.trim();
  if (!email) {
    signInMessage('sign-in', 'Type your email address first.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    signInMessage('sign-in', SIGN_IN_PROBLEMS['bad-email']);
    return;
  }
  signInMessage('sign-in', '');
  const sent = await sendCode(email, 'sign-in', document.querySelector('#sign-in [type="submit"]'));
  // (only if the person is still on this screen, and didn't go Back while it was sending)
  if (sent && document.getElementById('sign-in').classList.contains('active')) {
    document.getElementById('sign-in-code-text').value = '';
    show('sign-in-code');
  }
});

// The second sign-in screen: the code from the email
document.querySelector('#sign-in-code form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = document.getElementById('sign-in-code-text').value.replace(/\D/g, '');
  if (code.length !== 6) {
    signInMessage('sign-in-code', 'Type the 6-digit code from the email.');
    return;
  }
  signInMessage('sign-in-code', '');
  const button = document.querySelector('#sign-in-code [type="submit"]');
  button.disabled = true;
  button.textContent = 'Signing in…';
  const result = await signInRequest({ action: 'check-code', email: codeSentTo, code });
  button.disabled = false;
  button.textContent = 'Sign in';
  if (result.session) {
    keepSignIn(result.session, result.email || codeSentTo);
    finishSignIn();
    return;
  }
  if (result.error === 'wrong-code') {
    signInMessage('sign-in-code', result.triesLeft > 0
      ? 'That code didn’t work. Check it and try again.'
      : 'That code didn’t work, and it can’t be tried again. Tap “Send a new code” to get another.');
    return;
  }
  signInMessage('sign-in-code', SIGN_IN_PROBLEMS[result.error] || SIGN_IN_PROBLEMS.other);
});

Object.assign(actions, {
  // "Sign in" on the start screen
  'sign-in'() {
    startSignIn(() => {});
  },

  // "Sign out" on the start screen: this phone forgets its key, and the server stops accepting it
  async 'sign-out'() {
    const key = session;
    forgetSignIn();
    updateAccount('Signed out. Your saved studies and reading plan are still on this phone.');
    try {
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
        body: JSON.stringify({ action: 'sign-out' }),
      });
    } catch (error) {
      // Without reception the server isn't told, but the phone has forgotten the key,
      // and the server stops accepting it after 90 days anyway
    }
  },

  // "Have a passcode? Use it instead" (until sign-ups are finished, in step S6)
  'use-passcode'() {
    askPasscode(false);
  },

  // "Send a new code" (the earlier code stops working)
  async 'new-code'() {
    signInMessage('sign-in-code', '');
    if (await sendCode(codeSentTo, 'sign-in-code', document.querySelector('[data-action="new-code"]'))) {
      document.getElementById('sign-in-code-text').value = '';
      signInMessage('sign-in-code', 'A new code is on its way. The earlier one no longer works.');
    }
  },
});

updateAccount();



// ---------- Saved studies ----------
// Tap Save under the questions to keep them on this phone, in the browser's storage with
// the rest of the app's things (see readSaved). One saved study per passage: saving it again
// keeps the newest. They're listed on the "Saved studies" screen, and typing a saved passage
// opens its saved questions instead of asking the AI. Only the questions and the note for
// the leader are saved, never the Bible text.

// Saved studies, newest first: [{ passage: 'John 15', questions: [...], note: '', saved: '2026-10-26' }]
function savedStudies() {
  return readSaved().studies || [];
}

// "John 15" and "john  15" are the same passage
function samePassage(a, b) {
  const tidy = (text) => text.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  return tidy(a) === tidy(b);
}

function findStudy(name) {
  return savedStudies().find((study) => samePassage(study.passage, name));
}

// The questions worth keeping, without empty ones
function readyQuestions() {
  return questions.map((question) => question.trim()).filter(Boolean);
}

// The Save button says what it saves: "Save these questions for John 1", then
// "Saved on this phone", or "Save your changes" after an edit
function updateSaveButton() {
  const button = document.querySelector('[data-action="save"]');
  const study = findStudy(passage);
  const unchanged = study && JSON.stringify(study.questions) === JSON.stringify(readyQuestions()) &&
    (study.note || '') === leaderNote;
  // (a no-break space keeps "1 Corinthians" together if the words wrap)
  button.textContent = !study ? 'Save these questions for ' + passage.replace(/^(\d) /, '$1\u00a0')
    : unchanged ? 'Saved on this phone' : 'Save your changes';
  button.classList.toggle('is-saved', Boolean(unchanged));
  document.querySelector('[data-action="unsave"]').hidden = !study;
}

// Opens a saved study's questions, ready to use, change or share
function openStudy(study) {
  showNotFound(false);
  // If the AI is still writing for another passage, its answer is ignored
  latestRequest++;
  asking = false;
  const button = document.querySelector('[data-action="suggest"]');
  button.disabled = false;
  button.textContent = 'Write new questions';
  showWriting('questions', false);

  passage = study.passage;
  questions = study.questions.slice();
  leaderNote = study.note || '';
  closeLeaderNote();
  edited = false;
  questionsFor = passage;
  fill('.passage-name', passage);
  setShareStatus('');
  setStatus('Saved ' + showDate(study.saved) + '. Change anything, or write new questions.');
  document.querySelector('.test-cost').hidden = true;
  showPassageText('questions', passage);
  show('questions');
  showQuestions();
}

// The "Saved studies" screen: one row per study, newest first
function showSavedList() {
  const list = document.querySelector('.saved-list');
  list.textContent = '';
  const studies = savedStudies();
  studies.forEach((study) => {
    const item = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'row';
    const title = document.createElement('span');
    title.className = 'row-title';
    title.textContent = study.passage;
    const text = document.createElement('span');
    text.className = 'row-text';
    const count = study.questions.length;
    text.textContent = (count === 1 ? '1 question' : count + ' questions') + '. Saved ' + showDate(study.saved) + '.';
    row.append(title, text);
    row.addEventListener('click', () => openStudy(study));
    item.append(row);
    list.append(item);
  });
  document.querySelector('.no-saved').hidden = studies.length > 0;
  show('saved');
}



// ---------- The Bible text (ESV) ----------
// The passage itself, in a fold-out above the questions and on today's reading. It comes
// through the app's own server from Crossway's free ESV API (see "The Bible text" in SPEC.md).
// It's kept only while the page is open, never saved: Crossway allows storing no more than
// 500 verses. If it can't come (no passcode yet, no connection, too long), a link to
// esv.org shows instead.

// Crossway's copyright notice, shown under the text (their wording, from api.esv.org)
const ESV_NOTICE = 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), ' +
  '© 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. ' +
  'The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. ' +
  'The ESV may not be translated into any other language. ' +
  'Users may not copy or download more than 500 verses of the ESV Bible or more than one half of any book of the ESV Bible.';

const textFor = { questions: '', today: '' };      // the passage each screen's text is for (shown or coming)
const textWanted = { questions: '', today: '' };   // the passage each screen last asked for

// esv.org's own page for a passage, like https://www.esv.org/John+4:1-26/
function esvLink(name) {
  const clean = name.replace(/[–—]/g, '-').replace(/[^A-Za-z0-9:;,\- ]/g, '').trim();
  return 'https://www.esv.org/' + clean.replace(/\s+/g, '+') + '/';
}

async function showPassageText(screenId, name) {
  textWanted[screenId] = name;
  if (textFor[screenId] === name) return;   // already showing, or on its way
  textFor[screenId] = name;

  const screen = document.getElementById(screenId);
  const box = screen.querySelector('.scripture');
  const linkOnly = screen.querySelector('.esv-only');
  const ownBible = screen.querySelector('.read-own');
  screen.querySelectorAll('.esv-link').forEach((link) => { link.href = esvLink(name); });
  linkOnly.querySelector('a').textContent = 'Read ' + name + ' on esv.org';
  box.hidden = true;
  box.open = false;
  linkOnly.hidden = true;
  if (ownBible) ownBible.hidden = false;

  let result = { error: 'not-connected' };
  if (SERVER_URL && canAsk()) {
    try {
      const response = await askServer({ passage: name, want: 'text' });
      result = await response.json();
    } catch (error) {
      result = { error: 'offline' };
    }
  }
  if (textFor[screenId] !== name) return;   // the screen moved on to another passage

  if (result.error || typeof result.text !== 'string') {
    textFor[screenId] = '';   // try again next time this passage shows
    linkOnly.hidden = false;
    return;
  }
  box.querySelector('.scripture-title').textContent = 'Read ' + name;
  fillScripture(box.querySelector('.scripture-text'), result.text);
  box.querySelector('.scripture-notice').textContent = ESV_NOTICE;
  box.hidden = false;
  if (ownBible) ownBible.hidden = true;
}

// Puts the words on screen as plain text (never as code), with verse numbers like [12] made small
function fillScripture(target, text) {
  target.textContent = '';
  text.split(/\[(\d+)\]/).forEach((part, index) => {
    if (index % 2 === 0) {
      target.append(part);
      return;
    }
    const number = document.createElement('sup');
    number.className = 'verse-number';
    number.textContent = part;
    target.append(number);
  });
}

// After signing in (or typing the passcode), the screen showing now tries its text again
function retryPassageText() {
  const screenId = document.getElementById('today').classList.contains('active') ? 'today' : 'questions';
  if (!textWanted[screenId]) return;
  textFor[screenId] = '';
  showPassageText(screenId, textWanted[screenId]);
}



// ---------- The reading plan ----------

// The 66 books and how many chapters each has. Checked October 25, 2026: two
// independent datasets agree on every book (66 books, 1,189 chapters):
// github.com/thiagobodruk/bible and github.com/scrollmapper/bible_databases
const BOOKS = [
  ['Genesis', 50], ['Exodus', 40], ['Leviticus', 27], ['Numbers', 36], ['Deuteronomy', 34],
  ['Joshua', 24], ['Judges', 21], ['Ruth', 4], ['1 Samuel', 31], ['2 Samuel', 24],
  ['1 Kings', 22], ['2 Kings', 25], ['1 Chronicles', 29], ['2 Chronicles', 36], ['Ezra', 10],
  ['Nehemiah', 13], ['Esther', 10], ['Job', 42], ['Psalms', 150], ['Proverbs', 31],
  ['Ecclesiastes', 12], ['Song of Solomon', 8], ['Isaiah', 66], ['Jeremiah', 52], ['Lamentations', 5],
  ['Ezekiel', 48], ['Daniel', 12], ['Hosea', 14], ['Joel', 3], ['Amos', 9],
  ['Obadiah', 1], ['Jonah', 4], ['Micah', 7], ['Nahum', 3], ['Habakkuk', 3],
  ['Zephaniah', 3], ['Haggai', 2], ['Zechariah', 14], ['Malachi', 4],
  ['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21], ['Acts', 28],
  ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13], ['Galatians', 6], ['Ephesians', 6],
  ['Philippians', 4], ['Colossians', 4], ['1 Thessalonians', 5], ['2 Thessalonians', 3], ['1 Timothy', 6],
  ['2 Timothy', 4], ['Titus', 3], ['Philemon', 1], ['Hebrews', 13], ['James', 5],
  ['1 Peter', 5], ['2 Peter', 3], ['1 John', 5], ['2 John', 1], ['3 John', 1],
  ['Jude', 1], ['Revelation', 22],
];
const NEW_TESTAMENT_STARTS = 39;   // Matthew is the 40th book

// Questions to think about each day, shown when the AI helper isn't set up or can't answer.
// The same order the AI follows for personal reading (see server/worker.js). Edit them here.
const READING_QUESTIONS = [
  'What stands out to you in today’s reading?',
  'What does it show you about God?',
  'How does it speak to what you love, trust or hope in?',
  'What is one way you can live it out today?',
  'What do you want to say to God about it?',
];

// Where a reading's AI questions are saved, by reading number, like "five-2".
// ("five" is from when the AI wrote exactly 5 questions; questions saved before that were
// left unused, so a reading opened before that change was written once more. Since
// October 26, 2026, the AI writes 3 to 5 under the same name, so saved readings stay.)
function questionsKey(n) {
  return 'five-' + n;
}

// The saved plan: { book: 'Matthew', perDay: 1, start: '2026-11-01', done: 2,
//                   lastDone: '2026-11-02', questions: { 'five-2': { questions: [...], note: '' } } }
//   done is how many readings are finished; lastDone is the date of the last "Done for today";
//   questions holds the AI's questions for each reading (by reading number, starting at 0),
//   so a reading is never paid for twice.
let readingAhead = false;   // true after "Read the next one now", until the page closes
let shownReading = null;    // the reading number on the "today" screen
let readingRequest = null;  // the reading number the AI is writing questions for, if any
// Readings whose AI questions failed while the page is open: they aren't asked for again
// by themselves (each try can cost), only when "Questions for this reading" is tapped
const readingFailed = new Set();

// Today's date as 2026-10-25, in this phone's own time zone
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// A date like 2026-11-01 shown as "Sun, Nov 1", optionally some days later
function showDate(isoDate, addDays = 0) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d + addDays);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function chaptersIn(bookName) {
  const book = BOOKS.find(([name]) => name === bookName);
  return book ? book[1] : 0;
}

function readingsIn(plan) {
  return Math.ceil(chaptersIn(plan.book) / plan.perDay);
}

// Reading number n (starting at 0) as a passage, like "Matthew 3" or "Matthew 3–4".
// Books with one chapter are just the book's name, like "Jude".
function readingName(plan, n) {
  const chapters = chaptersIn(plan.book);
  if (chapters === 1) return plan.book;
  const first = n * plan.perDay + 1;
  const last = Math.min(first + plan.perDay - 1, chapters);
  return plan.book + ' ' + (first === last ? first : first + '–' + last);
}

// The setup screen: fills in the books once, starts today
function showSetup() {
  const select = document.getElementById('plan-book');
  if (!select.options.length) {
    [['Old Testament', BOOKS.slice(0, NEW_TESTAMENT_STARTS)], ['New Testament', BOOKS.slice(NEW_TESTAMENT_STARTS)]].forEach(([title, books]) => {
      const group = document.createElement('optgroup');
      group.label = title;
      books.forEach(([name]) => group.append(new Option(name, name)));
      select.append(group);
    });
    select.value = 'Matthew';
  }
  document.getElementById('plan-start').value = today();
  updateSummary();
  show('plan-setup');
}

// "28 readings. If you read every day, you'll finish Sat, Nov 28."
function updateSummary() {
  const plan = setupChoices();
  const readings = readingsIn(plan);
  const finish = showDate(plan.start, readings - 1);
  fill('.plan-summary', readings === 1
    ? 'One reading, on ' + showDate(plan.start) + '.'
    : readings + ' readings. If you read every day, you’ll finish ' + finish + '.');
}

function setupChoices() {
  return {
    book: document.getElementById('plan-book').value,
    perDay: Number(document.querySelector('#plan-setup input[name="pace"]:checked').value),
    start: document.getElementById('plan-start').value || today(),
    done: 0,
  };
}

document.querySelector('#plan-setup form').addEventListener('change', updateSummary);
document.querySelector('#plan-setup form').addEventListener('submit', (event) => {
  event.preventDefault();
  const saved = readSaved();
  saved.plan = setupChoices();
  writeSaved(saved);
  readingAhead = false;
  history = ['home'];   // Back from today's reading goes to the start, not to setup
  showToday(false);
});

// Today's reading, or "Done for today" if today's is finished
function showToday(keepHistory = true) {
  const plan = readSaved().plan;
  const readings = readingsIn(plan);

  if (plan.done >= readings) {
    showFinished(plan);
    return;
  }
  if (plan.lastDone === today() && !readingAhead) {
    showDoneToday(plan, keepHistory);
    return;
  }

  fill('.reading-count', 'Reading ' + (plan.done + 1) + ' of ' + readings);
  fill('.reading-name', readingName(plan, plan.done));
  showPassageText('today', readingName(plan, plan.done));
  const early = document.querySelector('.reading-early');
  early.hidden = plan.start <= today();
  early.textContent = 'Your plan starts ' + showDate(plan.start) + '. You can read ahead, or come back then.';

  // The AI's questions for this reading if they're saved; otherwise the general ones,
  // and the AI is asked (when it's set up and this phone is signed in or has the passcode)
  shownReading = plan.done;
  showWriting('today', readingRequest === plan.done);   // still writing this one's questions?
  const saved = plan.questions && plan.questions[questionsKey(plan.done)];
  showReflect(saved ? saved.questions : READING_QUESTIONS, saved ? saved.note : '');
  setReadingStatus('');
  document.querySelector('.reading-ai').hidden = true;
  if (!saved && SERVER_URL) {
    if (canAsk() && !readingFailed.has(plan.done)) fetchReadingQuestions(plan.done);
    else document.querySelector('.reading-ai').hidden = false;
  }

  if (!keepHistory) screens.forEach((screen) => screen.classList.remove('active'));
  show('today');
}

// Shows the questions to think about, and the AI's note if there is one
function showReflect(questions, note) {
  const list = document.querySelector('.reflect-list');
  list.textContent = '';
  questions.forEach((question) => {
    const item = document.createElement('li');
    item.textContent = question;
    list.append(item);
  });
  const noteBox = document.querySelector('.reading-note');
  noteBox.hidden = !note;
  noteBox.open = false;   // closed until tapped, each time a reading shows
  fill('.reading-note-text', note || '');
}

function setReadingStatus(text) {
  const status = document.querySelector('.reading-status');
  status.textContent = text;
  status.hidden = !text;
}

// Asks the AI helper for questions on reading number n, and saves them with the plan
async function fetchReadingQuestions(n) {
  if (readingRequest === n) return;
  readingRequest = n;
  document.querySelector('.reading-ai').hidden = true;
  const plan = readSaved().plan;
  const name = readingName(plan, n);
  const key = questionsKey(n);
  setReadingStatus('Writing questions for ' + name + '. This can take up to a minute.');
  showWriting('today', shownReading === n);

  let result;
  try {
    const response = await askServer({ passage: name, method: 'personal' });
    result = await response.json();
  } catch (error) {
    result = { error: 'offline' };
  }
  readingRequest = null;
  if (shownReading === n) showWriting('today', false);

  // The plan was ended or changed while waiting: these questions don't belong anymore
  const saved = readSaved();
  const now = saved.plan;
  if (!now || now.book !== plan.book || now.perDay !== plan.perDay || now.start !== plan.start) return;
  const onScreen = shownReading === n && document.getElementById('today').classList.contains('active');

  if (result.error === 'wrong-passcode' || result.error === 'signed-out') {
    if (result.error === 'signed-out') forgetSignIn();
    else savePasscode('');
    if (onScreen) {
      setReadingStatus(result.error === 'signed-out' ? 'You’ve been signed out. Sign in again to get questions for this reading.' : 'The passcode didn’t work.');
      document.querySelector('.reading-ai').hidden = false;
    }
    return;
  }
  if (result.error || !result.knownPassage || !Array.isArray(result.questions) || !result.questions.length) {
    // Without reception, the next visit tries again by itself; otherwise only when tapped
    if (result.error !== 'offline') readingFailed.add(n);
    if (onScreen) {
      setReadingStatus(PROBLEMS[result.error] || PROBLEMS.other);
      if (result.error !== 'offline') document.querySelector('.reading-ai').hidden = false;
    }
    return;
  }

  now.questions = now.questions || {};
  now.questions[key] = { questions: result.questions, note: result.leaderNote || '' };
  writeSaved(saved);
  if (onScreen) {
    showReflect(result.questions, result.leaderNote || '');
    setReadingStatus('');
  }
}

function showDoneToday(plan, keepHistory = true) {
  fill('.done-title', 'Done for today.');
  fill('.done-next', readingName(plan, plan.done) + ' is next. It’ll be here tomorrow.');
  document.querySelector('.next-now').hidden = false;
  document.querySelector('.new-plan').hidden = true;
  if (!keepHistory) screens.forEach((screen) => screen.classList.remove('active'));
  show('reading-done');
}

function showFinished(plan) {
  fill('.done-title', 'You finished ' + plan.book + '.');
  const readings = readingsIn(plan);
  fill('.done-next', readings === 1 ? 'Well done.' : readings + ' readings, one day at a time.');
  document.querySelector('.next-now').hidden = true;
  document.querySelector('.new-plan').hidden = false;
  show('reading-done');
}

// What the start screen says: today's date at the top, like "Monday, October 26",
// and where the plan is, under "Bible reading plan companion" (nothing until a plan is set up)
function updatePlanStatus() {
  fill('.today-date', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  const count = savedStudies().length;
  fill('.saved-count', count === 0 ? 'Save a study’s questions to keep them here, on this phone.'
    : (count === 1 ? '1 study' : count + ' studies') + ' saved on this phone.');
  const plan = readSaved().plan;
  let text = '';
  if (plan) {
    const readings = readingsIn(plan);
    if (plan.done >= readings) text = 'You finished ' + plan.book + '.';
    else if (plan.lastDone === today()) text = 'Done for today. Next: ' + readingName(plan, plan.done) + '.';
    else text = 'Next: ' + readingName(plan, plan.done) + '. Reading ' + (plan.done + 1) + ' of ' + readings + '.';
  }
  fill('.plan-status', text);
}

function goHome() {
  history = [];
  updatePlanStatus();
  show('home');
  history = [];
}

Object.assign(actions, {
  'done-reading'() {
    const saved = readSaved();
    saved.plan.done += 1;
    saved.plan.lastDone = today();
    writeSaved(saved);
    readingAhead = false;
    showToday();
    history = ['home'];   // Back goes to the start
  },

  'read-ahead'() {
    readingAhead = true;
    showToday();
    history = ['home'];
  },

  'new-plan'() {
    const saved = readSaved();
    delete saved.plan;
    writeSaved(saved);
    showSetup();
    history = ['home'];
  },

  // "Questions for this reading": asks the AI (signing in first, if this phone can't ask yet)
  'reading-ai'() {
    readingFailed.delete(shownReading);   // asked for on purpose: try again
    const reading = shownReading;
    if (canAsk()) {
      fetchReadingQuestions(reading);
      return;
    }
    startSignIn(() => fetchReadingQuestions(reading));
  },

  'end-plan'() {
    if (!window.confirm('End this plan? Where you are in it will be cleared.')) return;
    const saved = readSaved();
    delete saved.plan;
    writeSaved(saved);
    goHome();
  },
});

updatePlanStatus();


// ---------- Choose from the Bible (the passage picker) ----------
// For anyone who'd rather not type the passage (the owner's request, October 26, 2026):
// Old or New Testament, then the book, the chapter, and the whole chapter or some verses,
// one screen each. The choice goes into the typing box and starts the study, the same as
// typing it.

// How many verses each chapter has: one list per book, in the same order as BOOKS. Each line
// holds 20 chapters, so Genesis 24 is the 4th number on the 2nd line of Genesis.
// The numbers follow the NASB, ESV and NIV, the owner's Bibles (his choice, October 26, 2026),
// not the KJV. Checked October 26, 2026 against github.com/thiagobodruk/bible (its NASB 2020,
// ESV, NIV and KJV) and github.com/scrollmapper/bible_databases (KJV): every chapter ends on the
// same verse in all of them, except 3 John, which has 15 verses in the NASB, ESV and NIV
// (14 in the KJV). Never type these from memory.
const VERSES = [
  // Genesis
  [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18,
   34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23,
   57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
  // Exodus
  [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26,
   36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
  // Leviticus
  [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27,
   24, 33, 44, 23, 55, 46, 34],
  // Numbers
  [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29,
   35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
  // Deuteronomy
  [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20,
   23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
  // Joshua
  [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9,
   45, 34, 16, 33],
  // Judges
  [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48,
   25],
  // Ruth
  [22, 23, 18, 22],
  // 1 Samuel
  [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42,
   15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
  // 2 Samuel
  [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26,
   22, 51, 39, 25],
  // 1 Kings
  [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43,
   29, 53],
  // 2 Kings
  [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21,
   26, 20, 37, 20, 30],
  // 1 Chronicles
  [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8,
   30, 19, 32, 31, 31, 32, 34, 21, 30],
  // 2 Chronicles
  [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37,
   20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
  // Ezra
  [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
  // Nehemiah
  [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
  // Esther
  [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
  // Job
  [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29,
   34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24,
   34, 17],
  // Psalms
  [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9,
   13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17,
   13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12,
   8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19,
   16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5,
   8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7,
   8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13,
   10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
  // Proverbs
  [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30,
   31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
  // Ecclesiastes
  [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
  // Song of Solomon
  [17, 17, 11, 16, 16, 13, 13, 14],
  // Isaiah
  [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6,
   17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31,
   29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22,
   11, 12, 19, 12, 25, 24],
  // Jeremiah
  [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18,
   14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16,
   18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
  // Lamentations
  [22, 22, 66, 22, 22],
  // Ezekiel
  [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49,
   32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49,
   26, 20, 27, 31, 25, 24, 23, 35],
  // Daniel
  [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
  // Hosea
  [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
  // Joel
  [20, 32, 21],
  // Amos
  [15, 16, 15, 13, 27, 14, 17, 14, 15],
  // Obadiah
  [21],
  // Jonah
  [17, 10, 10, 11],
  // Micah
  [16, 13, 12, 13, 15, 16, 20],
  // Nahum
  [15, 13, 19],
  // Habakkuk
  [17, 20, 19],
  // Zephaniah
  [18, 15, 20],
  // Haggai
  [15, 23],
  // Zechariah
  [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
  // Malachi
  [14, 17, 18, 6],
  // Matthew
  [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34,
   46, 46, 39, 51, 46, 75, 66, 20],
  // Mark
  [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
  // Luke
  [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47,
   38, 71, 56, 53],
  // John
  [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31,
   25],
  // Acts
  [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38,
   40, 30, 35, 27, 27, 32, 44, 31],
  // Romans
  [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
  // 1 Corinthians
  [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
  // 2 Corinthians
  [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
  // Galatians
  [24, 21, 29, 31, 26, 18],
  // Ephesians
  [23, 22, 21, 32, 33, 24],
  // Philippians
  [30, 30, 21, 23],
  // Colossians
  [29, 23, 25, 18],
  // 1 Thessalonians
  [10, 20, 13, 18, 28],
  // 2 Thessalonians
  [12, 17, 18],
  // 1 Timothy
  [20, 15, 16, 16, 25, 21],
  // 2 Timothy
  [18, 26, 17, 22],
  // Titus
  [16, 15, 15],
  // Philemon
  [25],
  // Hebrews
  [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
  // James
  [27, 26, 18, 17, 20],
  // 1 Peter
  [25, 25, 22, 19, 14],
  // 2 Peter
  [21, 22, 18],
  // 1 John
  [10, 29, 24, 21, 21],
  // 2 John
  [13],
  // 3 John
  [15],
  // Jude
  [25],
  // Revelation
  [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15,
   27, 21],
];

// Verses the ESV and NIV have only in a footnote (checked October 26, 2026, in the same
// datasets). The verse numbers stay, so the ESV and NIV go from Matthew 17:20 to 17:22.
// The picker shows these lighter, with a note. Matthew 12:47 isn't here: only the ESV
// leaves it out, and the NIV and NASB have it.
const IN_FOOTNOTES = {
  'Matthew 17': [21], 'Matthew 18': [11], 'Matthew 23': [14],
  'Mark 7': [16], 'Mark 9': [44, 46], 'Mark 11': [26], 'Mark 15': [28],
  'Luke 17': [36], 'Luke 23': [17], 'John 5': [4],
  'Acts 8': [37], 'Acts 15': [34], 'Acts 24': [7], 'Acts 28': [29],
  'Romans 16': [24],
};

// What's being chosen: the book (its place in BOOKS), the chapter, and the first and
// last verse (0 until a verse is tapped)
const pick = { book: 0, chapter: 1, first: 0, last: 0 };

// A chapter's name, like "John 3". Bibles say "Psalm 23" for one psalm,
// and a book of one chapter is just its name, like "Jude".
function chapterName(book, chapter) {
  const [name, chapters] = BOOKS[book];
  if (chapters === 1) return name;
  return (name === 'Psalms' ? 'Psalm' : name) + ' ' + chapter;
}

// One box in a grid: a book's name, or a chapter or verse number
function gridButton(text, onTap) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', onTap);
  return button;
}

// The books of the Old or the New Testament
function showBooks(newTestament) {
  const first = newTestament ? NEW_TESTAMENT_STARTS : 0;
  const books = newTestament ? BOOKS.slice(NEW_TESTAMENT_STARTS) : BOOKS.slice(0, NEW_TESTAMENT_STARTS);
  fill('.pick-testament-name', newTestament ? 'New Testament' : 'Old Testament');
  const grid = document.querySelector('.book-grid');
  grid.textContent = '';
  books.forEach(([name], index) => {
    // (a no-break space keeps "1 Thessalonians" together, so the 1 never sits alone)
    grid.append(gridButton(name.replace(/^(\d) /, '$1\u00a0'), () => showChapters(first + index)));
  });
  show('pick-book');
}

// The chapters of a book. A book of one chapter (like Jude) goes straight to its verses.
function showChapters(book) {
  const [name, chapters] = BOOKS[book];
  if (chapters === 1) {
    showVerses(book, 1);
    return;
  }
  fill('.pick-book-name', name);
  fill('.pick-chapter-question', name === 'Psalms' ? 'Which psalm?' : 'Which chapter?');
  const grid = document.querySelector('.chapter-grid');
  grid.textContent = '';
  for (let chapter = 1; chapter <= chapters; chapter++) {
    grid.append(gridButton(chapter, () => showVerses(book, chapter)));
  }
  show('pick-chapter');
}

// The verses of a chapter, with nothing chosen yet
function showVerses(book, chapter) {
  Object.assign(pick, { book, chapter, first: 0, last: 0 });
  const [name, chapters] = BOOKS[book];
  fill('.pick-chapter-name', chapterName(book, chapter));
  fill('.whole-chapter', chapters === 1 ? 'The whole book' : name === 'Psalms' ? 'The whole psalm' : 'The whole chapter');

  const footnotes = IN_FOOTNOTES[name + ' ' + chapter] || [];
  const grid = document.querySelector('.verse-grid');
  grid.textContent = '';
  for (let verse = 1; verse <= VERSES[book][chapter - 1]; verse++) {
    const button = gridButton(verse, () => tapVerse(verse));
    if (footnotes.includes(verse)) {
      button.classList.add('in-footnote');
      button.setAttribute('aria-label', verse + ', only in a footnote in the ESV and NIV');
    }
    grid.append(button);
  }
  const note = document.querySelector('.footnote-note');
  note.hidden = !footnotes.length;
  note.textContent = footnotes.length === 1
    ? 'Verse ' + footnotes[0] + ' is lighter because the ESV and NIV have it only in a footnote.'
    : 'Verses ' + footnotes.join(' and ') + ' are lighter because the ESV and NIV have them only in footnotes.';

  updatePick();
  show('pick-verses');
}

// Tap the first verse, then the last (in either order). After that, a tap starts again.
function tapVerse(verse) {
  const oneChosen = pick.first > 0 && pick.first === pick.last;
  if (oneChosen && verse !== pick.first) {
    pick.first = Math.min(pick.first, verse);
    pick.last = Math.max(pick.last, verse);
  } else {
    pick.first = verse;
    pick.last = verse;
  }
  updatePick();
}

// The chosen passage, like "John 3:16–21", "John 3:16", "John 3" (the whole chapter) or "Jude 3–5"
function pickName() {
  const name = chapterName(pick.book, pick.chapter);
  if (pick.first === 1 && pick.last === VERSES[pick.book][pick.chapter - 1]) return name;
  const verses = pick.first === pick.last ? pick.first : pick.first + '–' + pick.last;
  return BOOKS[pick.book][1] === 1 ? name + ' ' + verses : name + ':' + verses;
}

// Shows what's chosen: the verses shaded (the first and last filled in), and at the
// bottom the passage's name with "Go deeper with AI"
function updatePick() {
  document.querySelectorAll('.verse-grid button').forEach((button, index) => {
    const verse = index + 1;
    button.setAttribute('aria-pressed', String(verse >= pick.first && verse <= pick.last));
    button.classList.toggle('end', verse === pick.first || verse === pick.last);
  });
  const whole = pick.first === 1 && pick.last === VERSES[pick.book][pick.chapter - 1];
  document.querySelector('.whole-chapter').setAttribute('aria-pressed', String(whole));
  document.querySelector('.pick-bar').hidden = !pick.first;
  fill('.pick-choice', pick.first ? pickName() : '');
}

Object.assign(actions, {
  // "Choose from the Bible" on the passage screen
  choose() {
    show('pick-testament');
  },
  'pick-old'() {
    showBooks(false);
  },
  'pick-new'() {
    showBooks(true);
  },
  'pick-whole'() {
    pick.first = 1;
    pick.last = VERSES[pick.book][pick.chapter - 1];
    updatePick();
  },
  // Puts the choice in the typing box and starts the study, as if it were typed
  'pick-go'() {
    const name = pickName();
    document.getElementById('passage-text').value = name;
    startStudy(name);
  },
});


// ---------- Works without reception ----------
// sw.js keeps a copy of the app on the phone, so it opens without reception.
// Writing new questions still needs the internet. See SPEC.md.

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});   // if it fails, the app works as before
}

// Asks the phone to keep saved studies even when it's short on space. Some phones say no; that's fine.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

// The home screen tip isn't needed once the app is opened from the home screen
const fromHomeScreen = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const installTip = document.querySelector('.install-tip');
if (installTip) installTip.hidden = fromHomeScreen;


document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button && actions[button.dataset.action]) actions[button.dataset.action]();
});
