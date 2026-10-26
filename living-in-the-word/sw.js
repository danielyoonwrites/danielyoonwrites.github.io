// ============================================================
// Living in the Word: the offline helper (a "service worker")
//
// The phone runs this file in the background. It keeps a copy of the
// app's own files and fonts on the phone, so the app still opens
// without reception, and saved studies can be read anywhere.
// See SPEC.md, "Works without reception."
//
// - With reception, the app always loads the newest files from the
//   internet, and the copy on the phone is updated.
// - Without reception (or if the internet takes longer than 4 seconds),
//   the copy on the phone is used instead.
// - Only the app's own files and its fonts are kept. Requests to the
//   AI helper are never touched or kept.
// ============================================================


// Raise this number only to throw away every copy on people's phones
// and start fresh. Normal changes to the app don't need it.
const VERSION = 1;
const CACHE = 'living-in-the-word-' + VERSION;

// Copied onto the phone the first time the app opens
const APP_FILES = [
  './',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
];

// The same fonts link as in index.html. If you change the fonts there, change it here too.
const FONTS = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=Jost:wght@400;500&display=swap';

// How long to wait for the internet before using the copy on the phone
const WAIT = 4000;   // milliseconds (4 seconds)


// ---------- The first time: copy the app onto the phone ----------

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // "reload" skips the browser's own short-term copy, so the files are the newest
    await cache.addAll(APP_FILES.map((file) => new Request(file, { cache: 'reload' })));
    await copyFonts(cache);
    self.skipWaiting();   // start helping right away, without waiting for a restart
  })());
});

// Copies the fonts' instructions and the English letters of each font.
// (Google sends separate files for other alphabets; the app doesn't need them.)
async function copyFonts(cache) {
  try {
    const response = await fetch(FONTS);
    const css = await response.clone().text();
    await cache.put(FONTS, response);
    // Each font is described in a block that starts with /* latin */
    const blocks = css.split('/* ').filter((block) => block.startsWith('latin */'));
    const files = blocks.map((block) => (block.match(/url\((https:[^)]+)\)/) || [])[1]).filter(Boolean);
    await cache.addAll([...new Set(files)]);   // [...new Set()] drops repeats: both Jost weights share one file
  } catch (error) {
    // No fonts on the phone: the app still works, in Georgia, until the next try
  }
}


// ---------- Each new version: clear out old copies ----------

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    // Only this app's old copies. Other parts of the website may keep their own.
    const old = names.filter((name) => name.startsWith('living-in-the-word-') && name !== CACHE);
    await Promise.all(old.map((name) => caches.delete(name)));
    await self.clients.claim();   // look after pages that are already open, too
  })());
});


// ---------- Every file the app asks for ----------

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;   // sending things (like asking the AI) is left alone

  const url = new URL(request.url);
  const ours = request.url.startsWith(self.registration.scope);
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!ours && !fonts) return;   // anything else (the AI helper, esv.org) is left alone

  event.respondWith(newestOrCopy(event, request));
});

// Tries the internet first. Uses the copy on the phone when there's no
// reception, or when the internet is slower than WAIT.
async function newestOrCopy(event, request) {
  const fromInternet = fetch(request).then((response) => {
    // Keep the newest copy (fonts come back "opaque": fine to keep, just unreadable to us)
    if (response.ok || response.type === 'opaque') {
      const copy = response.clone();
      event.waitUntil(keepCopy(request, copy));
    }
    return response;
  });
  event.waitUntil(fromInternet.catch(() => {}));   // let it finish even if the copy is used

  const tooSlow = new Promise((resolve) => setTimeout(resolve, WAIT));
  let noReception = false;
  try {
    const response = await Promise.race([fromInternet, tooSlow]);
    if (response) return response;
  } catch (error) {
    noReception = true;
  }

  // No reception: the copy of this file, whatever its version. Only slow: the exact same
  // version only (style.css?v=15, not ?v=14), so a newer page never runs with an older script.
  const copy = await findCopy(request, noReception);
  return copy || fromInternet;   // no copy yet: keep waiting for the internet
}

// One copy per file: style.css?v=14 and style.css?v=15 count as the same file
async function keepCopy(request, response) {
  const cache = await caches.open(CACHE);
  await cache.delete(request, { ignoreSearch: true, ignoreVary: true });
  await cache.put(request, response);
}

async function findCopy(request, anyVersion) {
  const cache = await caches.open(CACHE);
  const copy = await cache.match(request, { ignoreSearch: anyVersion, ignoreVary: true });
  // Without reception, any page of the app (like index.html) can fall back to the start page
  if (!copy && anyVersion && request.mode === 'navigate') return cache.match('./', { ignoreSearch: true });
  return copy;
}
