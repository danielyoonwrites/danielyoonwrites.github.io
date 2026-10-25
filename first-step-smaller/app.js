// First step smaller: shows one screen at a time.
// Practice version (build step 2): everything lives in memory and is forgotten
// when the page closes. Saving on the phone comes in step 3 (see SPEC.md).

// The task in progress, for example:
// { name: 'Clean the garage', steps: [ { text: 'Clear one shelf', before: 4, after: 2, date: '2026-10-25' } ] }
let task = { name: '', steps: [] };
let current = null;  // the small step being worked on: { text, before }
let history = [];    // screens visited, so Back can go to the one before

const screens = [...document.querySelectorAll('.screen')];

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

// Fills every element with this class on the page with the same words
function fill(selector, text) {
  document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
}

// Today's date as 2026-10-25, and how to show it, like "Oct 25"
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function shortDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Draws the arc: one line per small step, in order
function drawArc(list) {
  list.textContent = '';
  task.steps.forEach((step) => {
    const item = document.createElement('li');
    const date = document.createElement('span');
    date.className = 'arc-date';
    date.textContent = shortDate(step.date);
    const text = document.createElement('span');
    text.className = 'arc-text';
    text.textContent = step.text;
    const rating = document.createElement('span');
    rating.className = 'arc-rating';
    rating.textContent = 'felt ' + step.before + ', was ' + step.after;
    item.append(date, text, rating);
    list.append(item);
  });
}

// "3 small steps over 4 days"
function arcSummary() {
  const count = task.steps.length;
  const first = new Date(task.steps[0].date);
  const last = new Date(task.steps[count - 1].date);
  const days = Math.round((last - first) / 86400000) + 1;
  const steps = count === 1 ? '1 small step' : count + ' small steps';
  return days === 1 ? steps + ' in 1 day' : steps + ' over ' + days + ' days';
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

// Starts a new step: "What's one small thing..." the first time, "What's the next..." after
function askForStep() {
  const first = task.steps.length === 0;
  document.getElementById('smaller-question').textContent = first
    ? 'What’s one small thing you could do first?'
    : 'What’s the next small step?';
  document.getElementById('step-text').value = '';
  fill('.task-label', task.name);
  show('smaller');
}

// Shows the task's arc so far on the "That's fine" screen, if any steps are done
function showLater() {
  const soFar = document.querySelector('#later .so-far');
  soFar.hidden = task.steps.length === 0;
  if (task.steps.length) {
    fill('#later .task-name', task.name);
    drawArc(document.querySelector('#later .arc'));
  }
  history = [];
  show('later', false);
}

// ---------- The typing screens ----------

document.querySelector('#name form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = readBox(event.target);
  if (!name) return;
  task = { name, steps: [] };
  askForStep();
});

document.querySelector('#smaller form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = readBox(event.target);
  if (!text) return;
  document.getElementById('step-smaller').value = text;
  show('even-smaller');
});

document.querySelector('#even-smaller form').addEventListener('submit', (event) => {
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
  done() {
    show('after', false);
  },
  'not-now': showLater,
  'one-more': askForStep,
  finished() {
    fill('#finished .task-name', task.name);
    drawArc(document.querySelector('#finished .arc'));
    fill('.arc-summary', arcSummary());
    history = [];
    show('finished', false);
  },
  stop: showLater,
  restart() {
    task = { name: '', steps: [] };
    current = null;
    history = [];
    show('start', false);
  },
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button) actions[button.dataset.action]();
});
