# Photo Filters: progress (updated November 2, 2026)

A little app that puts Dan's own looks on his photos, in the browser of his phone (Chrome) and his MacBook (Safari), with the photos never leaving the device. Live at https://danielyoonwrites.github.io/photo-filters (not listed in search engines). Read `SPEC.md` ("Build plan for Milestone 1," "Questions to ask Dan first"), `DECISIONS.md` and `CLAUDE.md`.

## Where things stand
- Done:
  - Build step 1, the plan (pull request 114, merged November 2, 2026). Dan's answers: build it in this repository ("a"); the name "Photo Filters" ("call it Photo Filters"); Chrome on the phone and Safari on the MacBook ("b"); keep all five looks for now ("a"); then "ok" to the Milestone 1 plan. His Notion page "Photo Looks app: Claude Code spec (Nov 2026)" has the summary and the checked facts.
  - Build step 2, choosing a photo (pull request 117, merged November 2, 2026): "Choose photo" at the bottom; the photo right side up with its size; a plain message for a file the browser can't open; a made-up test photo page for the MacBook. Dan hasn't checked it on his devices yet (his checks for step 3 cover it).
- In progress: pull request 118, build step 3, Warm natural next to the original:
  - Two pictures, labeled "Original" and "Warm natural": one above the other on a phone, side by side on a computer.
  - The look is worked out on the screen's smaller copy by a background helper (`worker.js`, with the math in `looks.js`); if the helper can't start, the page does it itself. "Making the Warm natural look…" shows while it works.
- Checked in Chromium: 75 saved checks pass, including the looks' math against the spec. On Claude's cloud computer (not a phone), the look took about 0.4 seconds on a 1,000 by 2,000 copy, and a 12 MP photo's look was ready about 1.2 seconds after choosing it.
- Not checked yet: Safari (Dan's MacBook check), how fast it is on Dan's phone, and photos bigger than 12 MP.
- Branch: `ccr-23f232dc-auju6c` (this session's), restarted from main after each merge.
- Open pull requests: pull request 118.

## Next step
Build step 4: Export, a full-size JPEG of the Warm natural version (`SPEC.md`, "Build plan for Milestone 1"). Then Milestone 1 is done.

## Waiting on Dan
1. Merge pull request 118: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/118, Conversation tab, Merge pull request, Confirm merge. Publishing takes a minute or two.
2. The check on the phone (Chrome):
   1. Open Chrome and go to https://danielyoonwrites.github.io/photo-filters
   2. Tap "Choose photo" and pick a tall photo you took holding the phone upright.
   3. Both pictures show right side up: "Original" on top, "Warm natural" under it, within a few seconds.
   4. Does Warm natural look right to you: a little warmer, a touch more contrast, softer edges?
   5. Tap "Choose photo" again and try a wide photo too.
3. The check on the MacBook (Safari):
   1. Open Safari and go to https://danielyoonwrites.github.io/photo-filters/tests/test-photos.html
   2. Click "Download the test photo." If Safari asks whether to allow downloads from this site, click Allow. Safari saves it in your Downloads folder, unless you changed where downloads go (seen in search results, not Apple's own page).
   3. Go to https://danielyoonwrites.github.io/photo-filters, click "Choose photo," and pick tall-test-photo.jpg from Downloads.
   4. Both pictures show side by side, right side up (the word TOP at the top left), with "3,000 × 4,000 pixels (12.0 MP)" under them.

## How to run and check it
- Saved checks: `node photo-filters/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, and 180 (a phone with its zoom at 200%), serving the repository on http://127.0.0.1:8767 (that port must be free), and checks the looks' math in Node (section I). Success ends "75 passed, 0 failed" (about a minute). Screenshots go to the temporary folder it prints.
- The test photos are drawn in the page; `withPhoneDetails()` adds a rotation tag and a made-up location, like a phone's camera. The MacBook test photo, `tests/tall-test-photo.jpg`, was made once the same way (a drawn scene, turned and tagged); section G checks it.
