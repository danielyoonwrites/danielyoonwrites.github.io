# Video editor: progress (updated November 3, 2026, with the Projects page listing)

A simple video editor, just for the owner, on his Android phone in Chrome: trim, speed, a look (Korean styles), lighting and better sound now; shape, text and clip order next. The videos never leave the phone, and every video is made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the looks, the platforms' rules, the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked on Dan's phone:
  - The plan and the name (pull request 110).
  - Build step 2, the phone test (pull request 111): checked November 2, 2026: every line ✓, AAC sound built in, and the copy "is in my gallery, black and white and with sound."
  - Build step 3, one clip with a look (pull request 112), at https://danielyoonwrites.github.io/video-editor: checked November 2, 2026: "it looks good."
- Built and live, not checked on Dan's phone yet:
  - The Korean looks (pull request 116, Dan's "a"): Original, Milky 우유빛, Peach 복숭아, Soft glow 뽀샤시, Café 카페, Clear 맑음, Film 필름, Black and white 흑백.
  - Build step 4, trim and speed (pull request 125): the "Edit" screen with Trim and Speed tabs; the sound follows the speed like a tape (Dan's "b"); each new video made frame by frame.
  - Build step 5, better sound (pull request 129, merged November 3, 2026, Dan's "B"): a fifth tab, "Sound," with three switches (Cut rumble, Clearer voice, Even out the volume) and a Volume slider from Off to 200%. The playing video sounds the same way as the new video will. How it works: `SPEC.md`, "Tech notes," "Better sound."
  - The tabs in Dan's order (pull request 137, merged November 3, 2026, his request): Filter, Lighting, Sound, Trim, Speed; the Edit screen opens on Filter.
  - On the website's Projects page (pull request 138, Dan's "A"): https://danielyoonwrites.github.io/projects.html, between Idea board and Quiet room, with a link, a gray line saying it's made for an Android phone in Chrome, and a "How I built it" note. Checked in Claude's test browser at 320 and 360 pixels wide: the line shows whole (3 lines), nothing scrolls sideways, and the link opens the app.
- Checked in Claude's test browser (November 3, 2026): 184 saved checks pass (`tests/app-test.mjs`), including made-up test sounds: in a saved video, the 50 Hz rumble 17.7 dB quieter, 300 Hz 3.0 dB quieter and 3,500 Hz 4.0 dB louder, a 30 dB gap between quiet and loud down to 18 dB, Volume 50% exactly 6.0 dB quieter, nothing clipping, and the sound in line with the original to the sample. The phone test's 71 pass.
- Not checked yet:
  - The sound switches on Dan's phone with a real voice, and whether the playing video's sound stays in step with the lips while editing.
  - Trim and speed on the phone, and how long making a video takes there now that it's frame by frame.
  - Real uploads to the three platforms (asked with pull request 112; not reported yet).
  - What the owner's phone writes in the "For Claude" line on "Your video" (color tags, edit lists).
  - How fast Soft glow is on the phone, and the looks on real faces (Claude's test scene is made up).
- Branch: `ccr-f31dd4eb-gq2mec` (the video editor's session), restarted from main after each merge; everything up to pull request 137 is merged into main.
- Open pull requests: pull request 138, the video editor on the Projects page.
- Claude's rough estimate: 4 more small pull requests (build steps 6 to 9).
- Dan's Master Notes (Notion), the page "Simple video editor: how hard to build (Nov 2026)," gets one entry after each merge (what merged, what was checked, what's next).

## Waiting on Dan
1. Merge the video editor on the Projects page, pull request 138: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/138, Conversation tab, Merge pull request, Confirm merge. Then, on his phone in Chrome, open https://danielyoonwrites.github.io/projects.html: "Video editor" shows between "Idea board" and "Quiet room," its line whole. Tap "Open the video editor": the app opens; tap < to come back. Under "How I built it," tap "Video editor": its note opens. Also the tabs (pull request 137, merged): in the app, tap "Choose a video": it opens on Filter, and the tabs read Filter, Lighting, Sound, Trim, Speed (if either still shows the old page, wait a few minutes and reload: a phone can keep the old copy for a short while after a merge).
2. The better sound check on his phone (any time; it's live):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a video of yourself talking, at least 15 seconds long, ideally one with some wind or traffic in it (it stays on your phone).
   3. Tap the speaker on the video to turn its sound on.
   4. Tap the Sound tab. While it plays, turn each switch on and off and listen: Cut rumble, Clearer voice, Even out the volume. Then try the Volume slider.
   5. Keep the switches you like, tap "Make the video," and play it: it should sound like what you heard while editing.
   6. Tell Claude which switches helped, whether any made it sound worse, and whether the voice stayed in step with the lips while editing.
3. The trim and speed check (pull request 125), any time:
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor (if you're on "Your video" from item 2, tap "← Edit" at the top left instead and skip to step 3).
   2. Tap "Choose a video" and pick a video of your own at least 15 seconds long. It opens on the Filter tab and starts playing. Tap the Trim tab.
   3. Tap "Start here" a moment in. Let it play about 10 more seconds, then tap "End here." Keep at least 6 seconds: shorter at 2× makes a video under 3 seconds, and "Your video" will say it's too short for Instagram (expected).
   4. Tap the Speed tab, then 2×.
   5. Tap "Make the video," note roughly how long it takes, then play it: it should start and end where you chose, at double speed, with the sound higher.
   6. Tell Claude how it went and how long it took.
4. Still open from before (pull requests 112 and 116), any time:
   1. On your phone, open Chrome, go to https://danielyoonwrites.github.io/video-editor, tap "Choose a video" and pick one of your own, with a face in it if you like.
   2. It opens on the Filter tab: tap each look while it plays: Milky, Peach, Soft glow, Café, Clear, Film. Note any you'd change or drop.
   3. Tap Soft glow, then "Make the video," and note roughly how long it takes.
   4. On "Your video," tap "What was checked" to open it, and take a screenshot (it has the "For Claude" line).
   5. Tap "Save to phone." Then upload that video privately in each app: YouTube as a Short set to Private, TikTok with "Only me," Instagram as a Reel saved to drafts. Unverified: Claude couldn't open those apps' help pages (blocked from its session), so it can't name their exact buttons; note any app that refuses the video and what it says.
   6. Send Claude your notes on the looks, the time, the screenshot, and how the uploads went.

## Next step
After this pull request merges, Dan's request: text on the videos ("I want the ability to add text to the videos," November 3, 2026), before shape and crop. The plan in `SPEC.md` ("How it works," step 4, and "Tech notes"): type a line, put it at the top, middle or bottom, and choose when it shows; on the playing video it's a page box over the video, and each frame of the new video gets the same text drawn on it. Ask Dan first, one question at a time, with options and a recommendation, starting with how many lines and when they show. When it's built, update the Projects page line and note too (`CLAUDE.md`). Then ask for his phone checks (items 2 to 4 above). Adjust whatever he asks: the sound's numbers are in `buildSoundSteps()` in `app.js` (check with the saved checks, section J), the looks' numbers in the SVG filters near the top of `index.html` (check with `tests/looks-sheet.mjs` and section H). Then build step 6, shape and crop. Ask Dan first, one question at a time, each with options and a recommendation: (1) which shapes: tall 9:16 and square both count as YouTube Shorts (up to 3 minutes), but wide doesn't (`SPEC.md`, "Made for Instagram, TikTok and YouTube Shorts"), so wide would need a warning, or be left out; (2) the starting shape (Claude would suggest tall); (3) how to choose which part shows: dragging the picture, or a few buttons (left, middle, right). Where it goes on the screen is Claude's design to show in screenshots (likely a sixth tab, "Shape," on the Edit screen; the first plan in `SPEC.md`, "How it works," had separate screens before the app became one Edit screen with tabs).

## Ideas, not done
- A note on the Trim and Speed tabs when the new video would be under 3 seconds or over 3 minutes (now only "Your video" says so, after it's made).
- Turning down a steady hiss, like a fan (left for later, November 3, 2026; `SPEC.md`, "Not in version 1").

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- Also blocked (November 2, 2026): the platforms' rule pages (developers.facebook.com, developers.tiktok.com, help.instagram.com, support.google.com) and the Korean-look sources (apps.apple.com, capcut.com, gridfiti.com). They were read through search results only; don't retry them through other services.
- danielyoonwrites.github.io itself can't be opened from Claude's session (the proxy answers 403); a green publish run is the check, and Dan's phone is the first live look (`CLOUD-NOTES.md`).
- scikit-image's test photos moved inside that project (their old paths answer 404), so the looks are judged on a made-up scene (`tests/make-scene.py`).
- An OffscreenCanvas ignores SVG filters (`url(#...)`): the frame came out unchanged. A normal canvas works, even one that isn't on the page.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- Mediabunny's one-step `Conversion` can trim but has no speed setting (its type notes, version 1.65.0), so the app makes each video frame by frame.
- A Web Audio high-pass filter with Q 0.707 made a 3.4 dB bump at 100 Hz: for that filter type Q is in decibels (the Web Audio spec); −3.01 is the smooth shape.
- Timing the new video's sound by when a sudden tone starts read 14 thousandths of a second late, with or without the sound steps: AAC (the sound format) smears a sudden start. Lining up a hiss (`soundLag()` in `tests/test-videos.mjs`) shows it's in line to the sample.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (fixed with `stopAsked`).
- In the checks, `innerText` of words inside a closed fold-out is empty; read them with `textContent`.
- The phone test's check B3 looked for "Make a 5-second black-and-white copy" too early (the page shows it after looking for a saved location), so it failed now and then; it now waits for the button, up to 10 seconds.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app (needs Playwright with Chromium, and ffmpeg; both are installed in Claude's cloud sessions): `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos, a color chart, a "clock" video and test sounds with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "184 passed, 0 failed" (in about 2 minutes); screenshots go to the temporary folder it prints.
- See the looks side by side: `node video-editor/tests/looks-sheet.mjs` (port 8769; needs Python with Pillow and numpy for the test scene). It prints where the picture is.
- Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767). Success ends "71 passed, 0 failed."
