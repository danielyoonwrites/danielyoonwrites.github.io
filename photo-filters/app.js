// Photo Filters (SPEC.md, "Build plan for Milestone 1")
// Build step 2: choose a photo and see it right side up, with its size.
// Build step 3: the Warm natural look next to the original.
//
// Everything happens in this browser. The photo is never sent anywhere: the page's safety rule
// (near the top of index.html) blocks connections to other sites.
'use strict';

// The pictures on the screen are smaller copies, about this many pixels wide
// (SPEC.md, "Technical notes": "Preview at about 1,080 pixels wide").
const PREVIEW_WIDTH = 1080;

// The one look in Milestone 1. Its numbers are in looks.js.
const LOOK = 'warm-natural';

// The parts of the page this script uses (their ids are in index.html)
const $ = (id) => document.getElementById(id);
const chooseButton = $('choose');
const fileInput = $('file');
const intro = $('intro');
const photo = $('photo');
const originalCanvas = $('original');
const lookCanvas = $('look');
const sizeLine = $('size');
const message = $('message');

// The photo that's open now: the picture itself and its address on this device ("blob:...").
// It's kept for Export (build step 4), which works from the full-size picture.
let current = null;

// Counts the photos opened, so a look that finishes late, for an older photo, is ignored
let opening = 0;

// "Choose photo" opens the phone's photo picker (or the computer's file window)
chooseButton.addEventListener('click', () => {
  fileInput.value = '';   // so choosing the same photo again still counts
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (file) showPhoto(file);   // (nothing chosen: everything stays as it was)
});

// Opens the chosen file and shows it right side up, then makes the look next to it
async function showPhoto(file) {
  opening += 1;
  const thisPhoto = opening;
  showMessage('Opening the photo…');
  const opened = await openPicture(file);
  if (thisPhoto !== opening) return;   // another photo was chosen meanwhile
  if (!opened) {
    photo.hidden = true;
    showMessage("This browser couldn't open that file. Please choose a JPEG photo.");
    return;
  }

  // The new photo replaces the old one; the old one's address on this device is let go
  if (current) URL.revokeObjectURL(current.address);
  current = opened;

  // The browser has already turned the picture right side up (from the rotation the camera
  // saved with it), so these are the photo's width and height as you see it.
  const width = current.picture.naturalWidth;
  const height = current.picture.naturalHeight;
  sizeLine.textContent = describeSize(width, height);

  // Draw a smaller copy for the screen (never bigger than the photo itself)
  const scale = Math.min(1, PREVIEW_WIDTH / width);
  const copyWidth = Math.round(width * scale);
  const copyHeight = Math.round(height * scale);
  originalCanvas.width = copyWidth;
  originalCanvas.height = copyHeight;
  const original = originalCanvas.getContext('2d');
  original.imageSmoothingQuality = 'high';
  original.drawImage(current.picture, 0, 0, copyWidth, copyHeight);

  // The look's picture waits as an empty gray box of the same size until the look is ready
  lookCanvas.width = copyWidth;
  lookCanvas.height = copyHeight;
  lookCanvas.classList.add('waiting');
  intro.hidden = true;
  photo.hidden = false;
  showMessage('Making the Warm natural look…');

  const made = await lookOn(original.getImageData(0, 0, copyWidth, copyHeight), LOOK);
  if (thisPhoto !== opening) return;   // another photo was chosen meanwhile
  lookCanvas.getContext('2d').putImageData(made.image, 0, 0);
  lookCanvas.classList.remove('waiting');
  lookCanvas.dataset.took = String(Math.round(made.took));   // milliseconds, for the saved checks
  showMessage('');
}

// Reads a file into a picture the page can draw. Gives back null if this browser can't open it
// (for example a file that isn't a photo, or a kind of photo the browser doesn't know).
async function openPicture(file) {
  if (file.type && !file.type.startsWith('image/')) return null;
  const address = URL.createObjectURL(file);
  const picture = new Image();
  picture.src = address;
  try {
    await picture.decode();   // waits until the whole photo is read
    return { picture, address, name: file.name };
  } catch (error) {
    URL.revokeObjectURL(address);
    return null;
  }
}

// ----- Making a look -----
// The work is done by the background helper (worker.js), so the screen doesn't freeze. If this
// browser can't start the helper, the page does the same work itself (the screen may pause).

let helper = null;          // the background helper, started the first time it's needed
let helperBroken = false;   // true once the helper has failed: from then on the page does the work
let jobs = 0;
const waitingFor = new Map();   // job number → what to do with the helper's answer

function startHelper() {
  if (helper || helperBroken) return helper;
  try {
    helper = new Worker('worker.js?v=1');
  } catch (error) {
    helperBroken = true;
    return null;
  }
  helper.onmessage = (event) => {
    const { job, pixels, took } = event.data;
    const answer = waitingFor.get(job);
    waitingFor.delete(job);
    if (answer) answer({ pixels, took });
  };
  helper.onerror = (event) => {
    event.preventDefault();
    helperBroken = true;
    helper = null;
    // Every job still waiting gets "no answer," and the page does it itself
    for (const [job, answer] of waitingFor) {
      waitingFor.delete(job);
      answer(null);
    }
  };
  return helper;
}

// Puts a look on a smaller copy's pixels (an ImageData) and gives back the new picture
async function lookOn(image, look) {
  const { width, height } = image;
  const worker = startHelper();
  if (worker) {
    jobs += 1;
    const job = jobs;
    const pixels = new Uint8ClampedArray(image.data);   // the helper gets its own copy
    const answer = await new Promise((resolve) => {
      waitingFor.set(job, resolve);
      worker.postMessage({ job, width, height, pixels, look }, [pixels.buffer]);
    });
    if (answer) return { image: new ImageData(answer.pixels, width, height), took: answer.took };
  }
  // No helper: the page does the work itself
  const started = performance.now();
  applyLook(image.data, width, height, LOOKS[look]);
  return { image, took: performance.now() - started };
}

// ----- Words on the screen -----

// "4,000 × 3,000 pixels (12.0 MP)": the size in pixels, and in megapixels (millions of pixels)
function describeSize(width, height) {
  const megapixels = (width * height / 1000000).toFixed(1);
  return `${width.toLocaleString('en-US')} × ${height.toLocaleString('en-US')} pixels (${megapixels} MP)`;
}

// Shows a line of words under the photo; empty words hide it
function showMessage(words) {
  message.textContent = words;
  message.hidden = !words;
}
