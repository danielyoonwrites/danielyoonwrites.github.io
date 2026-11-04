# Video editor

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`.

A simple video editor for the owner's own videos, on his Android phone in Chrome, planned November 2, 2026 (the name is the owner's choice). It does a few things well: a filter, lighting, text, clip order, crop, speed and better sound. It lives in this folder and is published at https://danielyoonwrites.github.io/video-editor (live since pull request 112; not listed in search engines; on the website's Projects page since pull request PULL_REQUEST_NUMBER). Keep the "Build plan" in `SPEC.md` up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first.
- Just for the owner, on his Android phone in Chrome (his choice "A", November 2, 2026). Don't spend work on iPhones or other browsers unless he asks.
- The videos never leave the phone: the app reads them and makes the new file inside Chrome. No server, AI, analytics or tracking.
- No music button, nothing copyrighted, and no AI (the owner's words, November 2, 2026).
- Never change or delete the owner's original videos: the app only reads them.
- Mediabunny reads and writes the video files. Its ready-made file is saved in `lib/`, with its license and a link to its source (its license, MPL-2.0, asks that people can find the source). Keep one version; update only on purpose, after reading its release notes, and say so in the pull request.
- Saving the finished video is the hard part. Claude's test browser (Chromium in the cloud session) can't make AAC sound without the add-on, can't read HEVC and can't share (checked November 2, 2026), and it has no video chip, so every pull request that changes saving has a check on the owner's phone.
- Screenshots and checks use made-up test videos, never the owner's own videos, and never his kids (the privacy rule in the root `CLAUDE.md`).
- The app writes each new video fresh (Mediabunny's `Output` with `CanvasSource` and `AudioBufferSource`, in `makeVideo()`), so none of the original's tags come along; they can include where a video was filmed. Anything that copies with Mediabunny's `Conversion` (the phone test) passes `tags: {}` (or only tags chosen on purpose): `Conversion` copies the original's tags unless told not to.
- Speed: the sound follows the speed like a tape (the owner's "b", November 2, 2026). The new video's sound is played at the speed in an `OfflineAudioContext` (`soundAtSpeed()`), and the playing video has `preservesPitch` off so it sounds the same. Change the two together.
- Better sound (the owner's "B", November 3, 2026): three switches and a Volume slider on the Sound tab. `buildSoundSteps()` in `app.js` makes the same steps for the playing video (from the first change on the Sound tab) and for the new video's sound, so they sound the same. With nothing changed, the sound passes through untouched. Each compressor there holds the sound back 6 thousandths of a second: if you add or remove one, change `soundDelay()` too. A high-pass or low-pass filter's Q is in decibels in Chrome (−3.01 is the smooth shape). Check any change with the saved checks, section J, which measure each step with test tones.
- The AAC add-on (`lib/mediabunny-aac-encoder.min.js`) contains FFmpeg under the LGPL: keep `lib/licenses/ffmpeg/` and the links in `lib/README.md` with it.
- Each page has a safety rule (a Content-Security-Policy, near the top): its own scripts and styles only, plus `'wasm-unsafe-eval'` and `worker-src blob:` for the AAC add-on. Put words into the page with `textContent`, never as HTML, and no inline scripts or `style="..."` attributes.
- Every video must fit Instagram's, TikTok's and YouTube Shorts' upload rules (the owner's request, November 2, 2026). The `OUTPUT` settings at the top of `app.js` and `checkReady()` keep it so; before changing them, read `SPEC.md`, "Made for Instagram, TikTok and YouTube Shorts," and check the rules again.
- The look is dark (the owner's choice): its colors are at the top of `style.css`, and the checks test their contrast.
- The looks are Korean styles (the owner's choice, November 2, 2026), listed in `FILTERS` in `app.js`; the Korean ones are SVG filters near the top of `index.html`. The same filter goes on the playing video and on each frame of the new file, so they match. Draw frames on a normal canvas, never an OffscreenCanvas, which ignores SVG filters. The glow's blur is a share of the picture's width (`setGlowFor()`). Check any change to a look with the looks sheet and the saved checks (section H).
- Screens change only through `goDeeper()`, `show()` and `followHistory()` in `app.js`, so the phone's Back button (<) goes back one screen at a time; Back while a video is being made stops it.
- Run the saved checks after any change, and add checks for new work, from the repository folder: `node video-editor/tests/app-test.mjs` (the app) and `node video-editor/tests/phone-test.mjs` (the phone test). Both must end "0 failed".
- Raise the `?v=` number on file links whenever a file changes.
- It's on the website's Projects page (`projects.html`, since pull request PULL_REQUEST_NUMBER): a short line, a gray line saying it's made for an Android phone in Chrome, and a "How I built it" note, in the website's voice (`.claude/rules/website.md`). The line says only what works today. When what the app can do changes (text, shape and crop, several clips), update both in the same pull request.
