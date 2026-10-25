// Living in the Word: shows one screen at a time, and turns a passage into
// questions for a small group. Nothing is ever sent anywhere, and in this step
// nothing is saved either: the questions stay only while the page is open.
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
  const target = id === 'passage' ? screen.querySelector('input') : screen.querySelector('h2');
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

  // Puts back the method's own questions, undoing every edit (asks first if anything changed)
  reset() {
    const changed = drafts[method].join('\n') !== METHODS[method].questions.join('\n');
    if (changed && !window.confirm('Undo your changes and start these questions over?')) return;
    drafts[method] = freshQuestions(method);
    showQuestions();
  },
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button && actions[button.dataset.action]) actions[button.dataset.action]();
});
