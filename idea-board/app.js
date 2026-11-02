// Idea board: boards of typed notes and photos (build steps 2 to 4 in SPEC.md) that line up on the
// board's dots. For now everything is saved only in this browser, on this device, in IndexedDB
// (the browser's own storage). Nothing is sent anywhere.
// Signing in and saving to your account come in build steps 6 and 7.


// ---------- What's saved ----------
//
// One record for each board, in IndexedDB (database "idea-board", store "boards"):
//   { id, name, version: 1, made, changed, items: [ item, ... ] }
//   item = { id, type: 'note', x, y, text, made, changed }
//       or { id, type: 'photo', photoId, x, y, width, ratio, made, changed }
// x and y are where an item's top-left corner sits on the board, in board pixels.
// An item added or moved sits on a settling spot (a whole number of SETTLE_GAP steps, on the dots);
// a note saved before notes lined up stays where it was until it's moved.
// A photo's width is in board pixels, and ratio is its height divided by its width.
// The last item in the list is drawn on top. An item of a type this version doesn't know
// (from a later version) is kept and saved, just not drawn.
//
// The photos themselves are in a second database ("idea-board-photos", store "photos"), one record
// for each: { id, blob, width, height, made }, where blob is the smaller JPEG copy made on this
// device. Keeping them apart means a board's record stays small, and the boards' database didn't
// need changing, so an older copy of the app (a phone can keep one for 10 minutes) still opens it.
//
// Where you were looking on each board (how far it's moved, and the zoom) is kept separately,
// in localStorage, because it belongs to this device, not to the board.

const DB_NAME = 'idea-board';
const STORE = 'boards';
const VIEW_KEY = 'idea-board-view:';   // followed by the board's id
const DATA_VERSION = 1;                 // raise it if what's saved ever changes shape
const UNTITLED = 'Untitled board';      // the name of a board saved without one

const PHOTO_DB_NAME = 'idea-board-photos';
const PHOTO_STORE = 'photos';
const PHOTO_LONG_SIDE = 1600;           // pixels on the long side of the smaller copy that's saved
const PHOTO_QUALITY = 0.85;             // how sharp that JPEG copy is (1 is the sharpest, and biggest)
const TIDY_AFTER = 24 * 60 * 60 * 1000; // a photo file no board uses is tidied away after a day

const NOTE_WIDTH = 220;        // board pixels, the same as .note in style.css
const PHOTO_WIDTH = 220;       // board pixels: a new photo is as wide as a note
const PHOTO_MIN_WIDTH = 156;   // board pixels: the smallest a photo can be (3 spots, less the gap)
const PHOTO_MAX_WIDTH = 988;   // board pixels: the biggest, as wide as four notes side by side
const SMALL_ON_SCREEN = 120;   // screen pixels: a photo narrower than this hides its size corner
const DOT_GAP = 32;            // board pixels between the faint dots, at the normal zoom
const SETTLE_GAP = 64;         // board pixels between the spots where a note's top-left corner settles:
                               // every second dot, so the spots are easy to hit with a finger
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const MOVE_BEFORE_DRAG = 8;    // screen pixels a finger moves before a tap becomes a drag
const SAVE_DELAY = 400;        // milliseconds after the last change, before saving
const UNDO_TIME = 8000;        // milliseconds that "Note removed. Undo" stays

let db = null;                 // the open database, or null if this browser won't save
let photoDb = null;            // the photos' database, or null if this browser won't save photos
const photoUrls = new Map();   // photoId -> a link the page can show, made from the saved JPEG
let boards = [];               // every board on this device
let board = null;              // the board on the screen (null on the list of boards)
let screen = 'list';           // 'list' or 'board'
let readOnly = false;          // true if a newer version of the app saved this board
let view = { x: 0, y: 0, zoom: 1 };   // how far the board is moved on the screen, and the zoom
let editing = null;            // the note open on its own screen
let editingIsNew = false;      // true while a just-added note is open
let viewing = null;            // the photo open on its own screen
let pendingPhoto = null;       // a photo chosen on a new note's screen, added once that screen closes
let settingsMode = null;       // 'new' or 'rename' while a board's name is open on its own screen
let leaving = false;           // true between tapping "Done" (or "Boards") and the screen closing
let lastRemoved = null;        // for Undo: { kind: 'item', item, index } or { kind: 'board', record }
let removedTimer = null;
let saveTimer = null;
let viewTimer = null;

const $ = (id) => document.getElementById(id);
const listScreen = $('list-screen');
const boardScreen = $('board-screen');
const boardsEl = $('boards');
const boardEl = $('board');
const worldEl = $('world');
const emptyEl = $('empty');
const statusEl = $('status');
const editorEl = $('editor');
const noteText = $('note-text');
const settingsEl = $('board-settings');
const nameInput = $('board-name-input');
const removedEl = $('removed');
const photoInput = $('photo-file');
const photoViewEl = $('photo-view');


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

