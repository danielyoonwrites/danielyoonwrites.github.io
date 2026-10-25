// Living in the Word: shows one screen at a time, and turns a passage into
// questions for a small group. The questions stay only while the page is open.
// Only "Suggest questions" sends anything: the passage name and the method,
// to the app's own small server (the AI helper, see AI-PLAN.md).
// See SPEC.md for the plan.


// ---------- The questions for each method ----------
// Edit the wording right here. Where each method comes from is listed in SPEC.md.
// "tip" is a short line shown above the questions.
const METHODS = {
  dbs: {
    name: 'Discovery Bible Study',
    tip: 'Read the passage aloud, maybe twice, then go through the questions together.',
    questions: [
      'Can someone retell the passage in their own words?',
      'What does this passage say about God?',
      'What does it say about people?',
      'How will I obey what it says this week?',
      'Who will I share it with this week?',
    ],
  },
  oia: {
    name: 'Observe, Interpret, Apply',
    tip: 'Read the passage aloud. Stay with what it says before moving to what it means.',
    questions: [
      'What does the passage say? Notice who, what, when and where, and any words that repeat.',
      'What does it mean? What do other parts of the Bible say about this?',
      'What should I do about it?',
    ],
  },
  swedish: {
    name: 'The Swedish method',
    tip: 'Read the passage aloud. Give everyone a few quiet minutes with it, then share one of each.',
    questions: [
      'Light bulb: what stands out or shines for you?',
      'Question mark: what is hard to understand, or what would you ask?',
      'Arrow: how does it apply to your life?',
    ],
  },
};


// ---------- What's being worked on (only while the page is open) ----------
let passage = '';     // the passage typed, like "John 4:1-26"
let method = 'dbs';   // the method chosen
let drafts = {};      // the questions for each method, with any edits: { dbs: [...], ... }
let notes = {};       // the AI's note for the leader, for each method it suggested questions for
let draftsFor = '';   // the passage those questions belong to
let history = [];     // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];


// ---------- Screens ----------

function show(id) {
  const now = screens.find((screen) => screen.classList.contains('active'));
  if (now && now.id !== id) history.push(now.id);
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  window.scrollTo(0, 0);

  // The passage screen puts the cursor in the box; the others move to the heading
  const screen = document.getElementById(id);
  screen.querySelectorAll('.gentle-error').forEach((note) => { note.hidden = true; });
  const typing = id === 'passage' || id === 'passcode';
  const target = typing ? screen.querySelector('input') : screen.querySelector('h2');
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
  const questions = drafts[method];

  questions.forEach((question, index) => {
    const item = document.createElement('li');

    const box = document.createElement('textarea');
    box.value = question;
    box.rows = 1;
    box.setAttribute('aria-label', 'Question ' + (index + 1));
    box.addEventListener('input', () => {
      questions[index] = box.value;
      fitHeight(box);
    });
    item.append(box);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'quiet remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove question ' + (index + 1));
    remove.addEventListener('click', () => {
      questions.splice(index, 1);
      showQuestions();
    });
    item.append(remove);

    list.append(item);
  });

  document.querySelector('.no-questions').hidden = questions.length > 0;
  list.querySelectorAll('textarea').forEach(fitHeight);

  // The AI's note for the leader, if it wrote one
  const note = notes[method] || '';
  document.querySelector('.leader-note').hidden = !note;
  fill('.leader-note-text', note);
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

// A fresh copy of a method's questions, so editing never changes the originals
function freshQuestions(id) {
  return METHODS[id].questions.slice();
}


// ---------- Typing and choosing ----------

// 1. Which passage?
document.querySelector('#passage form').addEventListener('submit', (event) => {
  event.preventDefault();
  const box = document.getElementById('passage-text');
  const text = box.value.trim().replace(/\s+/g, ' ');
  if (!text) {
    document.querySelector('#passage .gentle-error').hidden = false;
    box.focus();
    return;
  }
  passage = text;
  // A new passage starts fresh, so suggestions for another passage never show up here
  if (passage !== draftsFor) {
    drafts = {};
    notes = {};
    draftsFor = passage;
  }
  fill('.passage-label', passage);
  show('method');
});

// 2. How do you want to study it?
document.querySelector('#method form').addEventListener('submit', (event) => {
  event.preventDefault();
  method = document.querySelector('#method input[name="method"]:checked').value;
  // Each method keeps its own edits, so switching back and forth doesn't lose them
  if (!drafts[method]) drafts[method] = freshQuestions(method);
  fill('.method-label', METHODS[method].name);
  fill('.passage-name', passage);
  fill('.method-tip', METHODS[method].tip);
  setStatus('');
  document.querySelector('.test-cost').hidden = true;
  show('questions');
  showQuestions();   // after the screen shows, so each box can measure its words
});


// ---------- Buttons ----------

