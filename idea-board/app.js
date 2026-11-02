// Idea board: one big board of typed notes (build step 2 in SPEC.md).
// For now the board is saved only in this browser, on this device, in IndexedDB
// (the browser's own storage, which can hold photos later). Nothing is sent anywhere.
// Signing in and saving to your account come in build steps 6 and 7.


// ---------- What's saved ----------
//
// One record for each board, in IndexedDB (database "idea-board", store "boards"):
//   { id, name, version: 1, made, changed, items: [ item, ... ] }
//   item = { id, type: 'note', x, y, text, made, changed }
// x and y are where a note's top-left corner sits on the board, in board pixels.
// The last item in the list is drawn on top.
//
// Where you were looking (how far the board is moved, and the zoom) is kept separately,
// in localStorage, because it belongs to this device, not to the board.

const DB_NAME = 'idea-board';
const STORE = 'boards';
const VIEW_KEY = 'idea-board-view:';   // followed by the board's id
const DATA_VERSION = 1;                 // raise it if what's saved ever changes shape

const NOTE_WIDTH = 220;        // board pixels, the same as .note in style.css
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const MOVE_BEFORE_DRAG = 8;    // screen pixels a finger moves before a tap becomes a drag
const SAVE_DELAY = 400;        // milliseconds after the last change, before saving
const UNDO_TIME = 8000;        // milliseconds that "Note removed. Undo" stays

let db = null;                 // the open database, or null if this browser won't save
let board = null;              // the board on the screen
let readOnly = false;          // true if a newer version of the app saved this board
let view = { x: 0, y: 0, zoom: 1 };   // how far the board is moved on the screen, and the zoom
let editing = null;            // the note open on its own screen
let editingIsNew = false;      // true while a just-added note is open
let editorInHistory = false;   // true while the note screen has its own step in the Back history
let lastRemoved = null;        // { item, index }, for Undo
let removedTimer = null;
let saveTimer = null;
let viewTimer = null;

const boardEl = document.getElementById('board');
const worldEl = document.getElementById('world');
const emptyEl = document.getElementById('empty');
const statusEl = document.getElementById('status');
const editorEl = document.getElementById('editor');
const noteText = document.getElementById('note-text');
const removedEl = document.getElementById('removed');


// ---------- Small helpers ----------

function now() {
  return new Date().toISOString();
}

// A new id that won't clash with another one
function makeId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function showStatus(words) {
  statusEl.textContent = words;
}

function findItem(id) {
  return board.items.find((item) => item.id === id);
}

// A finger's (or the mouse's) place on the board area of the screen
function point(event) {
  const rect = boardEl.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}


// ---------- Saving on this device (IndexedDB) ----------

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('The database is open in another tab.'));
  });
}

function readAllBoards() {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function writeBoard(record) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(record);   // the browser copies the board right here
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// Saves a moment after the last change, so dragging a note doesn't save 60 times a second
function saveSoon() {
  if (!db || readOnly) return;
  showStatus('Saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, SAVE_DELAY);
}

async function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!db || readOnly) return;
  board.changed = now();
  try {
    await writeBoard(board);
    showStatus('Saved on this device');
  } catch (error) {
    showStatus('Couldn’t save on this device');
  }
}

function newBoard(name) {
  return { id: makeId(), name, version: DATA_VERSION, made: now(), changed: now(), items: [] };
}

// Where you were looking: kept for each board in localStorage
function saveViewSoon() {
  clearTimeout(viewTimer);
  viewTimer = setTimeout(saveView, 300);
}

function saveView() {
  clearTimeout(viewTimer);
  try {
    localStorage.setItem(VIEW_KEY + board.id, JSON.stringify(view));
  } catch (error) {
    // Some private modes won't save; the board just opens at the start next time
  }
}

function loadView() {
  try {
    const saved = JSON.parse(localStorage.getItem(VIEW_KEY + board.id));
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && Number.isFinite(saved.zoom)) {
      view = { x: saved.x, y: saved.y, zoom: clampZoom(saved.zoom) };
    }
  } catch (error) {
    // Nothing saved, or it can't be read: start at the beginning
  }
}