// "Saving," "Saved on this device" or a problem, in the board's corner. "Saved" fades after a few
// seconds, so it doesn't sit over a note; anything else stays until it changes.
let statusTimer = null;
function showStatus(words) {
  statusEl.textContent = words;
  statusEl.classList.remove('faded');
  clearTimeout(statusTimer);
  if (words === 'Saved on this device') statusTimer = setTimeout(() => statusEl.classList.add('faded'), 3000);
}

function findItem(id) {
  return board.items.find((item) => item.id === id);
}

function notesOf(record) {
  return record.items.filter((item) => item.type === 'note');
}

function photosOf(record) {
  return record.items.filter((item) => item.type === 'photo');
}

// What this version draws on a board: notes and photos (anything else is kept, not drawn)
function drawnItems(record) {
  return record.items.filter((item) => item.type === 'note' || item.type === 'photo');
}

// "No notes yet," "1 note," "3 notes," "1 photo" or "3 notes and 1 photo"
function whatsOnIt(record) {
  const notes = notesOf(record).length;
  const photos = photosOf(record).length;
  const parts = [];
  if (notes) parts.push(notes === 1 ? '1 note' : `${notes} notes`);
  if (photos) parts.push(photos === 1 ? '1 photo' : `${photos} photos`);
  return parts.length ? parts.join(' and ') : 'No notes yet';
}

function nameOf(record) {
  return (record.name || '').trim() || UNTITLED;
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

// Writes one board (or, with remove, deletes it), and waits until it's really saved
function changeBoard(record, remove) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    if (remove) store.delete(record.id);
    else store.put(record);   // the browser copies the board right here
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// The photos' own database (see "What's saved" at the top)
function openPhotoDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('The photos are open in another tab.'));
  });
}

// Does one thing with the photos, and waits until it's really done
function photoTransaction(mode, work) {
  return new Promise((resolve, reject) => {
    const transaction = photoDb.transaction(PHOTO_STORE, mode);
    const request = work(transaction.objectStore(PHOTO_STORE));
    transaction.oncomplete = () => resolve(request ? request.result : undefined);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function savePhotoFile(record) {
  return photoTransaction('readwrite', (store) => store.put(record));
}

function readPhotoFile(id) {
  return photoTransaction('readonly', (store) => store.get(id));
}

// Removes photo files for good: only once removing their photo (or board) can't be undone
function deletePhotoFiles(ids) {
  if (!photoDb || !ids.length) return Promise.resolve();
  return photoTransaction('readwrite', (store) => {
    ids.forEach((id) => store.delete(id));
  }).catch(() => {});   // if it fails, tidyPhotoFiles() takes them away later
}

// At the start: a photo file no board uses (left behind if the page closed while "Photo removed.
// Undo" or "Board removed. Undo" was showing) is taken away once it's a day old. A newer one is
// left alone, in case another tab is adding it right now.
async function tidyPhotoFiles() {
  if (!photoDb || !db) return;
  const used = new Set();
  for (const record of boards) {
    for (const item of photosOf(record)) used.add(item.photoId);
  }
  const files = await photoTransaction('readonly', (store) => store.getAll());
  const old = files.filter((file) => !used.has(file.id) && Date.now() - Date.parse(file.made) > TIDY_AFTER);
  await deletePhotoFiles(old.map((file) => file.id));
}

// Saves a moment after the last change, so dragging a note doesn't save 60 times a second
function saveSoon() {
  if (!db || readOnly || !board) return;
  showStatus('Saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, SAVE_DELAY);
}

async function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!db || readOnly || !board) return;
  board.changed = now();
  try {
    await changeBoard(board);
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
  if (!board) return;
  try {
    localStorage.setItem(VIEW_KEY + board.id, JSON.stringify(view));
  } catch (error) {
    // Some private modes won't save; the board just opens at the start next time
  }
}

// True if this device remembers where you were on the board
function loadView() {
  try {
    const saved = JSON.parse(localStorage.getItem(VIEW_KEY + board.id));
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && Number.isFinite(saved.zoom)) {
      view = { x: saved.x, y: saved.y, zoom: clampZoom(saved.zoom) };
      return true;
    }
  } catch (error) {
    // Nothing saved, or it can't be read: start at the beginning
  }
  return false;
}

// Before the page closes or goes to the background, save anything still waiting
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (saveTimer) saveNow();
    saveView();
  }
});


// ---------- Going from screen to screen (and the phone's Back button) ----------
//
// The screens: the list of boards, then a board, then on top of a board either a note or the
// board's name. Each step deeper adds a step to the browser's Back history, so the phone's
// Back button (<) goes back one step instead of leaving the app. "Done" and "Boards" go back
// the same way. Whenever the history moves, followHistory() shows what that step should show.

