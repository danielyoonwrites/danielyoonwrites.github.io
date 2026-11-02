# Video editor: progress (updated November 2, 2026)

A simple video editor, just for the owner, on his Android phone in Chrome: a filter, lighting, text, clip order, crop and speed, with the videos never leaving the phone, and every video made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the platforms' rules, the tech notes and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked:
  - The plan and the name (pull request 110).
  - Build step 2, the phone test (pull request 111), checked on Dan's phone November 2, 2026: every line ✓, AAC sound built in, and the copy "is in my gallery, black and white and with sound." The research is in Dan's Notion (Master Notes, "Simple video editor: how hard to build (Nov 2026)").
- In progress: pull request 112, build step 3, one clip with a look, at https://danielyoonwrites.github.io/video-editor:
  - the dark look (Dan's "A");
  - "The look": six filters and Brightness and Contrast, shown on the video as it plays;
  - "Making the video," with Stop;
  - "Your video": a line saying whether it meets Instagram's, TikTok's and YouTube Shorts' upload rules (Dan's request), "What was checked," Save to phone, Share.
- Checked in Claude's test browser: 100 saved checks pass (`tests/app-test.mjs`), and the phone test's 71 still pass. The new file is H.264 High, 1080 by 1920, a steady 30 frames a second, about 8 Mbps, AAC at 48 kHz stereo, 128 kbps, details first, no location; black and white and brightness +20 show in the file; it's upright.
- Not checked yet: real uploads to the three platforms; what the owner's phone writes in the line for Claude (color tags, edit lists); the KakaoTalk in-app browser (use Chrome).
- Claude's rough estimate: 5 more small pull requests (build steps 4 to 8).

## Waiting on Dan
1. Merge pull request 112: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/112, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a short video (under 3 minutes) with no one's face in it.
   3. Try a filter, then tap "Lighting" and move Brightness. The playing video changes as you go.
   4. Tap "Make the video" and wait. On "Your video," tap "What was checked," then take a screenshot (it includes the small "For Claude" line).
   5. Tap "Save to phone," then find the new video in Gallery and play it: it should look like the preview.
   6. The real test, privately:
      - YouTube: upload it as a Short with "Private" visibility.
      - TikTok: post it with "Only me" (who can watch).
      - Instagram: start a new Reel with it and save it as a draft.
      Check that each one takes the file, and that it plays with sound and looks right.
   7. Send Claude the screenshot, and say how each platform did.

## Open pull requests
- Pull request 112, build step 3.

## Next step
Read Dan's screenshot: the "For Claude" line says what his phone writes (color range, edit lists). If a platform had trouble, fix that first. Then build step 4, trim and speed; ask open question 3 (the sound when a clip is sped up or slowed down) first.

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- The platforms' official rule pages couldn't be opened from Claude's session either: developers.facebook.com, developers.tiktok.com, help.instagram.com and support.google.com (November 2, 2026). They were read through search results only; don't retry them through other services.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (found while writing the phone test's checks; fixed with `stopAsked`, in the app too).
- In the checks, `innerText` of words inside a closed fold-out is empty; read them with `textContent`.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app: `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "100 passed, 0 failed" (in about half a minute); screenshots go to the temporary folder it prints.
- Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767). Success ends "71 passed, 0 failed."
