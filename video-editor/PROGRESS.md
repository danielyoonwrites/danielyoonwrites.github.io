# Video editor: progress (updated November 2, 2026)

A simple video editor, just for the owner, on his Android phone in Chrome: trim, speed, a look (Korean styles) and lighting now; better sound, shape, text and clip order next. The videos never leave the phone, and every video is made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the looks, the platforms' rules, the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked:
  - The plan and the name (pull request 110).
  - Build step 2, the phone test (pull request 111): every line ✓ on Dan's phone, AAC sound built in, and the copy "is in my gallery, black and white and with sound."
  - Build step 3, one clip with a look (pull request 112), at https://danielyoonwrites.github.io/video-editor. Dan, November 2, 2026: "it looks good."
- Done, Dan's notes not in yet: the Korean looks (pull request 116, Dan's "a"): Original, Milky 우유빛, Peach 복숭아, Soft glow 뽀샤시, Café 카페, Clear 맑음, Film 필름, Black and white 흑백.
- In progress: pull request 125, build step 4, trim and speed. The second screen is now "Edit," with four tabs: Trim ("Start here" and "End here" while it plays, or sliders), Speed (0.5×, 1×, 1.5×, 2×; the sound follows the speed like a tape, Dan's "b"), Filter and Lighting. The app now makes each new video frame by frame (`DECISIONS.md`).
- Checked in Claude's test browser: 154 saved checks pass (`tests/app-test.mjs`), including a made-up "clock" video trimmed and sped up: the right length, a steady 30 frames a second, each frame showing the right moment, and the tone at the right pitch (twice as high at 2×, half as high at 0.5×). The phone test's 71 still pass.
- Not checked yet:
  - Trim and speed on the owner's phone, and how long making a video takes there, now that it's frame by frame.
  - Real uploads to the three platforms (asked with pull request 112; not reported yet).
  - What the owner's phone writes in the "For Claude" line (color tags, edit lists).
  - How fast Soft glow is on the phone, and the looks on real faces (Claude's test scene is made up).
- Claude's rough estimate: 5 more small pull requests (build steps 5 to 9).

## Waiting on Dan
1. Merge pull request 125: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/125, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a video of your own that's at least 15 seconds long (it stays on your phone). It opens on the Trim tab and starts playing.
   3. Tap "Start here" a moment in. Let it play about 10 more seconds, then tap "End here." "Your clip" shows the new length.
   4. Tap the Speed tab, then 2×. Tap the speaker on the video to hear it: it plays just your clip, fast, with the sound higher.
   5. Tap "Make the video," and note roughly how long it takes. Then play it: it should start and end where you chose, at double speed, with the sound higher.
   6. Tell Claude how it went and how long it took. A screenshot of "What was checked" helps (it has the "For Claude" line).
3. Still open from before: his notes on the Korean looks (any to change or drop), how long Soft glow takes, and private test uploads (YouTube as a Short set to Private, TikTok with "Only me," Instagram as a Reel saved to drafts).

## Open pull requests
- Pull request 125, build step 4, trim and speed.

## Next step
Build step 5, Better sound: ask open question 6 in `SPEC.md` first (which tools, and one "Clearer sound" switch or separate controls). The sound already passes through an `OfflineAudioContext` (`soundAtSpeed()` in `app.js`), so the new tools go there.

## Ideas, not done
- A note on the Trim and Speed tabs when the new video would be under 3 seconds or over 3 minutes (now only "Your video" says so, after it's made).

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- Also blocked (November 2, 2026): the platforms' rule pages (developers.facebook.com, developers.tiktok.com, help.instagram.com, support.google.com) and the Korean-look sources (apps.apple.com, capcut.com, gridfiti.com). They were read through search results only; don't retry them through other services.
- scikit-image's test photos moved inside that project (their old paths answer 404), so the looks are judged on a made-up scene (`tests/make-scene.py`).
- An OffscreenCanvas ignores SVG filters (`url(#...)`): the frame came out unchanged. A normal canvas works, even one that isn't on the page.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- Mediabunny's one-step `Conversion` can trim but has no speed setting (its type notes, version 1.65.0), so the app makes each video frame by frame.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (fixed with `stopAsked`).
- In the checks, `innerText` of words inside a closed fold-out is empty; read them with `textContent`.
- The phone test's check B3 looked for "Make a 5-second black-and-white copy" too early (the page shows it after looking for a saved location), so it failed now and then; it now waits for the button, up to 10 seconds.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app: `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos, a color chart and a "clock" video with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "154 passed, 0 failed"; screenshots go to the temporary folder it prints.
- See the looks side by side: `node video-editor/tests/looks-sheet.mjs` (port 8769; needs Python with Pillow and numpy for the test scene). It prints where the picture is.
- Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767). Success ends "71 passed, 0 failed."