function goDeeper(step) {
  history.pushState({ ideaBoard: step }, '');
}

function goBack(steps = 1) {
  if (leaving) return;   // a second quick tap mustn't go back a step too far
  leaving = true;
  setTimeout(() => { leaving = false; }, 1000);   // just in case the history doesn't move
  history.go(-steps);
}

window.addEventListener('popstate', (event) => followHistory(event.state && event.state.ideaBoard));

function followHistory(step) {
  leaving = false;
  if (editing && step !== 'note') closeEditor();
  if (viewing && step !== 'photo') closePhoto();
  if (settingsMode && step !== 'settings') closeSettings();
  if (screen === 'board' && (!step || step === 'list')) showList();
}


// ---------- The list of boards ----------

function showList() {
  if (board) {
    if (saveTimer) saveNow();
    saveView();
  }
  board = null;
  screen = 'list';
  if (lastRemoved && lastRemoved.kind === 'item') clearRemoved();   // that note or photo stays removed
  forgetPhotoUrls();
  boardScreen.hidden = true;
  listScreen.hidden = false;
  $('board-tools').hidden = true;
  $('list-tools').hidden = false;
  renderList();
}

function renderList() {
  boards.sort((a, b) => String(b.changed).localeCompare(String(a.changed)));   // newest first
  boardsEl.replaceChildren(...boards.map(boardRow));
  $('no-boards').hidden = boards.length > 0;
}

function boardRow(record) {
  const row = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'row';
  button.dataset.id = record.id;
  const name = document.createElement('span');
  name.className = 'row-name';
  name.textContent = nameOf(record);   // always as plain words, never as code
  const count = document.createElement('span');
  count.className = 'row-count';
  count.textContent = whatsOnIt(record);
  const arrow = document.createElement('span');
  arrow.className = 'row-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  button.append(name, count, arrow);
  row.append(button);
  return row;
}

boardsEl.addEventListener('click', (event) => {
  const row = event.target.closest('.row');
  const record = row && boards.find((each) => each.id === row.dataset.id);
  if (!record) return;
  goDeeper('board');
  openBoard(record);
});


// ---------- One board ----------

function openBoard(record) {
  board = record;
  screen = 'board';
  readOnly = board.version > DATA_VERSION;   // saved by a newer version: show it, never write over it
  if (lastRemoved && lastRemoved.kind === 'board') clearRemoved();   // that board stays removed
  view = { x: 0, y: 0, zoom: 1 };
  const remembered = loadView();
  listScreen.hidden = true;
  boardScreen.hidden = false;
  $('list-tools').hidden = true;
  $('board-tools').hidden = false;
  $('board-name').textContent = nameOf(board);
  render();
  // The first time this device opens a board with notes or photos on it, show them all
  if (!remembered && drawnItems(board).length) showAll(false);
  if (readOnly) showStatus('Reload the page to get the newest version');
  else showStatus(db ? 'Saved on this device' : 'This browser won’t save here');
}

$('to-boards').addEventListener('click', () => goBack());

function render() {
  // Notes and photos. Anything else (from a later version) is kept, just not drawn.
  const items = drawnItems(board);
  worldEl.replaceChildren(...items.map((item) => (item.type === 'photo' ? photoElement(item) : noteElement(item))));
  emptyEl.hidden = items.length > 0;
  applyView();
}

function noteElement(item) {
  const el = document.createElement('div');
  el.className = 'item note';
  el.dataset.id = item.id;
  el.tabIndex = 0;                     // a computer's Tab key can reach it, and Enter opens it
  el.setAttribute('role', 'button');
  el.textContent = item.text;          // always as plain words, never as code
  placeItem(el, item);
  return el;
}

function photoElement(item) {
  const el = document.createElement('div');
  el.className = 'item photo';
  el.dataset.id = item.id;
  el.tabIndex = 0;                     // a computer's Tab key can reach it, and Enter opens it
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Photo');
  const picture = document.createElement('img');
  picture.alt = '';                    // the label above already says what it is
  picture.draggable = false;           // dragging moves the photo, not a copy of the picture
  const corner = document.createElement('span');
  corner.className = 'corner';         // the size corner: drag it to make the photo bigger or smaller
  corner.setAttribute('aria-hidden', 'true');
  el.append(picture, corner);
  placeItem(el, item);
  showPhoto(picture, item.photoId);
  return el;
}

// Where an item sits on the board, and a photo's size
function placeItem(el, item) {
  el.style.left = item.x + 'px';
  el.style.top = item.y + 'px';
  if (item.type === 'photo') {
    el.style.width = item.width + 'px';
    el.style.height = item.width * item.ratio + 'px';
  }
}

