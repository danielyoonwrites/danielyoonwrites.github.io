// First step smaller: shows one screen at a time, and saves tasks on this phone.
// Nothing is ever sent anywhere: everything stays in this browser's own storage
// (localStorage), under one name. See SPEC.md for the plan.

const STORAGE_KEY = 'first-step-smaller';

// Everything that's saved. A backup file (build step 4) will hold the same thing:
// { version: 1, tasks: [ { id, name, status: 'waiting' or 'finished', created, finished,
//   updated, pending, steps: [ { text: 'Clear one shelf', before: 4, after: 2, date: '2026-10-25' } ] } ] }
// "pending" is a step typed but not done yet ("Not now"), kept so it doesn't need retyping.
let data = { version: 1, tasks: [] };
let canSave = true;  // false if this browser won't let the app save (some private modes)

let task = null;     // the task being worked on (one of data.tasks)
let current = null;  // the small step being worked on: { text, before }
let history = [];    // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];


// ---------- Saving on this phone ----------

// Reads what's saved. If it can't be read, keeps a copy under another name
// instead of writing over it, and starts fresh.
function load() {
  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    canSave = false;
    return;
  }
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks)) {
      data = parsed;
      return;
    }
  } catch (error) {
    // not readable; handled just below
  }
  try {
    localStorage.setItem(STORAGE_KEY + '-unreadable', saved);
  } catch (error) {
    canSave = false;
  }
}

// Saves everything. Called after every change.
function save() {
  if (!canSave) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    canSave = false;
  }
}

// Marks a task as just used, so it shows first in the lists, and saves
function touch(t) {
  t.updated = Date.now();
  save();
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


// ---------- Showing screens ----------

// Shows one screen, hides the rest, and moves the reader to it.
// remember: false skips adding the current screen to the Back history.
function show(id, remember = true) {
  const now = document.querySelector('.screen.active');
  if (remember && now) history.push(now.id);
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  window.scrollTo(0, 0);

  // Typing screens put the cursor in the box; the others move to the heading
  const screen = document.getElementById(id);
  screen.querySelectorAll('.gentle-error').forEach((note) => { note.hidden = true; });
  const target = screen.querySelector('input') || screen.querySelector('h1, h2');
  if (target) target.focus({ preventScroll: true });
}

// Fills every element matching the selector with the same words
function fill(selector, text) {
  document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
}

// Makes an element with a class and words, safely (words are never read as code)
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// Today's date as 2026-10-25, and how to show it, like "Oct 25" (kept on one line)
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function shortDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '\u00A0');
}


// ---------- The arc ----------

// Draws a task's arc into a list: one line per small step, in order
function drawArc(list, t) {
  list.textContent = '';
  t.steps.forEach((step) => {
    const item = make('li');
    item.append(
      make('span', 'arc-date', shortDate(step.date)),
      make('span', 'arc-text', step.text),
      make('span', 'arc-rating', 'felt ' + step.before + ', was ' + step.after)
    );
    list.append(item);
  });
}

// "3 small steps over 4 days" (empty if there are no steps)
function arcSummary(t) {
  const count = t.steps.length;
  if (!count) return '';
  const first = new Date(t.steps[0].date);
  const last = new Date(t.steps[count - 1].date);
  const days = Math.round((last - first) / 86400000) + 1;
  const steps = count === 1 ? '1 small step' : count + ' small steps';
  return days === 1 ? steps + ' in 1 day' : steps + ' over ' + days + ' days';
}

// "2 small steps so far" or "No steps yet"
function soFar(t) {
  const count = t.steps.length;
  if (!count) return 'No steps yet';
  return (count === 1 ? '1 small step' : count + ' small steps') + ' so far';
}


// ---------- The start screen ----------

function newestFirst(a, b) {
  return (b.updated || 0) - (a.updated || 0);
}

// Fills in the Waiting list and the Finished link from what's saved
function drawStart() {
  const waiting = data.tasks.filter((t) => t.status === 'waiting').sort(newestFirst);
  const finished = data.tasks.filter((t) => t.status === 'finished');

  const rows = document.querySelector('#waiting .rows');
  rows.textContent = '';
  waiting.forEach((t) => {
    const button = make('button', 'row');
    button.type = 'button';
    button.dataset.action = 'open';
    button.dataset.id = t.id;
    button.append(make('span', 'row-name', t.name), make('span', 'row-sub', soFar(t)));
    const item = make('li');
    item.append(button);
    rows.append(item);
  });
  document.getElementById('waiting').hidden = waiting.length === 0;

  document.querySelector('#finished-link .row').textContent = finished.length === 1
    ? 'See 1 finished task'
    : 'See ' + finished.length + ' finished tasks';
  document.getElementById('finished-link').hidden = finished.length === 0;

  document.getElementById('saved-note').hidden = !canSave;
  document.getElementById('cant-save').hidden = canSave;
}

