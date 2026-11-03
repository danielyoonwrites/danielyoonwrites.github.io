# Video editor: progress (updated November 3, 2026)

A simple video editor, just for the owner, on his Android phone in Chrome: trim, speed, a look (Korean styles), lighting and better sound now; shape, text and clip order next. The videos never leave the phone, and every video is made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the looks, the platforms' rules, the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked:
  - The plan and the name (pull request 110).
  - Build step 2, the phone test (pull request 111): every line ✓ on Dan's phone, AAC sound built in, and the copy "is in my gallery, black and white and with sound."
  - Build step 3, one clip with a look (pull request 112), at https://danielyoonwrites.github.io/video-editor. Dan, November 2, 2026: "it looks good."
- Done, Dan's phone check not in yet:
  - The Korean looks (pull request 116, Dan's "a"): Original, Milky 우유빛, Peach 복숭아, Soft glow 뽀샤시, Café 카페, Clear 맑음, Film 필름, Black and white 흑백.
  - Build step 4, trim and speed (pull request 125): the "Edit" screen with Trim and Speed tabs; the sound follows the speed like a tape (Dan's "b"); each new video made frame by frame.
- In progress: pull request 129, build step 5, better sound (Dan's "B"): a fifth tab, "Sound," with three switches (Cut rumble, Clearer voice, Even out the volume) and a Volume slider from Off to 200%. The playing video sounds the same way as the new video will. How it works: `SPEC.md`, "Tech notes," "Better sound."
- Checked in Claude's test browser: 182 saved checks pass (`tests/app-test.mjs`), including made-up test sounds: in a saved video, the 50 Hz rumble 17.7 dB quieter, 300 Hz 3.0 dB quieter and 3,500 Hz 4.0 dB louder, a 30 dB gap between quiet and loud down to 18 dB, Volume 50% exactly 6.0 dB quieter, nothing clipping, and the sound in line with the original to the sample. The phone test's 71 still pass.
- Not checked yet:
  - The sound switches on the owner's phone with a real voice, and whether the playing video's sound stays in step with the lips while editing.
  - Trim and speed on the phone, and how long making a video takes there now that it's frame by frame.
  - Real uploads to the three platforms (asked with pull request 112; not reported yet).
  - What the owner's phone writes in the "For Claude" line (color tags, edit lists).
  - How fast Soft glow is on the phone, and the looks on real faces (Claude's test scene is made up).
- Claude's rough estimate: 4 more small pull requests (build steps 6 to 9).

## Waiting on Dan
1. Merge pull request 129: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/129, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a video of yourself talking, at least 15 seconds long, ideally one with some wind or traffic in it (it stays on your phone).
   3. Tap the speaker on the video to turn its sound on.
   4. Tap the Sound tab. While it plays, turn each switch on and off and listen: Cut rumble, Clearer voice, Even out the volume. Then try the Volume slider.
   5. Keep the switches you like, tap "Make the video," and play it: it should sound like what you heard while editing.
   6. Tell Claude which switches helped, whether any made it sound worse, and whether the voice stayed in step with the lips while editing.
3. Still open from before: the trim and speed check (pull request 125: trim about 10 seconds, choose 2×, make the video, note how long it takes), his notes on the Korean looks (any to change or drop), how long Soft glow takes, and private test uploads (YouTube as a Short set to Private, TikTok with "Only me," Instagram as a Reel saved to drafts).

## Open pull requests
- Pull request 129, build step 5, better sound.

## Next step
Adjust the sound steps from Dan's notes (the numbers are in `buildSoundSteps()` in `app.js`; check any change with the saved checks, section J). Then build step 6, shape and crop: ask Dan first which shapes he wants (`SPEC.md`, "How it works," suggests tall 9:16, square or wide).

## Ideas, not done
- A note on the Trim and Speed tabs when the new video would be under 3 seconds or over 3 minutes (now only "Your video" says so, after it's made).
- Turning down a steady hiss, like a fan (left for later, November 3, 2026; `SPEC.md`, "Not in version 1").

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- Also blocked (November 2, 2026): the platforms' rule pages (developers.facebook.com, developers.tiktok.com, help.instagram.com, support.google.com) and the Korean-look sources (apps.apple.com, capcut.com, gridfiti.com). They were read through search results only; don't retry them through other services.
- scikit-image's test photos moved inside that project (their old paths answer 404), so the looks are judged on a made-up scene (`tests/make-scene.py`).
- An OffscreenCanvas ignores SVG filters (`url(#...)`): the frame came out unchanged. A normal canvas works, even one that isn't on the page.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- Mediabunny's one-step `Conversion` can trim but has no speed setting (its type notes, version 1.65.0), so the app makes each video frame by frame.
- A Web Audio high-pass filter with Q 0.707 made a 3.4 dB bump at 100 Hz: for that filter type Q is in decibels (the Web Audio spec); −3.01 is the smooth shape.
- Timing the new video's sound by when a sudden tone starts read 14 thousandths of a second late, with or without the sound steps: AAC smears a sudden start. Lining up a hiss (`soundLag()` in `tests/test-videos.mjs`) shows it's in line to the sample.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (fixed with `stopAsked`).
- In the checks, `innerText` of words inside a closed fold-out is empty; read them with `textContent`.
- The phone test's check B3 looked for "Make a 5-second black-and-white copy" too early (the page shows it after looking for a saved location), so it failed now and then; it now waits for the button, up to 10 seconds.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app: `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos, a color chart, a "clock" video and test sounds with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "182 passed, 0 failed" (in about 2 minutes); screenshots go to the temporary folder it prints.
- See the looks side by side: `node video-editor/tests/looks-sheet.mjs` (port 8769; needs Python with Pillow and numpy for the test scene). It prints where the picture is.
- Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767). Success ends "71 passed, 0 failed."