// Puts a saved photo into an <img>, once it's read from the photos' database
async function showPhoto(picture, photoId) {
  let url = photoUrls.get(photoId);
  if (!url && photoDb) {
    try {
      const file = await readPhotoFile(photoId);
      if (file && file.blob) {
        url = photoUrls.get(photoId) || URL.createObjectURL(file.blob);
        photoUrls.set(photoId, url);
      }
    } catch (error) {
      // shown as missing, below
    }
  }
  if (url) picture.src = url;
  else if (picture.parentElement) picture.parentElement.classList.add('missing');
}

// Leaving a board: the links made for its photos aren't needed any more
function forgetPhotoUrls() {
  for (const url of photoUrls.values()) URL.revokeObjectURL(url);
  photoUrls.clear();
}

// The nearest spot where a note's corner can settle, one direction at a time (across, then down).
// The spots are the same at every zoom, so any two notes can always line up exactly.
function onSpot(value) {
  return Math.round(value / SETTLE_GAP) * SETTLE_GAP;
}

// A photo's width settles to a whole number of spots, less the 36-pixel gap between two notes
// side by side, so a photo can be exactly as wide as one note (220), two side by side (476),
// three (732) or four (988), with steps of 64 in between
function settledWidth(width) {
  const gapBetweenNotes = SETTLE_GAP * 4 - NOTE_WIDTH;   // 36
  const spots = Math.round((width + gapBetweenNotes) / SETTLE_GAP);
  return Math.min(PHOTO_MAX_WIDTH, Math.max(PHOTO_MIN_WIDTH, spots * SETTLE_GAP - gapBetweenNotes));
}

// Moves and zooms the world, and the dots behind it
function applyView() {
  worldEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  // The dots stay between 16 and 64 pixels apart, so they never get crowded. A dot is drawn in
  // the middle of its little square, so the squares start half a square up and to the left:
  // that puts a dot on every spot where a note's corner settles (only when zoomed out the
  // farthest, below a quarter of the size, are there spots between the dots).
  let gap = DOT_GAP * view.zoom;
  while (gap < 16) gap *= 2;
  while (gap > 64) gap /= 2;
  boardEl.style.backgroundSize = `${gap}px ${gap}px`;
  boardEl.style.backgroundPosition = `${view.x - gap / 2}px ${view.y - gap / 2}px`;
  // A photo's size corner stays the same size on the screen at any zoom (style.css uses --zoom),
  // and hides when the photo is small on the screen, so it never covers the picture
  worldEl.style.setProperty('--zoom', view.zoom);
  for (const el of worldEl.querySelectorAll('.photo')) {
    el.classList.toggle('small', el.offsetWidth * view.zoom < SMALL_ON_SCREEN);
  }
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

// "Show all": moves and zooms so every note and photo fits on the screen
function showAll(gliding = true) {
  if (!drawnItems(board).length) {
    view = { x: 0, y: 0, zoom: 1 };
    applyView();
    saveViewSoon();
    return;
  }
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const outline of itemOutlines()) {
    left = Math.min(left, outline.left);
    top = Math.min(top, outline.top);
    right = Math.max(right, outline.right);
    bottom = Math.max(bottom, outline.bottom);
  }
  const rect = boardEl.getBoundingClientRect();
  const margin = 24;
  const buttonsRoom = roomForButtons();   // keep clear of the buttons at the bottom
  const width = Math.max(1, rect.width - margin * 2);
  const height = Math.max(1, rect.height - margin - buttonsRoom - margin);
  const zoom = clampZoom(Math.min(width / (right - left), height / (bottom - top), 1));
  view = {
    zoom,
    x: margin + (width - (right - left) * zoom) / 2 - left * zoom,
    y: margin + (height - (bottom - top) * zoom) / 2 - top * zoom,
  };
  if (gliding) glide();
  applyView();
  saveViewSoon();
}

// How much of the bottom of the board the buttons cover (two rows on a narrow screen)
function roomForButtons() {
  const boardRect = boardEl.getBoundingClientRect();
  const toolsRect = $('board-tools').getBoundingClientRect();
  return Math.max(0, boardRect.bottom - toolsRect.top) + 8;
}

// An item's size on the board, in board pixels (a note grows taller with more words)
function itemSize(item) {
  if (item.type === 'photo') return { width: item.width, height: item.width * item.ratio };
  const el = worldEl.querySelector(`[data-id="${item.id}"]`);
  return { width: NOTE_WIDTH, height: el ? el.offsetHeight : NOTE_WIDTH };
}

// Each note's and photo's outline on the board, in board pixels
function itemOutlines() {
  return drawnItems(board).map((item) => {
    const { width, height } = itemSize(item);
    return { left: item.x, top: item.y, right: item.x + width, bottom: item.y + height };
  });
}