// Before the page closes or goes to the background, save anything still waiting
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (saveTimer) saveNow();
    if (board) saveView();
  }
});


// ---------- Drawing the board ----------

function render() {
  // Only notes for now. Anything else (from a later version) is kept, just not drawn.
  const notes = board.items.filter((item) => item.type === 'note');
  worldEl.replaceChildren(...notes.map(noteElement));
  emptyEl.hidden = notes.length > 0;
  applyView();
}

function noteElement(item) {
  const el = document.createElement('div');
  el.className = 'note';
  el.dataset.id = item.id;
  el.tabIndex = 0;                     // a computer's Tab key can reach it, and Enter opens it
  el.setAttribute('role', 'button');
  el.textContent = item.text;          // always as plain words, never as code
  placeNote(el, item);
  return el;
}

function placeNote(el, item) {
  el.style.left = item.x + 'px';
  el.style.top = item.y + 'px';
}

// Moves and zooms the world, and the dots behind it
function applyView() {
  worldEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  // The dots stay between 16 and 64 pixels apart, so they never get crowded
  let gap = 32 * view.zoom;
  while (gap < 16) gap *= 2;
  while (gap > 64) gap /= 2;
  boardEl.style.backgroundSize = `${gap}px ${gap}px`;
  boardEl.style.backgroundPosition = `${view.x}px ${view.y}px`;
}

// Zooms in or out, keeping the spot under (x, y) on the screen where it is
function zoomAt(newZoom, x, y) {
  newZoom = clampZoom(newZoom);
  const boardX = (x - view.x) / view.zoom;
  const boardY = (y - view.y) / view.zoom;
  view.zoom = newZoom;
  view.x = x - boardX * newZoom;
  view.y = y - boardY * newZoom;
  applyView();
  saveViewSoon();
}

function zoomFromCenter(factor) {
  const rect = boardEl.getBoundingClientRect();
  glide();
  zoomAt(view.zoom * factor, rect.width / 2, rect.height / 2);
}

// "Show all": moves and zooms so every note fits on the screen
function showAll() {
  const notes = board.items.filter((item) => item.type === 'note');
  if (!notes.length) {
    view = { x: 0, y: 0, zoom: 1 };
    applyView();
    saveViewSoon();
    return;
  }
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const outline of noteOutlines()) {
    left = Math.min(left, outline.left);
    top = Math.min(top, outline.top);
    right = Math.max(right, outline.right);
    bottom = Math.max(bottom, outline.bottom);
  }
  const rect = boardEl.getBoundingClientRect();
  const margin = 24;
  const buttonsRoom = 84;   // keep clear of the buttons at the bottom
  const width = Math.max(1, rect.width - margin * 2);
  const height = Math.max(1, rect.height - margin * 2 - buttonsRoom);
  const zoom = clampZoom(Math.min(width / (right - left), height / (bottom - top), 1));
  view = {
    zoom,
    x: margin + (width - (right - left) * zoom) / 2 - left * zoom,
    y: margin + (height - (bottom - top) * zoom) / 2 - top * zoom,
  };
  glide();
  applyView();
  saveViewSoon();
}

// Each note's outline on the board, in board pixels (a note grows taller with more words)
function noteOutlines() {
  return board.items.filter((item) => item.type === 'note').map((item) => {
    const el = worldEl.querySelector(`[data-id="${item.id}"]`);
    const height = el ? el.offsetHeight : NOTE_WIDTH;
    return { left: item.x, top: item.y, right: item.x + NOTE_WIDTH, bottom: item.y + height };
  });
}

// Moves the board, if needed, so a note is on the screen (the zoom stays the same)
function bringIntoView(item) {
  const el = worldEl.querySelector(`[data-id="${item.id}"]`);
  if (!el) return;
  const rect = boardEl.getBoundingClientRect();
  const margin = 16;
  const buttonsRoom = 84;   // keep clear of the buttons at the bottom
  const left = view.x + item.x * view.zoom;
  const top = view.y + item.y * view.zoom;
  const right = left + NOTE_WIDTH * view.zoom;
  const bottom = top + el.offsetHeight * view.zoom;
  let dx = 0;
  let dy = 0;
  if (left < margin) dx = margin - left;
  else if (right > rect.width - margin) dx = rect.width - margin - right;
  if (top < margin) dy = margin - top;
  else if (bottom > rect.height - buttonsRoom) dy = Math.max(margin - top, rect.height - buttonsRoom - bottom);
  if (!dx && !dy) return;
  view.x += dx;
  view.y += dy;
  glide();
  applyView();
  saveViewSoon();
}

