# Video editor

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`.

A simple video editor for the owner's own videos, on his Android phone in Chrome, planned November 2, 2026 (the name is the owner's choice). It does a few things well: a filter, lighting, text, clip order, crop and speed. It lives in this folder and will be published at https://danielyoonwrites.github.io/video-editor (not listed in search engines). Keep the "Build plan" in `SPEC.md` up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first.
- Just for the owner, on his Android phone in Chrome (his choice "A", November 2, 2026). Don't spend work on iPhones or other browsers unless he asks.
- The videos never leave the phone: the app reads them and makes the new file inside Chrome. No server, AI, analytics or tracking.
- No music button, nothing copyrighted, and no AI (the owner's words, November 2, 2026).
- Never change or delete the owner's original videos: the app only reads them.
- Mediabunny reads and writes the video files. Its ready-made file is saved in `lib/`, with its license and a link to its source (its license, MPL-2.0, asks that people can find the source). Keep one version; update only on purpose, after reading its release notes, and say so in the pull request.
- Saving the finished video is the hard part. Claude's test browser (Chromium in the cloud session) can't make AAC sound without the add-on, can't read HEVC and can't share (checked November 2, 2026), and it has no video chip, so every pull request that changes saving has a check on the owner's phone.
- Screenshots and checks use made-up test videos, never the owner's own videos, and never his kids (the privacy rule in the root `CLAUDE.md`).
- Make every copy with `tags: {}` (or only tags chosen on purpose): Mediabunny copies the original's tags unless told not to, and they can include where a video was filmed.
- The AAC add-on (`lib/mediabunny-aac-encoder.min.js`) contains FFmpeg under the LGPL: keep `lib/licenses/ffmpeg/` and the links in `lib/README.md` with it.
- Each page has a safety rule (a Content-Security-Policy, near the top): its own scripts and styles only, plus `'wasm-unsafe-eval'` and `worker-src blob:` for the AAC add-on. Put words into the page with `textContent`, never as HTML, and no inline scripts or `style="..."` attributes.
- Every video must fit Instagram's, TikTok's and YouTube Shorts' upload rules (the owner's request, November 2, 2026). The `OUTPUT` settings at the top of `app.js` and `checkReady()` keep it so; before changing them, read `SPEC.md`, "Made for Instagram, TikTok and YouTube Shorts," and check the rules again.
- The look is dark (the owner's choice): its colors are at the top of `style.css`, and the checks test their contrast. The filters are CSS filters (`FILTERS` in `app.js`): the same words go on the playing video and on each frame of the new file, so they always match.
- Screens change only through `goDeeper()`, `show()` and `followHistory()` in `app.js`, so the phone's Back button (<) goes back one screen at a time; Back while a video is being made stops it.
- Run the saved checks after any change, and add checks for new work, from the repository folder: `node video-editor/tests/app-test.mjs` (the app) and `node video-editor/tests/phone-test.mjs` (the phone test). Both must end "0 failed".
- Raise the `?v=` number on file links whenever a file changes.