// Moves the board, if needed, so an item is on the screen (the zoom stays the same)
function bringIntoView(item) {
  const el = worldEl.querySelector(`[data-id="${item.id}"]`);
  if (!el) return;
  const rect = boardEl.getBoundingClientRect();
  const margin = 16;
  const buttonsRoom = roomForButtons();   // keep clear of the buttons at the bottom
  const size = itemSize(item);
  const left = view.x + item.x * view.zoom;
  const top = view.y + item.y * view.zoom;
  const right = left + size.width * view.zoom;
  const bottom = top + size.height * view.zoom;
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


// ---------- Moving the board, pinching, and dragging notes and photos ----------
//
// Pointer events cover fingers and the mouse alike.
// One finger (or the mouse) on an empty spot moves the board.
// One finger on a note or photo drags it; a tap without moving opens it.
// One finger on a photo's size corner makes the photo bigger or smaller.
// Two fingers pinch to zoom.

const pointers = new Map();   // the fingers (or the mouse) on the board: id -> { x, y }
let gesture = null;
// gesture is one of:
//   { kind: 'pan', lastX, lastY }
//   { kind: 'item', item, el, startX, startY, itemX, itemY, dragging }
//   { kind: 'resize', item, el, startX, startY, startWidth, dragging }
//   { kind: 'pinch', startDistance, startZoom, boardX, boardY }

boardEl.addEventListener('pointerdown', (event) => {
  if (editing || viewing || (event.pointerType === 'mouse' && event.button !== 0)) return;
  const p = point(event);
  pointers.set(event.pointerId, p);
  boardEl.setPointerCapture(event.pointerId);   // keep getting this finger's moves, wherever it goes
  worldEl.classList.remove('gliding');          // a finger on the board stops any gliding at once
  boardEl.classList.remove('gliding');
  if (pointers.size === 1) {
    const itemEl = event.target.closest('.item');
    const item = itemEl && findItem(itemEl.dataset.id);
    if (item) {
      itemEl.classList.remove('settling');   // picked up again while still gliding: it follows the finger at once
      const kind = event.target.closest('.corner') ? 'resize' : 'item';
      gesture = { kind, item, el: itemEl, startX: p.x, startY: p.y, itemX: item.x, itemY: item.y, startWidth: item.width, dragging: false };
    } else {
      gesture = { kind: 'pan', lastX: p.x, lastY: p.y };
      boardEl.classList.add('moving');
    }
  } else if (pointers.size === 2) {
    finishDrag();   // a second finger turns a drag into a pinch
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
  } else if (gesture.kind === 'item' || gesture.kind === 'resize') {
    const dx = p.x - gesture.startX;
    const dy = p.y - gesture.startY;
    if (!gesture.dragging) {
      if (Math.hypot(dx, dy) < MOVE_BEFORE_DRAG) return;   // still a tap, so far
      if (readOnly) return;
      gesture.dragging = true;
      gesture.el.classList.add('dragging');
      bringToFront(gesture.item, gesture.el);
    }
    if (gesture.kind === 'item') {
      gesture.item.x = Math.round(gesture.itemX + dx / view.zoom);
      gesture.item.y = Math.round(gesture.itemY + dy / view.zoom);
    } else {
      // The size follows the finger along the photo's diagonal, so the photo keeps its shape
      // whichever way the finger goes
      const ratio = gesture.item.ratio;
      const grow = (dx + dy * ratio) / view.zoom / (1 + ratio * ratio);
      gesture.item.width = Math.min(PHOTO_MAX_WIDTH, Math.max(PHOTO_MIN_WIDTH, Math.round(gesture.startWidth + grow)));
    }
    placeItem(gesture.el, gesture.item);
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

  if (gesture.kind === 'item' || gesture.kind === 'resize') {
    if (gesture.dragging) {
      finishDrag();
    } else if (event.type === 'pointerup') {
      const item = gesture.item;
      gesture = null;
      openItem(item);   // a tap opens the note or photo (a tap on the size corner too)
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

function finishDrag() {
  if (!gesture || (gesture.kind !== 'item' && gesture.kind !== 'resize')) return;
  if (gesture.dragging) {
    const { item, el } = gesture;
    el.classList.remove('dragging');
    if (gesture.kind === 'item') {
      // Let go: the note or photo glides onto the nearest spot on the dots, so things line up
      item.x = onSpot(item.x);
      item.y = onSpot(item.y);
    } else {
      item.width = settledWidth(item.width);   // and a photo's size settles in steps that line up too
    }
    el.classList.add('settling');
    placeItem(el, item);
    setTimeout(() => el.classList.remove('settling'), 200);
    applyView();   // a photo's size corner may hide or show at its new size
    item.changed = now();
    saveSoon();
  }
  gesture = null;
}

function openItem(item) {
  if (item.type === 'photo') openPhoto(item);
  else openNote(item, false);
}

// The note or photo you pick up goes on top of the others (last in the list is drawn on top)
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

// On a computer: Tab to a note or photo, then Enter opens it
worldEl.addEventListener('keydown', (event) => {
  const itemEl = event.target.closest('.item');
  if (!itemEl || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  const item = findItem(itemEl.dataset.id);
  if (item) openItem(item);
});


// ---------- Adding a note ----------

function addNote() {
  if (readOnly) return;
  const { x, y } = openSpot();
  const item = { id: makeId(), type: 'note', x, y, text: '', made: now(), changed: now() };
  openNote(item, true);   // it joins the board once you type something
}

// An open spot for a new note (or photo, with its own width and height), as near the middle of the
// screen as possible, so it never covers anything else. It goes in the same rows and columns as the
// item nearest the middle, so new things line up with the ones already there. On a phone held
// upright it tries below first, on a wide screen to the right.
function openSpot(width = NOTE_WIDTH, height = NOTE_WIDTH) {
  const rect = boardEl.getBoundingClientRect();
  const step = SETTLE_GAP * 4;   // 256 board pixels: a note's width and a gap, from spot to spot
  // Where a new item in the middle of the screen would go, on the board
  const centerX = (rect.width / 2 - view.x) / view.zoom - width / 2;
  const centerY = (rect.height / 2 - 40 - view.y) / view.zoom - height / 2;
  // The item nearest that place (if there is one) sets the rows and columns
  let nearest = null;
  for (const item of drawnItems(board)) {
    if (!nearest || Math.hypot(item.x - centerX, item.y - centerY) < Math.hypot(nearest.x - centerX, nearest.y - centerY)) nearest = item;
  }
  const lineX = onSpot(nearest ? nearest.x : centerX);
  const lineY = onSpot(nearest ? nearest.y : centerY);
  // The place in those rows and columns closest to the middle of the screen
  const middleX = lineX + Math.round((centerX - lineX) / step) * step;
  const middleY = lineY + Math.round((centerY - lineY) / step) * step;
  const upright = rect.height > rect.width;
  const gap = 12;
  const taken = itemOutlines();
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
    spot.x < outline.right + gap && spot.x + width > outline.left - gap &&
    spot.y < outline.bottom + gap && spot.y + height > outline.top - gap));
  const chosen = free || { x: middleX, y: middleY };
  return { x: chosen.x, y: chosen.y };   // already on the dots
}


// ---------- A note on its own screen ----------

function openNote(item, isNew) {
  if (readOnly) return;
  goDeeper('note');
  editing = item;
  editingIsNew = isNew;
  noteText.value = item.text;
  editorEl.hidden = false;
  updatePhotoButton();
  noteText.focus();   // opens the phone's keyboard
  if (!isNew) {
    putCursorAtEnd();
    // On a phone, the tap that opened the note also sends a click a moment later. It lands on this
    // typing box and would put the cursor where the finger was; put it back at the end of the words.
    noteText.addEventListener('click', putCursorAtEnd, { once: true });
    setTimeout(() => noteText.removeEventListener('click', putCursorAtEnd), 500);
  }
}

function putCursorAtEnd() {
  noteText.setSelectionRange(noteText.value.length, noteText.value.length);
}

// Every letter is saved, so nothing is lost if the phone closes the page mid-sentence
noteText.addEventListener('input', () => {
  if (!editing) return;
  editing.text = noteText.value;
  editing.changed = now();
  if (!board.items.includes(editing) && editing.text.trim()) {
    board.items.push(editing);   // a new note joins the board with its first letter
  }
  updatePhotoButton();
  saveSoon();
});

// "Photo" shows on a new note's screen until you type something: then it's a note
function updatePhotoButton() {
  $('add-photo').hidden = !(editing && editingIsNew && photoDb && !noteText.value.trim());
}

// Runs when the history goes back from the note (by "Done," "Remove" or the Back button)
function closeEditor() {
  const item = editing;
  editing = null;
  editorEl.hidden = true;
  noteText.blur();
  if (!board) return;
  if (!item.text.trim()) removeItem(item, false);   // an empty note isn't kept
  render();
  if (editingIsNew && board.items.includes(item)) bringIntoView(item);   // so you see where it went
  editingIsNew = false;
  if (saveTimer) saveNow();
  if (pendingPhoto) {
    // A photo was chosen on this screen: now that the board shows, it's added
    const { file, target } = pendingPhoto;
    pendingPhoto = null;
    addPhoto(file, target);
  }
}

$('done').addEventListener('click', () => goBack());

$('remove-note').addEventListener('click', () => {
  if (!editing || leaving) return;
  const item = editing;
  if (board.items.includes(item)) removeItem(item, item.text.trim() !== '');   // Undo only for a note with words
  else item.text = '';   // a new note that was never kept
  goBack();
});


// ---------- Adding a photo ----------
//
// "Add," then "Photo" on the new note's screen, opens the phone's own photo picker (or the
// computer's file window). The chosen photo is shrunk on this device and saved in the photos'
// database; its place on the board goes in the board's record.

$('add-photo').addEventListener('click', () => {
  if (!editing || leaving) return;
  photoInput.value = '';   // so choosing the same photo again still counts
  photoInput.click();
});

photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file || !editing || leaving) return;   // (nothing chosen: the note's screen stays)
  pendingPhoto = { file, target: board };
  goBack();   // the note's screen closes (its empty note isn't kept); closeEditor() adds the photo
});

// Makes the smaller copy that's saved: about 1600 pixels on the long side, as a JPEG. It's a new
// picture drawn from the chosen one, so it leaves out the hidden details a phone's photo can
// carry, like where it was taken. It fails if this browser can't read that kind of picture.
async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const picture = new Image();
    picture.src = url;
    await picture.decode();   // the browser turns it the right way up, as the phone shows it
    const scale = Math.min(1, PHOTO_LONG_SIDE / Math.max(picture.naturalWidth, picture.naturalHeight));
    const width = Math.max(1, Math.round(picture.naturalWidth * scale));
    const height = Math.max(1, Math.round(picture.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';   // a see-through picture gets a white background, not black
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(picture, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((made) => (made ? resolve(made) : reject(new Error('No JPEG was made'))), 'image/jpeg', PHOTO_QUALITY);
    });
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function addPhoto(file, target) {
  showStatus('Adding the photo');
  let shrunk;
  try {
    shrunk = await shrinkPhoto(file);
  } catch (error) {
    showStatus('Couldn’t open that photo');
    return;
  }
  const photoId = makeId();
  try {
    // The photo file is saved first, so the board never names a photo that isn't there
    await savePhotoFile({ id: photoId, blob: shrunk.blob, width: shrunk.width, height: shrunk.height, made: now() });
  } catch (error) {
    showStatus('Couldn’t save the photo on this device');
    return;
  }
  const ratio = shrunk.height / shrunk.width;
  const item = { id: makeId(), type: 'photo', photoId, x: 0, y: 0, width: PHOTO_WIDTH, ratio, made: now(), changed: now() };
  if (board === target) {
    // In an open spot near the middle of the screen, in line with the notes and photos there
    const spot = openSpot(PHOTO_WIDTH, PHOTO_WIDTH * ratio);
    item.x = spot.x;
    item.y = spot.y;
    target.items.push(item);
    render();
    bringIntoView(item);
    saveSoon();
  } else {
    // The board was left while the photo was being made: it still joins that board, under the rest
    const bottoms = drawnItems(target).map((each) => each.y + (each.type === 'photo' ? each.width * each.ratio : NOTE_WIDTH));
    item.y = onSpot(Math.max(0, ...bottoms) + SETTLE_GAP);
    target.items.push(item);
    target.changed = now();
    if (db) changeBoard(target).catch(() => {});
  }
}


// ---------- A photo on its own screen ----------

function openPhoto(item) {
  goDeeper('photo');
  viewing = item;
  const big = $('photo-big');
  big.removeAttribute('src');
  big.parentElement.classList.remove('missing');
  photoViewEl.hidden = false;
  $('remove-photo').hidden = readOnly;   // (a board saved by a newer version is only shown)
  showPhoto(big, item.photoId);
  $('photo-done').focus();
}

// Runs when the history goes back from the photo (by "Done," "Remove" or the Back button)
function closePhoto() {
  viewing = null;
  photoViewEl.hidden = true;
  $('photo-big').removeAttribute('src');
}

$('photo-done').addEventListener('click', () => goBack());

$('remove-photo').addEventListener('click', () => {
  if (!viewing || leaving || readOnly) return;
  removeItem(viewing, true);   // "Photo removed. Undo" for 8 seconds; the file goes after that
  render();
  goBack();
});


// ---------- A board's name on its own screen: a new board, or rename or remove one ----------

function openSettings(mode) {
  goDeeper('settings');
  settingsMode = mode;
  settingsEl.hidden = false;
  $('remove-board').hidden = mode === 'new';
  $('confirm-remove').hidden = true;
  nameInput.value = mode === 'new' ? '' : board.name;
  $('board-count').textContent = mode === 'new' ? '' : whatsOnIt(board);
  nameInput.focus();   // opens the phone's keyboard
}

// Runs when the history goes back from the name screen
function closeSettings() {
  const mode = settingsMode;
  settingsMode = null;
  settingsEl.hidden = true;
  $('confirm-remove').hidden = true;
  nameInput.blur();
  if (mode === 'rename' && board) {
    board.name = nameOf(board);
    $('board-name').textContent = board.name;
    saveNow();
  }
}

$('new-board').addEventListener('click', () => openSettings('new'));
$('edit-board').addEventListener('click', () => {
  if (!readOnly) openSettings('rename');
});

// Renaming: every letter is saved
nameInput.addEventListener('input', () => {
  if (settingsMode !== 'rename' || !board) return;
  board.name = nameInput.value;
  $('board-name').textContent = nameOf(board);
  saveSoon();
});

function nameDone() {
  if (settingsMode !== 'new') {
    goBack();
    return;
  }
  // A new board: make it, and open it in place of the name screen (Back then goes to the list)
  const record = newBoard(nameInput.value.trim() || UNTITLED);
  boards.push(record);
  if (db) changeBoard(record).catch(() => showStatus('Couldn’t save on this device'));
  history.replaceState({ ideaBoard: 'board' }, '');
  settingsMode = null;
  settingsEl.hidden = true;
  nameInput.blur();
  openBoard(record);
}

$('board-done').addEventListener('click', nameDone);
nameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    nameDone();
  }
});