const actions = {
  back: goBack,

  // Adds an empty question at the end, with the cursor in it
  add() {
    drafts[method].push('');
    showQuestions();
    const boxes = document.querySelectorAll('.question-list textarea');
    boxes[boxes.length - 1].focus();
  },

  // Puts back the method's own questions, undoing every edit and suggestion (asks first if anything changed)
  reset() {
    if (changedQuestions() && !window.confirm('Start over with the general questions? Changes here will be lost.')) return;
    drafts[method] = freshQuestions(method);
    delete notes[method];
    setStatus('');
    showQuestions();
  },

  // Asks the AI helper for questions written for this passage
  suggest() {
    if (asking) return;
    if (!SERVER_URL) {
      setStatus('The AI helper isn’t connected yet.');
      return;
    }
    if (changedQuestions() && !window.confirm('Replace these questions with new suggestions?')) return;
    if (!passcode) {
      askPasscode(false);
      return;
    }
    requestSuggestions();
  },
};

// True if the questions on screen aren't the method's general ones anymore
function changedQuestions() {
  return drafts[method].join('\n') !== METHODS[method].questions.join('\n') || Boolean(notes[method]);
}


// ---------- The AI helper ----------

// The AI helper's address: the Cloudflare Worker (see AI-PLAN.md). Filled in once it's set up.
const SERVER_URL = '';

// The passcode is saved on this phone only, under the app's own name in the browser's storage
const STORAGE_KEY = 'living-in-the-word';
let passcode = readSaved().passcode || '';
let asking = false;   // true while waiting for the AI

// The test link (the address with ?test) shows a model choice and what each answer cost
const testMode = new URLSearchParams(window.location.search).has('test');
document.querySelector('.test-only').hidden = !testMode;
const MODEL_NAMES = {
  'claude-opus-5-5': 'Opus 5.5',
  'claude-sonnet-5-5': 'Sonnet 5.5',
  'claude-haiku-5-5': 'Haiku 5.5',
};

// What's saved: { version: 1, passcode: '...' }. Later steps add recent studies.
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === 1) return saved;
  } catch (error) {
    // Nothing saved yet, or this browser won't let the app save
  }
  return { version: 1 };
}

function savePasscode(code) {
  passcode = code;
  const saved = readSaved();
  if (code) saved.passcode = code;
  else delete saved.passcode;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    // This browser won't save it; it's kept until the page closes
  }
}

function askPasscode(wrong) {
  document.getElementById('passcode-text').value = '';
  show('passcode');
  document.querySelector('#passcode .wrong-passcode').hidden = !wrong;
}

// The passcode screen
document.querySelector('#passcode form').addEventListener('submit', (event) => {
  event.preventDefault();
  const code = document.getElementById('passcode-text').value.trim();
  if (!code) {
    document.querySelector('#passcode .wrong-passcode').hidden = true;
    document.querySelector('#passcode .empty-passcode').hidden = false;
    return;
  }
  savePasscode(code);
  goBack();   // back to the questions
  requestSuggestions();
});

function setStatus(text) {
  const status = document.querySelector('.suggest-status');
  status.textContent = text;
  status.hidden = !text;
}

// Kind words for each problem the AI helper can report
const PROBLEMS = {
  'limit-reached': 'This month’s AI limit is reached. The general questions are still here.',
  declined: 'The AI couldn’t write questions for this one. Try again, or use the general questions.',
  offline: 'Couldn’t reach the AI helper. Check your connection and try again.',
  other: 'The AI helper couldn’t answer just now. Try again in a moment.',
};

async function requestSuggestions() {
  asking = true;
  const button = document.querySelector('[data-action="suggest"]');
  button.disabled = true;
  button.textContent = 'Writing questions…';
  setStatus('This can take up to a minute.');
  document.querySelector('.test-cost').hidden = true;

  // Remember what was asked, in case the leader moves on while waiting
  const forPassage = passage;
  const forMethod = method;
  const body = { passcode, passage: forPassage, method: forMethod };
  if (testMode) body.model = document.querySelector('.test-only input:checked').value;

  let result = null;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 120000);   // give up after 2 minutes
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: stop.signal,
    });
    result = await response.json();
  } catch (error) {
    result = { error: 'offline' };
  }
  clearTimeout(timer);

  asking = false;
  button.disabled = false;
  button.textContent = 'Suggest questions for this passage';

  // The leader typed a new passage while waiting: these suggestions don't belong anymore
  if (draftsFor !== forPassage) {
    setStatus('');
    return;
  }

  if (result.error === 'wrong-passcode') {
    savePasscode('');
    setStatus('');
    askPasscode(true);
    return;
  }
  if (result.error) {
    setStatus(PROBLEMS[result.error] || PROBLEMS.other);
    return;
  }
  if (!result.knownPassage) {
    setStatus('The AI didn’t recognize that passage. Check it, like “John 4:1-26.”');
    return;
  }
  if (!Array.isArray(result.questions) || !result.questions.length) {
    setStatus(PROBLEMS.other);
    return;
  }

  drafts[forMethod] = result.questions;
  notes[forMethod] = result.leaderNote || '';
  if (method === forMethod) {
    setStatus('Suggested for this passage. Read each one, and change anything before you use it.');
    showQuestions();
  }

  if (testMode) {
    const cost = document.querySelector('.test-cost');
    cost.textContent = (MODEL_NAMES[result.model] || result.model) + ': ' +
      result.inputTokens.toLocaleString() + ' tokens in, ' +
      result.outputTokens.toLocaleString() + ' out. About ' +
      (result.cost * 100).toFixed(2) + ' cents.';
    cost.hidden = false;
  }
}


document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button && actions[button.dataset.action]) actions[button.dataset.action]();
});
