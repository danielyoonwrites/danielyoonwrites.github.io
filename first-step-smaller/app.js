// First step smaller: shows one screen at a time, and saves tasks on this phone.
// Nothing is ever sent anywhere: everything stays in this browser's own storage
// (localStorage), under one name. See SPEC.md for the plan.

const STORAGE_KEY = 'first-step-smaller';

// Everything that's saved (the backup file in build step 4 will hold the same thing).
// Tasks are a tree: any task or step can hold smaller steps, as deep as needed,
// like "Write a book" > "Chapter 1" > "Write three sentences".
//   { version: 2, tasks: [ node, ... ] }
//   node = { id, text, status, created, updated, finished, before, after, date, children: [ node, ... ] }
//   status is 'waiting' (not done yet), 'done' (a step done, with before, after and date)
//   or 'finished' (a task marked "I finished it").
let data = { version: 2, tasks: [] };
let canSave = true;   // false if this browser won't let the app save (some private modes)

let viewing = null;   // the task or step shown on the "node" screen
let step = null;      // the small step being worked on
let asking = null;    // the task a new step is being typed for
let typed = null;     // the step just typed, so going Back and changing it doesn't add a second one
let adding = null;    // the task a planned step is being added to
let history = [];     // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];


// ---------- Saving on this phone ----------

// Reads what's saved. Data from the first version is turned into the tree,
// after keeping a copy of it. Data that can't be read is kept as a copy, not written over.
function load() {
  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    canSave = false;
    return;
  }
  if (!saved) return;

  let parsed = null;
  try {
    parsed = JSON.parse(saved);
  } catch (error) {
    parsed = null;
  }

  if (parsed && parsed.version === 2 && Array.isArray(parsed.tasks)) {
    data = parsed;
  } else if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks)) {
    keepCopy('-version-1', saved);
    data = { version: 2, tasks: parsed.tasks.map(fromVersion1) };
    save();
  } else {
    keepCopy('-unreadable', saved);
  }
}

function keepCopy(ending, text) {
  try {
    localStorage.setItem(STORAGE_KEY + ending, text);
  } catch (error) {
    canSave = false;
  }
}

