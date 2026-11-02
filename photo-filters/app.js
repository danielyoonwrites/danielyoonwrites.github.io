// Photo Filters (SPEC.md, "Build plan for Milestone 1")
// Build step 2: choose a photo and see it right side up, with its size.
//
// Everything happens in this browser. The photo is never sent anywhere: the page's safety rule
// (near the top of index.html) blocks connections to other sites.
'use strict';

// The photo on the screen is a smaller copy, about this many pixels wide
// (SPEC.md, "Technical notes": "Preview at about 1,080 pixels wide").
const PREVIEW_WIDTH = 1080;

// The parts of the page this script uses (their ids are in index.html)
const $ = (id) => document.getElementById(id);
const chooseButton = $('choose');
const fileInput = $('file');
const intro = $('intro');
const photo = $('photo');
const preview = $('preview');
const sizeLine = $('size');
const message = $('message');

// The photo that's open now: the picture itself and its address on this device ("blob:...").
// It's kept for the next steps (the looks and Export work from the full-size picture).
let current = null;

// "Choose photo" opens the phone's photo picker (or the computer's file window)
chooseButton.addEventListener('click', () => {
  fileInput.value = '';   // so choosing the same photo again still counts
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (file) showPhoto(file);   // (nothing chosen: everything stays as it was)
});

// Opens the chosen file and shows it, right side up, with its size
async function showPhoto(file) {
  showMessage('Opening the photo…');
  const opened = await openPicture(file);
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

  // Draw a smaller copy for the screen (never bigger than the photo itself)
  const scale = Math.min(1, PREVIEW_WIDTH / width);
  preview.width = Math.round(width * scale);
  preview.height = Math.round(height * scale);
  const context = preview.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(current.picture, 0, 0, preview.width, preview.height);

  sizeLine.textContent = describeSize(width, height);
  intro.hidden = true;
  photo.hidden = false;
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
