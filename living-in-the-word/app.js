// Living in the Word: shows one screen at a time. It turns a passage into
// questions for a small group (they stay only while the page is open), and keeps
// a daily reading plan (saved on this phone).
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

  // The start screen's two buttons
  study() {
    show('passage');
  },
  reading() {
    if (readSaved().plan) showToday();
    else showSetup();
  },
  home: goHome,

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
      afterPasscode = requestSuggestions;
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
let afterPasscode = requestSuggestions;   // what to do once a passcode is typed

// The test link (the address with ?test) shows a model choice and what each answer cost
const testMode = new URLSearchParams(window.location.search).has('test');
document.querySelector('.test-only').hidden = !testMode;
const MODEL_NAMES = {
  'claude-opus-5-5': 'Opus 5.5',
  'claude-sonnet-5-5': 'Sonnet 5.5',
  'claude-haiku-5-5': 'Haiku 5.5',
};

// What's saved on this phone, as one piece of JSON:
//   { version: 1, passcode: '...', plan: { ... } }   (the plan is described in the reading plan part)
// Later steps add recent studies.
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === 1) return saved;
  } catch (error) {
    // Nothing saved yet, or this browser won't let the app save
  }
  return { version: 1 };
}

function writeSaved(saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    // This browser won't save; things are kept until the page closes
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
    afterPasscode = requestSuggestions;
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

// Questions to think about each day, from the Swedish method (see SPEC.md), for one person.
// Edit the wording here. The AI helper will write questions for each chapter later.
const REFLECT = [
  'Light bulb: what stands out to you in today’s reading?',
  'Question mark: what’s hard to understand, or what would you ask God about it?',
  'Arrow: how could this shape your day?',
];

// The saved plan: { book: 'Matthew', perDay: 1, start: '2026-11-01', done: 2, lastDone: '2026-11-02',
//                   questions: { 2: { questions: [...], note: '' } } }
//   done is how many readings are finished; lastDone is the date of the last "Done for today";
//   questions holds the AI's questions for each reading (by number, starting at 0), so a
//   reading is never paid for twice.
let readingAhead = false;   // true after "Read the next one now", until the page closes
let shownReading = null;    // the reading number on the "today" screen
let readingRequest = null;  // the reading number the AI is writing questions for, if any

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
  const early = document.querySelector('.reading-early');
  early.hidden = plan.start <= today();
  early.textContent = 'Your plan starts ' + showDate(plan.start) + '. You can read ahead, or come back then.';

  // The AI's questions for this reading if they're saved; otherwise the general ones,
  // and the AI is asked (when it's set up and this phone has the passcode)
  shownReading = plan.done;
  const saved = plan.questions && plan.questions[plan.done];
  showReflect(saved ? saved.questions : REFLECT, saved ? saved.note : '');
  setReadingStatus('');
  document.querySelector('.reading-ai').hidden = true;
  if (!saved && SERVER_URL) {
    if (passcode) fetchReadingQuestions(plan.done);
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
  setReadingStatus('Writing questions for ' + name + '…');

  let result;
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode, passage: name, method: 'devotional' }),
    });
    result = await response.json();
  } catch (error) {
    result = { error: 'offline' };
  }
  readingRequest = null;

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
    if (onScreen) setReadingStatus(PROBLEMS[result.error] || PROBLEMS.other);
    return;
  }

  now.questions = now.questions || {};
  now.questions[n] = { questions: result.questions, note: result.leaderNote || '' };
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

// What the start screen says under "Today's reading"
function updatePlanStatus() {
  const plan = readSaved().plan;
  let text = 'Set up a plan, like one chapter of Matthew a day.';
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

  // "Questions for this reading": asks for the passcode first, then the AI
  'reading-ai'() {
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


document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button && actions[button.dataset.action]) actions[button.dataset.action]();
});