// "Remove board" asks first, with the board's name and how many notes and photos go with it
$('remove-board').addEventListener('click', () => {
  const count = drawnItems(board).length;
  $('confirm-words').textContent = count
    ? `Remove “${nameOf(board)}” and its ${whatsOnIt(board)}?`
    : `Remove “${nameOf(board)}”? It has no notes.`;
  $('confirm-remove').hidden = false;
  $('confirm-yes').focus();
});

$('confirm-no').addEventListener('click', () => {
  $('confirm-remove').hidden = true;
  nameInput.focus();
});

$('confirm-yes').addEventListener('click', () => {
  if (!board || leaving) return;
  const record = board;
  clearTimeout(saveTimer);   // nothing more is saved for this board
  saveTimer = null;
  boards = boards.filter((each) => each !== record);
  if (db) changeBoard(record, true).catch(() => {});
  board = null;   // the list doesn't save it again
  offerUndo({ kind: 'board', record }, 'Board removed.');
  goBack(2);      // past the board, to the list
});


// ---------- Removing, and Undo ----------

function removeItem(item, offerIt) {
  const index = board.items.indexOf(item);
  if (index === -1) return;
  board.items.splice(index, 1);
  if (offerIt) offerUndo({ kind: 'item', item, index }, item.type === 'photo' ? 'Photo removed.' : 'Note removed.');
  saveSoon();
}

