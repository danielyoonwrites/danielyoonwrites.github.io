# Video editor: progress (updated November 2, 2026)

A simple video editor, just for the owner, on his Android phone in Chrome: a look (Korean styles) and lighting now; trim, speed, better sound, shape, text and clip order next. The videos never leave the phone, and every video is made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the looks, the platforms' rules, the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked:
  - The plan and the name (pull request 110).
  - Build step 2, the phone test (pull request 111): every line ✓ on Dan's phone, AAC sound built in, and the copy "is in my gallery, black and white and with sound."
  - Build step 3, one clip with a look (pull request 112), at https://danielyoonwrites.github.io/video-editor. Dan, November 2, 2026: "it looks good."
- In progress: pull request 116, the Korean looks (Dan's "a"): Original, Milky 우유빛, Peach 복숭아, Soft glow 뽀샤시, Café 카페, Clear 맑음, Film 필름, Black and white 흑백. Also "Better sound" added to the build plan as step 5, after Dan asked whether it's possible.
- Checked in Claude's test browser: 128 saved checks pass (`tests/app-test.mjs`), including each look's effect on a color chart, the preview matching the saved file (Milky and Peach), and the glow's size; the phone test's 71 still pass.
- Not checked yet:
  - Real uploads to the three platforms (asked with pull request 112; not reported yet).
  - What the owner's phone writes in the "For Claude" line (color tags, edit lists).
  - How fast Soft glow is on the phone.
  - The looks on real faces (Claude's test scene is made up).
- Claude's rough estimate: 6 more small pull requests (build steps 4 to 9).

## Waiting on Dan
1. Merge pull request 116: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/116, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a short video of your own, with a face in it if you like (it stays on your phone).
   3. Tap each look while it plays: Milky, Peach, Soft glow, Café, Clear, Film. Note any you'd change or drop.
   4. Choose Soft glow, tap "Make the video," and see how long it takes. Then play it: it should look like the preview.
   5. If you haven't yet: upload a video from the app privately (YouTube as a Short set to Private, TikTok with "Only me," Instagram as a Reel saved to drafts), and check that each one takes it.
   6. Tell Claude which looks you like, how long Soft glow took, and how the uploads went. A screenshot of "What was checked" helps (it has the "For Claude" line).

## Open pull requests
- Pull request 116, the Korean looks.

## Next step
Adjust any look Dan wants changed (the numbers are in the SVG filters in `index.html`; `node video-editor/tests/looks-sheet.mjs` shows them side by side). Then build step 4, trim and speed; ask open question 3 (the sound when a clip is sped up or slowed down) first.

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- Also blocked (November 2, 2026): the platforms' rule pages (developers.facebook.com, developers.tiktok.com, help.instagram.com, support.google.com) and the Korean-look sources (apps.apple.com, capcut.com, gridfiti.com). They were read through search results only; don't retry them through other services.
- scikit-image's test photos moved inside that project (their old paths answer 404), so the looks are judged on a made-up scene (`tests/make-scene.py`).
- An OffscreenCanvas ignores SVG filters (`url(#...)`): the frame came out unchanged. A normal canvas works, even one that isn't on the page.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (fixed with `stopAsked`).
- In the checks, `innerText` of words inside a closed fold-out is empty; read them with `textContent`.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app: `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos and a color chart with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "128 passed, 0 failed" (in about a minute); screenshots go to the temporary folder it prints.
- See the looks side by side: `node video-editor/tests/looks-sheet.mjs` (port 8769; needs Python with Pillow and numpy for the test scene). It prints where the picture is.
- Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767). Success ends "71 passed, 0 failed."