// The board glides, instead of jumping, when a button moves it
function glide() {
  worldEl.classList.add('gliding');
  boardEl.classList.add('gliding');
  setTimeout(() => {
    worldEl.classList.remove('gliding');
    boardEl.classList.remove('gliding');
  }, 300);
}


// ---------- Moving the board, pinching, and dragging notes ----------
//
// Pointer events cover fingers and the mouse alike.
// One finger (or the mouse) on an empty spot moves the board.
// One finger on a note drags the note; a tap without moving opens it.
// Two fingers pinch to zoom.

const pointers = new Map();   // the fingers (or the mouse) on the board: id -> { x, y }
let gesture = null;
// gesture is one of:
//   { kind: 'pan', lastX, lastY }
//   { kind: 'note', item, el, startX, startY, itemX, itemY, dragging }
//   { kind: 'pinch', startDistance, startZoom, boardX, boardY }

boardEl.addEventListener('pointerdown', (event) => {
  if (editing || (event.pointerType === 'mouse' && event.button !== 0)) return;
  const p = point(event);
  pointers.set(event.pointerId, p);
  boardEl.setPointerCapture(event.pointerId);   // keep getting this finger's moves, wherever it goes
  worldEl.classList.remove('gliding');          // a finger on the board stops any gliding at once
  boardEl.classList.remove('gliding');
  if (pointers.size === 1) {
    const noteEl = event.target.closest('.note');
    const item = noteEl && findItem(noteEl.dataset.id);
    if (item) {
      gesture = { kind: 'note', item, el: noteEl, startX: p.x, startY: p.y, itemX: item.x, itemY: item.y, dragging: false };
    } else {
      gesture = { kind: 'pan', lastX: p.x, lastY: p.y };
      boardEl.classList.add('moving');
    }
  } else if (pointers.size === 2) {
    finishNoteDrag();   // a second finger turns a drag into a pinch
    startPinch();
  }
});

boardEl.addEventListener('pointermove', (event) => {
  if (!pointers.has(event.pointerId)) return;
  const p = point(event);
  pointers.set(event.pointerId, p);
  if (!gesture) return;

  if (gesture.kind === 'pan') {
    view.x += p.x - gesture.lastX;
    view.y += p.y - gesture.lastY;
    gesture.lastX = p.x;
    gesture.lastY = p.y;
    applyView();
  } else if (gesture.kind === 'note') {
    const dx = p.x - gesture.startX;
    const dy = p.y - gesture.startY;
    if (!gesture.dragging) {
      if (Math.hypot(dx, dy) < MOVE_BEFORE_DRAG) return;   // still a tap, so far
      gesture.dragging = true;
      gesture.el.classList.add('dragging');
      bringToFront(gesture.item, gesture.el);
    }
    gesture.item.x = Math.round(gesture.itemX + dx / view.zoom);
    gesture.item.y = Math.round(gesture.itemY + dy / view.zoom);
    placeNote(gesture.el, gesture.item);
  } else if (gesture.kind === 'pinch' && pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
    const zoom = clampZoom(gesture.startZoom * distance / gesture.startDistance);
    const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    // The spot that was between the fingers stays between them
    view = { zoom, x: middle.x - gesture.boardX * zoom, y: middle.y - gesture.boardY * zoom };
    applyView();
  }
});

function startPinch() {
  const [a, b] = [...pointers.values()];
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  gesture = {
    kind: 'pinch',
    startDistance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
    startZoom: view.zoom,
    boardX: (middle.x - view.x) / view.zoom,   // the board spot between the fingers
    boardY: (middle.y - view.y) / view.zoom,
  };
}

