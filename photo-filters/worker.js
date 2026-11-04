// Photo Filters: the background helper (a "Web Worker").
// It puts a look on a photo's pixels away from the screen, so the page doesn't freeze while it
// works. The page sends: a job number, the width and height, the pixels, and the look's name
// (for example "warm-natural"). The helper sends back the same job number, the changed pixels,
// and how many milliseconds it took. The math itself is in looks.js.
'use strict';

importScripts('looks.js?v=1');   // raise this ?v= number too when looks.js changes

self.onmessage = (event) => {
  const { job, width, height, pixels, look } = event.data;
  const started = performance.now();
  applyLook(pixels, width, height, LOOKS[look]);
  // The pixels' memory is handed back, not copied, which is faster for a big photo
  self.postMessage({ job, pixels, took: performance.now() - started }, [pixels.buffer]);
};
