# Video editor: progress (updated November 2, 2026)

A simple video editor, just for the owner, on his Android phone in Chrome: a filter, lighting, text, clip order, crop and speed, with the videos never leaving the phone. Read `SPEC.md` (what it does, the tech notes and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done: the plan and the name, "Video editor" (pull request 110, merged November 2, 2026). The research behind it is in Dan's Notion (Master Notes, "Simple video editor: how hard to build (Nov 2026)").
- In progress: pull request 111, build step 2, the phone test, at https://danielyoonwrites.github.io/video-editor/phone-test.html. It lists what Chrome on the phone can do, reads a video you choose, makes a black-and-white copy of its first 5 seconds (MP4: H.264 picture, AAC sound), times it, checks that the copy plays and carries no location, and offers "Save to phone" and "Share."
- Checked in Claude's test browser (71 saved checks, all passing): the copy is upright (a sideways phone-style video), black and white, 5 seconds, H.264 and AAC; a location in the original doesn't reach the copy; a video longer than 1920 pixels is made smaller; a 3-second video, a silent one and "Stop" work; an HEVC video gets a plain "can't read" line.
- What the test browser showed, which the phone may not (November 2, 2026): no AAC built in (so the add-on made the sound), no HEVC reading, no sharing, and 5 seconds took about 7 to 10 seconds (no video chip). Only the phone can say how it really does.
- Not checked yet: the KakaoTalk in-app browser (use Chrome).
- Claude's rough estimate: 6 more small pull requests (build steps 3 to 8).

## Waiting on Dan
1. Merge pull request 111: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/111, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome (not KakaoTalk) and go to https://danielyoonwrites.github.io/video-editor/phone-test.html
   2. Wait until every line under "What Chrome can do" has a ✓ or ✗, then take a screenshot.
   3. Tap "Choose a video" and pick a short video with no one's face in it (a room or the sky is fine), since you'll send Claude a screenshot.
   4. Tap "Make a 5-second black-and-white copy" and wait. When "The copy" shows, take a screenshot.
   5. Tap play on the copy: it's black and white, with sound.
   6. Tap "Save to phone," then open your Gallery (or Photos) and look for the copy, called video-editor-test.
   7. Tap "Share" to see your phone's share menu, then tap < to close it.
   8. Send Claude the two screenshots, and say whether the copy showed up in your Gallery.

## Open pull requests
- Pull request 111, build step 2, the phone test.

## Next step
Read Dan's screenshots: whether AAC is built in (if so, the app won't need the add-on), H.264, sharing, and the speed ("Made 5 seconds of video in ..."). Write what they show in `DECISIONS.md` and `SPEC.md`. Then build step 3, one clip with a look; ask open question 2 (the look) first, then question 4 (filter and lighting for the whole video or each clip).

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files came from the npm registry (`registry.npmjs.org`, reachable).
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- "Stop" tapped in the first moment, before the copy had really started, did nothing (found while writing the checks; fixed with `stopAsked`).

## How to run and check it
- Run: nothing to install; the page is plain files. Open https://danielyoonwrites.github.io/video-editor/phone-test.html, or serve the repository folder (`python3 -m http.server`) and open `/video-editor/phone-test.html`.
- Check: `node video-editor/tests/phone-test.mjs` from the repository folder. It makes made-up test videos with ffmpeg, serves the repository on http://127.0.0.1:8767 (that port must be free) and runs Chromium at 360 wide with touch and 1280 with a mouse. Success ends "71 passed, 0 failed" (in about a minute); screenshots go to the temporary folder it prints.