function pointerEnded(event) {
  if (!pointers.has(event.pointerId)) return;
  pointers.delete(event.pointerId);
  if (!gesture) return;

  if (gesture.kind === 'note') {
    if (gesture.dragging) {
      finishNoteDrag();
    } else if (event.type === 'pointerup') {
      const item = gesture.item;
      gesture = null;
      openEditor(item, false);   // a tap opens the note
    } else {
      gesture = null;
    }
  } else if (gesture.kind === 'pinch') {
    if (pointers.size === 1) {
      // One finger is left: keep moving the board with it
      const [p] = [...pointers.values()];
      gesture = { kind: 'pan', lastX: p.x, lastY: p.y };
    } else if (pointers.size === 0) {
      gesture = null;
    }
    saveViewSoon();
  } else if (gesture.kind === 'pan' && pointers.size === 0) {
    gesture = null;
    boardEl.classList.remove('moving');
    saveViewSoon();
  }
}

boardEl.addEventListener('pointerup', pointerEnded);
boardEl.addEventListener('pointercancel', pointerEnded);

function finishNoteDrag() {
  if (!gesture || gesture.kind !== 'note') return;
  if (gesture.dragging) {
    gesture.el.classList.remove('dragging');
    gesture.item.changed = now();
    saveSoon();
  }
  gesture = null;
}

// The note you pick up goes on top of the others (last in the list is drawn on top)
function bringToFront(item, el) {
  const index = board.items.indexOf(item);
  if (index !== -1 && index !== board.items.length - 1) {
    board.items.splice(index, 1);
    board.items.push(item);
  }
  worldEl.appendChild(el);
}

// The mouse wheel zooms, around the mouse
boardEl.addEventListener('wheel', (event) => {
  event.preventDefault();
  const p = point(event);
  const lines = event.deltaMode === 1 ? 40 : 1;   // some mice count in lines, not pixels
  zoomAt(view.zoom * Math.exp(-event.deltaY * lines * 0.002), p.x, p.y);
}, { passive: false });

// No menu on a long press: it's for dragging
boardEl.addEventListener('contextmenu', (event) => event.preventDefault());