function goToStart() {
  task = null;
  current = null;
  history = [];
  drawStart();
  show('start', false);
}


// ---------- Working on a task ----------

// Starts a step: "What's one small thing..." the first time, "What's the next..." after.
// A step typed earlier but not done ("Not now") is already in the box.
function askForStep() {
  const first = task.steps.length === 0;
  document.getElementById('smaller-question').textContent = first
    ? 'What’s one small thing you could do first?'
    : 'What’s the next small step?';
  document.getElementById('step-text').value = task.pending || '';
  fill('.task-label', task.name);
  show('smaller');
}

// Kind words that compare how heavy it felt with how it really was
function resultWords(before, after) {
  const line = 'It felt like a ' + before + '. It was a ' + after + '.';
  if (after < before) return [line, 'Lighter than it felt.'];
  if (after > before) return [line, 'Heavier than it looked, and you did it anyway.'];
  return [line, 'About what you expected, and you did it.'];
}

// Reads a typing screen's box. If it's empty, shows a gentle note and returns nothing.
function readBox(form) {
  const input = form.querySelector('input');
  const note = form.querySelector('.gentle-error');
  const value = input.value.trim();
  note.hidden = value !== '';
  if (!value) input.focus();
  return value;
}

// "That's fine. It'll wait for you." with the task's steps so far
function showLater() {
  const box = document.querySelector('#later .so-far');
  box.hidden = task.steps.length === 0;
  if (task.steps.length) {
    fill('#later .task-name', task.name);
    drawArc(document.querySelector('#later .arc'), task);
  }
  history = [];
  show('later', false);
}

// A waiting task's own screen
function showTask() {
  fill('#task .task-name', task.name);
  document.querySelector('#task .no-steps').hidden = task.steps.length > 0;
  drawArc(document.querySelector('#task .arc'), task);
  show('task');
}

// The finished tasks, newest first; each opens to show its arc
function showHistory() {
  const list = document.querySelector('#history .history-list');
  list.textContent = '';
  data.tasks.filter((t) => t.status === 'finished').sort(newestFirst).forEach((t) => {
    const fold = make('details', 'done-task');
    const summary = make('summary');
    const words = [arcSummary(t), t.finished ? 'finished ' + shortDate(t.finished) : ''].filter(Boolean).join(' · ');
    summary.append(make('span', 'row-name', t.name), make('span', 'row-sub', words));
    const arc = make('ol', 'arc');
    drawArc(arc, t);
    fold.append(summary, arc);
    list.append(fold);
  });
  show('history');
}


// ---------- The typing screens ----------

document.querySelector('#name form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = readBox(event.target);
  if (!name) return;
  task = { id: newId(), name, status: 'waiting', created: today(), steps: [] };
  data.tasks.push(task);
  touch(task);
  askForStep();
});

document.querySelector('#smaller form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = readBox(event.target);
  if (!text) return;
  current = { text };
  fill('.step-text', text);
  show('before');
});


// ---------- The 1 to 5 buttons ----------

document.querySelectorAll('.scale').forEach((scale) => {
  scale.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const rating = Number(button.value);

    if (scale.dataset.rating === 'before') {
      current.before = rating;
      history = [];          // no going back once the step is set
      show('do-it', false);
    } else {
      task.steps.push({ text: current.text, before: current.before, after: rating, date: today() });
      delete task.pending;
      touch(task);
      const [line, kind] = resultWords(current.before, rating);
      fill('.result-line', line);
      fill('.result-kind', kind);
      current = null;
      show('result', false);
    }
  });
});


// ---------- The other buttons ----------

const actions = {
  begin() {
    document.getElementById('task-name').value = '';
    show('name');
  },
  back() {
    const previous = history.pop();
    if (previous) show(previous, false);
  },
  open(button) {
    task = data.tasks.find((t) => t.id === button.dataset.id);
    if (task) showTask();
  },
  continue: askForStep,
  history: showHistory,
  done() {
    show('after', false);
  },
  'not-now'() {
    task.pending = current.text;   // kept so it doesn't need retyping
    touch(task);
    showLater();
  },
  'one-more': askForStep,
  finished() {
    task.status = 'finished';
    task.finished = today();
    delete task.pending;
    touch(task);
    fill('#finished .task-name', task.name);
    drawArc(document.querySelector('#finished .arc'), task);
    fill('.arc-summary', arcSummary(task));
    history = [];
    show('finished', false);
  },
  stop: showLater,
  remove() {
    if (!window.confirm('Remove “' + task.name + '” and its steps from this phone?')) return;
    data.tasks = data.tasks.filter((t) => t !== task);
    save();
    goToStart();
  },
  restart: goToStart,
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button) actions[button.dataset.action](button);
});


// ---------- When the page opens ----------

load();
drawStart();