function offerUndo(removed, words) {
  if (lastRemoved) clearRemoved();
  lastRemoved = removed;
  $('removed-words').textContent = words;
  removedEl.hidden = false;
  removedTimer = setTimeout(clearRemoved, UNDO_TIME);
}

// The Undo time is over (or the screen changed): the removal stays, and photo files go for good
function clearRemoved() {
  clearTimeout(removedTimer);
  removedEl.hidden = true;
  if (lastRemoved && lastRemoved.kind === 'board') {
    try {
      localStorage.removeItem(VIEW_KEY + lastRemoved.record.id);
    } catch (error) {
      // Nothing to tidy
    }
    deletePhotoFiles(photosOf(lastRemoved.record).map((item) => item.photoId));
  } else if (lastRemoved && lastRemoved.kind === 'item' && lastRemoved.item.type === 'photo') {
    deletePhotoFiles([lastRemoved.item.photoId]);
  }
  lastRemoved = null;
}

$('undo').addEventListener('click', () => {
  if (!lastRemoved) return;
  const removed = lastRemoved;
  lastRemoved = null;
  clearTimeout(removedTimer);
  removedEl.hidden = true;
  if (removed.kind === 'item' && board) {
    board.items.splice(Math.min(removed.index, board.items.length), 0, removed.item);
    render();
    saveSoon();
  } else if (removed.kind === 'board') {
    boards.push(removed.record);
    if (db) changeBoard(removed.record).catch(() => {});
    renderList();
  }
});


// ---------- The buttons ----------

$('add-note').addEventListener('click', addNote);
$('show-all').addEventListener('click', () => showAll());
$('zoom-in').addEventListener('click', () => zoomFromCenter(1.25));
$('zoom-out').addEventListener('click', () => zoomFromCenter(1 / 1.25));


// ---------- Starting ----------

async function start() {
  // The app always opens on the list of boards. A reload from deeper in leaves old Back steps
  // behind, so this step is marked as the list.
  history.replaceState({ ideaBoard: 'list' }, '');

  try {
    db = await openDatabase();
    boards = (await readAllBoards()).filter((record) => record && record.id && Array.isArray(record.items));
  } catch (error) {
    db = null;
    boards = [];
    $('list-note').textContent = 'This browser won’t save here, so boards go away when the page closes.';
  }
  if (db) {
    try {
      photoDb = await openPhotoDatabase();
    } catch (error) {
      photoDb = null;   // notes still work; photos can't be added on this browser
    }
  }
  showList();
  tidyPhotoFiles().catch(() => {});
}

start();