// On a computer: Tab to a note, then Enter opens it
worldEl.addEventListener('keydown', (event) => {
  const noteEl = event.target.closest('.note');
  if (!noteEl || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  const item = findItem(noteEl.dataset.id);
  if (item) openEditor(item, false);
});


// ---------- Adding a note ----------

function addNote() {
  if (readOnly) return;
  const { x, y } = openSpot();
  const item = { id: makeId(), type: 'note', x, y, text: '', made: now(), changed: now() };
  openEditor(item, true);   // it joins the board once you type something
}

// An open spot for a new note, as near the middle of the screen as possible,
// so it never covers another note. On a phone held upright it tries below first,
// on a wide screen to the right.
function openSpot() {
  const rect = boardEl.getBoundingClientRect();
  const middleX = (rect.width / 2 - view.x) / view.zoom - NOTE_WIDTH / 2;
  const middleY = (rect.height / 2 - 40 - view.y) / view.zoom - NOTE_WIDTH / 2;
  const upright = rect.height > rect.width;
  const step = NOTE_WIDTH + 24;
  const gap = 12;
  const taken = noteOutlines();
  const spots = [];
  for (let ring = 0; ring <= 8; ring += 1) {
    for (let across = -ring; across <= ring; across += 1) {
      for (let down = -ring; down <= ring; down += 1) {
        if (Math.max(Math.abs(across), Math.abs(down)) !== ring) continue;
        // How far the spot is from the middle; the small extras prefer right over left, and below over above
        const distance = upright ? Math.hypot(across * 1.2, down) : Math.hypot(across, down * 1.2);
        const order = distance + (across < 0 ? 0.01 : 0) + (down < 0 ? 0.02 : 0);
        spots.push({ x: middleX + across * step, y: middleY + down * step, order });
      }
    }
  }
  spots.sort((a, b) => a.order - b.order);
  const free = spots.find((spot) => !taken.some((outline) =>
    spot.x < outline.right + gap && spot.x + NOTE_WIDTH > outline.left - gap &&
    spot.y < outline.bottom + gap && spot.y + NOTE_WIDTH > outline.top - gap));
  const chosen = free || { x: middleX, y: middleY };
  return { x: Math.round(chosen.x), y: Math.round(chosen.y) };
}


// ---------- A note on its own screen ----------

function openEditor(item, isNew) {
  if (readOnly) return;
  editing = item;
  editingIsNew = isNew;
  noteText.value = item.text;
  editorEl.hidden = false;
  noteText.focus();   // opens the phone's keyboard
  if (!isNew) noteText.setSelectionRange(noteText.value.length, noteText.value.length);
  // Give the note screen its own step in the Back history,
  // so the phone's Back button (<) closes the note instead of leaving the app
  history.pushState({ ideaBoardNote: true }, '');
  editorInHistory = true;
}

// Every letter is saved, so nothing is lost if the phone closes the page mid-sentence
noteText.addEventListener('input', () => {
  if (!editing) return;
  editing.text = noteText.value;
  editing.changed = now();
  if (!board.items.includes(editing) && editing.text.trim()) {
    board.items.push(editing);   // a new note joins the board with its first letter
  }
  saveSoon();
});

function closeEditor(fromBackButton) {
  if (!editing) return;
  const item = editing;
  editing = null;
  editorEl.hidden = true;
  noteText.blur();
  if (!item.text.trim()) removeItem(item, false);   // an empty note isn't kept
  render();
  if (editingIsNew && board.items.includes(item)) bringIntoView(item);   // so you see where it went
  editingIsNew = false;
  if (saveTimer) saveNow();
  // Take away the note screen's step in the Back history, unless Back already did
  if (!fromBackButton && editorInHistory) {
    editorInHistory = false;
    history.back();
  }
}

document.getElementById('done').addEventListener('click', () => closeEditor(false));

document.getElementById('remove-note').addEventListener('click', () => {
  if (!editing) return;
  const item = editing;
  const wasOnBoard = board.items.includes(item);
  if (wasOnBoard) removeItem(item, item.text.trim() !== '');   // Undo only for a note with words
  item.text = wasOnBoard ? item.text : '';
  closeEditor(false);
});

// The phone's Back button (<) while a note is open: close the note, keep the words
window.addEventListener('popstate', () => {
  editorInHistory = false;
  if (editing) closeEditor(true);
});


// ---------- Removing, and Undo ----------

function removeItem(item, offerUndo) {
  const index = board.items.indexOf(item);
  if (index === -1) return;
  board.items.splice(index, 1);
  if (offerUndo) {
    lastRemoved = { item, index };
    removedEl.hidden = false;
    clearTimeout(removedTimer);
    removedTimer = setTimeout(() => {
      removedEl.hidden = true;
      lastRemoved = null;
    }, UNDO_TIME);
  }
  saveSoon();
}

document.getElementById('undo').addEventListener('click', () => {
  if (!lastRemoved) return;
  const { item, index } = lastRemoved;
  board.items.splice(Math.min(index, board.items.length), 0, item);
  lastRemoved = null;
  clearTimeout(removedTimer);
  removedEl.hidden = true;
  render();
  saveSoon();
});


// ---------- The buttons ----------

document.getElementById('add-note').addEventListener('click', addNote);
document.getElementById('show-all').addEventListener('click', showAll);
document.getElementById('zoom-in').addEventListener('click', () => zoomFromCenter(1.25));
document.getElementById('zoom-out').addEventListener('click', () => zoomFromCenter(1 / 1.25));


// ---------- Starting ----------

async function start() {
  // A reload while a note was open leaves its Back step behind: tidy it away
  if (history.state && history.state.ideaBoardNote) history.replaceState(null, '');

  try {
    db = await openDatabase();
    const boards = await readAllBoards();
    // The board changed most recently (build step 3 adds a list of boards)
    boards.sort((a, b) => String(b.changed).localeCompare(String(a.changed)));
    board = boards.find((record) => record && Array.isArray(record.items)) || null;
  } catch (error) {
    db = null;
  }

  if (board && board.version > DATA_VERSION) {
    // Saved by a newer version of the app: show it, but never write over it
    readOnly = true;
    showStatus('Reload the page to get the newest version');
  } else if (!board) {
    board = newBoard('My board');
    if (db) saveNow();
  }

  if (!db) showStatus('This browser won’t save here');
  else if (!readOnly) showStatus('Saved on this device');

  loadView();
  render();
}

start();
