// Photo Filters: the looks (SPEC.md, "The looks"). Plain math on a photo's pixels.
//
// Used in three places: by the background helper (worker.js), by the page itself if the helper
// can't start, and by the saved checks (tests/app-test.mjs). Each pixel is four numbers from
// 0 to 255 (red, green, blue, and alpha for see-through); the math below works with 0 to 1,
// the way the spec writes it.
//
// Build step 3 has one look, Warm natural, and only the steps it needs: temperature, contrast,
// saturation and softness. The other steps (exposure, tint, fade, split tone, glow and grain)
// come with the other looks in Milestone 2, in the spec's order.
'use strict';

// The looks' starting values (SPEC.md, "Starting values"). Dan will adjust them on his photos.
// The saved checks compare these numbers with the table in SPEC.md.
const LOOKS = {
  'warm-natural': {
    name: 'Warm natural',
    temperature: 0.05,
    contrast: 0.08,
    saturation: 1.03,
    softness: 0.35,
    softnessRadius: 0.0022,   // the softness blur's radius, as a part of the photo's width
  },
};

// Temperature t: red × (1 + t), green × (1 + t/4), blue × (1 − t)
function warmer(rgb, t) {
  rgb[0] *= 1 + t;
  rgb[1] *= 1 + t / 4;
  rgb[2] *= 1 - t;
}

// Contrast c: (x − 0.5) × (1 + c) + 0.5, for red, green and blue
function moreContrast(rgb, c) {
  for (let i = 0; i < 3; i += 1) rgb[i] = (rgb[i] - 0.5) * (1 + c) + 0.5;
}

// Saturation s: x = L + (x − L) × s, where L (the brightness) = 0.2126 R + 0.7152 G + 0.0722 B.
// s = 1 leaves the colors as they are; above 1 they get stronger.
function saturate(rgb, s) {
  const L = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  for (let i = 0; i < 3; i += 1) rgb[i] = L + (rgb[i] - L) * s;
}

// Puts a look on the pixels (red, green, blue, alpha, one after another), changing them in place.
// width is the photo's width in pixels: the softness blur grows with it, so a small copy on the
// screen and the full-size photo get the same look.
function applyLook(pixels, width, height, look) {
  // 1. The color steps, pixel by pixel, in the spec's order ("Processing order")
  const rgb = [0, 0, 0];
  for (let p = 0; p < pixels.length; p += 4) {
    rgb[0] = pixels[p] / 255;
    rgb[1] = pixels[p + 1] / 255;
    rgb[2] = pixels[p + 2] / 255;
    if (look.temperature) warmer(rgb, look.temperature);
    if (look.contrast) moreContrast(rgb, look.contrast);
    if (look.saturation !== undefined && look.saturation !== 1) saturate(rgb, look.saturation);
    // Back to 0 to 255: the pixels' list rounds each number and keeps it between 0 and 255
    pixels[p] = rgb[0] * 255;
    pixels[p + 1] = rgb[1] * 255;
    pixels[p + 2] = rgb[2] * 255;
  }
  // 2. Softness, after the colors
  if (look.softness) soften(pixels, width, height, look.softness, look.softnessRadius * width);
  return pixels;
}

// Softness a (like Samsung's Picture softening): x = x × (1 − a) + blur × a.
// The blur is a Gaussian blur, and its "radius" is its standard deviation, the way Pillow's
// GaussianBlur and CSS's blur() use the word. Red, green and blue are blurred one at a time,
// which keeps the memory it needs small, even for a big photo.
function soften(pixels, width, height, amount, radius) {
  const count = width * height;
  const channel = new Float32Array(count);
  const scratch = new Float32Array(count);
  const sizes = boxSizes(radius);
  for (let c = 0; c < 3; c += 1) {
    for (let i = 0; i < count; i += 1) channel[i] = pixels[i * 4 + c];
    for (const size of sizes) {
      const reach = (size - 1) / 2;
      boxBlurRows(channel, scratch, width, height, reach);
      boxBlurColumns(scratch, channel, width, height, reach);
    }
    for (let i = 0; i < count; i += 1) {
      const p = i * 4 + c;
      pixels[p] = pixels[p] * (1 - amount) + channel[i] * amount;
    }
  }
}

// Three quick "box" blurs in a row look almost exactly like one Gaussian blur, and are much
// faster on a big photo. (Pillow's GaussianBlur works the same way: "a sequence of extended box
// filters, which approximates a Gaussian kernel.") This picks the three box widths (odd numbers
// of pixels) whose blurs add up to the Gaussian's standard deviation.
function boxSizes(radius, boxes = 3) {
  const variance = radius * radius;
  const ideal = Math.sqrt((12 * variance) / boxes + 1);
  let lower = Math.floor(ideal);
  if (lower % 2 === 0) lower -= 1;
  const upper = lower + 2;
  const howManyLower = Math.round(
    (12 * variance - boxes * lower * lower - 4 * boxes * lower - 3 * boxes) / (-4 * lower - 4));
  const sizes = [];
  for (let i = 0; i < boxes; i += 1) sizes.push(i < howManyLower ? lower : upper);
  return sizes;
}

// One box blur along each row: each pixel becomes the average of the pixels within `reach` of
// it. Past the edges, the edge pixel repeats, so the edges don't get darker.
function boxBlurRows(from, to, width, height, reach) {
  const scale = 1 / (2 * reach + 1);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    const first = from[row];
    const last = from[row + width - 1];
    let sum = (reach + 1) * first;
    for (let k = 1; k <= reach; k += 1) sum += from[row + Math.min(k, width - 1)];
    for (let x = 0; x < width; x += 1) {
      to[row + x] = sum * scale;
      // Slide the window one pixel to the right: one pixel comes in, one goes out
      const coming = x + reach + 1 < width ? from[row + x + reach + 1] : last;
      const going = x - reach >= 0 ? from[row + x - reach] : first;
      sum += coming - going;
    }
  }
}

// The same, down each column
function boxBlurColumns(from, to, width, height, reach) {
  const scale = 1 / (2 * reach + 1);
  for (let x = 0; x < width; x += 1) {
    const first = from[x];
    const last = from[x + (height - 1) * width];
    let sum = (reach + 1) * first;
    for (let k = 1; k <= reach; k += 1) sum += from[x + Math.min(k, height - 1) * width];
    for (let y = 0; y < height; y += 1) {
      to[x + y * width] = sum * scale;
      const coming = y + reach + 1 < height ? from[x + (y + reach + 1) * width] : last;
      const going = y - reach >= 0 ? from[x + (y - reach) * width] : first;
      sum += coming - going;
    }
  }
}

// For the saved checks, which run in Node (in the browser, `module` doesn't exist)
if (typeof module !== 'undefined') {
  module.exports = { LOOKS, applyLook, warmer, moreContrast, saturate, soften, boxSizes };
}
