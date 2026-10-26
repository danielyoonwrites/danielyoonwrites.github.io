// Living in the Word: shows one screen at a time. It writes 5 questions for a Bible
// passage with the AI helper (they stay only while the page is open), and keeps a
// daily reading plan (saved on this phone).
// Only the passage name is sent anywhere, to the app's own small server (the AI helper,
// see AI-PLAN.md). See SPEC.md for the plan.


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
let leaderNote = '';     // the AI's note for the leader, if it wrote one
let questionsFor = '';   // the passage those questions belong to
let edited = false;      // true once the leader changes, removes or adds a question
let history = [];        // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];


// ---------- Screens ----------

function show(id) {
  const now = screens.find((screen) => screen.classList.contains('active'));
  if (now && now.id !== id) history.push(now.id);
  if (id === 'home') updatePlanStatus();   // the start screen always shows where the plan is
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  window.scrollTo(0, 0);

  // The passage screen puts the cursor in the box; the others move to the heading
  const screen = document.getElementById(id);
  screen.querySelectorAll('.gentle-error').forEach((note) => { note.hidden = true; });
  const typing = id === 'passage' || id === 'passcode';
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

  // The AI's note for the leader, if it wrote one
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
  edited = false;
  questionsFor = passage;
  setStatus('');
  document.querySelector('.test-cost').hidden = true;
  showPassageText('questions', passage);
  show('questions');
  showQuestions();
  // Ask the AI, unless it's already writing for this same passage (Back, then the button again)
  if (!(asking && samePassage(askingFor, passage))) writeQuestions();
});

// Asks the AI helper for questions (the passcode first, if this phone doesn't have it yet)
function writeQuestions() {
  if (!SERVER_URL) {
    useGeneralQuestions();
    return;
  }
  if (!passcode) {
    if (!questions.length) useGeneralQuestions();   // what's there if the leader goes Back
    afterPasscode = requestSuggestions;
    askPasscode(false);
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

// The passcode is saved on this phone only, under the app's own name in the browser's storage
const STORAGE_KEY = 'living-in-the-word';
let passcode = readSaved().passcode || '';
let asking = false;   // true while waiting for the AI
let latestRequest = 0;   // counts requests, so only the newest one changes the screen
let askingFor = '';      // the passage the AI is writing for, while asking
let afterPasscode = requestSuggestions;   // what to do once a passcode is typed

// The test link (the address with ?test) shows what each answer cost
const testMode = new URLSearchParams(window.location.search).has('test');

// What's saved on this phone, as one piece of JSON:
//   { version: 1, passcode: '...', plan: { ... } }   (the plan is described in the reading plan part)
// Later steps add recent studies.
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
  goBack();   // back to where the passcode was asked for
  afterPasscode();
  retryPassageText();   // the passage text waits for the passcode too
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
  setStatus('Writing 5 questions for ' + passage + '. This can take up to a minute.');
  document.querySelector('.test-cost').hidden = true;
  showWriting('questions', true);
  showQuestions();

  // Remember what was asked, in case the leader moves on while waiting
  const forPassage = passage;

  let result = null;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 120000);   // give up after 2 minutes
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode, passage: forPassage, method: 'study' }),
      signal: stop.signal,
    });
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
    afterPasscode = requestSuggestions;
    askPasscode(true);
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
  if (SERVER_URL && passcode) {
    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passcode, passage: name, want: 'text' }),
      });
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

// After the passcode is typed, the screen showing now tries its text again
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
// ("five" because the AI writes 5 questions; questions saved before that are left unused,
// so a reading opened before the change is written once more.)
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
  // and the AI is asked (when it's set up and this phone has the passcode)
  shownReading = plan.done;
  showWriting('today', readingRequest === plan.done);   // still writing this one's questions?
  const saved = plan.questions && plan.questions[questionsKey(plan.done)];
  showReflect(saved ? saved.questions : READING_QUESTIONS, saved ? saved.note : '');
  setReadingStatus('');
  document.querySelector('.reading-ai').hidden = true;
  if (!saved && SERVER_URL) {
    if (passcode && !readingFailed.has(plan.done)) fetchReadingQuestions(plan.done);
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
  document.querySelector('.reading-note').hidden = !note;
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
  setReadingStatus('Writing 5 questions for ' + name + '. This can take up to a minute.');
  showWriting('today', shownReading === n);

  let result;
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode, passage: name, method: 'personal' }),
    });
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

  if (result.error === 'wrong-passcode') {
    savePasscode('');
    if (onScreen) {
      setReadingStatus('The passcode didn’t work.');
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

  // "Questions for this reading": asks the AI (for the passcode first, if this phone doesn't have it)
  'reading-ai'() {
    readingFailed.delete(shownReading);   // asked for on purpose: try again
    if (passcode) {
      fetchReadingQuestions(shownReading);
      return;
    }
    afterPasscode = () => fetchReadingQuestions(shownReading);
    askPasscode(false);
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