// The first version kept each task's steps in one flat list
function fromVersion1(t) {
  const children = t.steps.map((s) => ({
    id: newId(), text: s.text, status: 'done', before: s.before, after: s.after, date: s.date, children: [],
  }));
  if (t.pending) children.push({ id: newId(), text: t.pending, status: 'waiting', children: [] });
  return {
    id: t.id || newId(), text: t.name, status: t.status, created: t.created,
    finished: t.finished, updated: t.updated, children,
  };
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

// Marks a step's big task as just used, so it shows first in the lists, and saves
function touch(node) {
  const path = pathTo(node.id);
  (path ? path[0] : node).updated = Date.now();
  save();
}

let idCount = 0;
function newId() {
  idCount += 1;
  return Date.now().toString(36) + idCount.toString(36) + Math.random().toString(36).slice(2, 6);
}


// ---------- The tree ----------

// The path from a big task down to the step with this id: [big task, ..., step]
function pathTo(id, nodes = data.tasks, path = []) {
  for (const node of nodes) {
    const here = path.concat(node);
    if (node.id === id) return here;
    const found = pathTo(id, node.children, here);
    if (found) return found;
  }
  return null;
}

function parentOf(node) {
  const path = pathTo(node.id);
  return path && path.length > 1 ? path[path.length - 2] : null;
}

function isBigTask(node) {
  return data.tasks.includes(node);
}

// A step with nothing inside it that isn't done yet
function isStepToDo(node) {
  return !isBigTask(node) && node.children.length === 0 && node.status === 'waiting';
}

// The next step to do inside a task: the first one not done yet, in order,
// going into smaller steps first. Finished parts are skipped.
function nextStepIn(node) {
  for (const child of node.children) {
    if (child.status === 'finished') continue;
    if (child.children.length) {
      const found = nextStepIn(child);
      if (found) return found;
    } else if (child.status === 'waiting') {
      return child;
    }
  }
  return null;
}

// Every step at the end of a branch inside a task (the ones that get done)
function stepsIn(node) {
  return node.children.flatMap((child) => (child.children.length ? stepsIn(child) : [child]));
}

// "2 of 3 steps done" or "No steps yet"
function progress(node) {
  const all = stepsIn(node);
  if (!all.length) return 'No steps yet';
  const done = all.filter((s) => s.status === 'done').length;
  return done + ' of ' + all.length + (all.length === 1 ? ' step' : ' steps') + ' done';
}

// "3 small steps over 4 days" (empty if nothing is done)
function arcSummary(node) {
  const dates = stepsIn(node).filter((s) => s.status === 'done' && s.date).map((s) => s.date).sort();
  if (!dates.length) return '';
  const days = Math.round((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1;
  const steps = dates.length === 1 ? '1 small step' : dates.length + ' small steps';
  return days === 1 ? steps + ' in 1 day' : steps + ' over ' + days + ' days';
}

// Adding or doing a step inside a finished task opens that task again
function reopen(node) {
  (pathTo(node.id) || [node]).forEach((p) => {
    if (p.status === 'finished') {
      p.status = 'waiting';
      delete p.finished;
    }
  });
}


// ---------- Showing screens ----------

// Remembers the screen showing now, so Back can return to it
function remember() {
  const now = document.querySelector('.screen.active');
  if (now) history.push({ screen: now.id, node: now.id === 'node' && viewing ? viewing.id : null });
}

// Shows one screen, hides the rest, and moves the reader to it.
// keep: false skips remembering the current screen for Back.
function show(id, keep = true) {
  if (keep) remember();
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

// Makes a button that runs one of the actions below
function actionButton(className, action, id) {
  const button = make('button', className);
  button.type = 'button';
  button.dataset.action = action;
  if (id) button.dataset.id = id;
  return button;
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

// The small line under a step in an arc, like "felt 3, was 1" or "1 of 3 steps done · next"
function describe(child, next) {
  const words = [];
  if (child.status === 'done' && child.before) words.push('felt ' + child.before + ', was ' + child.after);
  if (child.children.length) words.push(progress(child));
  if (child.status === 'finished') {
    words.push('finished');
  } else if (next && (child === next || (child.children.length && pathTo(next.id).includes(child)))) {
    words.push('next');
  } else if (isStepToDo(child)) {
    words.push('not done yet');
  }
  return words.join(' · ');
}

// Draws a task's smaller steps as an arc: filled squares for done, hollow for not yet.
// With tappable: true, each one opens when tapped.
function drawArc(list, node, tappable) {
  list.textContent = '';
  const next = node.status === 'finished' ? null : nextStepIn(node);  // nothing is "next" in a finished part
  node.children.forEach((child) => {
    const item = make('li', child.status === 'waiting' ? 'to-do' : 'done');
    const box = tappable ? actionButton('arc-item', 'open', child.id) : make('div', 'arc-item');
    if (child.date) box.append(make('span', 'arc-date', shortDate(child.date)));
    box.append(make('span', 'arc-text', child.text), make('span', 'arc-rating', describe(child, next)));
    item.append(box);
    list.append(item);
  });
}


// ---------- The start screen and the finished list ----------

function newestFirst(a, b) {
  return (b.updated || 0) - (a.updated || 0);
}

// A big task you can tap, with a small line under its name
function taskRow(task, words) {
  const button = actionButton('row', 'open', task.id);
  button.append(make('span', 'row-name', task.text), make('span', 'row-sub', words));
  const item = make('li');
  item.append(button);
  return item;
}

function drawStart() {
  const waiting = data.tasks.filter((t) => t.status !== 'finished').sort(newestFirst);
  const finished = data.tasks.filter((t) => t.status === 'finished');

  const rows = document.querySelector('#waiting .rows');
  rows.textContent = '';
  waiting.forEach((t) => rows.append(taskRow(t, progress(t))));
  document.getElementById('waiting').hidden = waiting.length === 0;

  document.querySelector('#finished-link .row').textContent = finished.length === 1
    ? 'See 1 finished task'
    : 'See ' + finished.length + ' finished tasks';
  document.getElementById('finished-link').hidden = finished.length === 0;

  document.getElementById('saved-note').hidden = !canSave;
  document.getElementById('cant-save').hidden = canSave;
}

function goToStart() {
  viewing = null;
  step = null;
  history = [];
  drawStart();
  show('start', false);
}

function showHistory() {
  const rows = document.querySelector('#history .rows');
  rows.textContent = '';
  data.tasks.filter((t) => t.status === 'finished').sort(newestFirst).forEach((t) => {
    const words = [arcSummary(t), t.finished ? 'finished ' + shortDate(t.finished) : ''].filter(Boolean).join(' · ');
    rows.append(taskRow(t, words));
  });
  show('history');
}


// ---------- One task or step, with the smaller steps inside it ----------

function showNode(node, keep = true) {
  if (keep) remember();
  viewing = node;
  const toDo = isStepToDo(node);

  // "Write a book › Chapter 1 ›" at the top: tap to go up
  const crumbs = document.querySelector('#node .crumbs');
  crumbs.textContent = '';
  pathTo(node.id).slice(0, -1).forEach((p) => {
    const crumb = actionButton('crumb', 'open', p.id);
    crumb.textContent = p.text;
    crumbs.append(crumb);
  });

  const status = { finished: 'Finished', done: 'Done' }[node.status] || (toDo ? 'Not done yet' : 'Waiting');
  fill('#node .node-status', status);
  fill('#node .node-name', node.text);
  const meta = document.querySelector('#node .node-meta');
  meta.textContent = node.status === 'done' && node.before
    ? shortDate(node.date) + ' · felt ' + node.before + ', was ' + node.after
    : '';
  meta.hidden = !meta.textContent;
  document.querySelector('#node .no-steps').hidden = !(isBigTask(node) && node.children.length === 0);
  drawArc(document.querySelector('#node .node-arc'), node, true);

  // Which buttons make sense here
  const doButton = document.querySelector('#node [data-action="do-next"]');
  doButton.textContent = toDo ? 'Do this step' : 'Do the next step';
  doButton.hidden = node.status === 'finished' || (node.status === 'done' && node.children.length === 0);
  document.querySelector('#node [data-action="finish-node"]').hidden = node.status !== 'waiting' || toDo;
  document.querySelector('#node [data-action="remove"]').hidden = !isBigTask(node);

  show('node', false);
}


// ---------- Doing a step ----------

// Asks for a new step inside a task: "What's one small thing..." the first time, "What's the next..." after
function askForStep(parent) {
  asking = parent;
  typed = null;
  document.getElementById('smaller-question').textContent = parent.children.length === 0
    ? 'What’s one small thing you could do first?'
    : 'What’s the next small step?';
  document.getElementById('step-text').value = '';
  fill('.task-label', parent.text);
  show('smaller');
}

// Starts a step that's already in the tree: "How heavy does this step feel?"
function doStep(node) {
  step = node;
  reopen(node);
  fill('.step-text', node.text);
  show('before');
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

// "That's fine. It'll wait for you." with what's done so far in this part
function showLater(part) {
  const box = document.querySelector('#later .so-far');
  box.hidden = !part || part.children.length === 0;
  if (!box.hidden) {
    fill('#later .task-name', part.text);
    drawArc(document.querySelector('#later .arc'), part, false);
  }
  history = [];
  show('later', false);
}

// "I finished it": marks a task or part finished and shows its arc
function finish(node) {
  node.status = 'finished';
  node.finished = today();
  touch(node);
  fill('#finished .task-name', node.text);
  drawArc(document.querySelector('#finished .arc'), node, false);
  fill('.arc-summary', arcSummary(node));

  // A finished part of a bigger task offers a way back to that task
  const parent = parentOf(node);
  const up = document.querySelector('#finished .up-button');
  up.hidden = !parent;
  if (parent) {
    up.textContent = 'Back to “' + parent.text + '”';
    up.dataset.id = parent.id;
  }
  document.querySelector('#finished .new-button').className = (parent ? 'outline' : 'primary') + ' new-button';

  history = [];
  show('finished', false);
}


// ---------- The typing screens ----------

document.querySelector('#name form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = readBox(event.target);
  if (!text) return;
  const task = { id: newId(), text, status: 'waiting', created: today(), children: [] };
  data.tasks.push(task);
  touch(task);
  askForStep(task);
});

document.querySelector('#smaller form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = readBox(event.target);
  if (!text) return;
  if (typed) {
    typed.text = text;     // came Back and changed the words
  } else {
    typed = { id: newId(), text, status: 'waiting', children: [] };
    reopen(asking);
    asking.children.push(typed);
  }
  touch(typed);
  step = typed;
  fill('.step-text', text);
  show('before');
});

document.querySelector('#add form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = readBox(event.target);
  if (!text) return;
  reopen(adding);
  adding.children.push({ id: newId(), text, status: 'waiting', children: [] });
  touch(adding);
  history.pop();           // back to the task, with Back working as before
  showNode(adding, false);
});


// ---------- The 1 to 5 buttons ----------

document.querySelectorAll('.scale').forEach((scale) => {
  scale.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const rating = Number(button.value);

    if (scale.dataset.rating === 'before') {
      step.before = rating;
      touch(step);
      history = [];          // no going back once the step is set
      show('do-it', false);
    } else {
      step.after = rating;
      step.status = 'done';
      step.date = today();
      touch(step);
      const [line, kind] = resultWords(step.before, rating);
      fill('.result-line', line);
      fill('.result-kind', kind);
      fill('#result .finish-part', 'I finished “' + parentOf(step).text + '”');
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
    if (!previous) return;
    if (previous.screen === 'start') return goToStart();
    const path = previous.node && pathTo(previous.node);
    if (previous.screen === 'node') return path ? showNode(path[path.length - 1], false) : goToStart();
    show(previous.screen, false);
  },
  open(button) {
    const path = pathTo(button.dataset.id);
    if (path) showNode(path[path.length - 1]);
  },
  history: showHistory,

  // On a task or step's own screen
  'do-next'() {
    if (isStepToDo(viewing)) return doStep(viewing);
    const next = nextStepIn(viewing);
    return next ? doStep(next) : askForStep(viewing);
  },
  add() {
    adding = viewing;
    fill('.add-label', viewing.text);
    document.getElementById('add-text').value = '';
    show('add');
  },
  'finish-node'() {
    finish(viewing);
  },
  remove() {
    if (!window.confirm('Remove “' + viewing.text + '” and all its steps from this phone?')) return;
    data.tasks = data.tasks.filter((t) => t !== viewing);
    save();
    goToStart();
  },

  // While doing a step
  done() {
    show('after', false);
  },
  'not-now'() {
    delete step.before;    // asked again next time
    touch(step);
    showLater(parentOf(step));
  },
  'one-more'() {
    const part = parentOf(step);
    const next = nextStepIn(part);
    return next ? doStep(next) : askForStep(part);
  },
  'finish-part'() {
    finish(parentOf(step));
  },
  stop() {
    showLater(parentOf(step));
  },

  // After finishing
  up(button) {
    const path = pathTo(button.dataset.id);
    history = [{ screen: 'start', node: null }];
    return path ? showNode(path[path.length - 1], false) : goToStart();
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
